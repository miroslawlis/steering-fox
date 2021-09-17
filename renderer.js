// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const path = require("path");
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const os = require("os");
var ifaces = os.networkInterfaces();
var spawn = require("child_process").spawn;
var win = electron.remote.getCurrentWindow();
var isLinux = process.platform === 'linux';
const remote = require('electron').remote;
const modal = require('./templates/modal/modals.js');
const { settings } = require("cluster");

// const settings = require('./js/settings.js');
//for debugLog()
const startParameters = remote.process.argv.slice(2);

if (
  startParameters.includes("debug") ||
  startParameters.includes("remote-debugging-port=8315")
) {
  var debugMode = true;
}
//
songsObj = [];

window.addEventListener('DOMContentLoaded', function () {
  document.getElementById('loader-wrapper').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  audioElement = document.querySelector("#audio");

  (async () => {
    await document.getElementById('settings').addEventListener('click', function () {
      // on click fire this function
      getIPs();
      wifiInfo();
    });

    // minimizing and closing
    await document.getElementById('minimize').addEventListener("click", function () {
      win.minimize();
    });
    await document.getElementById('closeApp').addEventListener("click", function () {
      win.close();
    });
    //
    // bluetooth
    await document.getElementById('bluetooth').addEventListener("click", function () {
      // show/hide bluetooth settings
      document.querySelector('.settings .bluetooth').classList.toggle('hide');
    });
    await document.getElementById('btClose').addEventListener("click", function () {
      document.querySelector('.settings .bluetooth').classList.toggle('hide');
    });
    // display app version from package.json
    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, args) => {
      ipcRenderer.removeAllListeners('app_version');
      document.getElementById('app_version').innerText = 'Version: ' + args.version;
    });

    // send request to check if update is available
    // setTimeout(() => {
    //     ipcRenderer.send('check_for_application_update');
    // }, 10000);

    ipcRenderer.on('update_available', () => {
      console.log('update_available');
      ipcRenderer.removeAllListeners('update_available');
      document.getElementById('update_status').innerText = 'A new update is available. Downloading now...';
    });
    ipcRenderer.on('update_downloaded', () => {
      console.log('update_downloaded');
      ipcRenderer.removeAllListeners('update_downloaded');
      document.getElementById('update_status').innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
    });
    ipcRenderer.on('update-not-available', () => {
      console.log('update-not-available');
      ipcRenderer.removeAllListeners('update-not-available');
    });
    // download progress
    ipcRenderer.on('send-download-progress', (text) => {
      console.log(text);
    });

    // get userData path
    ipcRenderer.invoke('get-user-data-path').then((data) => {
      settings_app.user_path = data;
      // do settings file stuff
      settings_app.init();
    });
    // initiall start
    await getIPs();
    await wifiInfo();

    await asksCANforNewData();
    // and repeate checking and asking if necessery every x miliseconds
    await setInterval(asksCANforNewData, 500);

    await dateAndTime();
    await setInterval(dateAndTime, 1000);

    await guiUpdateData();
    await setInterval(guiUpdateData, 1000);

    await debugLog(os.networkInterfaces());
  })();

});

function debugLog(...args) {
  // let args = arguments;
  var output = "";

  if (debugMode === true) {
    args.forEach(function (arg, index) {
      if (typeof arg === "object") {
        // console.log(JSON.stringify(arg, null, 4));
        for (var property in arg) {
          output += property + ": " + JSON.stringify(arg[property]) + ";\n";
        }
        console.log(output);
      } else if (args.lastIndexOf("colorGREEN") >= 0) {
        args.pop();
        console.log("%c%s", "background: green;", arg);
      } else if (args.lastIndexOf("colorORANGE") >= 0) {
        args.pop();
        console.log("%c%s", "background: orange; color: black;", arg);
      } else {
        console.log(arg);
      }
    });
  }
}

