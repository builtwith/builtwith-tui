const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', '.builtwith-config.json');

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch (e) {
    // ignore corrupt config
  }
  return { apiKey: '', history: [] };
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function getApiKey() {
  const config = loadConfig();
  return config.apiKey || '';
}

function setApiKey(key) {
  const config = loadConfig();
  config.apiKey = key;
  saveConfig(config);
}

function addHistory(entry) {
  const config = loadConfig();
  if (!config.history) config.history = [];
  config.history.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  // Keep last 100 entries
  config.history = config.history.slice(0, 100);
  saveConfig(config);
}

function getHistory() {
  const config = loadConfig();
  return config.history || [];
}

module.exports = { getApiKey, setApiKey, addHistory, getHistory };
