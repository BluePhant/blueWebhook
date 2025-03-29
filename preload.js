const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getWebhookUrl: () => ipcRenderer.invoke('get-webhook-url'),
  saveWebhookUrl: (url) => ipcRenderer.invoke('save-webhook-url', url),
  testWebhook: (url) => ipcRenderer.invoke('test-webhook', url),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  closeApp: () => ipcRenderer.send('close-app')
});