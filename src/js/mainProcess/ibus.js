import { BrowserWindow } from "electron";
import { wrtieIBUSdataToFile } from "./utils";

const { IbusInterface, IbusDevices } = require("ibus");

// config
const device = "/dev/ttyUSB0";

// setup interface
export const ibusInterface = new IbusInterface(device);

export function sendAllData(data) {
  // id, from, to, message, message hex, analyzing, description
  return `${data.id} | ${IbusDevices.getDeviceName(
    data.src
  )} |  ${IbusDevices.getDeviceName(data.dst)} | 
    ${data.msg} | 
    ${data}`;
}

export default function initIBUS() {
  // disables logs from ibus (lots of colorfull spam, "ibus" is using "debug" package)
  // const debug = require("debug");
  // debug.disable();

  // Configure your device location

  function init() {
    ibusInterface.startup();
  }

  // main start
  if (window.appData.isLinux) {
    init();
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

  function onIbusDataHandler(data) {
    const msgDescryption = "";
    const buffMsg = Buffer.from(data.msg);
    const buffMsgHex = buffMsg.toString("hex").toLowerCase();
    const output = {
      name: null,
      data: null,
    };

    function sendToRenderer(dataTosend) {
      BrowserWindow.getFocusedWindow().webContents.send("fromCAN", dataTosend);
    }

    // remove empty data, like: from BodyModule - 0 to BodyModule - 0
    // tre for less data from CAN, for les noise in debuging (only knowns comands?)
    if (true) {
      if ((data.src === "0" && data.dst === "0") || data.src === "a4") {
        // end this round of data
      }
      if (data.src === "3b" && data.dst === "80" && buffMsgHex === "410701") {
        // filters this: id: 1588784831880 | GraphicsNavigationDriver - 3b | InstrumentClusterElectronics - 80 Message: A |  410701 | [object Object] |
      }
    }

    // from: MultiFunctionSteeringWheel && to: Radio or Telephone ('c8')
    if (data.src === "50" && (data.dst === "68" || data.dst === "c8")) {
      // volume down steering wheel
      if (data.msg === Buffer.from([50, 16]).toString("ascii")) {
        // Volume down button steering wheel
        output.name = "volDown";
        sendToRenderer(output);
      }
      // volume up steering wheel
      if (data.msg === Buffer.from([50, 17]).toString("ascii")) {
        // Volume up button steering wheel
        output.name = "volUp";
        sendToRenderer(output);
      }
      // previous track steering wheel
      if (data.msg === Buffer.from([59, 8]).toString("ascii")) {
        // Arrow up? button steering wheel
        output.name = "steeringWheelArrowDown";
        sendToRenderer(output);
      }
      // next song stearing wheel
      if (data.msg === Buffer.from([59, 1]).toString("ascii")) {
        // Arrow up button steering wheel
        output.name = "steeringWheelArrowUp";
        sendToRenderer(output);
      }
    }

    // from: MultiFunctionSteeringWheel
    if (data.src === "50") {
      // face button steering wheel
      if (buffMsgHex === "3b40") {
        // Face button steering wheel
        output.name = "pauseAudio";
        sendToRenderer(output);
      }
      // RT button steering wheel
      if (buffMsgHex === "3b80") {
        // RT button steering wheel
        output.name = "muteAudio";
        sendToRenderer(output);
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
      output.name = "tempOutside";
      output.data = buffMsgHex.substring(6, 16);
      sendToRenderer(output);
    }

    // time from instrument cluster not GPS
    // data.msg -> first 3 parts in buffer describe is it time ([36, 1, 0]) in hex: 24010031373a30392020
    if (
      data.src === "80" &&
      data.dst === "ff" &&
      buffMsgHex.substring(0, 6) === "240100"
    ) {
      // remove 3 first parts from buffer and remove 2 parts from end -> this give time in format HH:MM egz 12:45 (12h or 24h?)
      output.name = "timeFromInstrumentCluster";
      output.data = buffMsg.slice(3, 9).toString("utf-8");
      sendToRenderer(output);
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
      output.data.tempOutside = parseInt(buffMsgHex.substring(2, 4), 16);
      output.data.coolantTemp = parseInt(buffMsgHex.substring(4, 6), 16);

      output.name = "tempOutsideAndCoolantTemp";
      sendToRenderer(output);
    }

    if (data.src === "80" && data.dst === "ff") {
      // if (buffMsg.slice(1, 1).toString('hex') === '04') {
      if (data.msg[1] === "04") {
        // fuel consumption 1
        output.name = "fuleConsumption1";
        output.data = data.msg
          .slice(3, 14)
          .toString("utf-8")
          .replace(".", ",")
          .trim();
        sendToRenderer(output);
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
        output.name = "fuleConsumption2";
        output.data = buffMsgHex
          .slice(6, 14)
          .toString("utf-8")
          .replace(".", ",")
          .trim();
        sendToRenderer(output);
      }
      if (buffMsgHex.slice(0, 4) === "2406") {
        output.name = "range";
        output.data = buffMsgHex.slice(6, 14).toString("utf-8").trim();

        sendToRenderer(output);
      }
      if (data.msg[1] === "07") {
        // window.CANdata.distance
        output.name = "distance";
        output.data = data.msg.slice(3, 14).toString("hex");

        sendToRenderer(output);
      }
      if (data.msg[1] === "09") {
        output.name = "speedLimit";
        output.data = data.msg.slice(3, 14).toString("hex");

        sendToRenderer(output);
      }
      if (buffMsgHex.slice(0, 6) === "240a00") {
        output.data = buffMsgHex.slice(6, 14);
        output.name = "avgSpeed";

        sendToRenderer(output);
      }
    }
    // if from NavigationEurope 7f
    if (data.src === "7f") {
      // Town from NavModule GPS
      // data.msg -> third part ("1") in buffer msg describe is it town ([164, 0, 1])
      if (buffMsgHex.slice(0, 6) === "a40001") {
        output.data = buffMsg
          .slice(3, buffMsg.indexOf("0", 5))
          .toString("utf-8");
        output.name = "navTownName";
      }
      // Street from NavModule GPS
      // data.msg -> third part ("2") in buffer msg describe is it street ([164, 0, 2])
      if (buffMsgHex.slice(0, 6) === "a40002") {
        output.data = buffMsg
          .slice(3, buffMsg.indexOf("0", 5))
          .toString("utf-8");
        output.name = "navStreetName";
      }
      // GPS cords, time, altitude
      // data.msg -> first 3 parts in buffer describe is it GPS position ([162, 1, 0]) -> 'a20100' -- maybe only one part?? [162] - > 'a2', it can be ([162, 0, 0])
      if (buffMsgHex.slice(0, 6) === "a20100") {
        // buffer egxample: [162, 1, 0, 81, 64, 82, 80, 0, 32, 87, 65, 144, 1, 16, 0, 16, 71, 73] -> hex -> a2 01 00 51 40 52 50 00 20 57 41 90 01 10 00 10 47 49
        // first 3 can be  erased (a20100) -> 514052500020574190011000104749
        // from nav encoder: 2019-10-13 10:25:49.105||NAV  |TEL |Current position|GPS fix; 51°40'52.5"N  20°57'41.9"E; Alt 111m;  UTC 08:25:49
        // 51 (stopnie) 40 (minuty) 52 (sekundy) 50 (połowki sekundy N?) 00 (separator?) 20 (stopnie) 57 (minuty) 41 (sekundy) 90 (połowki sekundy E?) 01 10 00 (wysokość 111m, traktować jak stringi i połączyć? wtedy 01 + 10 + 00 daje 011000 -> 110m?) 10 (UTC godzina)47 (UTC minuty) 49 (UTC sekundy)
        output.name = "navLatLngTimeLatitiude";
        output.data.lat = buffMsg.slice(3, 7).toString("hex");
        output.data.lng = buffMsg.slice(8, 12).toString("hex");
        output.data.altitude = parseInt(buffMsgHex.slice(24, 28), 10);
        output.data.utcTime = buffMsg.slice(15, 18).toString("hex");

        sendToRenderer(output);
      }
    }

    // light dimmer
    // data.msg -> hex -> 5C FF FC FF 00 -> lights on?
    // data.msg -> hex -> 5c ff c9 ff 00 -> lights on?
    if (data.src === "d0" && data.dst === "bf" && buffMsgHex === "5cff3fff00") {
      output.data = "day";
      output.name = "lightSensor";

      sendToRenderer(output);
    }

    if (data.src === "d0" && data.dst === "bf" && buffMsgHex === "5cfe3fff00") {
      output.data = "night";
      output.name = "lightSensor";

      sendToRenderer(output);
    }

    // debugLog('[app] Analyzing: ', Buffer.from(data), '\n');

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
    sendToRenderer(output); // null
  }

  // Cleanup and close the device when exiting.
  function onSignalInt() {
    ibusInterface.shutdown(() => {
      process.exit();
    });
  }
  // events
  ibusInterface.on("data", onIbusDataHandler);

  // implementation
  // process.on('SIGINT', onSignalInt);
  process.on("exit", onSignalInt);
}