function menuHideToggle(element) {
  let activeElementNav = document.querySelector("#nav .element.active");
  let activeElementMain = document.querySelector("#main .element.active");

  if (
    element.classList.contains("active") == false &&
    element.classList.contains("element") == true
  ) {
    // info
    if (element.id == "info") {
      // remove class from currently active in nav
      activeElementNav.classList.remove("active");
      // remove class from currently active in main
      activeElementMain.classList.remove("active");

      // add class nav
      document.getElementById("info").classList.add("active");
      // add class main
      document.querySelector("#main .info.element").classList.add("active");
    }

    // music
    if (element.id == "music") {
      // remove class from currently active in nav
      activeElementNav.classList.remove("active");
      // remove class from currently active in main
      activeElementMain.classList.remove("active");

      // add class nav
      document.getElementById("music").classList.add("active");
      // add class main
      document.querySelector("#main .music.element").classList.add("active");
    }

    // youtube
    if (element.id == "youtube") {
      // remove class from currently active in nav
      activeElementNav.classList.remove("active");
      // remove class from currently active in main
      activeElementMain.classList.remove("active");

      // add class nav
      document.getElementById("youtube").classList.add("active");
      // add class main
      document.querySelector("#main .youtube.element").classList.add("active");
    }

    // map
    if (element.id == "map") {
      // remove class from currently active in nav
      activeElementNav.classList.remove("active");
      // remove class from currently active in main
      activeElementMain.classList.remove("active");

      // add class nav
      document.getElementById("map").classList.add("active");
      // add class main
      document.querySelector("#main .map.element").classList.add("active");
    }

    // settings
    if (element.id == "settings") {
      // remove class from currently active in nav
      activeElementNav.classList.remove("active");
      // remove class from currently active in main
      activeElementMain.classList.remove("active");

      // add class nav
      document.getElementById("settings").classList.add("active");
      // add class main
      document.querySelector("#main .settings.element").classList.add("active");
    }
  }
}

function updateSourceWithSong(tableRow) {
  audioElement.setAttribute("src", tableRow.querySelector(".file").innerText);
  // add attribute with song number
  audioElement.setAttribute(
    "itemId",
    tableRow.querySelector(".itemid").innerText
  );

  playAudio(true);
}

function dateAndTime() {
  let dateObj = new Date();
  let date = dateObj.toLocaleDateString("pl-PL").replace(/\./g, "-");
  let time = dateObj.toLocaleTimeString("pl-PL").substr(0, 5);
  let timeDateElement = document.querySelector("#main .info .curent_time");
  // get time from instrument claster (CAN)

  if (time_instrument_cluster) {
    // get time from instrument claster (CAN)
    timeDateElement.innerHTML =
      '<span class="time">' +
      time_instrument_cluster +
      "</span>" +
      '<span class="date">' +
      date +
      "</span>";
    // to do
    // set time and date (on OS) from CAN/car?
  } else {
    timeDateElement.innerHTML =
      '<span class="time">' +
      time +
      "</span>" +
      '<span class="date">' +
      date +
      "</span>";
  }

  //// if 'gps_utc_time' have data then get time from gps
  // if (gps_utc_time) {
  //     // current time from GPS
  //     gps_utc_time = parseInt(gps_utc_time.substring(0, 2)) + 1 + ':' + gps_utc_time.substring(2, 4) + ':' + gps_utc_time.substring(4, 6);

  // }
}

function addRowsToMusicTable() {
  // debugLog(Array.isArray(songsObj));
  // debugLog("songsObj: ");
  // debugLog(songsObj);

  // clear table
  document.querySelector("#main .music table tbody").innerHTML = "";

  if (songsObj[0]) {
    for (let item of songsObj) {
      document.querySelector("#main .music table tbody").innerHTML +=
        '<tr class="itemIDrow' +
        item["id"] +
        '" onclick="updateSourceWithSong(this);"><td class="itemid">' +
        item["id"] +
        `</td><td class="file">` +
        item["path"] +
        '</td><td class="length">' +
        item["length"] +
        "</td></tr>";
    }

    // set src (first audio from table) of audio element
    audioElement.setAttribute(
      "src",
      document.querySelector("#main .music table tbody td.file").innerText
    );
    // add attribute with song number
    audioElement.setAttribute(
      "itemId",
      document.querySelector("#main .music table tbody td.itemid").innerText
    );
    //////////
    //auto play at start
    playAudio();
  }
}

