const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

// separate by commas, based on button's customID
const combinabilityRules = {
  role1: ["learner"],
  role2: ["learner"],
  role3: ["learner"],
  role4: ["learner"],
  learner: ["role1", "role2", "role3", "role4"],
};

function createBossEmbed(user, field = {}) {
  // Create the embed
  const embed = new EmbedBuilder()
    .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() })
    .setTitle("Boss") // BossName
    .setURL("https://runescape.wiki/") // Link to strategy guide or wiki page
    .setColor("Green") // Change to fit boss
    .addFields(
      {
        name: "<:emoji_name:emojiID> Role1",
        value: field.role1 || "`Empty`",
        inline: true,
      },
      {
        name: "<:emoji_name:emojiID> Role2",
        value: field.role2 || "`Empty`",
        inline: true,
      },
      {
        name: "<:emoji_name:emojiID> Role3",
        value: field.role3 || "`Empty`",
        inline: true,
      },
      {
        name: "<:emoji_name:emojiID> Role4",
        value: field.role4 || "`Empty`",
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
    new ButtonBuilder() //match custom id to field.[customID] above
      .setCustomId("role1:true") // 'false' means non-exclusive
      .setEmoji("1285633207055810560")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("role2:false") // 'true' means exclusive (only one person on this role)
      .setEmoji("1285633171156893827")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("role3:false")
      .setEmoji("1285633577962438800")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("role4:false")
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

module.exports = { createBossEmbed, combinabilityRules };