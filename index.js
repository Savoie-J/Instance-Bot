require('dotenv').config();

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { loadFolder } = require('./handlers/load');

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });

const commands = loadFolder('./commands');
const handlers = loadFolder('./handlers');

client.commands = new Collection();
Object.values(commands).forEach(command => {
    if (command.data && command.data.name) {
        client.commands.set(command.data.name, command);
    }
});

client.on('ready', () => {
    if (handlers.ready) {
        handlers.ready(client, commands);
    }
});

client.on('interactionCreate', interaction => {
    if (handlers.interaction) {
        handlers.interaction(interaction, client);
    }
});

client.login(process.env.token);