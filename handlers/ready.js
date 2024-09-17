const { syncCommands } = require('./sync');

module.exports = async (client, commands) => {
    console.log(`${client.user.tag}, now online.`);
    await syncCommands(process.env.token, client.user.id);
};