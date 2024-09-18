const fs = require('fs');
const path = require('path');

// Define the path for settings.json to be in a 'config' folder one level up
const settingsDir = path.join(__dirname, '..', 'config');
const settingsFilePath = path.join(settingsDir, 'settings.json');

// Ensure the directory exists
if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
}

// Load settings from the file
function loadSettings() {
    if (fs.existsSync(settingsFilePath)) {
        const data = fs.readFileSync(settingsFilePath, 'utf8');
        return JSON.parse(data);
    } else {
        // Create a new file with default settings if none exists
        const defaultSettings = {
            doublePing: {}
        };
        saveSettings(defaultSettings); // Save the default settings
        return defaultSettings;
    }
}

// Save settings to the file
function saveSettings(settings) {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');
}

module.exports = {
    loadSettings,
    saveSettings
};