// mesuure start time
const profileStartTime = Date.now();

require("log-node")();

// Modules to control application life and create native browser window
// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow } = require("electron");
const IbusInterface = require("ibus/src/IbusInterface");
const { SerialPort } = require("serialport");
const mainIpcs = require("./js/mainProcess/ipcs");
const {
  default: handleSquirrelEvent,
} = require("./js/main-squirel-events-handler");

const { default: initUpdates } = require("./js/main-updates");
const { default: initIBUSinMain } = require("./js/mainProcess/ibus");

require("update-electron-app")({
  updateInterval: "1 hour",
  notifyUser: true,
});
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

const createWindow = () => {
  // Create the browser window.
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 480,
    frame: !app.isPackaged,
    icon: "./build/icons/icon.ico",
    webPreferences: {
      // eslint-disable-next-line no-undef
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      // nodeIntegration: true,
    },
    fullscreen: app.isPackaged,
    backgroundColor: "#2c2c2c",
  });

  if (!app.isPackaged) {
    // dev mode - kind off, not packed
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    // production only
    mainWindow.maximize();
  }

  // and load the index.html of the app.
  // eslint-disable-next-line no-undef
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // mainWindow.loadFile(
  //   "F:/Repozytoria/my-app/src/index.html"
  // );
  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  // let ibusInterface = {};

  SerialPort.list().then((ports, err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log(`serialPort list error`, err);
      return;
    }
    // eslint-disable-next-line no-console
    console.log("ports: ", ports);
    // setup interface
    // const device = "/dev/ttyUSB0"; // for linux
    const ibusInterface = new IbusInterface(
      app.isPackaged ? ports[0].path : "/dev/ROBOT"
    );

    try {
      initIBUSinMain(ibusInterface);
    } catch (error) {
      console.log(error);
    }

    // API
    mainIpcs(profileStartTime, ibusInterface);
  });

  if (handleSquirrelEvent() === "firstrun") {
    setTimeout(initUpdates, 30000);
  } else {
    initUpdates();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// DOMException: play() failed because the user didn't interact with the document first.
// allow to play audio without intereaction with document
app.commandLine.appendSwitch("--autoplay-policy", "no-user-gesture-required");

// console.log(powerSaveBlocker.isStarted(id))
// app.whenReady().then(() => {});
