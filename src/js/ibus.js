import {
  muteAudio,
  nextSong,
  pauseAudio,
  previousSong,
  volDown,
  volUp,
} from "./music-player";
import { setDarkTheme, setPreviousTheme } from "./settings";
import debugLog, { hexToAscii, wrtieIBUSdataToFile } from "./utils";

const lessInfoFromCAN = true;

/// / ibus part start

const { IbusInterface, IbusDevices } = require("ibus");

// disables logs from ibus (lots of colorfull spam, "ibus" is using "debug" package)
// const debug = require("debug");
// debug.disable();

// Configure your device location

// config
const device = "/dev/ttyUSB0";

// setup interface
const ibusInterface = new IbusInterface(device);

function init() {
  ibusInterface.startup();
}

// main start
if (window.appData.isLinux) {
  init();
}

function nightSensorSaysItIs(dayOrNightString) {
  if (dayOrNightString === "day") {
    setPreviousTheme();
  }
  if (dayOrNightString === "night") {
    setDarkTheme();
  }
}

// Message structure:
// 1. Transmitter address (8 bit Source ID)
// 2. Length of data (number of following message bytes)
// 3. Receiver address (8 bit Destination ID)
// 4. Detailed description of message (maximum 32 bytes of data)
// 5. Summary of transmitted information (check sum)

// | Source ID | Length | Dest ID | Message Data | Checksum |
// |-----------|--------|---------|--------------|----------|
// |           |        |           Length                  |

// Add an event listener on the ibus interface output stream.

