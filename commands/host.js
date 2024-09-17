const hostCommandBuilder = require('./builders/host');
const { loadFolder } = require('../handlers/load');

const embeds = loadFolder('./embeds'); // Dynamically load all embeds
console.log('Loaded embeds:', Object.keys(embeds)); // Check which embeds are loaded

module.exports = {
    data: hostCommandBuilder,
    async execute(interaction) {
        try {
            const activityName = interaction.options.getString('name');
            console.log('Activity Name:', activityName);

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
            console.warn(`embedFunction - ${embedFunction}`);

            if (embedFunction) {
                const embed = embedFunction(interaction.user);
                console.log('Sending embed:', embed);
                await interaction.reply({ embeds: [embed] });
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