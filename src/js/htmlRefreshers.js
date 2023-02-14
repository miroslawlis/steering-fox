import { saveSettingsToFile } from "./settings";
import debugLog, { hexToAscii } from "./utils";

export function dateAndTimeSetInHTML() {
  const dateObj = new Date();
  const date = dateObj.toLocaleDateString("pl-PL").replace(/\./g, "-");
  const time = dateObj.toLocaleTimeString("pl-PL").substring(0, 5);
  const timeDateElement = document.querySelector("#main .info .curent_time");
  // get time from instrument claster (CAN)

  if (window.CANdata.time_instrument_cluster) {
    // get time from instrument claster (CAN)
    timeDateElement.innerHTML =
      `<span class="time">${window.CANdata.time_instrument_cluster}</span>` +
      `<span class="date">${date}</span>`;
    // to do
    // set time and date (on OS) from CAN/car?
  } else {
    timeDateElement.innerHTML = `<span class="time">${time}</span><span class="date">${date}</span>`;
  }

  /// / if 'window.CANdata.gps_utc_time' have data then get time from gps
  // if (window.CANdata.gps_utc_time) {
  //     // current time from GPS
  //     window.CANdata.gps_utc_time = parseInt(window.CANdata.gps_utc_time.substring(0, 2)) + 1 + ':' + window.CANdata.gps_utc_time.substring(2, 4) + ':' + window.CANdata.gps_utc_time.substring(4, 6);

  // }
}

export function CPUtemp() {
  if (window.appData.isLinux) {
    try {
      window.electronAPI.CPUtemp.then((data) => {
        // return data/1000;
        document.querySelector(
          ".info .cpu_temp .data"
        ).innerHTML = `${Math.round(
          data / 1000
        )}<div class="small text">\xB0C</div>`;
      });
    } catch (error) {
      debugLog(error);
    }
  } else {
    document.querySelector(".info .cpu_temp .data").innerHTML = `${Math.round(
      "56.548"
    )}<div class="small text">\xB0C</div>`;
  }
}

export function guiUpdateData() {
  // neerest town
  if (window.CANdata.town_nav) {
    // document.querySelector('.grid-cell.nearest_town .data').innerText = window.CANdata.town_nav;
  }

  // alltitude, with conversion
  if (window.CANdata.gps_altitude) {
    document.querySelector(
      ".grid-cell.altitude .data"
    ).innerHTML = `${window.CANdata.gps_altitude}<div class="small text">m</div>`;
  }

  // Temperature outside
  if (window.CANdata.temp_outside) {
    window.CANdata.temp_outside =
      window.CANdata.temp_outside.length > 7
        ? hexToAscii(window.CANdata.temp_outside)
        : window.CANdata.temp_outside;

    // to string conversion
    window.CANdata.temp_outside += "";

    if (window.CANdata.temp_outside.includes(" ")) {
      window.CANdata.temp_outside = window.CANdata.temp_outside.trim();
    } else if (
      window.CANdata.temp_outside.includes("+") ||
      window.CANdata.temp_outside.includes("-")
    ) {
      window.CANdata.temp_outside = window.CANdata.temp_outside.replace(
        "+",
        "+ "
      );
      window.CANdata.temp_outside = window.CANdata.temp_outside.replace(
        "-",
        "- "
      );
      window.CANdata.temp_outside = window.CANdata.temp_outside.replace(
        ".",
        ","
      );

      document.querySelector(
        ".grid-cell.window.CANdata.temp_outside_car .data"
      ).innerText = `${window.CANdata.temp_outside} \xB0C`;
    }
  }

  if (window.CANdata.coolant_temp) {
    document.querySelector(
      ".grid-cell.window.CANdata.coolant_temp .data"
    ).innerText = `${window.CANdata.coolant_temp} \xB0C`;
  }

  // fuel consumption 1
  if (window.CANdata.fuel_consumption_1) {
    document.querySelector(
      "#main .fuel_cons1 .data"
    ).innerHTML = `<div class="data1">${window.CANdata.fuel_consumption_1}</div><div class="small text">l/100km</div>`;
  }
  // fuel consumption 2
  if (window.CANdata.fuel_consumption_2) {
    document.querySelector(
      ".grid-cell.fuel_cons2 .data"
    ).innerHTML = `${window.CANdata.fuel_consumption_2}<div class="small text">l/100km</div>`;
  }

  // light sensor in place of weather forecast
  if (window.CANdata.light_sensor) {
    document.querySelector(".grid-cell.weather_forecast").innerText =
      window.CANdata.light_sensor;
  }

  // window.CANdata.range
  if (window.CANdata.range) {
    document.querySelector(
      ".grid-cell.window.CANdata.range .data"
    ).innerHTML = `${window.CANdata.range}<div class="small text">km</div>`;
  }

  // window.CANdata.avg_speed
  if (window.CANdata.avg_speed) {
    document.querySelector(
      ".grid-cell.window.CANdata.avg_speed .data"
    ).innerHTML = `${window.CANdata.avg_speed}<div class="small text">km/h</div>`;
  }

  CPUtemp();
}

export function getIPs() {
  // clear DOM
  document.getElementById("ipslist").innerHTML = "";

  window.electronAPI.networkInterfaces().then((data) => {
    Object.keys(data).forEach((ifname) => {
      let alias = 0;

      data[ifname].forEach((iface) => {
        if (iface.family !== "IPv4" || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }

        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          debugLog(`${ifname}:${alias}`, iface.address);
          document.getElementById(
            "ipslist"
          ).innerHTML += `<span class="ip">${ifname}: ${alias} ${iface.address}</span>`;
        } else {
          // this interface has only one ipv4 adress
          debugLog(`${ifname}: ${iface.address}`);
          document.getElementById(
            "ipslist"
          ).innerHTML += `<span class="ip">${ifname}: ${iface.address}</span>`;
        }
        alias += 1;
      });
    });
  });
}

export function updateGUIwithSettings(settingsObj) {
  // update GUI
  const themeElement = document.querySelector(".settings .themeOption");
  const musicFolderEl = document.querySelector(".settings .item .filepath");

  musicFolderEl.innerText = settingsObj.musicFolder;

  themeElement.value = settingsObj.theme;
  const event = new Event("change");
  themeElement.dispatchEvent(event);

  window.appData.audio.audio.volume = settingsObj.audioVolume;
}

export function listenForUIchanges() {
  // add events listners responsible for saving when user interacts with UI
  document.querySelector(".settings input").addEventListener(
    "change",
    () => {
      console.log(`listenForUIchanges`);
      saveSettingsToFile();
    },
    false
  );
  window.appData.audio.audio.onvolumechange = () => {
    console.log(`volumechange`);
  };

  // theme and language chages and saves to settings file are handled in elements on click functions
}
