// mesuure start time
global.profile_startTime = Date.now();

// Modules to control application life and create native browser window
const { app, BrowserWindow, powerSaveBlocker, session, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

//require('electron-reload')(__dirname);
// if (process.env.NODE_ENV === 'development') { require('electron-reload')(__dirname, {
//   electron: require('electron-prebuilt')
// });

// require('electron-reload')(__dirname);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  (mainWindow = new BrowserWindow({
    width: 800,
    height: 480,
    frame: false,
    icon: path.join(__dirname, "build/icons/png/1024x1024.png"),
    webPreferences: {
      nodeIntegration: true, // is default (false) value after Electron v5
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: false, // protect against prototype pollution -> if true
      enableRemoteModule: true, // turn off remote -> if false
      // preload: path.join(__dirname, "preload.js"),   // use a preload script
      webviewTag: true, //for webview -> youtube
    },
    fullscreen: true,
    frame: false,
    backgroundColor: "#2c2c2c",
  })),
    // mainWindow.webContents.openDevTools(),
    mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // install updates
  // Emitted before the application starts closing its windows.
  mainWindow.on("before-quit", () => {
    autoUpdater.quitAndInstall();
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);
app.allowRendererProcessReuse = false; // deprecated https://github.com/electron/electron/issues/18397

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// DOMException: play() failed because the user didn't interact with the document first.
// allow to play audio without intereaction with document
app.commandLine.appendSwitch("--autoplay-policy", "no-user-gesture-required");

const id = powerSaveBlocker.start("prevent-display-sleep");
// console.log(powerSaveBlocker.isStarted(id))
ipcMain.on("startParameters", () => {
  mainWindow.webContents.reply("startParameters:result", remote.process.argv.slice(2));
});
ipcMain.on("isLinux", () => {
  mainWindow.webContents.send("isLinux:result", process.platform === "linux");
});
ipcMain.on("minimize", () => {
  win.minimize();
});
ipcMain.on("close", () => {
  win.close();
});

ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
});

//// auto updater

ipcMain.on("check_for_application_update", () => {
  // autoUpdater.setFeedUrl = "https://github.com/miroslawlis/steering-fox";
  // autoUpdater.checkForUpdates();
});

// event listeners to handle update events
autoUpdater.on("update-available", () => {
  mainWindow.webContents.send("update_available");
});
autoUpdater.on("update-downloaded", () => {
  mainWindow.webContents.send("update_downloaded");
});
autoUpdater.on("update-not-available", () => {
  mainWindow.webContents.send("update-not-available");
});
// download progress
autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + " - Downloaded " + progressObj.percent + "%";
  log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")";
  sendStatusToWindow(log_message);
});
autoUpdater.on("error", (error) => {
  console.log(error);
});
// end

ipcMain.handle("get-user-data-path", () => {
  const path = app.getPath("userData");
  return path;
});

function sendStatusToWindow(text) {
  mainWindow.webContents.send("send-download-progress", text);
}
