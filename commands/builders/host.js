const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { loadFolder } = require("../../handlers/load"); // Adjust path accordingly

// Load all handlers from the folder (this will load generateDateChoices and generateTimeChoices)
const handlers = loadFolder("./handlers"); // Adjust the folder path accordingly

const generateDateChoices = handlers.date;
const generateTimeChoices = handlers.time;

module.exports = new SlashCommandBuilder()
  .setName("host")
  .setDescription("Manage activities for hosting")

  // Subcommand for hosting an activity
  .addSubcommand((subcommand) =>
    subcommand
      .setName("activity")
      .setDescription("Host an activity")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Select an activity")
          .setRequired(true)
          .addChoices(
            { name: "Croesus", value: "croesus" }
            // Add other activities here
          )
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription(
            "Add a description to the top of the embed (max 2048 characters)"
          )
          .setMaxLength(1024)
      )
      .addRoleOption((option) =>
        option
          .setName("restrict")
          .setDescription(
            "Restrict button interactions for users with this role"
          )
      )
      .addStringOption((option) =>
        option
          .setName("thread")
          .setDescription("Create a discussion thread?")
          .addChoices(
            { name: "Yes", value: "yes" },
            { name: "No", value: "no" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("date")
          .setDescription("Select a date (YYYY-MM-DD)")
          .addChoices(generateDateChoices())
      )
      .addStringOption((option) =>
        option
          .setName("time")
          .setDescription("Select a time (HH:MM)")
          .addChoices(generateTimeChoices())
      )
      .addRoleOption((option) =>
        option
          .setName("mention")
          .setDescription("Mention a role for the activity")
      )
      .addIntegerOption((option) =>
        option
          .setName("maximum_players")
          .setDescription("Set the maximum number of players")
          .setMinValue(1)
      )
      .addStringOption((option) =>
        option
          .setName("fill")
          .setDescription("Add fill role (default: no)")
          .addChoices(
            { name: "Yes", value: "yes" },
            { name: "No", value: "no" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("learner")
          .setDescription("Add learner role (default: no)")
          .addChoices(
            { name: "Yes", value: "yes" },
            { name: "No", value: "no" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("reserve")
          .setDescription("Add reserve role (default: yes)")
          .addChoices(
            { name: "Yes", value: "yes" },
            { name: "No", value: "no" }
          )
      )
  )

  .addSubcommand((subcommand) =>
    subcommand
      .setName("assign")
      .setDescription("Assign a user to an embed")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to assign")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("message_link")
          .setDescription("The link to the message containing the embed")
          .setRequired(true)
      )
  )
  
  .addSubcommand((subcommand) =>
    subcommand
      .setName("unassign")
      .setDescription("Unassign a user from an embed")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to unassign")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("message_link")
          .setDescription("The link to the message containing the embed")
          .setRequired(true)
      )
  )

  // Subcommand for setting double-ping option
  .addSubcommand((subcommand) =>
    subcommand
      .setName("double-ping")
      .setDescription("Set whether to ping in both the channel and the thread")
      .addStringOption((option) =>
        option
          .setName("enabled")
          .setDescription("Enable or disable double-ping (default: No)")
          .setRequired(true)
          .addChoices(
            { name: "Yes", value: "yes" },
            { name: "No", value: "no" }
          )
      )
  )

  // Subcommand for managing restricted roles
  .addSubcommand((subcommand) =>
    subcommand
      .setName("restrict")
      .setDescription("Manage restricted roles for button interactions")
      .addStringOption((option) =>
        option
          .setName("action")
          .setDescription("Add, remove, or list restricted roles")
          .setRequired(true)
          .addChoices(
            { name: "Add", value: "add" },
            { name: "Remove", value: "remove" },
            { name: "List", value: "list" }
          )
      )
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription("The role to add or remove from the restricted list")
          .setRequired(false)
      )
  );