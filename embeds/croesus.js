const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

// separate by commas, based on button's customID
const combinabilityRules = {
  woodcutting: ["fishing", "learner"],
  fishing: ["woodcutting", "learner"],
  mining: ["learner"],
  hunter: ["learner"],
  learner: ["woodcutting", "fishing", "mining", "hunter"]
};

function createCroesusEmbed(user, field = {}) {
  // Create the embed
  const embed = new EmbedBuilder()
    .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() })
    .setTitle("Croesus")
    .setURL("https://runescape.wiki/w/Croesus/Strategies")
    .setColor("Green")
    .addFields(
      {
        name: "<:woodcutting:1285633207055810560> Woodcutting",
        value: field.woodcutting || "`Empty`",
        inline: true,
      },
      {
        name: "<:fishing:1285633171156893827> Fishing",
        value: field.fishing || "`Empty`",
        inline: true,
      },
      {
        name: "<:mining:1285633577962438800> Mining",
        value: field.mining || "`Empty`",
        inline: true,
      },
      {
        name: "<:hunter:1285633121534087319> Hunter",
        value: field.hunter || "`Empty`",
        inline: true,
      }
    )
    .setFooter({
      text: "Ongoing Hosting",
      iconURL: "https://cdn.discordapp.com/emojis/1285924977035710514.gif",
    })
    .setTimestamp();

  // First row of buttons
  const actionRow1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("woodcutting:true") // 'false' means non-exclusive
      .setEmoji("1285633207055810560")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("fishing:false") // 'true' means exclusive
      .setEmoji("1285633171156893827")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("mining:false")
      .setEmoji("1285633577962438800")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("hunter:false")
      .setEmoji("1285633121534087319")
      .setStyle(ButtonStyle.Secondary)
  );

  // Second row with the "Complete the group" button
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

  // Return both the embed and the button rows
  return { embed, actionRow1, actionRow2 }; // Ensure actionRows is returned correctly
}

module.exports = { createCroesusEmbed, combinabilityRules };
