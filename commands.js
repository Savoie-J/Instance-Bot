const { loadFolder } = require('../handlers/load');
const commandsPath = './commands';

// Use the loader function to load all commands
const commands = Object.values(loadFolder(commandsPath));

// Export the loaded commands array
module.exports = commands;