const hostCommandBuilder = require('./builders/host');
const moment = require('moment');
const { loadFolder } = require('../handlers/load');
const embeds = loadFolder('./embeds'); // Dynamically load all embeds
const handlers = loadFolder('./handlers');
const { getDateTimeDetails } = handlers.datetime;

console.log('Loaded embeds:', Object.keys(embeds)); // Check which embeds are loaded

module.exports = {
    data: hostCommandBuilder,
    async execute(interaction) {
        try {
            const activityName = interaction.options.getString('name');
            const createThread = interaction.options.getString('thread') || 'Yes'; // Default to 'Yes'
            const date = interaction.options.getString('date');
            const time = interaction.options.getString('time');

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

                // Send the embed message and capture the message object
                const sentMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

                // Check if the user requested thread creation
                if (createThread === 'Yes') {
                    // Create a thread attached to the sent message
                    const thread = await sentMessage.startThread({
                        name: `${embed.data.title}`, // Use embed title instead of activity name
                        autoArchiveDuration: 4320, // Automatically archive after 60 minutes of inactivity
                        reason: `Thread created for ${embed.title} activity`, // Reason for creating the thread
                    });
                    console.log(`Created thread attached to message with ID: ${thread.id}`);
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