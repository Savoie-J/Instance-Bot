const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const combinabilityRules = {
  Woodcutting: ["Learner"],
  Fishing: ["Learner"],
  Mining: ["Learner"],
  Hunter: ["Learner"],
  Learner: ["Woodcutting", "Fishing", "Mining", "Hunter"]
};

function createCroesusEmbed(user, field = {}) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() })
    .setTitle("Croesus")
    .setURL("https://runescape.wiki/w/Croesus")
    .setThumbnail(
      "https://runescape.wiki/images/thumb/Croesus.png/300px-Croesus.png?b260c"
    )
    .setColor("Random")
    .addFields(
      {
        name: "<:woodcutting:1285633207055810560> Woodcutting",
        value: field.Woodcutting || "`Empty`",
        inline: true,
      },
      {
        name: "<:fishing:1285633171156893827> Fishing",
        value: field.Fishing || "`Empty`",
        inline: true,
      },
      {
        name: "<:mining:1285633577962438800> Mining",
        value: field.Mining || "`Empty`",
        inline: true,
      },
      {
        name: "<:hunter:1285633121534087319> Hunter",
        value: field.Hunter || "`Empty`",
        inline: true,
      }
    )
    .setFooter({
      text: "Join",
      iconURL: "https://cdn.discordapp.com/emojis/1285924977035710514.gif",
    })
    .setTimestamp();

  // First row of buttons
  const actionRow1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("Woodcutting:true") // customID is what will be sent to users
      .setEmoji("1285633207055810560")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Fishing:true")
      .setEmoji("1285633171156893827")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Mining:true")
      .setEmoji("1285633577962438800")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Hunter:true")
      .setEmoji("1285633121534087319")
      .setStyle(ButtonStyle.Secondary)
  );

  const actionRow2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("complete")
      .setLabel("Complete group")
      .setEmoji("1285892459020161064")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("notify")
      .setLabel("Notify Players")
      .setEmoji("1285924980063997973")
      .setStyle(ButtonStyle.Danger)
  );

  return { embed, actionRow1, actionRow2 }; 
}

module.exports = { createCroesusEmbed, combinabilityRules };