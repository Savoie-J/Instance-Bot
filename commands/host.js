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
const restrictCommand = require("./restrict"); // Adjust path as needed

console.log("Loaded embeds:", Object.keys(embeds)); // Check which embeds are loaded

const doublePingSettings = new Map(); // Store double-ping settings for each guild

// Load double-ping settings from file
const settings = loadSettings();
for (const [guildId, enabled] of Object.entries(settings.doublePing || {})) {
  doublePingSettings.set(guildId, enabled);
}

function areRolesCombinable(activityName, role1, role2) {
  console.log(
    `Checking combinability for ${activityName}: '${role1}' and '${role2}'`
  );
  if (!role1 || !role2) {
    console.log("One of the roles is empty, returning false");
    return false;
  }
  const rules = embeds[activityName].combinabilityRules;
  if (!rules) {
    console.log(`No combinability rules found for activity: ${activityName}`);
    return false;
  }

  // Check both directions
  const result =
    (rules[role1] && rules[role1].includes(role2)) ||
    (rules[role2] && rules[role2].includes(role1));

  console.log(`Result: ${result}`);
  return result;
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

          const input = interaction.options.getString("mention");

          let validMentions = [];
          let mentionSet = new Set(); // Track unique mentions

          // Ensure input exists before processing mentions
          if (input) {
            const mentions = input.split(" ").filter(Boolean); // Splitting input and removing empty strings

            for (let mention of mentions) {
              const roleId = mention.replace(/[<@&>]/g, "");
              const userId = mention.replace(/[<@!>]/g, "");

              // Check for duplicates
              if (mentionSet.has(mention)) {
                await interaction.reply({
                  content: "You can't mention the same role more than once.",
                  ephemeral: true,
                });
                return; // Stop processing further
              }

              mentionSet.add(mention); // Add mention to the set

              // Check if the mention is a role
              if (interaction.guild.roles.cache.has(roleId)) {
                validMentions.push(`<@&${roleId}>`); // Role mention
              } else if (interaction.guild.members.cache.has(userId)) {
                // If the mention is a user
                await interaction.reply({
                  content: `${mention} is not a valid role, please use only role mentions.`,
                  ephemeral: true,
                });
                return; // Stop processing further
              } else {
                // If the mention is neither a role nor a user (possibly a channel or invalid mention)
                await interaction.reply({
                  content: `${mention} is not a valid role, please ensure you're only mentioning roles.`,
                  ephemeral: true,
                });
                return; // Stop processing further
              }
            }
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

            // Check if validMentions exists and has valid entries
            if (validMentions.length > 0) {
              reply = validMentions.join(" "); // Combine all valid mentions
            }

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
                  (field) =>
                    field.name === "<:Intercept:1287469958909136988> Fill"
                )
              ) {
                embed.addFields({
                  name: "<:Intercept:1287469958909136988> Fill",
                  value: "`Empty`",
                  inline: true,
                });
              }
              if (
                addLearner &&
                !embed.data.fields.some(
                  (field) =>
                    field.name === "<:Intercepted:1287469955465609321> Learner"
                )
              ) {
                embed.addFields({
                  name: "<:Intercepted:1287469955465609321> Learner",
                  value: "`Empty`",
                  inline: true,
                });
              }
              if (
                addReserve &&
                !embed.data.fields.some(
                  (field) =>
                    field.name === "<:Team:1287469956824432713> Reserve"
                )
              ) {
                embed.addFields({
                  name: "<:Team:1287469956824432713> Reserve",
                  value: "`Empty`",
                  inline: true,
                });
              }

              const uniqueUsers = new Set();
              embed.data.fields.forEach((field) => {
                if (field.value !== "`Empty`" && field.name.trim() !== "") {
                  field.value.split("\n").forEach((line) => {
                    const trimmedLine = line.trim();
                    if (
                      trimmedLine !== "" &&
                      trimmedLine !== "`Empty`" &&
                      trimmedLine !== "\u200B"
                    ) {
                      const match = trimmedLine.match(/<@!?(\d+)>/);
                      if (match) {
                        uniqueUsers.add(match[0]);
                      }
                    }
                  });
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

              // Function to split buttons into groups of 5
              const splitButtonsIntoRows = (buttons) => {
                const rows = [];
                for (let i = 0; i < buttons.length; i += 5) {
                  const row = new ActionRowBuilder().addComponents(
                    buttons.slice(i, i + 5)
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
                    .setCustomId("Fill:false")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("1287469958909136988")
                );
              }
              if (addLearner) {
                allButtons.push(
                  new ButtonBuilder()
                    .setCustomId("Learner:false")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("1287469955465609321")
                );
              }
              if (addReserve) {
                allButtons.push(
                  new ButtonBuilder()
                    .setCustomId("Reserve:false")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("1287469956824432713")
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

            // Collect role IDs from valid mentions
            const roleIds = validMentions
              .filter((mention) => mention.startsWith("<@&")) // Filter for role mentions only
              .map((mention) => mention.replace(/[<@&>]/g, "")); // Extract the role ID

            // console.log(roleIds);

            const sentMessage = await interaction.reply({
              content: reply,
              embeds: [embed],
              components: actionRows,
              fetchReply: true,
              allowedMentions: { roles: roleIds },
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

                  const countUniqueUsers = () => {
                    const allUsers = new Set();
                    const nonReserveUsers = new Set();
                    const reserveUsers = new Set();

                    fields.forEach((f) => {
                      // Skip fields that are just blank Unicode characters or empty
                      if (f.name.trim() === "" || f.value.trim() === "") return;

                      f.value.split("\n").forEach((line) => {
                        // Trim the line and check if it's not empty, not 'Empty', and not a blank Unicode character
                        const trimmedLine = line.trim();
                        if (
                          trimmedLine !== "" &&
                          trimmedLine !== "`Empty`" &&
                          trimmedLine !== "\u200B"
                        ) {
                          // Extract user ID from the line
                          const match = trimmedLine.match(/<@!?(\d+)>/);
                          if (match) {
                            const user = match[0];
                            allUsers.add(user);
                            if (f.name.toLowerCase().includes("reserve")) {
                              reserveUsers.add(user);
                            } else {
                              nonReserveUsers.add(user);
                            }
                          }
                        }
                      });
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

                  // Check if the user is already in this role
                  const userInRole = currentValue.includes(userId);

                  // Handle assignment/unassignment
                  if (userInRole) {
                    // Unassign the user
                    const updatedLines = currentValue
                      .split("\n")
                      .map((line) =>
                        line.includes(userId) ? "`Empty`" : line
                      );
                    field.value = updatedLines.join("\n");
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
                        .filter(
                          (field) =>
                            field.value.includes(userId) &&
                            field.value !== "`Empty`"
                        )
                        .map((field) => {
                          //console.log("Processing field:", field);
                          // Extract the role name from the field name, preserving case
                          const roleName = field.name
                            .replace(/^<:[^:]+:\d+>\s*/, "")
                            .trim();
                          //console.log("Extracted role name:", roleName);
                          return roleName;
                        });

                      console.log("User current roles:", userCurrentRoles);

                      const nonCombinableRoles = userCurrentRoles.filter(
                        (currentRole) =>
                          !areRolesCombinable(
                            activityName,
                            roleName,
                            currentRole
                          )
                      );

                      //console.log("Non-combinable roles:", nonCombinableRoles);

                      if (nonCombinableRoles.length > 0) {
                        const rolesList = nonCombinableRoles
                          .map((role) => role)
                          .join(", ");
                        await i.reply({
                          content: `The \`${roleName}\` role isn't combinable with your \`${rolesList}\` role.`,
                          ephemeral: true,
                        });
                        return;
                      }

                      // Handle exclusive roles (only one user allowed) if combine is not "yes"
                      if (isExclusive && !currentValue.includes("`Empty`")) {
                        await i.reply({
                          content: `The ${roleName} role is exclusive and already taken.`,
                          ephemeral: true,
                        });
                        return;
                      }
                    }

                    // Assign the user to the first empty spot
                    const lines = currentValue.split("\n");
                    const emptyIndex = lines.findIndex(
                      (line) => line === "`Empty`"
                    );
                    if (emptyIndex !== -1) {
                      lines[emptyIndex] = userId;
                      field.value = lines.join("\n");
                    } else {
                      await i.reply({
                        content: `No empty spots available for ${roleName}.`,
                        ephemeral: true,
                      });
                      return;
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

              if (doublePingEnabled && validMentions.length > 0) {
                const mentionContent = validMentions.join(" "); // Combine all mentions into a single string
                await thread.send({
                  content: mentionContent,
                  allowedMentions: {
                    roles: validMentions.map((mention) =>
                      mention.replace(/[<@&>]/g, "")
                    ),
                  },
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
    let choices = [];

    switch (focusedOption.name) {
      case "date":
        choices = generateDateChoices();
        break;
      case "time":
        choices = generateTimeChoices();
        break;
    }

    const userInput = focusedOption.value.toLowerCase();
    let filtered;

    if (focusedOption.name === "date") {
      filtered = choices.filter(
        (choice) =>
          choice.name.toLowerCase().includes(userInput) ||
          isValidDateFormat(userInput)
      );
    } else if (focusedOption.name === "time") {
      filtered = choices.filter(
        (choice) =>
          choice.name.toLowerCase().includes(userInput) ||
          isValidTimeFormat(userInput)
      );
    } else {
      filtered = choices.filter((choice) =>
        choice.name.toLowerCase().includes(userInput)
      );
    }

    if (
      filtered.length === 0 &&
      (isValidDateFormat(userInput) || isValidTimeFormat(userInput))
    ) {
      filtered.push({ name: userInput, value: userInput });
    }

    await interaction.respond(
      filtered
        .slice(0, 25)
        .map((choice) => ({ name: choice.name, value: choice.value }))
    );
  },
};
