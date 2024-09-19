const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require("discord-api-types/v10");

module.exports = new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Forcefully sync all commands with Discord')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);