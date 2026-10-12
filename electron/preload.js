const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronBridge', {
  isDesktop: true,
  platform: process.platform,

  // Get Linux default download folder path (~/Downloads)
  getDownloadsPath: () => ipcRenderer.invoke('desktop:get-downloads-path'),

  // Upload file directly from local Linux machine to Telegram (16x MTProto workers, no Vercel limit)
  uploadFile: (params) => ipcRenderer.invoke('desktop:telegram-upload', params),

  // Download file directly from Telegram to ~/Downloads (16x MTProto workers, native notification)
  downloadFile: (params) => ipcRenderer.invoke('desktop:telegram-download', params),

  // Cancel an active in-flight transfer
  cancelTransfer: (taskId) => ipcRenderer.invoke('desktop:cancel-transfer', taskId),

  // Subscribe to live transfer progress from main process
  onProgress: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('desktop:transfer-progress', listener);
    return () => ipcRenderer.removeListener('desktop:transfer-progress', listener);
  },

  // Secure OS Keyring API Credentials
  saveCredentials: (creds) => ipcRenderer.invoke('desktop:save-credentials', creds),
  loadCredentials: () => ipcRenderer.invoke('desktop:load-credentials'),
});
