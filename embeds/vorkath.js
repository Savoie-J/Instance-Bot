const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  
  const combinabilityRules = {
    "Zemouregal Tank": ["Learner", "Ballista"],
    "Vorkath Tank": ["Learner", "Ballista"],
    Ballista: ["Learner", "Zemouregal Tank", "Vorkath Tank"],
    Free: ["Learner"],
    Learner: ["Zemouregal Tank", "Vorkath Tank", "Ballista", "Free"]
  };
  
  function createVorkathEmbed(user, field = {}) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: user.globalName, iconURL: user.displayAvatarURL() })
      .setTitle("Vorkath")
      .setURL("https://runescape.wiki/w/Zemouregal_%26_Vorkath")
      .setThumbnail(
        "https://runescape.wiki/images/Vorkath.png?547c0"
      )
      .setColor("Random")
      .addFields(
        {
          name: "<:zemo:1289009857306820620> Zemouregal Tank",
          value: field["Zemouregal Tank"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:vorkathy:1289006786149355570> Vorkath Tank",
          value: field["Vorkath Tank"] || "`Empty`",
          inline: true,
        },
        {
          name: "<:ballista:1289009216828342292> Ballista",
          value: field.Ballista || "`Empty`",
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
        .setCustomId("Zemouregal Tank:true") // customID is what will be sent to users
        .setEmoji("1289009857306820620")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("Vorkath Tank:true")
        .setEmoji("1289006786149355570")
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId("Ballista:true")
        .setEmoji("1289009216828342292")
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
  
  module.exports = { createVorkathEmbed, combinabilityRules };