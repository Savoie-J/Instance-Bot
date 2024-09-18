module.exports = async (interaction, client) => {
    // console.log('Interaction received:', interaction);
    
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    // console.log('Command received:', interaction.commandName);

    if (!command) {
        console.error(`No command found for: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction, client.commands, client);
    } catch (error) {
        console.error('Error executing command:', error);
        if (!interaction.replied) {
            await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
    }
};
