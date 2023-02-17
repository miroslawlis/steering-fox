// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// eslint-disable-next-line import/no-extraneous-dependencies
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getMusicFiles: (folderPath) =>
    ipcRenderer.invoke("getMusicFiles", folderPath),
  networkInterfaces: () => ipcRenderer.invoke("networkInterfaces"),
  isLinux: () => ipcRenderer.invoke("isLinux"),
  startParameters: () => ipcRenderer.invoke("startParameters"),
  minimize: () => ipcRenderer.invoke("minimize"),
  close: () => ipcRenderer.invoke("close"),
  appVersion: () => ipcRenderer.invoke("appVersion"),
  getUserDataPath: () => ipcRenderer.invoke("getUserDataPath"),
  profileStartTime: () => ipcRenderer.invoke("profileStartTime"),
  bufferFrom: () => ipcRenderer.invoke("bufferFrom"),
  listSerialPorts: () => ipcRenderer.invoke("listSerialPorts"),
  pathJoin: (args = []) => ipcRenderer.invoke("pathJoin", args),
  pathDirname: (filePath) => ipcRenderer.invoke("pathDirname", filePath),
  existsSync: (stringPath = "") => ipcRenderer.invoke("existsSync", stringPath),
  readFileSync: (stringPath = "") =>
    ipcRenderer.invoke("readFileSync", stringPath),
  writeFileSync: (args) => ipcRenderer.invoke("writeFileSync", args),
  writeFile: (args) => ipcRenderer.invoke("writeFile", args),
  CPUtemp: () => ipcRenderer.send("CPUtemp"),
  getSong: (filePath) => ipcRenderer.invoke("getSong", filePath),
  getWifiSSID: () => ipcRenderer.invoke("getWifiSSID"),
});
