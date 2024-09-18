const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const { loadFolder } = require('../../handlers/load'); // Adjust path accordingly

// Load all handlers from the folder (this will load generateDateChoices and generateTimeChoices)
const handlers = loadFolder('./handlers'); // Adjust the folder path accordingly

const generateDateChoices = handlers.date;
const generateTimeChoices = handlers.time;

module.exports = new SlashCommandBuilder()
    .setName('host')
    .setDescription('Manage activities for hosting')
    .addSubcommand(subcommand =>
        subcommand
            .setName('activity')
            .setDescription('Host an activity')
            .addStringOption(option =>
                option
                    .setName('name')
                    .setDescription('Select an activity')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Croesus', value: 'croesus' },
                        // Add other activities here
                    )
            )
            .addStringOption(option =>
                option
                    .setName('thread')
                    .setDescription('Create a discussion thread?')
                    .addChoices(
                        { name: 'Yes', value: 'yes' },
                        { name: 'No', value: 'no' }
                    )
            )
            .addStringOption(option =>
                option
                    .setName('date')
                    .setDescription('Select a date (YYYY-MM-DD)')
                    .addChoices(generateDateChoices())
            )
            .addStringOption(option =>
                option
                    .setName('time')
                    .setDescription('Select a time (HH:MM)')
                    .addChoices(generateTimeChoices())
            )
            .addRoleOption(option =>
                option
                    .setName('mention')
                    .setDescription('Mention a role for the activity')
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('double-ping')
            .setDescription('Set whether to ping in both the channel and the thread')
            .setRequired(true)
            .addStringOption(option =>
                option
                    .setName('enabled')
                    .setDescription('Enable or disable double-ping (default: No)')
                    .addChoices(
                        { name: 'Yes', value: 'yes' },
                        { name: 'No', value: 'no' }
                    )
            )
    );