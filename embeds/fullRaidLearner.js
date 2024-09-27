const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  
  // separate by commas, based on button's customID
  const combinabilityRules = {
    "Base": ["learner", "Base (Yaka)", "CPR", "Poison Tank", "North Tank", "Jelly Wrangler", "Main Stun", "Stun 5", "Shark 10", "Double", "Stun 0", "Backup Stun"],
    "Backup": ["learner", "Base (Yaka)", "CPR", "Poison Tank", "North Tank", "Jelly Wrangler", "Main Stun", "Stun 5", "Shark 10", "Double", "Stun 0", "Backup Stun"],
    "North Chargers": ["learner", "Base (Yaka)", "CPR", "Poison Tank", "North Tank", "Jelly Wrangler", "Main Stun", "Stun 5", "Shark 10", "Double", "Stun 0", "Backup Stun"],
    "Pet 1/3": ["learner", "Base (Yaka)", "CPR", "Poison Tank", "North Tank", "Jelly Wrangler", "Main Stun", "Stun 5", "Shark 10", "Double", "Stun 0", "Backup Stun"],
    "Pet 2": ["learner", "Base (Yaka)", "CPR", "Poison Tank", "North Tank", "Jelly Wrangler", "Main Stun", "Stun 5", "Shark 10", "Double", "Stun 0", "Backup Stun"],
    "Free": ["learner", "backup", "North Chargers", "Pet 1/3", "Pet 2", "Base (Yaka)", "CPR", "Poison Tank", "North Tank", "Jelly Wrangler", "Main Stun", "Stun 5", "Shark 10", "Double", "Stun 0", "Backup Stun"],
    
    "Base (Yaka)": ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "learner"],
    
    "CPR": ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "learner", "Shark 10", "Stun 5", "Jelly Wrangler", "North Tank"],
    "Poison Tank": ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "learner", "North Tank", "Jelly Wrangler", "Stun 5", "Shark 10"],
    "Double": ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "learner", "North Tank", "Jelly Wrangler", "Stun 5", "Shark 10"],
    "Main Stun": ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "learner", "North Tank", "Jelly Wrangler", "Stun 5", "Shark 10"],
    "Backup Stun": ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "learner", "North Tank", "Jelly Wrangler", "Stun 5", "Shark 10"],

    "North Tank": ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "learner", "CPR", "Main Stun", "Poison Tank", "Double", "Backup Stun"],
    "Jelly Wrangler": ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "learner", "CPR", "Main Stun", "Poison Tank", "Double", "Backup Stun"],
    'Stun 5': ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "learner", "CPR", "Main Stun", "Poison Tank", "Double", "Backup Stun"],
    'Stun 0': ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "learner", "CPR", "Main Stun", "Poison Tank", "Double", "Backup Stun"],
    "Shark 10": ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "learner", "CPR", "Main Stun", "Poison Tank", "Double", "Backup Stun"],
    
    "Learner": ["base", "backup", "North Chargers", "Pet 1/3", "Pet 2", "free", "Base (Yaka)", "CPR", "Poison Tank", "North Tank", "Jelly Wrangler", "Main Stun", "Stun 5", "Shark 10", "Double", "Stun 0", "Backup Stun"],
  };
  
  // Boss == value set in builder with the first letter capitalized, keep it lowercase in value
  function createFullRaidLearnerEmbed(user, field = {}) {
    // Create the embed
    const embed = new EmbedBuilder()
      .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() })
      .setTitle("Full Raid (Learner)") // BossName
      .setURL("https://runescape.wiki/w/Yakamaru") // Link to strategy guide or wiki page
      .setThumbnail("https://runescape.wiki/images/Yakamaru.png?18623") //link to image (cant host locally)
      .setColor("Random") // Change to fit boss
      .addFields(
        {
          name: "<:Incite:1287459187194073189> Base",
          value: field.Base || "`Empty`",
          inline: true,
        },
        {
          name: "<:loyalty:1287461613921636503> Backup",
          value: field.Backup || "`Empty`",
          inline: true,
        },
        {
          name: "<:salvation:1287461617017032805> North Chargers",
          value: field["North Chargers"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:Divert:1287452889333108788> Pet 1/3",
          value: field["Pet 1/3"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:Resonance:1288127144697794643> Pet 2",
          value: field["Pet 2"] || "`Empty`",
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: "<:dome:1287461615452688384> Base (Yaka)",
          value: field["Base (Yaka)"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:constitution:1288496464942862407> CPR",
          value: field.CPR || "`Empty`",
          inline: true,
        },
        {
          name: "<:stun:1288492612499800226> Main Stun",
          value: field["Main Stun"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:Staggericon:1288647971210137691> Backup Stun",
          value: field["Backup Stun"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:Poison:1288127146782363690> Poison Tank",
          value: field["Poison Tank"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:Surge:1288647970216083527> Double",
          value: field.Double || "`Empty`",
          inline: true,
        },
        {
          name: "<:plank:1288497085381087418> Stun 5",
          value: field["Stun 5"] || "`Empty`\n`Empty`",
          inline: true,
        },
        {
          name: "<:SmokeTendrils:1288647967770935358> Stun 0",
          value: field["Stun 0"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:sharknado:1288497087599607850> Shark 10",
          value: field["Shark 10"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:barricade:1288496439047098389> North Tank",
          value: field["North Tank"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:durable:1288498547444027392> Jelly Wrangler",
          value: field["Jelly Wrangler"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:WeaponSpecialAttack:1287459183503081492> Free",
          value: field.Free || "`Empty`",
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
      .setCustomId("Base:true")
      .setEmoji("1287459187194073189")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Backup:true")
      .setEmoji("1287461613921636503")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("North Chargers:true")
      .setEmoji("1287461617017032805")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Pet 1/3:true")
      .setEmoji("1287452889333108788")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Pet 2:true")
      .setEmoji("1288127144697794643")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Base (Yaka):true")
      .setEmoji("1287461615452688384")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("CPR:true")
      .setEmoji("1288496464942862407")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Main Stun:true")
      .setEmoji("1288492612499800226")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Backup Stun:true")
      .setEmoji("1288647971210137691")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Poison Tank:true")
      .setEmoji("1288127146782363690")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Double:true")
      .setEmoji("1288647970216083527")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Stun 5:true")
      .setEmoji("1288497085381087418")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Stun 0:true")
      .setEmoji("1288647967770935358")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Shark 10:true")
      .setEmoji("1288497087599607850")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("North Tank:true")
      .setEmoji("1288496439047098389")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("Jelly Wrangler:true")
      .setEmoji("1288498547444027392")
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
  
  module.exports = { createFullRaidLearnerEmbed, combinabilityRules };