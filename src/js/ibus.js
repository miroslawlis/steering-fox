import {
  muteAudio,
  nextSong,
  pauseAudio,
  previousSong,
  volDown,
  volUp,
} from "./music-player";
import { setDarkTheme, setPreviousTheme } from "./themes";
import debugLog, { hexToAscii, wrtieIBUSdataToFile } from "./utils";

function nightSensorSaysItIs(dayOrNightString) {
  if (dayOrNightString === "day") {
    setPreviousTheme();
  }
  if (dayOrNightString === "night") {
    setDarkTheme();
  }
}

// send to CAN

// https://github.com/kmalinich/node-bmw-ref/blob/master/ibus/bus-lib.txt
// to check
const onCanDataHanlder = ({ name, data }) => {
  if (name === "volDown") {
    volDown();
  }
  if (name === "volUp") {
    volUp();
  }
  if (name === "steering_wheel_arrow_down") {
    previousSong();
  }
  if (name === "steering_wheel_arrow_up") {
    nextSong();
  }
  if (name === "pauseAudio") {
    pauseAudio();
  }
  if (name === "muteAudio") {
    muteAudio();
  }
  if (
    data !== null &&
    data !== undefined &&
    name !== undefined &&
    name !== null
  ) {
    if (name === "tempOutsideAndCoolantTemp") {
      window.CANdata.coolantTemp = data.coolantTemp;
      window.CANdata.tempOutside2 = data.tempOutside;
      return;
    }
    if (name === "navLatLngTimeLatitiude") {
      window.CANdata.lat = data.lat;
      window.CANdata.lng = data.lng;
      window.CANdata.altitude = data.altitude;
      window.CANdata.utcTime = data.utcTime;
      return;
    }
    if (name === "lightSensor") {
      nightSensorSaysItIs(data);
      return;
    }
    window.CANdata[name] = data;
  }
};

export default function initIBus() {
  // event registration
  window.electronAPI.onCan((event, data) => onCanDataHanlder(data));
}

// send end

/// / ibus part end
