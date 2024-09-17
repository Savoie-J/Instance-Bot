const syncCommandBuilder = require('./builders/sync');
const { syncCommands } = require('../handlers/sync');

module.exports = {
    data: syncCommandBuilder,
    async execute(interaction, client, commands) {
        // Check if the user is the bot owner or has specific permissions
        if (interaction.user.id !== process.env.owner) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        await interaction.reply({ content: 'Syncing commands...', ephemeral: true });

        // Sync the commands with Discord
        await syncCommands(client, commands);

        await interaction.editReply({ content: 'Commands synced successfully!', ephemeral: true });
    }
};