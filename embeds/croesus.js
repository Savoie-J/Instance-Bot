const { EmbedBuilder } = require('discord.js');

function createCroesusEmbed(user) {
    return new EmbedBuilder()
        .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() })
        .setTitle('Croesus')
}

module.exports = { createCroesusEmbed };