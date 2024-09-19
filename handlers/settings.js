const fs = require("fs");
const path = require("path");

// Define the path for settings.json to be in a 'config' folder one level up
const settingsDir = path.join(__dirname, "..", "config");
const settingsFilePath = path.join(settingsDir, "settings.json");

// Ensure the directory exists
if (!fs.existsSync(settingsDir)) {
  fs.mkdirSync(settingsDir, { recursive: true });
}

function loadSettings() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const data = fs.readFileSync(settingsFilePath, "utf8");
      return JSON.parse(data);
    } else {
      const defaultSettings = {}; // No global settings, guild-specific only
      saveSettings(defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error("Error loading settings:", error);
    return {}; // Return empty settings on error
  }
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(
      settingsFilePath,
      JSON.stringify(settings, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

// Add or update doublePing setting for a specific guild
function setDoublePing(guildId, value) {
  const settings = loadSettings();

  // Ensure the guild has an entry in the settings, if not create it
  if (!settings[guildId]) {
    settings[guildId] = { restrictedRoles: [], doublePing: false };
  }

  // Update doublePing for the guild
  settings[guildId].doublePing = value;
  saveSettings(settings);
}

// Add a role to the restricted list for a specific guild
function addRestrictedRole(guildId, roleId) {
  const settings = loadSettings();

  // Ensure the guild has an entry in the settings, if not create it
  if (!settings[guildId]) {
    settings[guildId] = { restrictedRoles: [], doublePing: false };
  }

  // If the role is not already in the restricted list for the guild, add it
  if (!settings[guildId].restrictedRoles.includes(roleId)) {
    settings[guildId].restrictedRoles.push(roleId);
    saveSettings(settings);
    return true; // Role was added
  }

  return false; // Role was already in the list
}

// Remove a role from the restricted list for a specific guild
function removeRestrictedRole(guildId, roleId) {
  const settings = loadSettings();

  // If the guild has no restricted roles, there's nothing to remove
  if (!settings[guildId] || !settings[guildId].restrictedRoles) {
    return false; // Guild or role not found
  }

  const index = settings[guildId].restrictedRoles.indexOf(roleId);

  // If the role is found in the guild's restricted roles, remove it
  if (index > -1) {
    settings[guildId].restrictedRoles.splice(index, 1);
    saveSettings(settings);
    return true; // Role was removed
  }

  return false; // Role was not in the list
}

// Check if a role is restricted in a specific guild
function isRoleRestricted(guildId, roleId) {
  const settings = loadSettings();

  // If the guild doesn't have restricted roles, return false
  if (!settings[guildId] || !settings[guildId].restrictedRoles) {
    return false;
  }

  return settings[guildId].restrictedRoles.includes(roleId);
}

// Get doublePing setting for a specific guild
function getDoublePing(guildId) {
  const settings = loadSettings();

  // Return the doublePing value for the guild, or false if not set
  return settings[guildId]?.doublePing ?? false;
}

module.exports = {
  loadSettings,
  saveSettings,
  addRestrictedRole,
  removeRestrictedRole,
  isRoleRestricted,
  setDoublePing,
  getDoublePing,
};