function createSongsObject() {
  // get files recursivly (with sub folders)
  // https://stackoverflow.com/questions/2727167/how-do-you-get-a-list-of-the-names-of-all-files-present-in-a-directory-in-node-j
  // add record in songsObj for each audio file in musicFolder

  // clear songsObj
  songsObj = [];
  let i = 1;

  function findMusicFilesRecursivly(initailPath) {
    try {
      // read files and directoryes in current directory
      let files = fs.readdirSync(initailPath);

      files.forEach(function (file) {
        // for each file or directory
        // check if it's file or directory
        // file = path.join(initailPath, file).toLowerCase();
        file = path.join(initailPath, file);
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
          // it is directory
          // Recurse into a subdirectory for curent path/directory
          findMusicFilesRecursivly(file);
        } else {
          // Is a file
          // get only .mp3 audio files
          if (
            file.split(".").pop() == "mp3" ||
            file.split(".").pop() == "MP3"
          ) {
            songsObj.push({
              id: i,
              name: file.split("\\").pop().split("/").pop(),
              length: "",
              path: file,
            });
            i++;
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  findMusicFilesRecursivly(settings_app.musicFolder);
  addRowsToMusicTable();
  // randomize songs
  shuffl();
  // HTML update
  GetThreeSongsToGUI();

  // auto play
  audio.play();

  debugLog("songsObj: ");
  debugLog(songsObj);
}

function getIPs() {
  //clear DOM
  document.getElementById("ipslist").innerHTML = "";

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ("IPv4" !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        debugLog(ifname + ":" + alias, iface.address);
        document.getElementById("ipslist").innerHTML +=
          '<span class="ip">' +
          ifname +
          ": " +
          alias +
          " " +
          iface.address +
          "</span>";
      } else {
        // this interface has only one ipv4 adress
        debugLog(ifname + ": " + iface.address);
        document.getElementById("ipslist").innerHTML +=
          '<span class="ip">' + ifname + ": " + iface.address + "</span>";
      }
      ++alias;
    });
  });
}

function CPUtemp() {
  if (isLinux) {
    try {
      temp = spawn("cat", ["/sys/class/thermal/thermal_zone0/temp"]);
      temp.stdout.on("data", function (data) {
        //return data/1000;
        document.querySelector(".info .cpu_temp .data").innerHTML =
          Math.round(data / 1000) + '<div class="small text">\xB0C</div>';
      });
    } catch (error) {
      debugLog(error);
    }
  } else {
    document.querySelector(".info .cpu_temp .data").innerHTML =
      Math.round("56.548") + '<div class="small text">\xB0C</div>';
  }
}

function guiUpdateData() {
  //neerest town
  if (town_nav) {
    // document.querySelector('.grid-cell.nearest_town .data').innerText = town_nav;
  }

  // alltitude, with conversion
  if (gps_altitude) {
    document.querySelector(".grid-cell.altitude .data").innerHTML =
      gps_altitude + '<div class="small text">m</div>';
  }

  // Temperature outside
  if (temp_outside) {
    temp_outside =
      temp_outside.length > 7 ? hex_to_ascii(temp_outside) : temp_outside;

    // to string conversion
    temp_outside = temp_outside + "";

    if (temp_outside.includes(" ")) {
      temp_outside = temp_outside.trim();
    } else if (temp_outside.includes("+") || temp_outside.includes("-")) {
      temp_outside = temp_outside.replace("+", "+ ");
      temp_outside = temp_outside.replace("-", "- ");
      temp_outside = temp_outside.replace(".", ",");

      document.querySelector(".grid-cell.temp_outside_car .data").innerText =
        temp_outside + " \xB0C";
    }
  }

  if (coolant_temp) {
    document.querySelector(".grid-cell.coolant_temp .data").innerText =
      coolant_temp + " \xB0C";
  }

  //fuel consumption 1
  if (fuel_consumption_1) {
    document.querySelector("#main .fuel_cons1 .data").innerHTML =
      '<div class="data1">' +
      fuel_consumption_1 +
      '</div><div class="small text">l/100km</div>';
  }
  //fuel consumption 2
  if (fuel_consumption_2) {
    document.querySelector(".grid-cell.fuel_cons2 .data").innerHTML =
      fuel_consumption_2 + '<div class="small text">l/100km</div>';
  }

  // light sensor in place of weather forecast
  if (light_sensor) {
    document.querySelector(
      ".grid-cell.weather_forecast"
    ).innerText = light_sensor;
  }

  // range
  if (range) {
    document.querySelector(".grid-cell.range .data").innerHTML =
      range + '<div class="small text">km</div>';
  }

  // avg_speed
  if (avg_speed) {
    document.querySelector(".grid-cell.avg_speed .data").innerHTML =
      avg_speed + '<div class="small text">km/h</div>';
  }

  CPUtemp();
}

function hex_to_ascii(str1) {
  if (str1 == " " || str1.length < 7) {
    return;
  }
  var hex = str1.toString();
  var str = "";
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}

function updateTimeCANfromInput(element) {
  let el = document.getElementById("modalTwoInputs");
  let hour = el.querySelector("input.hour.time").value;
  let minutes = el.querySelector("input.minutes.time").value;

  if (
    hour.match(/^[0-9][0-9]$/) != null &&
    minutes.match(/^[0-9][0-9]$/) != null
  ) {
    sendCAN("update-time", hour, minutes);
    modalClose(element);
  }
}

function timeSetModal(params) {

  let modal_time;
  let elemModal = modal.modalTwoInputs;

  modal_time = document.createElement("div");
  modal_time.id = "timeModalSet";
  modal_time.classList = modalClasses[0] + " " + modalClasses[1];

  modal_time.innerHTML = elemModal;

  document.body.appendChild(modal_time);

  // add attribute "onclick" to template file
  // fire chnage time CAN fucntion
  document
    .querySelector("#timeModalSet .modal .confirm")
    .setAttribute("onclick", "updateTimeCANfromInput(this)");

  // second init, for inputs in modal that was created
  Keyboard.reinitForInputs();

  // set focus on first input to show keyboard
  document.querySelector("#timeModalSet .modal input").focus();
}

function wifiModal() {

  let modal_wifi;
  let elemModal = modal.wifiPassword;

  modal_wifi = document.createElement("div");
  modal_wifi.id = "wifipasswordModal";
  modal_wifi.classList = modalClasses[0] + " " + modalClasses[1];

  modal_wifi.innerHTML = elemModal;

  document.body.appendChild(modal_wifi);

  // for modal popup, after entering password
  document.querySelector(
    "#wifiPassword .wifipassconnect"
  ).onclick = function () {
    wifiConnect();
  };

  // second init, for inputs in modal that was created
  Keyboard.reinitForInputs();
}

function fuelConsResetModal(arg) {

  let modal_fuel_reset;
  let elemModal = modal.modalConfirm;

  modal_fuel_reset = document.createElement("div");
  modal_fuel_reset.id = "modalConfirmWrap";
  modal_fuel_reset.classList = modalClasses[0] + " " + modalClasses[1];

  modal_fuel_reset.innerHTML = elemModal;

  document.body.appendChild(modal_fuel_reset);

  // add attribute "onclick" to template file

  document
    .querySelector("#modalConfirmWrap .modal .confirm")
    .click(function () {
      // fire reset fuel1 CAN function
    });
}

function switchTheme(ele) {
  // update css in html
  // based on select drop down change OR from setting file
  let styleTag = document.getElementById("themeColor");
  let theme = '';

  if (ele) {
    theme = ele.options[ele.options.selectedIndex].value;
    // save settings to file - changed theme
    settings_app.saveSettingsToFile();
  } else {
    // no element provided in parameter then read saved option from setting file
    theme = settingFromFileObj.themeOptionFile;
  }

  switch (theme) {
    case "green":
      styleTag.setAttribute("href", "css/themes/green.css");
      break;
    case "dark_grey":
      styleTag.setAttribute("href", "css/themes/dark_grey.css");
      break;
    case "purpule":
      styleTag.setAttribute("href", "css/themes/purpule.css");
      break;
    case "rainbow":
      styleTag.setAttribute("href", "css/themes/rainbow.css");
      break;
    case "light":
      styleTag.setAttribute("href", "css/themes/light.css");
      break;
    default:
      styleTag.setAttribute("href", "css/themes/dark_grey.css");
      break;
  }
}

function asksCANforNewData() {
  // checks if variable is empty, if soo then ask CAN for new data

  if (!fuel_consumption_1) {
    sendCAN("fuel_consumption_1");
  }
  if (!fuel_consumption_2) {
    sendCAN("fuel_consumption_2");
  }
  if (!temp_outside) {
    sendCAN("temp_outside");
  }
  if (!distance) {
    sendCAN("distance");
  }
  if (!range) {
    sendCAN("range");
  }
  if (!avg_speed) {
    sendCAN("avg_speed");
  }
  if (!time_instrument_cluster) {
    sendCAN("time");
  }
}

function wrtieIBUSdataToFile(...args) {
  const captureIBUSandSave = document.getElementById('checkbox-ibus-collect').checked;
  let output_file = fs.createWriteStream(`DATA_FROM_IBUS_${new Date().toISOString().split('T')[0]}.txt`, { flags: 'a' });

  if (!captureIBUSandSave) {
    return;
  }

  output_file.on('error', (error) => {
    console.error(error);
    return;
  });
  output_file.write(args.join(', ') + '\n');
  output_file.end();

  debugLog('ibus data saved to file');
}