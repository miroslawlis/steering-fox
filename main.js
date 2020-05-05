// Modules to control application life and create native browser window
const { app, BrowserWindow, powerSaveBlocker } = require('electron');
const path = require('path');

//require('electron-reload')(__dirname);
// if (process.env.NODE_ENV === 'development') { require('electron-reload')(__dirname, {
//   electron: require('electron-prebuilt')
// });


// require('electron-reload')(__dirname);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 480,
    frame: false,
    icon: path.join(__dirname, 'build/icons/png/1024x1024.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true //for webview -> youtube
    },
    fullscreen: true,
    frame: false,
    backgroundColor: "#2c2c2c"
  }),
    // mainWindow.webContents.openDevTools(),
    mainWindow.maximize()

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// DOMException: play() failed because the user didn't interact with the document first.
// allow to play audio without intereaction with document
app.commandLine.appendSwitch('--autoplay-policy', 'no-user-gesture-required');

const id = powerSaveBlocker.start('prevent-display-sleep');
// console.log(powerSaveBlocker.isStarted(id))