function onIbusData(data) {
  let msgDescryption = "";
  const buffMsg = window.electronAPI.bufferFrom(data.msg);
  const buffMsgHex = buffMsg.toString("hex").toLowerCase();

  // remove empty data, like: from BodyModule - 0 to BodyModule - 0
  if (lessInfoFromCAN === true) {
    if ((data.src === "0" && data.dst === "0") || data.src === "a4") {
      return;
      // end this round of data
    }
    if (data.src === "3b" && data.dst === "80" && buffMsgHex === "410701") {
      // filters this: id: 1588784831880 | GraphicsNavigationDriver - 3b | InstrumentClusterElectronics - 80 Message: A |  410701 | [object Object] |
      return;
    }
  }

  // from: MultiFunctionSteeringWheel && to: Radio or Telephone ('c8')
  if (data.src === "50" && (data.dst === "68" || data.dst === "c8")) {
    // volume down steering wheel
    if (data.msg === window.electronAPI.bufferFrom([50, 16]).toString("ascii")) {
      volDown();

      msgDescryption = "Volume down button steering wheel";
    }
    // volume up steering wheel
    if (data.msg === window.electronAPI.bufferFrom([50, 17]).toString("ascii")) {
      volUp();

      msgDescryption = "Volume up button steering wheel";
    }
    // previous track steering wheel
    if (data.msg === window.electronAPI.bufferFrom([59, 8]).toString("ascii")) {
      previousSong();

      msgDescryption = "Arrow up? button steering wheel";
    }
    // next song stearing wheel
    if (data.msg === window.electronAPI.bufferFrom([59, 1]).toString("ascii")) {
      nextSong();

      msgDescryption = "Arrow down? button steering wheel";
    }
  }

  // from: MultiFunctionSteeringWheel
  if (data.src === "50") {
    // face button steering wheel
    if (buffMsgHex === "3b40") {
      pauseAudio();

      msgDescryption = "Face button steering wheel";
    }
    // RT button steering wheel
    if (buffMsgHex === "3b80") {
      muteAudio();

      msgDescryption = "RT button steering wheel";
    }
  }
  // egz WHOLE message: 80 0a ff 24 03 00 2b 31 32 2e 35 61 80 0f ff 24 02 00 31 30 2e 31 31 2e 32 30 31 39 5d 80 05 bf 18 00 06 24
  // or WHOLE message: Buffer(36) [128, 10, 255, 36, 3, 0, 43, 49, 50, 46, 53, 97, 128, 15, 255, 36, 2, 0, 49, 48, 46, 49, 49, 46, 50, 48, 49, 57, 93, 128, 5, 191, 24, 0, 6, 36]
  // 80 source, 0a length, ff destenation, 2b 31 32 2e 35 actual temperature, there is allso time later in string
  if (
    data.src === "80" &&
    data.dst === "ff" &&
    buffMsgHex.substring(0, 4) === "2403"
  ) {
    // outside temperature
    window.CANdata.temp_outside = buffMsgHex.substring(6, 16);

    msgDescryption = "Outside temperature";
  }

  // time from instrument cluster not GPS
  // data.msg -> first 3 parts in buffer describe is it time ([36, 1, 0]) in hex: 24010031373a30392020
  if (
    data.src === "80" &&
    data.dst === "ff" &&
    buffMsgHex.substring(0, 6) === "240100"
  ) {
    // remove 3 first parts from buffer and remove 2 parts from end -> this give time in format HH:MM egz 12:45 (12h or 24h?)
    window.CANdata.time_instrument_cluster = buffMsg
      .slice(3, 9)
      .toString("utf-8");

    msgDescryption = "Time from instrument cluster";
  }

  // temperature outside and coolant temperature
  // from: InstrumentClusterElectronics - 80 to: GlobalBroadcastAddress - bf msg: 19154b00
  if (
    data.src === "80" &&
    data.dst === "bf" &&
    buffMsgHex.substring(0, 2) === "19"
  ) {
    // first hex in message indicates temperature outside and coolant temperatur message

    // to decimal conversion
    // in Celsius
    // CHECK IF ITS OK
    window.CANdata.temp_outside = parseInt(buffMsgHex.substring(2, 4), 16);
    window.CANdata.coolant_temp = parseInt(buffMsgHex.substring(4, 6), 16);

    msgDescryption =
      `Temperature: Outside:${window.CANdata.temp_outside}C ` +
      `Coolant: ${window.CANdata.coolant_temp} C`;
  }

  if (data.src === "80" && data.dst === "ff") {
    // if (buffMsg.slice(1, 1).toString('hex') === '04') {
    if (data.msg[1] === "04") {
      // fuel consumption 1
      window.CANdata.fuel_consumption_1 = data.msg
        .slice(3, 14)
        .toString("utf-8")
        .replace(".", ",")
        .trim();

      msgDescryption = "Fuel consumption 1";
    }
    if (buffMsgHex.slice(0, 4) === "2405") {
      // if (data.msg[1] === '05') {
      // fuel consumption 2
      // src: "80";
      // len: "9";
      // dst: "ff";
      // msg: {"type":"Buffer","data":[36,5,0,32,56,46,52]};
      // 24050020382e34
      // crc: "55";
      window.CANdata.fuel_consumption_2 = buffMsgHex.slice(6, 14);
      window.CANdata.fuel_consumption_2 = hexToAscii(
        window.CANdata.fuel_consumption_2
      )
        .replace(".", ",")
        .trim();

      msgDescryption = "Fuel consumption 2";
    }
    if (buffMsgHex.slice(0, 4) === "2406") {
      // window.CANdata.range
      window.CANdata.range = buffMsgHex.slice(6, 14);
      window.CANdata.range = hexToAscii(window.CANdata.range).trim();

      msgDescryption = "window.CANdata.range";
    }
    if (data.msg[1] === "07") {
      // window.CANdata.distance
      window.CANdata.distance = data.msg.slice(3, 14).toString("hex");

      msgDescryption = "Distance";
    }
    if (data.msg[1] === "09") {
      // window.CANdata.speed_limit
      window.CANdata.speed_limit = data.msg.slice(3, 14).toString("hex");

      msgDescryption = "Speed limit";
    }
    if (buffMsgHex.slice(0, 6) === "240a00") {
      // avarage speed
      window.CANdata.avg_speed = buffMsgHex.slice(6, 14);
      window.CANdata.avg_speed = hexToAscii(window.CANdata.avg_speed).trim();

      msgDescryption = "AVG speed";
    }
  }
  // if from NavigationEurope 7f
  if (data.src === "7f") {
    // Town from NavModule GPS
    // data.msg -> third part ("1") in buffer msg describe is it town ([164, 0, 1])
    if (buffMsgHex.slice(0, 6) === "a40001") {
      window.CANdata.town_nav = buffMsg
        .slice(3, buffMsg.indexOf("0", 5))
        .toString("utf-8");
      msgDescryption = "Town name";
    }
    // Street from NavModule GPS
    // data.msg -> third part ("2") in buffer msg describe is it street ([164, 0, 2])
    if (buffMsgHex.slice(0, 6) === "a40002") {
      //
      window.CANdata.street_nav = buffMsg
        .slice(3, buffMsg.indexOf("0", 5))
        .toString("utf-8");
      msgDescryption = "Street name";
    }
    // GPS cords, time, altitude
    // data.msg -> first 3 parts in buffer describe is it GPS position ([162, 1, 0]) -> 'a20100' -- maybe only one part?? [162] - > 'a2', it can be ([162, 0, 0])
    if (buffMsgHex.slice(0, 6) === "a20100") {
      // buffer egxample: [162, 1, 0, 81, 64, 82, 80, 0, 32, 87, 65, 144, 1, 16, 0, 16, 71, 73] -> hex -> a2 01 00 51 40 52 50 00 20 57 41 90 01 10 00 10 47 49
      // first 3 can be  erased (a20100) -> 514052500020574190011000104749
      // from nav encoder: 2019-10-13 10:25:49.105||NAV  |TEL |Current position|GPS fix; 51°40'52.5"N  20°57'41.9"E; Alt 111m;  UTC 08:25:49
      // 51 (stopnie) 40 (minuty) 52 (sekundy) 50 (połowki sekundy N?) 00 (separator?) 20 (stopnie) 57 (minuty) 41 (sekundy) 90 (połowki sekundy E?) 01 10 00 (wysokość 111m, traktować jak stringi i połączyć? wtedy 01 + 10 + 00 daje 011000 -> 110m?) 10 (UTC godzina)47 (UTC minuty) 49 (UTC sekundy)
      window.CANdata.gps_cords_lat = buffMsg.slice(3, 7).toString("hex");
      window.CANdata.gps_cords_lon = buffMsg.slice(8, 12).toString("hex");
      window.CANdata.gps_altitude = parseInt(buffMsgHex.slice(24, 28), 10);
      window.CANdata.gps_utc_time = buffMsg.slice(15, 18).toString("hex");

      msgDescryption = "GPS cords";
    }
  }

  // light dimmer
  // data.msg -> hex -> 5C FF FC FF 00 -> lights on?
  // data.msg -> hex -> 5c ff c9 ff 00 -> lights on?
  if (data.src === "d0" && data.dst === "bf" && buffMsgHex === "5cff3fff00") {
    //
    window.CANdata.light_sensor = "day";

    msgDescryption = "Light sensor = day";

    nightSensorSaysItIs(window.CANdata.light_sensor);
  }

  if (data.src === "d0" && data.dst === "bf" && buffMsgHex === "5cfe3fff00") {
    window.CANdata.light_sensor = "night";

    msgDescryption = "Light sensor = night";

    nightSensorSaysItIs(window.CANdata.light_sensor);
  }

  // id, from, to, message, message hex, analyzing, description
  debugLog(
    data.id,
    " | ",
    IbusDevices.getDeviceName(data.src),
    "|",
    IbusDevices.getDeviceName(data.dst),
    "|",
    data.msg,
    "|",
    buffMsgHex,
    "|",
    data,
    "|",
    msgDescryption
  );

  // debugLog('[app] Analyzing: ', window.electronAPI.bufferFrom(data), '\n');

  const msgDate = new Date();

  wrtieIBUSdataToFile(
    msgDate.getHours(),
    ":",
    msgDate.getMinutes(),
    ":",
    msgDate.getSeconds(),
    ":",
    msgDate.getMilliseconds(),
    " | id: ",
    data.id,
    " | src: ",
    IbusDevices.getDeviceName(data.src),
    "| dst: ",
    IbusDevices.getDeviceName(data.dst),
    "| msg:",
    data.msg,
    "| buffMsgHex:",
    buffMsgHex,
    "| data: ",
    JSON.stringify(data),
    "| msgDescryption: ",
    msgDescryption
  );
}

