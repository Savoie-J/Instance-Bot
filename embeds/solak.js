const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  
  const combinabilityRules = {
    Base: ["Learner", "North-West", "North-East"],
    Elf: ["Learner", "North-West", "North-East", "South-West", "South-East"],
    "North-West": ["Learner", "Elf", "Base"],
    "North-East": ["Learner", "Elf", "Base"],
    "South-West": ["Learner", "Elf"],
    "South-East": ["Learner", "Elf"],
    Learner: ["Base", "Elf", "North-West", "North-East", "South-West", "South-East"]
  };
  
  function createSolakEmbed(user, field = {}) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() })
      .setTitle("Solak")
      .setURL("https://runescape.wiki/w/Solak")
      .setThumbnail(
        "https://runescape.wiki/images/Solak.png?3239c"
      )
      .setColor("Random")
      .addFields(
        {
          name: "<:Incite:1287459187194073189> Base",
          value: field.Base || "`Empty`",
          inline: true,
        },
        {
          name: "↖ North-West",
          value: field["North-West"] || "`Empty`",
          inline: true,
        },
        {
          name: "↗ North-East",
          value: field["North-East"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:mind:1289009235556040755> Elf",
          value: field.Elf || "`Empty`",
          inline: true,
        },
        {
          name: "↙ South-West",
          value: field["South-West"] || "`Empty`",
          inline: true,
        },
        {
          name: "↘  South-East",
          value: field["South-East"] || "`Empty`",
          inline: true,
        },
      )
      .setFooter({
        text: "Join",
        iconURL: "https://cdn.discordapp.com/emojis/1285924977035710514.gif",
      })
      .setTimestamp();
  
    // First row of buttons
    const actionRow1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("Base:true") // customID is what will be sent to users
        .setEmoji("1287459187194073189")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("North-West:true")
        .setLabel("↖")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("North-East:true")
        .setLabel("↗")
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId("South-West:true")
        .setLabel("↙")
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId("South-East:true")
        .setLabel("↘")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("Elf:false")
        .setEmoji("1289009235556040755")
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
  
  module.exports = { createSolakEmbed, combinabilityRules };