const { safeStorage, app } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Config directory under Linux ~/.config/one-cloud
const configDir = path.join(os.homedir(), '.config', 'one-cloud');
const encryptedConfigFile = path.join(configDir, 'credentials.enc');
const envConfigFile = path.join(configDir, '.env');

function ensureConfigDir() {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true, mode: 0o700 }); // Private permissions (rwx------)
  }
}

/**
 * Saves sensitive API keys/credentials encrypted with Linux OS Keyring (GNOME Keyring / KWallet)
 */
function saveEncryptedCredentials(credentials) {
  try {
    ensureConfigDir();
    const rawJson = JSON.stringify(credentials);

    if (safeStorage && safeStorage.isEncryptionAvailable()) {
      const encryptedBuffer = safeStorage.encryptString(rawJson);
      fs.writeFileSync(encryptedConfigFile, encryptedBuffer, { mode: 0o600 });
      return { success: true, encrypted: true };
    } else {
      // Fallback: file with 0600 (owner-only read/write) permissions
      fs.writeFileSync(encryptedConfigFile, Buffer.from(rawJson).toString('base64'), { mode: 0o600 });
      return { success: true, encrypted: false, notice: 'Stored with private file permissions' };
    }
  } catch (err) {
    console.error('Failed to save encrypted credentials:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Loads sensitive credentials decrypted from Linux OS Keyring or ~/.config/one-cloud/.env
 */
function loadEncryptedCredentials() {
  const result = {
    apiId: process.env.TELEGRAM_API_ID || '',
    apiHash: process.env.TELEGRAM_API_HASH || '',
  };

  // 1. Check encrypted credentials file
  try {
    if (fs.existsSync(encryptedConfigFile)) {
      const fileBuffer = fs.readFileSync(encryptedConfigFile);
      let rawJson = '';

      if (safeStorage && safeStorage.isEncryptionAvailable()) {
        rawJson = safeStorage.decryptString(fileBuffer);
      } else {
        rawJson = Buffer.from(fileBuffer.toString('utf-8'), 'base64').toString('utf-8');
      }

      const parsed = JSON.parse(rawJson);
      if (parsed.apiId) result.apiId = parsed.apiId;
      if (parsed.apiHash) result.apiHash = parsed.apiHash;
    }
  } catch (err) {
    console.warn('Could not read encrypted config:', err.message);
  }

  // 2. Check local .env file (~/.config/one-cloud/.env)
  try {
    if (fs.existsSync(envConfigFile)) {
      const lines = fs.readFileSync(envConfigFile, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...vals] = trimmed.split('=');
        const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
        if (key.trim() === 'TELEGRAM_API_ID' && !result.apiId) result.apiId = val;
        if (key.trim() === 'TELEGRAM_API_HASH' && !result.apiHash) result.apiHash = val;
      }
    }
  } catch (err) {
    console.warn('Could not read user .env:', err.message);
  }

  return result;
}

module.exports = {
  saveEncryptedCredentials,
  loadEncryptedCredentials,
  configDir,
};
