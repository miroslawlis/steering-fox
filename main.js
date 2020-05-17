// Modules to control application life and create native browser window
const { app, BrowserWindow, powerSaveBlocker, ipcMain, remote } = require('electron');
const electron = require('electron')
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require("electron-updater");

//require('electron-reload')(__dirname);
// if (process.env.NODE_ENV === 'development') { require('electron-reload')(__dirname, {
//   electron: require('electron-prebuilt')
// });


// require('electron-reload')(__dirname);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 480,
    frame: false,
    icon: path.join(__dirname, 'build/icons/png/1024x1024.png'),
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"),   // use a preload script
      webviewTag: true //for webview -> youtube
    },
    fullscreen: true,
    frame: false,
    backgroundColor: "#2c2c2c"
  }),
    // mainWindow.webContents.openDevTools(),
    mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

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
// app.allowRendererProcessReuse = true;

const id = powerSaveBlocker.start('prevent-display-sleep');

// Filter loading any module via remote;
// you shouldn't be using remote at all, though
// https://electronjs.org/docs/tutorial/security#16-filter-the-remote-module
app.on("remote-require", (event, webContents, moduleName) => {
  event.preventDefault();
});

// built-ins are modules such as "app"
app.on("remote-get-builtin", (event, webContents, moduleName) => {
  event.preventDefault();
});

app.on("remote-get-global", (event, webContents, globalName) => {
  event.preventDefault();
});

app.on("remote-get-current-window", (event, webContents) => {
  event.preventDefault();
});

app.on("remote-get-current-web-contents", (event, webContents) => {
  event.preventDefault();
});

// autoUpdater.on('update-available', () => {
//   mainWindow.webContents.send('update_available');
// });
// autoUpdater.on('update-downloaded', () => {
//   mainWindow.webContents.send('update_downloaded');
// });


// API
ipcMain.on("minimize", (event, args) => {
  mainWindow.minimize();
});
ipcMain.on("close", (event, args) => {
  mainWindow.close();
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

ipcMain.on('settingsFileAndMusic', (event) => {
  let data = checkForSettingsFileAndCreate();
  // Send result back to preload
  event.sender.send('output_settingsFileAndMusic', data);
});

ipcMain.on('saveToSettingsFile', (event, data) => {

  let UserPath = (app || remote.app).getPath('userData');
  let filePathAndName = path.join(UserPath, 'settings.json');

  fs.writeFile(filePathAndName, data, (err) => {
    if (err) throw err;
    // The file has been saved!
    // console.log('The file has been saved! ' + filePathAndName);

    // createSongsObject();
  });
})

ipcMain.on('electron_command_line_arguments', (event) => {
  // for debug mode
  event.sender.send('output_electron_command_line_arguments', process.argv.slice(2));
})

// API end
function checkForSettingsFileAndCreate() {
  // checkick if settings file exist, if not create with default vaules

  let UserPath, output, filePathAndName, musicFolder, settingsFileName;

  settingsFileName = 'settings.json';
  musicFolder = '/Music/';
  UserPath = (app || remote.app).getPath('userData');
  filePathAndName = path.join(UserPath, settingsFileName);

  //// if settings.json file dose not egzist in app folder then create it
  // checking if file exist
  try {

    if (!fs.existsSync(filePathAndName)) {
      // file not exist
      // Settings file not exist, creating...
      let settingsFileContent = {};
      settingsFileContent.musicFolder = "";
      settingsFileContent.themeOptionFile = 5;

      fs.writeFile(filePathAndName, JSON.stringify(settingsFileContent), (error) => {

        if (error) {
          output = 'Error in creating settings file (main.js): ' + error;
          console.log(output);
          return output;
        } else {
          // no error === succes
          // after crating file, load content
          // Settings file created, loading content...
          readSettingfile(filePathAndName);
        }
      });
    } else {
      // file exist and no error
      // Settings file exist, loading content...
      return readSettingfile(filePathAndName);
    }

  } catch (error) {
    output = 'Setting file: ' + error;
    console.log(output);
    return output;
  }
}

function readSettingfile(filePath) {
  // console.log('readSettingfile')

  try {

    let data = fs.readFileSync(filePath, 'utf8')
    // console.log('readFile: ', data);

    let settingFromFileObj = JSON.parse(data);
    // console.log('settingFromFileObj: ', settingFromFileObj);
    if (settingFromFileObj.musicFolder != '') {
      // if settings file field it's not empty string then use it in 'musicFolder' else use "/Music/"
      musicFolder = settingFromFileObj.musicFolder;
      output = settingFromFileObj;
      return output;
    }

    // updateGUIwithSettings(settingFromFileObj.themeOptionFile, settingFromFileObj.musicFolder, settingFromFileObj.audioVolume);
    // switchTheme();
    // createSongsObject();
  } catch (error) {
    output = error;
    console.log('readSettingfile catch: ', output);
  }
}