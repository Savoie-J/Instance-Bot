const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { SlashCommandBuilder } = require("@discordjs/builders");

async function syncCommands(token, clientId, commands) {
  const rest = new REST({ version: "10" }).setToken(token);

  if (!commands) {
    throw new Error("Commands parameter is undefined or null.");
  }

  // Ensure commands have a valid data property
  const formattedCommands = commands
    .map((command) => {
      if (!command.data) {
        console.error("Command data is missing:", command);
        return null;
      }

      if (!(command.data instanceof SlashCommandBuilder)) {
        console.error(
          "Command data is not an instance of SlashCommandBuilder:",
          command.data
        );
        return null;
      }

      return command.data.toJSON();
    })
    .filter((cmd) => cmd !== null);

  // console.log("Commands to be synced:", formattedCommands);

  try {
    await rest.put(Routes.applicationCommands(clientId), {
      body: formattedCommands,
    });
  } catch (error) {
    console.error("Error syncing commands:", error);
    throw error;
  }
}

module.exports = { syncCommands };