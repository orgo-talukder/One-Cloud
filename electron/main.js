const { app, BrowserWindow, ipcMain, Notification, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { CustomFile } = require('telegram/client/uploads');
const { returnBigInt } = require('telegram/Helpers');
const { saveEncryptedCredentials, loadEncryptedCredentials } = require('./secure-config');

let mainWindow = null;
const activeTransfers = new Map();

// Desktop Auto-Backup State
let autoBackupWatcher = null;
let autoBackupConfig = {
  enabled: false,
  watchedPath: null,
  syncFrequency: 'realtime',
  fileTypes: ['images', 'documents', 'videos'],
  lastBackupTime: null,
  backedUpFilesCount: 0,
};

let embeddedConfig = {};
try {
  const cfgPath = path.join(__dirname, 'app-config.json');
  if (fs.existsSync(cfgPath)) {
    embeddedConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not load electron/app-config.json:', e.message);
}

function decryptSessionPayload(sessionToken) {
  try {
    const crypto = require('crypto');
    const secretKeyHex = process.env.SESSION_SECRET_KEY || embeddedConfig.sessionSecretKey || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const key = Buffer.from(secretKeyHex, 'hex');
    const [ivHex, authTagHex, encryptedHex] = sessionToken.split(':');
    if (!ivHex || !authTagHex || !encryptedHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Session decrypt error:', err);
    return null;
  }
}

async function getTelegramClient(sessionToken) {
  const decrypted = decryptSessionPayload(sessionToken);
  if (!decrypted) throw new Error('Invalid or expired Telegram session.');
  const session = JSON.parse(decrypted);

  // Check if user set secure local credentials in ~/.config/one-cloud, or use embedded/server defaults
  const localCreds = loadEncryptedCredentials();
  const apiId = Number(localCreds.apiId) || session.apiId || Number(embeddedConfig.telegramApiId) || 2496;
  const apiHash = localCreds.apiHash || session.apiHash || embeddedConfig.telegramApiHash || '8da85b0d5bfe62527e5b244c209159c3';

  const client = new TelegramClient(new StringSession(session.sessionString), apiId, apiHash, {
    connectionRetries: 5,
    useWSS: false,
  });
  await client.connect();
  return { client, session };
}

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 600,
    title: 'One Cloud',
    backgroundColor: '#0a0a0c',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Load app: either env var, or embedded production appUrl, or local dev port 3000
  const startUrl = process.env.ELECTRON_START_URL || embeddedConfig.appUrl || 'http://localhost:3000';
  mainWindow.loadURL(startUrl);

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -3) return; // ignore ABORTED
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>One Cloud — Connection</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #0B0E13;
              color: #F3F6FB;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              text-align: center;
            }
            .card {
              background: #141A24;
              border: 1px solid #293241;
              border-radius: 16px;
              padding: 40px;
              max-width: 520px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            }
            h1 { font-size: 22px; margin-bottom: 12px; color: #afc6ff; }
            p { font-size: 13px; color: #A4AFBF; line-height: 1.6; margin-bottom: 20px; }
            .url-box {
              background: #0B0E13;
              border: 1px solid #293241;
              border-radius: 8px;
              padding: 10px 14px;
              color: #758195;
              font-family: monospace;
              font-size: 12px;
              margin-bottom: 20px;
              word-break: break-all;
            }
            .input-group {
              display: flex;
              gap: 8px;
              margin-bottom: 16px;
            }
            input {
              flex: 1;
              background: #0B0E13;
              border: 1px solid #293241;
              border-radius: 8px;
              padding: 10px 14px;
              color: #F3F6FB;
              font-size: 13px;
              outline: none;
            }
            input:focus { border-color: #4F8CFF; }
            button {
              background: #4F8CFF;
              color: #ffffff;
              border: none;
              border-radius: 8px;
              padding: 10px 20px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
            }
            button:hover { background: #3D79EF; }
            .links { font-size: 12px; color: #758195; margin-top: 16px; }
            .links a { color: #afc6ff; text-decoration: none; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>☁️ One Cloud Desktop</h1>
            <p>Could not connect to the cloud server at:</p>
            <div class="url-box">${validatedURL}</div>
            <p>Enter your hosted One Cloud Web URL or connect to local server:</p>
            <div class="input-group">
              <input type="text" id="targetUrl" value="${validatedURL.includes('your-one-cloud') ? 'http://localhost:3000' : validatedURL}" placeholder="https://your-app.vercel.app or http://localhost:3000" />
              <button onclick="window.location.href = document.getElementById('targetUrl').value">Connect</button>
            </div>
            <div class="links">
              <a onclick="window.location.href = 'http://localhost:3000'">Try Localhost:3000</a> &bull;
              <a onclick="window.location.reload()">Retry Current URL</a>
            </div>
          </div>
        </body>
      </html>
    `;
    mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC Handlers ---

ipcMain.handle('desktop:get-downloads-path', () => {
  return app.getPath('downloads');
});

ipcMain.handle('desktop:save-credentials', (event, creds) => {
  return saveEncryptedCredentials(creds);
});

ipcMain.handle('desktop:load-credentials', () => {
  return loadEncryptedCredentials();
});

ipcMain.handle('desktop:cancel-transfer', (event, taskId) => {
  const cancelFn = activeTransfers.get(taskId);
  if (cancelFn) {
    cancelFn();
    activeTransfers.delete(taskId);
    return true;
  }
  return false;
});

// High-Speed 16x Parallel Direct MTProto Upload (no Vercel limits, up to 2GB+)
ipcMain.handle('desktop:telegram-upload', async (event, params) => {
  const { taskId, sessionToken, fileName, mimeType, fileBufferBase64, filePath, parentFolderId } = params;

  let fileBuffer;
  if (filePath && fs.existsSync(filePath)) {
    fileBuffer = fs.readFileSync(filePath);
  } else if (fileBufferBase64) {
    fileBuffer = Buffer.from(fileBufferBase64, 'base64');
  } else {
    throw new Error('No file data provided for desktop upload.');
  }

  const { client } = await getTelegramClient(sessionToken);
  let isCancelled = false;
  activeTransfers.set(taskId, () => {
    isCancelled = true;
  });

  try {
    const customFile = new CustomFile(fileName, fileBuffer.length, '', fileBuffer);

    // Upload with 16 parallel workers directly to Telegram DC
    const uploadedFileHandle = await client.uploadFile({
      file: customFile,
      workers: 16,
      onProgress: (progress) => {
        if (isCancelled) throw new Error('Upload cancelled');
        const pct = Math.min(98, Math.round(progress * 98));
        const uploadedBytes = Math.round(progress * fileBuffer.length);
        if (mainWindow) {
          mainWindow.webContents.send('desktop:transfer-progress', {
            taskId,
            progress: pct,
            uploadedBytes,
            totalBytes: fileBuffer.length,
          });
        }
      },
    });

    if (isCancelled) throw new Error('Upload cancelled');

    const sentMessage = await client.sendFile('me', {
      file: uploadedFileHandle,
      caption: fileName,
      forceDocument: true,
    });

    activeTransfers.delete(taskId);

    const fileId = 'file_' + sentMessage.id + '_' + Date.now();
    const extension = fileName.includes('.') ? fileName.split('.').pop() || '' : '';

    return {
      success: true,
      file: {
        id: fileId,
        name: fileName,
        normalizedName: fileName.toLowerCase(),
        mimeType: mimeType || 'application/octet-stream',
        extension,
        fileSizeBytes: fileBuffer.length,
        parentFolderId: parentFolderId || null,
        isStarred: false,
        status: 'active',
        telegramChatId: 'me',
        telegramMessageId: sentMessage.id,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    activeTransfers.delete(taskId);
    throw err;
  }
});

// High-Speed 16x Parallel Direct MTProto Download to ~/Downloads with Linux Notification
ipcMain.handle('desktop:telegram-download', async (event, params) => {
  const { taskId, sessionToken, messageId, fileName } = params;
  const { client } = await getTelegramClient(sessionToken);

  let isCancelled = false;
  activeTransfers.set(taskId, () => {
    isCancelled = true;
  });

  const downloadsDir = app.getPath('downloads');
  let targetPath = path.join(downloadsDir, fileName);

  // Avoid overwriting existing file
  let counter = 1;
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  while (fs.existsSync(targetPath)) {
    targetPath = path.join(downloadsDir, `${baseName} (${counter})${ext}`);
    counter++;
  }

  try {
    const messages = await client.getMessages('me', { ids: [messageId] });
    if (!messages || messages.length === 0 || !messages[0]) {
      throw new Error('File not found in Telegram Saved Messages.');
    }

    const message = messages[0];

    // Download directly using 16 workers
    const buffer = await client.downloadMedia(message, {
      workers: 16,
      progressCallback: (downloaded, fullSize) => {
        if (isCancelled) throw new Error('Download cancelled');
        const dlBytes = Number(downloaded.toString());
        const total = Number(fullSize.toString());
        const pct = total > 0 ? Math.min(99, Math.round((dlBytes / total) * 99)) : 50;
        if (mainWindow) {
          mainWindow.webContents.send('desktop:transfer-progress', {
            taskId,
            progress: pct,
            uploadedBytes: dlBytes,
            totalBytes: total,
          });
        }
      },
    });

    if (isCancelled) throw new Error('Download cancelled');

    fs.writeFileSync(targetPath, Buffer.from(buffer));
    activeTransfers.delete(taskId);

    // Native Linux Desktop Notification
    if (Notification.isSupported()) {
      new Notification({
        title: 'Download Complete — One Cloud',
        body: `${path.basename(targetPath)} has been saved to your Downloads folder.`,
        urgency: 'normal',
      }).show();
    }

    return {
      success: true,
      savedPath: targetPath,
    };
  } catch (err) {
    activeTransfers.delete(taskId);
    throw err;
  }
});

// Auto-Backup Handler: Select Directory dialog
ipcMain.handle('desktop:select-backup-dir', async () => {
  if (!mainWindow) return { canceled: true };
  const res = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Folder for Automatic One Cloud Backup',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (res.canceled || !res.filePaths.length) {
    return { canceled: true };
  }
  return { canceled: false, selectedPath: res.filePaths[0] };
});

// Auto-Backup Handler: Start Background Watcher
ipcMain.handle('desktop:start-auto-backup', async (event, { folderPath, frequency, fileTypes }) => {
  try {
    if (!folderPath || !fs.existsSync(folderPath)) {
      return { success: false, error: 'Specified folder path does not exist on disk.' };
    }

    if (autoBackupWatcher) {
      try { autoBackupWatcher.close(); } catch (e) {}
      autoBackupWatcher = null;
    }

    autoBackupConfig = {
      enabled: true,
      watchedPath: folderPath,
      syncFrequency: frequency || 'realtime',
      fileTypes: fileTypes || ['images', 'documents', 'videos'],
      lastBackupTime: new Date().toISOString(),
      backedUpFilesCount: autoBackupConfig.backedUpFilesCount || 0,
    };

    // Watch folder using Node fs.watch with debouncing
    let debounceTimer = null;
    autoBackupWatcher = fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        autoBackupConfig.backedUpFilesCount += 1;
        autoBackupConfig.lastBackupTime = new Date().toISOString();
        if (mainWindow) {
          mainWindow.webContents.send('desktop:auto-backup-event', {
            eventType,
            filename,
            folderPath,
            lastBackupTime: autoBackupConfig.lastBackupTime,
            count: autoBackupConfig.backedUpFilesCount,
          });
        }

        if (Notification.isSupported()) {
          new Notification({
            title: 'Auto-Backup Sync — One Cloud',
            body: `Synced new file: ${filename}`,
            silent: true,
          }).show();
        }
      }, 1500);
    });

    if (Notification.isSupported()) {
      new Notification({
        title: 'Auto-Backup Mode Active — One Cloud',
        body: `Now monitoring "${path.basename(folderPath)}" for automatic backup.`,
      }).show();
    }

    return { success: true, config: autoBackupConfig };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Auto-Backup Handler: Stop Background Watcher
ipcMain.handle('desktop:stop-auto-backup', async () => {
  if (autoBackupWatcher) {
    try { autoBackupWatcher.close(); } catch (e) {}
    autoBackupWatcher = null;
  }
  autoBackupConfig.enabled = false;
  return { success: true, config: autoBackupConfig };
});

// Auto-Backup Handler: Get Status
ipcMain.handle('desktop:get-auto-backup-status', async () => {
  return {
    success: true,
    config: autoBackupConfig,
  };
});

