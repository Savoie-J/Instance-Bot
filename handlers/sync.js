const { REST, Routes } = require('discord.js');
const { loadFolder } = require('./load');

async function syncCommands(token, clientId) {
    const commands = Object.values(loadFolder('./commands'));
    const rest = new REST({ version: '10' }).setToken(token);

    try {
        // console.log('Started syncing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands.map(cmd => cmd.data.toJSON()) } // Convert command data to JSON
        );

        // console.log('Successfully synced application (/) commands.');
    } catch (error) {
        console.error('Error syncing commands:', error);
    }
}

module.exports = { syncCommands };