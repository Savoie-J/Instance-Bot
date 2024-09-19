const { syncCommands } = require("./sync");
const { loadSettings } = require("./settings"); // Adjust the path as needed

module.exports = async (client, commands) => {
  console.log(`${client.user.tag}, now online.`);

  try {
    // Load settings before syncing commands
    const settings = loadSettings();
    // console.log("Settings loaded:", settings);

    // Log commands to verify they are loaded properly
    // console.log("Commands collection:", commands);

    // Sync commands after settings are loaded
    await syncCommands(process.env.token, client.user.id, commands);
    // console.log("Commands synchronized successfully.");
  } catch (error) {
    console.error("Error loading settings or syncing commands:", error);
  }
};