const {
  PermissionFlagsBits,
  ButtonStyle,
  ComponentType,
} = require("discord-api-types/v10");
const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { handleAssignment } = require("./assignment");
const { loadFolder } = require("../handlers/load");
const hostCommandBuilder = require("./builders/host");
const embeds = loadFolder("./embeds"); // Dynamically load all embeds
const handlers = loadFolder("./handlers");
const { getDateTimeDetails } = handlers.datetime;
const generateTimeChoices = handlers.time;
const generateDateChoices = handlers.date;
const { loadSettings, saveSettings, setDoublePing, getDoublePing } =
  handlers.settings; // Import settings functions
const { isRoleRestricted } = require("../handlers/settings");
const restrictCommand = require("./restrict"); // Adjust path as needed

console.log("Loaded embeds:", Object.keys(embeds)); // Check which embeds are loaded

const doublePingSettings = new Map(); // Store double-ping settings for each guild

// Load double-ping settings from file
const settings = loadSettings();
for (const [guildId, enabled] of Object.entries(settings.doublePing || {})) {
  doublePingSettings.set(guildId, enabled);
}

function areRolesCombinable(activityName, role1, role2) {
  const rules = embeds[activityName].combinabilityRules;
  return rules && rules[role1] && rules[role1].includes(role2);
}

function isValidDateFormat(input) {
  return /^\d{4}-\d{2}-\d{2}$/.test(input);
}

function isValidTimeFormat(input) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(input);
}

