const { PermissionFlagsBits, ButtonStyle } = require('discord-api-types/v10');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { loadFolder } = require('../handlers/load');
const hostCommandBuilder = require('./builders/host');
const embeds = loadFolder('./embeds'); // Dynamically load all embeds
const handlers = loadFolder('./handlers');
const { getDateTimeDetails } = handlers.datetime;
const { loadSettings, saveSettings } = handlers.settings; // Import settings functions

console.log('Loaded embeds:', Object.keys(embeds)); // Check which embeds are loaded

const doublePingSettings = new Map(); // Store double-ping settings for each guild

// Load double-ping settings from file
const settings = loadSettings();
for (const [guildId, enabled] of Object.entries(settings.doublePing || {})) {
    doublePingSettings.set(guildId, enabled);
}

module.exports = {
    data: hostCommandBuilder,
    async execute(interaction) {
        try {
            if (interaction.options.getSubcommand() === 'double-ping') {
                // Check if the user has administrator permissions
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                }

                const enabled = interaction.options.getString('enabled');
                if (enabled === null) {
                    // If no option was provided, just show the current setting
                    const currentSetting = doublePingSettings.get(interaction.guildId) || false;
                    await interaction.reply({ content: `Double-ping is currently ${currentSetting ? 'enabled' : 'disabled'} for this server.`, ephemeral: true });
                } else {
                    // If an option was provided, update the setting
                    const newSetting = enabled === 'yes';
                    doublePingSettings.set(interaction.guildId, newSetting);
                    // Save updated settings to file
                    const updatedSettings = { doublePing: Object.fromEntries(doublePingSettings) };
                    saveSettings(updatedSettings);
                    await interaction.reply({ content: `Double-ping has been ${newSetting ? 'enabled' : 'disabled'} for this server.`, ephemeral: true });
                }
                return;
            }

            // Rest of your existing code for the 'activity' subcommand
            const activityName = interaction.options.getString('name');
            const createThread = interaction.options.getString('thread') || 'Yes'; // Default to 'Yes'
            const date = interaction.options.getString('date');
            const time = interaction.options.getString('time');
            const mention = interaction.options.getRole('mention'); // Get mentioned role

            // Access the function within the module
            const embedModule = embeds[activityName];
            if (!embedModule) {
                console.error('Invalid activity name or module not loaded.');
                await interaction.reply({ content: 'Invalid activity name.', ephemeral: true });
                return;
            }

            // Create the embed function name
            const embedFunctionName = `create${activityName.charAt(0).toUpperCase() + activityName.slice(1)}Embed`;

            // Access the function within the module
            const embedFunction = embedModule[embedFunctionName];

            if (embedFunction) {
                const fields = {};
                let isGroupCompleted = false;
                let reply = '';

                // Mention role if provided
                if (mention) { reply = `<@&${mention.id}>`; } // Role mention in the content field
          
                const createUpdatedEmbed = () => {
                    const { embed, actionRow1, actionRow2 } = embedFunction(interaction.user, fields);
                    
                    // Get date and time details
                    const { dateTime, localTime, relativeTime } = getDateTimeDetails(date, time);

                    // Add date and time details to the embed only if they are not null
                    const field = [];
                    if (dateTime) field.push(`Date: \`${dateTime} UTC\``); // Indicate UTC time
                    if (localTime) field.push(`Local Time: <t:${localTime}:F>`); // Discord format for local time
                    if (relativeTime) field.push(`Relative Time: <t:${relativeTime}:R>`); // Dynamic countdown

                    if (field.length > 0) {
                        embed.setDescription(field.join('\n'));
                    }

                    // Update footer based on group completion status
                    embed.setFooter({
                    text: isGroupCompleted ? 'Completed' : 'Ongoing Hosting',
                    iconURL: isGroupCompleted 
                        ? 'https://cdn.discordapp.com/emojis/1285884645136793611.png' 
                        : 'https://cdn.discordapp.com/emojis/1285924977035710514.gif'
                    });

                    // Recreate action rows to ensure we can modify them
                    const updatedActionRow1 = ActionRowBuilder.from(actionRow1);
                    const updatedActionRow2 = ActionRowBuilder.from(actionRow2);

                    // Update "Complete group" button
                    const completeButton = updatedActionRow2.components.find(c => c.data.custom_id === 'complete');
                    if (completeButton) {
                    completeButton.setLabel(isGroupCompleted ? 'Re-open group' : 'Complete group');
                    }

                    // Disable/Enable buttons in the first action row
                    updatedActionRow1.components.forEach(button => {
                    button.setDisabled(isGroupCompleted);
                    });

                    return { embed, actionRows: [updatedActionRow1, updatedActionRow2] };
                };
          
                const { embed, actionRows } = createUpdatedEmbed();
          
                const sentMessage = await interaction.reply({ 
                  content: reply, 
                  embeds: [embed], 
                  components: actionRows,
                  fetchReply: true,
                  allowedMentions: { roles: [mention ? mention.id : null] }
                });
          
                // Set up a persistent collector for button interactions
                const collector = sentMessage.createMessageComponentCollector();
          
                collector.on('collect', async (i) => {
                  if (i.customId === 'complete') {
                    isGroupCompleted = !isGroupCompleted;
                  } else if (i.customId === 'alert') {
                    // Handle alert button
                    // ... (your alert button logic here)
                    return;
                  } else {
                    // Toggle the field value if the group is not completed
                    if (!isGroupCompleted) {
                      if (fields[i.customId] === i.user.toString()) {
                        fields[i.customId] = '`Empty`';
                      } else {
                        fields[i.customId] = i.user.toString();
                      }
                    }
                  }
          
                  // Create a new embed with updated fields and buttons
                  const { embed: updatedEmbed, actionRows: updatedActionRows } = createUpdatedEmbed();
          
                  // Update the message with the new embed and buttons
                  await i.update({ embeds: [updatedEmbed], components: updatedActionRows });
                });

                // Check if the user requested thread creation
                if (createThread === 'Yes') {
                    // Create a thread attached to the sent message
                    const thread = await sentMessage.startThread({
                        name: `${embed.data.title}`, // Use embed title instead of activity name
                        autoArchiveDuration: 4320, // Automatically archive after 3 days of inactivity
                        reason: `Thread created for ${embed.data.title} activity`, // Reason for creating the thread
                    });

                    // Check if double-ping is enabled for this server
                    const doublePingEnabled = doublePingSettings.get(interaction.guildId) || false;
                    if (doublePingEnabled && mention) {
                        await thread.send({
                            content: `<@&${mention.id}>`,
                            allowedMentions: { roles: [mention.id] }
                        });
                    }
                }
            } else {
                console.error('Invalid embed function.');
                await interaction.reply({ content: 'Invalid embed function.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error in execute method:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
            }
        }
    }
};