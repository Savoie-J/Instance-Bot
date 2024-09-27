const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  
  const combinabilityRules = {
    Base: ["Learner"],
    TL5: ["Learner"],
    "Bomb Tank I": ["Learner"],
    "Bomb Tank II": ["Learner"],
    Free: ["Learner"],
    Learner: ["Base", "TL5", "Bomb Tank I", "Bomb Tank II", "Free"]
  };
  
  function createVoragoHMEmbed(user, field = {}) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() })
      .setTitle("Vorago (Hard Mode)")
      .setURL("https://runescape.wiki/w/Vorago/Strategies/Hard_mode#The_fight")
      .setThumbnail(
        "https://runescape.wiki/images/Vitalis_%28pet%29.png?89290"
      )
      .setColor("Random")
      .addFields(
        {
          name: "<:Incite:1287459187194073189> Base",
          value: field.Base || "`Empty`",
          inline: true,
        },
        {
          name: "<:bleed:1287460958230544445> Bomb Tank I",
          value: field["Bomb Tank I"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:red_bomb:1278666593559117875> Bomb Tank II",
          value: field["Bomb Tank II"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:me_irl:1278180663115124839> TL5",
          value: field.TL5 || "`Empty`",
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
      new ButtonBuilder()
        .setCustomId("Base:true") // customID is what will be sent to users
        .setEmoji("1287459187194073189")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("Bomb Tank I:true")
        .setEmoji("1287460958230544445")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("Bomb Tank II:true")
        .setEmoji("1278666593559117875")
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId("TL5:true")
        .setEmoji("1278180663115124839")
        .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
        .setCustomId("Free:false")
        .setEmoji("1287459183503081492")
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
  
  module.exports = { createVoragoHMEmbed, combinabilityRules };