module.exports = {
  data: hostCommandBuilder,
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case "double-ping":
          // Check if the user has administrator permissions
          if (
            !interaction.member.permissions.has(
              PermissionFlagsBits.Administrator
            )
          ) {
            return interaction.reply({
              content: "You do not have permission to use this command.",
              ephemeral: true,
            });
          }
          const subcommand = interaction.options.getSubcommand();
          const guildId = interaction.guild.id;

          if (subcommand === "double-ping") {
            const enabled = interaction.options.getString("enabled");

            if (enabled === null) {
              // If no option was provided, just show the current setting
              const currentSetting = getDoublePing(guildId);
              await interaction.reply({
                content: `Double-ping is currently ${
                  currentSetting ? "enabled" : "disabled"
                } for this server.`,
                ephemeral: true,
              });
            } else {
              // If an option was provided, update the setting
              const newSetting = enabled === "yes";
              setDoublePing(guildId, newSetting);

              await interaction.reply({
                content: `Double-ping has been ${
                  newSetting ? "enabled" : "disabled"
                } for this server.`,
                ephemeral: true,
              });
            }
            return;
          }
          break;

        case "restrict":
          await restrictCommand.execute(interaction);
          break;

        case "assign":
          await handleAssignment(interaction, true);
          break;

        case "unassign":
          await handleAssignment(interaction, false);
          break;

        case "activity":
          // Rest of your existing code for the 'activity' subcommand
          const activityName = interaction.options.getString("name");
          const createThread = interaction.options.getString("thread") || "Yes"; // Default to 'Yes'
          const date = interaction.options.getString("date");
          const time = interaction.options.getString("time");
          const mention = interaction.options.getRole("mention");
          const maxPlayers = interaction.options.getInteger("maximum_players");
          const description = interaction.options.getString("description");
          const combine = interaction.options.getString("combine") || "no";

          // Get new options
          const addFill = interaction.options.getString("fill") === "yes";
          const addLearner = interaction.options.getString("learner") === "yes";
          const addReserve =
            interaction.options.getString("reserve") === "yes" ||
            interaction.options.getString("reserve") === null; // Default to 'yes'

          // Check if date is provided before validating its format
          if (date && !isValidDateFormat(date)) {
            return interaction.reply({
              content: "Invalid date format. Please use YYYY-MM-DD.",
              ephemeral: true,
            });
          }

          // Check if time is provided before validating its format
          if (time && !isValidTimeFormat(time)) {
            return interaction.reply({
              content: "Invalid time format. Please use HH:MM.",
              ephemeral: true,
            });
          }

          // Access the function within the module
          const embedModule = embeds[activityName];
          if (!embedModule) {
            console.error("Invalid activity name or module not loaded.");
            await interaction.reply({
              content: "Invalid activity name.",
              ephemeral: true,
            });
            return;
          }

          // Create the embed function name
          const embedFunctionName = `create${
            activityName.charAt(0).toUpperCase() + activityName.slice(1)
          }Embed`;

          // Access the function within the module
          const embedFunction = embedModule[embedFunctionName];

          if (embedFunction) {
            const fields = {};

            let isGroupCompleted = false;
            let reply = "";

            // Mention role if provided
            if (mention) {
              reply = `<@&${mention.id}>`;
            } // Role mention in the content field

            const createUpdatedEmbed = (currentEmbed) => {
              const { embed, actionRow1, actionRow2 } = embedFunction(
                interaction.user,
                fields
              );

              // Preserve existing fields from the current embed
              if (currentEmbed && currentEmbed.fields) {
                embed.data.fields = currentEmbed.fields;
              }

              // Add new fields based on options, but only if they don't already exist
              if (
                addFill &&
                !embed.data.fields.some(
                  (field) => field.name === ":scales: Fill"
                )
              ) {
                embed.addFields({
                  name: ":scales: Fill",
                  value: "`Empty`",
                  inline: true,
                });
              }
              if (
                addLearner &&
                !embed.data.fields.some(
                  (field) => field.name === ":mortar_board: Learner"
                )
              ) {
                embed.addFields({
                  name: ":mortar_board: Learner",
                  value: "`Empty`",
                  inline: true,
                });
              }
              if (
                addReserve &&
                !embed.data.fields.some(
                  (field) =>
                    field.name === "<a:reserve:1286334952090370132> Reserve"
                )
              ) {
                embed.addFields({
                  name: "<a:reserve:1286334952090370132> Reserve",
                  value: "`Empty`",
                  inline: true,
                });
              }

              const uniqueUsers = new Set();
              embed.data.fields.forEach((field) => {
                if (field.value !== "`Empty`") {
                  field.value
                    .split(", ")
                    .forEach((user) => uniqueUsers.add(user));
                }
              });
              // Count users and update footer
              const userCount = uniqueUsers.size;
              const maxPlayersText = maxPlayers ? `/${maxPlayers}` : "/∞";
              const footerText = `${
                isGroupCompleted ? "Completed" : "Join"
              } (Users: ${userCount}${maxPlayersText})`;

              Object.keys(fields).forEach((key) => {
                const factor = fields[key];
                const fieldValue = factor.users.length
                  ? factor.users.join(", ")
                  : "`Empty`";
                embed.addFields(key, fieldValue, true); // Add field to the embed
              });

              // Initialize an array to hold all description parts
              let descriptionParts = [];

              // Add the custom description if provided
              if (description) {
                descriptionParts.push(description);
              }

              // Validate the date and time format if both are provided
              if (date && time) {
                const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
                if (!dateTimeRegex.test(`${date} ${time}`)) {
                  return interaction.reply({
                    content:
                      "Invalid date or time format. Please use YYYY-MM-DD for date and HH:MM for time.",
                    ephemeral: true,
                  });
                }
              } else if ((date && !time) || (!date && time)) {
                // If only one of date or time is provided, prompt the user to provide both
                return interaction.reply({
                  content:
                    "Please provide both date and time, or leave both empty.",
                  ephemeral: true,
                });
              }

              // Get date and time details
              const { dateTime, localTime, relativeTime } = getDateTimeDetails(
                date,
                time
              );

              // Add date and time details to the description parts
              let dateTimeParts = [];
              if (dateTime) dateTimeParts.push(`**Date:** \`${dateTime}\``); // Indicate UTC time
              if (localTime)
                dateTimeParts.push(`**Local Time:** <t:${localTime}:F>`); // Discord format for local time
              if (relativeTime)
                dateTimeParts.push(`**Relative Time:** <t:${relativeTime}:R>`); // Dynamic countdown

              // Add date/time information to description parts if any exist
              if (dateTimeParts.length > 0) {
                // If there's already a custom description, add an empty line before date/time info
                if (descriptionParts.length > 0) {
                  descriptionParts.push("");
                }
                descriptionParts.push(dateTimeParts.join("\n"));
              }

              // Set the description only if there's content to add
              if (descriptionParts.length > 0) {
                embed.setDescription(descriptionParts.join("\n"));
              }

              // Update footer based on group completion status
              embed.setFooter({
                text: footerText,
                iconURL: isGroupCompleted
                  ? "https://cdn.discordapp.com/emojis/1285884645136793611.png"
                  : "https://cdn.discordapp.com/emojis/1285924977035710514.gif",
              });

              // Function to split buttons into groups of 4
              const splitButtonsIntoRows = (buttons) => {
                const rows = [];
                for (let i = 0; i < buttons.length; i += 4) {
                  const row = new ActionRowBuilder().addComponents(
                    buttons.slice(i, i + 4)
                  );
                  rows.push(row);
                }
                return rows;
              };

              // Get all buttons from actionRow1
              let allButtons = [...actionRow1.components];

              // Add new buttons based on options
              if (addFill) {
                allButtons.push(
                  new ButtonBuilder()
                    .setCustomId("fill:false")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("⚖️")
                );
              }
              if (addLearner) {
                allButtons.push(
                  new ButtonBuilder()
                    .setCustomId("learner:false")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("🎓")
                );
              }
              if (addReserve) {
                allButtons.push(
                  new ButtonBuilder()
                    .setCustomId("reserve:false")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("1286334952090370132")
                );
              }

              // Split all buttons into rows of 5
              const signUpRows = splitButtonsIntoRows(allButtons);

              // Handle the utility buttons (complete and notify)
              const utilityRow = ActionRowBuilder.from(actionRow2);

              // Update "Complete group" button
              const completeButton = utilityRow.components.find(
                (c) => c.data.custom_id === "complete"
              );

              if (completeButton) {
                completeButton.setLabel(
                  isGroupCompleted ? "Re-open group" : "Complete group"
                );
              }

              // Disable/Enable buttons in all rows when group is completed
              [...signUpRows].forEach((row) => {
                row.components.forEach((button) => {
                  button.setDisabled(isGroupCompleted);
                });
              });

              // Combine all rows
              const finalActionRows = [...signUpRows, utilityRow];

              return { embed, actionRows: finalActionRows };
            };

            const { embed, actionRows } = createUpdatedEmbed();

            const sentMessage = await interaction.reply({
              content: reply,
              embeds: [embed],
              components: actionRows,
              fetchReply: true,
              allowedMentions: { roles: [mention ? mention.id : null] },
            });

            // Set up a persistent collector for button interactions
            const collector = sentMessage.createMessageComponentCollector();

            collector.on("collect", async (i) => {
              const restrictedRoles =
                settings[interaction.guild.id]?.restrictedRoles || [];
              const hasRestrictedRole = i.member.roles.cache.some((role) =>
                restrictedRoles.includes(role.id)
              );

              if (hasRestrictedRole) {
                await i.reply({
                  content:
                    "You don't have permission to access groups at this time.",
                  ephemeral: true,
                });
                return;
              }

              if (i.customId === "complete") {
                // Check if the user has ManageEvents permission
                if (
                  !i.member.permissions.has(PermissionFlagsBits.ManageEvents)
                ) {
                  await i.reply({
                    content:
                      "Only users with  `Manage Event`  permissions may complete or re-open groups.",
                    ephemeral: true,
                  });
                  return;
                }

                // Toggle group completion status
                isGroupCompleted = !isGroupCompleted;
                const currentEmbed = i.message.embeds[0];
                const { embed, actionRows } = createUpdatedEmbed(currentEmbed);
                await i.update({ embeds: [embed], components: actionRows });
              } else if (i.customId === "notify") {
                // Notify players
                const currentEmbed = i.message.embeds[0];
                if (currentEmbed && currentEmbed.fields) {
                  const uniqueUsers = new Set();
                  currentEmbed.fields.forEach((field) => {
                    if (field.value !== "`Empty`") {
                      field.value
                        .split(" ")
                        .forEach((user) => uniqueUsers.add(user));
                    }
                  });

                  // Check if the user is part of the unique users set
                  if (!uniqueUsers.has(`<@${i.user.id}>`)) {
                    await i.reply({
                      content:
                        "Only those who are signed up may notify players.",
                      ephemeral: true,
                    });
                    return;
                  }

                  if (uniqueUsers.size === 1) {
                    await i.reply({
                      content: "Who are you trying to notify?",
                      ephemeral: true,
                    });
                    return;
                  }

                  const notificationMessage =
                    Array.from(uniqueUsers).join("\n");

                  // Check if there's a thread
                  const thread = i.message.thread;
                  if (thread) {
                    await thread.send(notificationMessage);
                    await i.reply({
                      content: `Notified players in the attached thread: [${thread.name}](${thread.url})`,
                      ephemeral: true,
                    });
                  } else {
                    await i.reply(notificationMessage);
                  }
                } else {
                  await i.reply({
                    content: "There are no users to notify :(",
                    ephemeral: true,
                  });
                }
              } else {
                const [roleName, exclusiveFlag] = i.customId.split(":");
                const isExclusive = exclusiveFlag === "true";

                const embed = i.message.embeds[0];
                const fields = embed.fields;

                const fieldIndex = fields.findIndex((field) =>
                  field.name.toLowerCase().includes(roleName.toLowerCase())
                );

                if (fieldIndex !== -1) {
                  const field = fields[fieldIndex];
                  const currentValue = field.value;
                  const userId = i.user.toString();

                  // Function to count unique users and handle the special cases
                  const countUniqueUsers = () => {
                    const allUsers = new Set();
                    const nonReserveUsers = new Set();
                    const reserveUsers = new Set();

                    fields.forEach((f) => {
                      if (f.value !== "`Empty`") {
                        f.value.split(" ").forEach((user) => {
                          allUsers.add(user);
                          if (f.name.toLowerCase().includes("reserve")) {
                            reserveUsers.add(user);
                          } else {
                            nonReserveUsers.add(user);
                          }
                        });
                      }
                    });

                    // If combine is "yes", we count users in both reserve and non-reserve fields only once for non-reserve count
                    const effectiveNonReserveUsers =
                      combine.toLowerCase() === "yes"
                        ? new Set(
                            [...nonReserveUsers].filter(
                              (user) => !reserveUsers.has(user)
                            )
                          )
                        : nonReserveUsers;

                    return {
                      total: allUsers.size,
                      nonReserve: effectiveNonReserveUsers.size,
                      reserve: reserveUsers.size,
                    };
                  };

                  // Get current user counts
                  let { total, nonReserve, reserve } = countUniqueUsers();

                  // Unassign the user if they are already in this role
                  if (currentValue.includes(userId)) {
                    let users = field.value
                      .split(" ")
                      .filter((user) => user !== userId);
                    field.value = users.length ? users.join(" ") : "`Empty`";
                  } else {
                    // Check player limit (excluding reserves)
                    const isReserveRole = field.name
                      .toLowerCase()
                      .includes("reserve");
                    if (
                      maxPlayers &&
                      nonReserve >= maxPlayers &&
                      !isReserveRole &&
                      !fields.some(
                        (f) =>
                          f.value.includes(userId) &&
                          !f.name.toLowerCase().includes("reserve")
                      )
                    ) {
                      await i.reply({
                        content: `The \`${maxPlayers}\` player limit has been reached. You may still sign up as a reserve in case a user drops out.`,
                        ephemeral: true,
                      });
                      return;
                    }

                    if (combine.toLowerCase() !== "yes") {
                      // Handle non-combinable roles
                      const userCurrentRoles = fields
                        .filter((f) => f.value.includes(userId))
                        .map((f) => f.name.split(" ")[1].toLowerCase());

                      const nonCombinableRoles = userCurrentRoles.filter(
                        (currentRole) =>
                          !areRolesCombinable(
                            activityName,
                            roleName,
                            currentRole
                          )
                      );

                      if (nonCombinableRoles.length > 0) {
                        const rolesList = nonCombinableRoles.join(" ");
                        await i.reply({
                          content: `The \`${roleName}\` role isn't combinable with some of the roles you currently have: \`${rolesList}\`.`,
                          ephemeral: true,
                        });
                        return;
                      }

                      // Handle exclusive roles (only one user allowed) if combine is not "yes"
                      if (isExclusive && currentValue !== "`Empty`") {
                        await i.reply({
                          content: `The ${roleName} role is exclusive and already taken.`,
                          ephemeral: true,
                        });
                        return;
                      }
                    }

                    // Assign the user to this spot
                    if (currentValue === "`Empty`") {
                      field.value = userId;
                    } else {
                      field.value += ` ${userId}`;
                    }
                  }

                  // Recount users after the action
                  const updatedCounts = countUniqueUsers();

                  // Create and update the embed with the new user assignments
                  const { embed: updatedEmbed, actionRows } =
                    createUpdatedEmbed({
                      ...embed,
                      fields: fields,
                      userCount: updatedCounts.total,
                      maxPlayers: maxPlayers,
                    });

                  // Update the message with the new embed and components
                  await i.update({
                    embeds: [updatedEmbed],
                    components: actionRows,
                  });
                } else {
                  await i.reply({
                    content: "Field not found",
                    ephemeral: true,
                  });
                }
              }
            });

            // Check if the user requested thread creation
            if (createThread === "Yes") {
              // Create a thread attached to the sent message
              const thread = await sentMessage.startThread({
                name: `${embed.data.title}`, // Use embed title instead of activity name
                autoArchiveDuration: 4320, // Automatically archive after 3 days of inactivity
                reason: `Thread created for ${embed.data.title} activity`, // Reason for creating the thread
              });

              // Check if double-ping is enabled for this server
              const doublePingEnabled =
                doublePingSettings.get(interaction.guildId) || false;
              if (doublePingEnabled && mention) {
                await thread.send({
                  content: `<@&${mention.id}>`,
                  allowedMentions: { roles: [mention.id] },
                });
              }
            }
          } else {
            console.error("Invalid embed function.");
            await interaction.reply({
              content: "Invalid embed function.",
              ephemeral: true,
            });
          }
          break;

        default:
          interaction.reply({
            content: "Unknown subcommand.",
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error("Error in execute method:", error);
      if (!interaction.replied) {
        await interaction.reply({
          content: "There was an error executing this command!",
          ephemeral: true,
        });
      }
    }
  },

  async autocomplete(interaction) {
  const focusedOption = interaction.options.getFocused(true);
  let choices;

  switch (focusedOption.name) {
    case "date":
      choices = generateDateChoices();
      break;
    case "time":
      choices = generateTimeChoices();
      break;
    default:
      choices = [];
  }

  const userInput = focusedOption.value.toLowerCase();
  let filtered;

  if (focusedOption.name === "date") {
    filtered = choices.filter(choice => 
      choice.name.toLowerCase().includes(userInput) ||
      isValidDateFormat(userInput)
    );
  } else if (focusedOption.name === "time") {
    filtered = choices.filter(choice => 
      choice.name.toLowerCase().includes(userInput) ||
      isValidTimeFormat(userInput)
    );
  } else {
    filtered = choices.filter(choice => 
      choice.name.toLowerCase().includes(userInput)
    );
  }

  if (filtered.length === 0 && (isValidDateFormat(userInput) || isValidTimeFormat(userInput))) {
    filtered.push({ name: userInput, value: userInput });
  }

  await interaction.respond(
    filtered.slice(0, 25).map((choice) => ({ name: choice.name, value: choice.value }))
  );
}};