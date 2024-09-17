const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Forcefully sync all commands with Discord');