const { PermissionFlagsBits } = require("discord-api-types/v10");
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

module.exports = {
  async handleAssignment(interaction, isAssign) {
    const user = interaction.options.getUser("user");
    const messageLink = interaction.options.getString("message_link");

    // Validate message link format
    const messageLinkPattern = /channels\/\d+\/(\d+)\/(\d+)/;
    const match = messageLink.match(messageLinkPattern);
    if (!match) {
      return interaction.reply({
        content: "Invalid message link format.",
        ephemeral: true,
      });
    }

    const [, channelId, messageId] = match;

    // Permissions check early
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEvents)) {
      return interaction.reply({
        content: "You don't have permission to modify this embed.",
        ephemeral: true,
      });
    }

    try {
      const channel = await interaction.client.channels.fetch(channelId);
      if (!channel) throw new Error("Channel not found");

      const message = await channel.messages.fetch(messageId);
      if (!message) throw new Error("Message not found");

      if (!message.embeds.length) {
        return interaction.reply({
          content: "No embed found in the specified message.",
          ephemeral: true,
        });
      }

      const embed = EmbedBuilder.from(message.embeds[0]);
      const fields = embed.data.fields.map((field, index) => {
        const emojiMatch = field.name.match(/<(.+?):(\d+)>/);
        const emoji = emojiMatch
          ? { name: emojiMatch[1], id: emojiMatch[2] }
          : null;

        // Remove the emoji part from the title
        const title = emojiMatch
          ? field.name.replace(emojiMatch[0], "").trim()
          : field.name;

        return {
          label: title, // Use the trimmed title
          value: index.toString(),
          emoji: emoji ? { id: emoji.id, name: emoji.name } : null,
        };
      });

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("field_select")
          .setPlaceholder("Select a field")
          .addOptions(
            fields.map((field) => ({
              label: field.label,
              value: field.value,
              emoji: field.emoji,
            }))
          )
      );

      await interaction.reply({
        content: `Please select the field to ${
          isAssign ? "assign" : "unassign"
        } ${user} ${isAssign ? "to" : "from"}:`,
        components: [row],
        ephemeral: true,
      });

      const filter = (i) =>
        i.customId === "field_select" && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 180000,
        max: 1,
      });

      collector.on("collect", async (i) => {
        const selectedField = embed.data.fields[parseInt(i.values[0])];

        // Handle assigning or unassigning
        if (isAssign) {
          if (selectedField.value === "`Empty`") {
            selectedField.value = user.toString();
          } else if (!selectedField.value.includes(user.toString())) {
            selectedField.value += ` ${user.toString()}`;
          } else {
            await i.update({
              content: `${user} is already assigned to this field.`,
              components: [],
            });
            return;
          }
        } else {
          if (selectedField.value.includes(user.toString())) {
            selectedField.value = selectedField.value
              .replace(user.toString(), "")
              .replace(/\s*,\s*$/, "")
              .replace(/^\s*,\s*/, "");
            if (selectedField.value === "") selectedField.value = "`Empty`";
          } else {
            await i.update({
              content: `${user} is not assigned to this field.`,
              components: [],
            });
            return;
          }
        }

        // Update the embed
        await message.edit({ embeds: [embed] });
        await i.update({
          content: `Successfully ${
            isAssign ? "assigned" : "unassigned"
          } ${user} ${isAssign ? "to" : "from"} ${selectedField.name}.`,
          components: [],
        });
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.editReply({
            content: "Selection timed out after 3 minutes.",
            components: [],
          });
        }
      });
    } catch (error) {
      console.error("Error fetching channel or message:", error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};