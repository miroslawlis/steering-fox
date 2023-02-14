/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./css/index.css";
import { settingsInit } from "./js/settings";

import Keyboard from "./js/keyboard";
import "./js/bluetooth";
import wifiConnect, { wifiInfo } from "./js/wifi";
import "./js/translation";
import { modalClasses } from "./js/modal";
import playAudio, {
  currentVolume,
  GetThreeSongsToGUI,
  pauseAudio,
  muteAudio,
  volUp,
  volDown,
  shuffl,
  nextSong,
  previousSong,
  musicEventRegister,
} from "./js/music-player";
import {
  guiUpdateData,
  dateAndTimeSetInHTML,
  getIPs,
} from "./js/htmlRefreshers";
import updateTimeCANfromInput, { asksCANforNewData } from "./js/canUpdaters";
import { switchTheme } from "./js/themes";
import { menuHideToggle } from "./js/menu";

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
);

function timeSetModal() {
  const elemModal = window.appData.modalTemplateEl.modalTwoInputs;

  const modalTime = document.createElement("div");
  modalTime.id = "timeModalSet";
  modalTime.classList = `${modalClasses[0]} ${modalClasses[1]}`;

  modalTime.innerHTML = elemModal;

  document.body.appendChild(modalTime);

  // add attribute "onclick" to template file
  // fire chnage time CAN fucntion
  document.querySelector("#timeModalSet .modal .confirm").onclick =
    updateTimeCANfromInput();

  // second init, for inputs in modal that was created
  Keyboard.reinitForInputs();

  // set focus on first input to show keyboard
  document.querySelector("#timeModalSet .modal input").focus();
}

export function wifiModal() {
  const elemModal = window.appData.modalTemplateEl.wifiPassword;

  const modalWifi = document.createElement("div");
  modalWifi.id = "wifipasswordModal";
  modalWifi.classList = `${modalClasses[0]} ${modalClasses[1]}`;

  modalWifi.innerHTML = elemModal;

  document.body.appendChild(modalWifi);

  // for modal popup, after entering password
  document.querySelector("#wifiPassword .wifipassconnect").onclick =
    function () {
      wifiConnect();
    };

  // second init, for inputs in modal that was created
  Keyboard.reinitForInputs();
}

function fuelConsResetModal() {
  const elemModal = window.appData.modalTemplateEl.modalConfirm;

  const modalFuleReset = document.createElement("div");
  modalFuleReset.id = "modalConfirmWrap";
  modalFuleReset.classList = `${modalClasses[0]} ${modalClasses[1]}`;

  modalFuleReset.innerHTML = elemModal;

  document.body.appendChild(modalFuleReset);

  // add attribute "onclick" to template file

  document.querySelector("#modalConfirmWrap .modal .confirm").click(() => {
    // fire reset fuel1 CAN function
  });
}

window.electronAPI.listSerialPorts();

window.addEventListener("DOMContentLoaded", () => {
  window.CANdata = {};

  window.appData = {
    ...window.appData,
    switchTheme,
    timeSetModal,
    fuelConsResetModal,
  };
  // const path = require("path");

  window.electronAPI.isLinux().then((data) => {
    window.appData.isLinux = data;
  });
  window.appData.debugMode = false;
  window.appData.debugMode = true;

  // const settings = require('./js/settings.js');
  window.electronAPI.startParameters().then((startParameters) => {
    if (
      startParameters.includes("debug") ||
      startParameters.includes("remote-debugging-port=8315")
    ) {
      window.appData.debugMode = true;
    }
  });

  const isTouchDevice = () =>
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;

  if (!isTouchDevice()) {
    document.body.style.cursor = "auto";
  }
  document.getElementById("loader-wrapper").style.display = "none";
  document.getElementById("app").style.display = "block";

  window.appData.audio = {
    ...window.appData.audio,
    audio: {},
    methods: {
      playAudio,
      pauseAudio,
      muteAudio,
      volUp,
      volDown,
      shuffl,
      nextSong,
      previousSong,
    },
  };

  window.appData.modalTemplateEl = document.getElementById(
    "modal-main-template"
  );
  window.appData.sliderVolumeMusicEl =
    document.getElementById("volume-music-bar");
  window.appData.sliderVolumeMusicEl.oninput = currentVolume();

  window.menuHideToggle = menuHideToggle;

  document.getElementById("settings").addEventListener("click", () => {
    getIPs();
    wifiInfo();
  });

  // minimizing and closing
  document.getElementById("minimize").addEventListener("click", () => {
    window.electronAPI.minimize();
  });
  document.getElementById("closeApp").addEventListener("click", () => {
    window.electronAPI.close();
  });
  //
  // bluetooth
  document.getElementById("bluetooth").addEventListener("click", () => {
    // show/hide bluetooth settings
    document.querySelector(".settings .bluetooth").classList.toggle("hide");
  });
  document.getElementById("btClose").addEventListener("click", () => {
    document.querySelector(".settings .bluetooth").classList.toggle("hide");
  });
  // display app version from package.json
  window.electronAPI.appVersion().then((data) => {
    document.getElementById("app_version").innerText = `Version: ${data}`;
  });

  // do settings file stuff
  settingsInit().then(() => {
    // initiall start
    window.electronAPI
      .getMusicFiles(window.appData.settingsFile.musicFolder)
      .then((data) => {
        window.appData.songsObj = data;
        playAudio(data[0]);
        musicEventRegister();
        GetThreeSongsToGUI();
      });
    setTimeout(getIPs, 4000);
    setTimeout(wifiInfo, 4000);

    asksCANforNewData();
    // and repeate checking and asking if necessery every x miliseconds
    setInterval(asksCANforNewData, 500);

    dateAndTimeSetInHTML();
    setInterval(dateAndTimeSetInHTML, 1000);

    guiUpdateData();
    setInterval(guiUpdateData, 1000);

    window.electronAPI.networkInterfaces();
  });
});
