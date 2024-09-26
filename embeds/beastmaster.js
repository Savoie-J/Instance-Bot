const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

// separate by commas, based on button's customID
const combinabilityRules = {
  base: ["learner"],
  backup: ["learner"],
  nc: ["learner"],
  pet1: ["learner"],
  pet2: ["learner"],
  learner: ["base", "backup", "nc", "pet 1/3", "pet 2"],
};

// Boss == value set in builder with the first letter capitalized, keep it lowercase in value
function createBeastmasterEmbed(user, field = {}) {
  // Create the embed
  const embed = new EmbedBuilder()
    .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() })
    .setTitle("Beastmaster Durzag") // BossName
    .setURL("https://runescape.wiki/w/Beastmaster_Durzag") // Link to strategy guide or wiki page
    .setThumbnail("https://runescape.wiki/images/Beastmaster_Durzag.png?4eea4") //link to image (cant host locally)
    .setColor("LightGrey") // Change to fit boss
    .addFields(
      {
        name: "<:Incite:1287459187194073189> Base",
        value: field.base || "`Empty`",
        inline: true,
      },
      {
        name: "<:loyalty:1287461613921636503> Backup",
        value: field.backup || "`Empty`",
        inline: true,
      },
      {
        name: "<:salvation:1287461617017032805> North Chargers",
        value: field.nc || "`Empty`",
        inline: true,
      },
      {
        name: "<:Divert:1287452889333108788> Pet 1/3",
        value: field.pet1 || "`Empty`",
        inline: true,
      },
      {
        name: "<:Resonance:1288127144697794643> Pet 2",
        value: field.pet2 || "`Empty`",
        inline: true,
      },
    )
    .setFooter({
      text: "Ongoing Hosting",
      iconURL: "https://cdn.discordapp.com/emojis/1285924977035710514.gif",
    })
    .setTimestamp();

  // First row of buttons
  const actionRow1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder() //match custom id to field.[customID] above
      .setCustomId("base:true") // 'false' means non-exclusive
      .setEmoji("1287459187194073189")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("backup:true") // 'true' means exclusive (only one person on this role)
      .setEmoji("1287461613921636503")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("nc:true")
      .setEmoji("1287461617017032805")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("pet1:true")
      .setEmoji("1287452889333108788")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("pet2:true")
      .setEmoji("1288127144697794643")
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

module.exports = { createBeastmasterEmbed, combinabilityRules };