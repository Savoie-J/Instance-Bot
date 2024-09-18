const { EmbedBuilder } = require('discord.js');

function createCroesusEmbed(user) {
    return new EmbedBuilder()
        .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() })
        .setTitle('Croesus')
        .setURL('https://runescape.wiki/w/Croesus/Strategies')
        .addFields(
            { name: '<:woodcutting:1285633207055810560> Woodcutting', value: '`Empty`', inline: true },
            { name: '<:fishing:1285633171156893827> Fishing', value: '`Empty`', inline: true },
            { name: '<:mining:1285633577962438800> Mining', value: '`Empty`', inline: true },
            { name: '<:hunter:1285633121534087319> Hunter', value: '`Empty`', inline: true },
        )
        .setTimestamp();
}

module.exports = { createCroesusEmbed };