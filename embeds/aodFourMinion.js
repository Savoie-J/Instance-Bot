const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

// separate by commas, based on button's customID
const combinabilityRules = {
  Base: ["Learner", "Hammer", "Smoke Cloud"],
  Umbra: ["Learner", "Hammer", "Smoke Cloud"],
  Glacies: ["Learner", "Hammer", "Smoke Cloud"],
  Cruor: ["Learner", "Hammer", "Smoke Cloud"],
  Fumus: ["Learner", "Hammer", "Smoke Cloud"],
  "Smoke Cloud": ["Base", "Umbra", "Glacies", "Cruor", "Fumus", "Learner", "Hammer"],
  Hammer: ["Base", "Umbra", "Glacies", "Cruor", "Fumus", "Learner", "Smoke Cloud"],
  Free: ["Learner"],
  Learner: [
    "Base",
    "Umbra",
    "Glacies",
    "Cruor",
    "Fumus",
    "Smoke Cloud",
    "Hammer",
    "Free",
  ],
};

// Boss == value set in builder with the first letter capitalized, keep it lowercase in value
function createAodFourMinionEmbed(user, field = {}) {
  // Create the embed
  const embed = new EmbedBuilder()
    .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() })
    .setTitle("Angel of Death - 4 Minion Tanks") // BossName
    .setURL("https://runescape.wiki/w/Nex") // Link to strategy guide or wiki page
    .setThumbnail("https://runescape.wiki/images/Nex_profile.png?402fb") //link to image (cant host locally)
    .setColor("Random") // Change to fit boss
    .addFields(
      {
        name: "<:Incite:1287459187194073189> Base",
        value: field.Base || "`Empty`",
        inline: true,
      },
      {
        name: "<:Umbra:1287465186537508884> Umbra",
        value: field.Umbra || "`Empty`",
        inline: true,
      },
      {
        name: "<:Glacies:1287465243303350383> Glacies",
        value: field.Glacies || "`Empty`",
        inline: true,
      },
      {
        name: "<:Cruor:1287465217730547825> Cruor",
        value: field.Cruor || "`Empty`",
        inline: true,
      },
      {
        name: "<:Fumus:1287465149363654697> Fumus",
        value: field.Fumus || "`Empty`",
        inline: true,
      },
      {
        name: "<:SmokeCloud:1287452887819096165> Smoke Cloud",
        value: field["Smoke Cloud"] || "`Empty`",
        inline: true,
      },
      {
        name: "<:Statius:1287452886854533172> Hammer",
        value: field.Hammer || "`Empty`",
        inline: true,
      },
      {
        name: "<:WeaponSpecialAttack:1287459183503081492> Free",
        value: field.Free || "`Empty`",
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
    new ButtonBuilder() //match custom id to field.[customID] above
      .setCustomId("Base:true") // 'false' means non-exclusive
      .setEmoji("1287459187194073189")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Umbra:true") // 'true' means exclusive (only one person on this role)
      .setEmoji("1287465186537508884")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Glacies:true")
      .setEmoji("1287465243303350383")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Cruor:true")
      .setEmoji("1287465217730547825")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Fumus:true")
      .setEmoji("1287465149363654697")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Smoke Cloud:true")
      .setEmoji("1287452887819096165")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Hammer:true")
      .setEmoji("1287452886854533172")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Free:false")
      .setEmoji("1287459183503081492")
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

module.exports = { createAodFourMinionEmbed, combinabilityRules };