// Cleanup and close the device when exiting.
function onSignalInt() {
  ibusInterface.shutdown(() => {
    process.exit();
  });
}
// events
ibusInterface.on("data", onIbusData);

// implementation
// process.on('SIGINT', onSignalInt);
process.on("exit", onSignalInt);

// send to CAN

// https://github.com/kmalinich/node-bmw-ref/blob/master/ibus/bus-lib.txt
// to check

export default function sendCAN(request, arg1, arg2, arg3) {
  try {
    if (ibusInterface) {
      switch (request) {
        // request for fuel consumption 1
        case "window.CANdata.fuel_consumption_1":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: window.electronAPI.bufferFrom([0x41, 0x04, 0x01]),
            // 3B 05 80 41 04 01
          });
          break;
        // request for fuel consumption 2
        case "window.CANdata.fuel_consumption_2":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: window.electronAPI.bufferFrom([0x41, 0x05, 0x01]),
            // 3B 05 80 41 05 01
          });
          break;
        // request for outside temperature
        case "window.CANdata.temp_outside":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: window.electronAPI.bufferFrom([0x41, 0x03, 0x01]),
          });
          break;
        // request for total kilometers
        // Odometer request
        case "window.CANdata.distance":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: window.electronAPI.bufferFrom([0x41, 0x07, 0x01]),
          });
          break;
        // request window.CANdata.range
        case "window.CANdata.range":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: window.electronAPI.bufferFrom([0x41, 0x06, 0x01]),
          });
          break;
        // request avg speed
        case "window.CANdata.avg_speed":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: window.electronAPI.bufferFrom([0x41, 0x0a, 0x01]),
          });
          break;
        // request obc
        case "obc":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: window.electronAPI.bufferFrom([0x41, 0x19]),
          });
          break;

        // set DSP
        case "dsp-on-concert-hall":
          ibusInterface.sendMessage({
            src: 0x68,
            dst: 0x6a,
            msg: window.electronAPI.bufferFrom([0x34, 0x09]),
          });
          break;

        // request time
        case "time":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: window.electronAPI.bufferFrom([0x41, 0x01, 0x01]),
          });
          break;

        // update time
        // arg1->Hours, arg2->minutes
        case "update-time":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: window.electronAPI.bufferFrom([0x40, 0x01, arg1, arg2]),
          });
          break;

        // update date
        // arg1->day, arg2->month, arg3->year
        case "update-date":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: window.electronAPI.bufferFrom([0x40, 0x02, arg1, arg2, arg3]),
          });
          break;

        default:
          break;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// send end

/// / ibus part end


