const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const {
  existsSync,
  readFileSync,
  writeFileSync,
  writeFile,
  lstatSync,
  readFile,
} = require("fs");
const { SerialPort } = require("serialport");
const { spawn, exec } = require("child_process");
const { findMusicFilesRecursivly } = require("../main-music-utils");
const { default: sendMsgToCAN } = require("./ibus-senders");

const convertSong = (filePath) => {
  const songPromise = new Promise((resolve, reject) => {
    if (typeof filePath !== "string") reject();
    readFile(filePath, "base64", (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(`data:audio/mp3;base64,${data}`);
    });
  });
  return songPromise;
};

function currentWifiSSID() {
  const cmd =
    process.platform === "linux"
      ? "iw wlan0 link | grep SSID"
      : "netsh wlan show interfaces";

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log("Error on BE while getting WIFI SSID");
        console.warn(error);
        reject(error);
      }
      resolve(stdout || stderr);
    });
  });
}

function getListOfAvailableNetworks() {
  const cmd =
    process.platform === "linux"
      ? "iwlist wlan0 scan | grep ESSID"
      : "netsh wlan show networks mode=Bssid";

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log("Error on BE while getting WIFI list");
        console.warn(error);
        reject(error);
      }
      resolve(stdout || stderr);
    });
  });
}

function disconnectFromWifi() {
  const cmd = process.platform === "linux" ? "" : "netsh wlan disconnect";

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log("Error on BE while disconnecting from wifi");
        console.warn(error);
        reject(error);
      }
      resolve(stdout || stderr);
    });
  });
}

function connectToWifiNetwork() {
  const cmd = process.platform === "linux" ? "" : "";

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log("Error on BE while connecting to wifi");
        console.warn(error);
        reject(error);
      }
      resolve(stdout || stderr);
    });
  });
}

const mainIpcs = (profileStartTime, ibusInstance) => {
  ipcMain.handle("getMusicFiles", (event, folderPath) =>
    findMusicFilesRecursivly(folderPath)
  );
  ipcMain.handle("networkInterfaces", () => os.networkInterfaces());
  ipcMain.handle("isLinux", () => process.platform === "linux");
  ipcMain.handle("startParameters", () => process.argv.slice(2));
  ipcMain.handle("minimize", () => BrowserWindow.getFocusedWindow().minimize());
  ipcMain.handle("close", () => BrowserWindow.getFocusedWindow().close());
  ipcMain.handle("appVersion", () => app.getVersion());
  ipcMain.handle("getUserDataPath", () => app.getPath("userData"));
  ipcMain.handle("profileStartTime", () => profileStartTime);
  ipcMain.handle("bufferFrom", (event, arg) => Buffer.from(arg));
  ipcMain.handle("pathJoin", (event, argArray) => {
    if (argArray.length > 0) {
      return path.join(...argArray);
    }
    return null;
  });
  ipcMain.handle("pathDirname", (event, arg) => {
    if (!existsSync(arg)) return null;
    if (lstatSync(arg).isDirectory()) {
      return arg;
    }
    const parentFolder = path.dirname(arg);
    return parentFolder;
  });
  ipcMain.handle("listSerialPorts", async () => {
    await SerialPort.list()
      .then((ports, err) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log(`serialPort list error`, err);
          return null;
        }
        // eslint-disable-next-line no-console
        console.log("ports: ", ports);
        return ports;
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.log("listSerialPorts error: ", err));
  });
  ipcMain.handle("existsSync", (event, arg) => existsSync(arg));
  ipcMain.handle(
    "readFileSync",
    (event, arg) => arg && readFileSync(arg, { encoding: "utf8" })
  );
  ipcMain.handle("writeFileSync", (event, args) => writeFileSync(...args));
  ipcMain.handle("writeFile", (event, args) => {
    writeFile(...args, (err) => {
      // eslint-disable-next-line no-console
      if (err) console.log(err);
      else {
        // eslint-disable-next-line no-console
        console.log("writeFile callback: File written successfully");
      }
    });
  });

  ipcMain.handle(
    "CPUtemp",
    () =>
      new Promise((resolve, reject) => {
        const temp = spawn("cat", ["/sys/class/thermal/thermal_zone0/temp"]);
        temp.stdout.on("data", async (data) => resolve(Number(data) / 1000));
        temp.stdout.on("error", async (err) => reject(err));
      })
  );

  ipcMain.handle("getSong", (event, filePath) => convertSong(filePath));
  ipcMain.handle("getWifiSSID", currentWifiSSID);
  ipcMain.handle("getListOfAvailableNetworks", getListOfAvailableNetworks);
  ipcMain.handle("disconnectFromWifi", disconnectFromWifi);
  ipcMain.handle("connectToWifiNetwork", connectToWifiNetwork);
  ipcMain.handle("sendMsgToCAN", (event, data) => {
    sendMsgToCAN(data, ibusInstance);
  });
};

module.exports = mainIpcs;
