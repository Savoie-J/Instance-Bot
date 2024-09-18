const hostCommandBuilder = require('./builders/host');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const { loadFolder } = require('../handlers/load');
const embeds = loadFolder('./embeds'); // Dynamically load all embeds
const handlers = loadFolder('./handlers');
const { getDateTimeDetails } = handlers.datetime;

console.log('Loaded embeds:', Object.keys(embeds)); // Check which embeds are loaded

const doublePingSettings = new Map(); // Store double-ping settings for each guild

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

            // Fetch the correct module from embeds
            const embedModule = embeds[activityName];
            if (!embedModule) {
                console.error('Invalid activity name or module not loaded.');
                await interaction.reply({ content: 'Invalid activity name.', ephemeral: true });
                return;
            }

            // Create the embed function name
            const embedFunctionName = `create${activityName.charAt(0).toUpperCase() + activityName.slice(1)}Embed`;
            console.log('Looking for embed function:', embedFunctionName);

            // Access the function within the module
            const embedFunction = embedModule[embedFunctionName];

            if (embedFunction) {
                const embed = embedFunction(interaction.user);

                // Get date and time details
                const { dateTime, localTime, relativeTime } = getDateTimeDetails(date, time);

                // Add date and time details to the embed only if they are not null
                const fields = [];
                if (dateTime) fields.push(`Date: \`${dateTime} UTC\``); // Indicate UTC time
                if (localTime) fields.push(`Local Time: <t:${localTime}:F>`); // Discord format for local time
                if (relativeTime) fields.push(`Relative Time: <t:${relativeTime}:R>`); // Dynamic countdown

                if (fields.length > 0) {
                    embed.setDescription(fields.join('\n'));
                }

                let reply = '';

                // Mention role if provided
                if (mention) { reply = `<@&${mention.id}>`; } // Role mention in the content field

                const sentMessage = await interaction.reply({ 
                    content: reply, 
                    embeds: [embed], 
                    fetchReply: true,
                    allowedMentions: { roles: [mention ? mention.id : null] } // Explicitly allow the role mention
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
