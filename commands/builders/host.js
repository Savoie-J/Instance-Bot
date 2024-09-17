const { SlashCommandBuilder } = require('@discordjs/builders');

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
    );