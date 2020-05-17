const { ipcRenderer } = require('electron');
const message = document.getElementById('updateMessage');
const version = document.getElementById('versionInfo');

ipcRenderer.send('app_version');

ipcRenderer.on('app_version', (event, arg) => {
  ipcRenderer.removeAllListeners('app_version');
  version.innerText = "Version: " + arg.version;
});

ipcRenderer.on('update_available', () => {
  ipcRenderer.removeAllListeners('update_available');
  message.innerText = 'A new update is available. Downloading now...';
});

ipcRenderer.on('update_downloaded', () => {
  ipcRenderer.removeAllListeners('update_downloaded');
  message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
});