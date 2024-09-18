const { SlashCommandBuilder } = require('@discordjs/builders');
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
    );