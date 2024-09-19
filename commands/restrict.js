const { PermissionFlagsBits } = require("discord-api-types/v10");
const {
  addRestrictedRole,
  removeRestrictedRole,
  loadSettings,
} = require("../handlers/settings");

module.exports = {
  async execute(interaction) {
    // Check if the user has administrator permissions
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const action = interaction.options.getString("action");
    const guildId = interaction.guild.id; // Get the guild ID

    if (action === "list") {
      const settings = loadSettings();
      const restrictedRoles = settings[guildId]?.restrictedRoles || []; // Fetch roles for this guild

      if (restrictedRoles.length === 0) {
        await interaction.reply({
          content: "There are currently no restricted roles.",
          ephemeral: true,
        });
      } else {
        const roleMentions = restrictedRoles.map((roleId) => {
          const role = interaction.guild.roles.cache.get(roleId);
          return role ? `<@&${roleId}>` : `Unknown Role (ID: ${roleId})`;
        });
        await interaction.reply({
          content: `Current restricted roles:\n${roleMentions.join("\n")}`,
          ephemeral: true,
        });
      }
      return;
    }

    const role = interaction.options.getRole("role");
    if (!role) {
      return interaction.reply({
        content: "You must specify a role for add or remove actions.",
        ephemeral: true,
      });
    }

    if (action === "add") {
      if (addRestrictedRole(guildId, role.id)) {
        // Pass the guild ID
        await interaction.reply({
          content: `<@&${role.id}> has been added to the restricted list.`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `<@&${role.id}> is already in the restricted list.`,
          ephemeral: true,
        });
      }
    } else if (action === "remove") {
      if (removeRestrictedRole(guildId, role.id)) {
        // Pass the guild ID
        await interaction.reply({
          content: `<@&${role.id}> has been removed from the restricted list.`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `<@&${role.id}> was not in the restricted list.`,
          ephemeral: true,
        });
      }
    }
  },
};