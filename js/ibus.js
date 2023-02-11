var time_instrument_cluster, town_nav, street_nav, gps_altitude, gps_cords_lat, gps_cords_lon, gps_utc_time, temp_outside, fuel_consumption_1, fuel_consumption_2, range, distance, speed_limit, avg_speed, light_sensor, coolant_temp;

var lessInfoFromCAN = true;

//// ibus part start

var IbusInterface = require("ibus").IbusInterface;
var IbusDevices = require("ibus").IbusDevices;

// disables logs from ibus (lots of colorfull spam, "ibus" is using "debug" package)
let debug = require("debug");
debug.disable();

// Configure your device location

// config
var device = "/dev/ttyUSB0";

// setup interface
var ibusInterface = new IbusInterface(device);

function init() {
  ibusInterface.startup();
}

ipcRenderer.send("isLinux");
ipcRenderer.on("isLinux:result", (event, arg) => {
  isLinux = arg;
  console.log(event, arg);
});
// main start
isLinux && init();

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

// events
ibusInterface.on("data", onIbusData);

function onIbusData(data) {
  let msgDescryption = "";
  let buffMsg = new Buffer.from(data.msg);
  let buffMsgHex = buffMsg.toString("hex").toLowerCase();

  // remove empty data, like: from BodyModule - 0 to BodyModule - 0
  if (lessInfoFromCAN === true) {
    if ((data.src == "0" && data.dst == "0") || data.src == "a4") {
      return;
      // end this round of data
    } else if (data.src == "3b" && data.dst == "80" && buffMsgHex == "410701") {
      // filters this: id: 1588784831880 | GraphicsNavigationDriver - 3b | InstrumentClusterElectronics - 80 Message: A |  410701 | [object Object] |
      return;
    }
  }

  // from: MultiFunctionSteeringWheel && to: Radio or Telephone ('c8')
  if (data.src == "50" && (data.dst == "68" || data.dst == "c8")) {
    // volume down steering wheel
    if (data.msg == new Buffer.from([50, 16]).toString("ascii")) {
      volDown();

      msgDescryption = "Volume down button steering wheel";
    }
    // volume up steering wheel
    if (data.msg == new Buffer.from([50, 17]).toString("ascii")) {
      volUp();

      msgDescryption = "Volume up button steering wheel";
    }
    // previous track steering wheel
    if (data.msg == new Buffer.from([59, 8]).toString("ascii")) {
      previousSong();

      msgDescryption = "Arrow up? button steering wheel";
    }
    //next song stearing wheel
    if (data.msg == new Buffer.from([59, 1]).toString("ascii")) {
      nextSong();

      msgDescryption = "Arrow down? button steering wheel";
    }
  }

  // from: MultiFunctionSteeringWheel
  if (data.src == "50") {
    // face button steering wheel
    if (buffMsgHex == "3b40") {
      pauseAudio();

      msgDescryption = "Face button steering wheel";
    }
    // RT button steering wheel
    if (buffMsgHex == "3b80") {
      muteAudio(document.querySelector("#music-player .mute.button"));

      msgDescryption = "RT button steering wheel";
    }
  }
  // egz WHOLE message: 80 0a ff 24 03 00 2b 31 32 2e 35 61 80 0f ff 24 02 00 31 30 2e 31 31 2e 32 30 31 39 5d 80 05 bf 18 00 06 24
  // or WHOLE message: Buffer(36) [128, 10, 255, 36, 3, 0, 43, 49, 50, 46, 53, 97, 128, 15, 255, 36, 2, 0, 49, 48, 46, 49, 49, 46, 50, 48, 49, 57, 93, 128, 5, 191, 24, 0, 6, 36]
  // 80 source, 0a length, ff destenation, 2b 31 32 2e 35 actual temperature, there is allso time later in string
  if (data.src == "80" && data.dst == "ff" && buffMsgHex.substring(0, 4) == "2403") {
    // outside temperature
    temp_outside = buffMsgHex.substring(6, 16);

    msgDescryption = "Outside temperature";
  }

  // time from instrument cluster not GPS
  // data.msg -> first 3 parts in buffer describe is it time ([36, 1, 0]) in hex: 24010031373a30392020
  if (data.src == "80" && data.dst == "ff" && buffMsgHex.substring(0, 6) == "240100") {
    // remove 3 first parts from buffer and remove 2 parts from end -> this give time in format HH:MM egz 12:45 (12h or 24h?)
    time_instrument_cluster = buffMsg.slice(3, 9).toString("utf-8");

    msgDescryption = "Time from instrument cluster";
  }

  // temperature outside and coolant temperature
  // from: InstrumentClusterElectronics - 80 to: GlobalBroadcastAddress - bf msg: 19154b00
  if (data.src == "80" && data.dst == "bf" && buffMsgHex.substring(0, 2) == "19") {
    // first hex in message indicates temperature outside and coolant temperatur message

    // to decimal conversion
    // in Celsius
    // CHECK IF ITS OK
    temp_outside = parseInt(buffMsgHex.substring(2, 4), 16);
    coolant_temp = parseInt(buffMsgHex.substring(4, 6), 16);

    msgDescryption = "Temperature: Outside:" + temp_outside + "C " + "Coolant: " + coolant_temp + " C";
  }

  if (data.src == "80" && data.dst == "ff") {
    // if (buffMsg.slice(1, 1).toString('hex') == '04') {
    if (data.msg[1] == "04") {
      // fuel consumption 1
      fuel_consumption_1 = data.msg.slice(3, 14).toString("utf-8").replace(".", ",").trim();

      msgDescryption = "Fuel consumption 1";
    }
    if (buffMsgHex.slice(0, 4) == "2405") {
      // if (data.msg[1] == '05') {
      // fuel consumption 2
      // src: "80";
      // len: "9";
      // dst: "ff";
      // msg: {"type":"Buffer","data":[36,5,0,32,56,46,52]};
      // 24050020382e34
      // crc: "55";
      fuel_consumption_2 = buffMsgHex.slice(6, 14);
      fuel_consumption_2 = hex_to_ascii(fuel_consumption_2).replace(".", ",").trim();

      msgDescryption = "Fuel consumption 2";
    }
    if (buffMsgHex.slice(0, 4) == "2406") {
      // range
      range = buffMsgHex.slice(6, 14);
      range = hex_to_ascii(range).trim();

      msgDescryption = "Range";
    }
    if (data.msg[1] == "07") {
      // distance
      distance = data.msg.slice(3, 14).toString("hex");

      msgDescryption = "Distance";
    }
    if (data.msg[1] == "09") {
      // speed_limit
      speed_limit = data.msg.slice(3, 14).toString("hex");

      msgDescryption = "Speed limit";
    }
    if (buffMsgHex.slice(0, 6) == "240a00") {
      // avarage speed
      avg_speed = buffMsgHex.slice(6, 14);
      avg_speed = hex_to_ascii(avg_speed).trim();

      msgDescryption = "AVG speed";
    }
  }
  // if from NavigationEurope 7f
  if (data.src == "7f") {
    // Town from NavModule GPS
    // data.msg -> third part ("1") in buffer msg describe is it town ([164, 0, 1])
    if (buffMsgHex.slice(0, 6) === "a40001") {
      town_nav = buffMsg.slice(3, buffMsg.indexOf("0", 5)).toString("utf-8");
      msgDescryption = "Town name";
    }
    // Street from NavModule GPS
    // data.msg -> third part ("2") in buffer msg describe is it street ([164, 0, 2])
    if (buffMsgHex.slice(0, 6) === "a40002") {
      //
      street_nav = buffMsg.slice(3, buffMsg.indexOf("0", 5)).toString("utf-8");
      msgDescryption = "Street name";
    }
    // GPS cords, time, altitude
    // data.msg -> first 3 parts in buffer describe is it GPS position ([162, 1, 0]) -> 'a20100' -- maybe only one part?? [162] - > 'a2', it can be ([162, 0, 0])
    if (buffMsgHex.slice(0, 6) == "a20100") {
      // buffer egxample: [162, 1, 0, 81, 64, 82, 80, 0, 32, 87, 65, 144, 1, 16, 0, 16, 71, 73] -> hex -> a2 01 00 51 40 52 50 00 20 57 41 90 01 10 00 10 47 49
      // first 3 can be  erased (a20100) -> 514052500020574190011000104749
      // from nav encoder: 2019-10-13 10:25:49.105||NAV  |TEL |Current position|GPS fix; 51°40'52.5"N  20°57'41.9"E; Alt 111m;  UTC 08:25:49
      // 51 (stopnie) 40 (minuty) 52 (sekundy) 50 (połowki sekundy N?) 00 (separator?) 20 (stopnie) 57 (minuty) 41 (sekundy) 90 (połowki sekundy E?) 01 10 00 (wysokość 111m, traktować jak stringi i połączyć? wtedy 01 + 10 + 00 daje 011000 -> 110m?) 10 (UTC godzina)47 (UTC minuty) 49 (UTC sekundy)
      gps_cords_lat = buffMsg.slice(3, 7).toString("hex");
      gps_cords_lon = buffMsg.slice(8, 12).toString("hex");
      gps_altitude = parseInt(buffMsgHex.slice(24, 28));
      gps_utc_time = buffMsg.slice(15, 18).toString("hex");

      msgDescryption = "GPS cords";
    }
  }

  // light dimmer
  // data.msg -> hex -> 5C FF FC FF 00 -> lights on?
  // data.msg -> hex -> 5c ff c9 ff 00 -> lights on?
  if (data.src == "d0" && data.dst == "bf" && buffMsgHex === "5cff3fff00") {
    //
    light_sensor = "day";

    msgDescryption = "Light sensor = day";

    nightSensorSaysItIs(light_sensor);
  }

  if (data.src == "d0" && data.dst == "bf" && buffMsgHex === "5cfe3fff00") {
    light_sensor = "night";

    msgDescryption = "Light sensor = night";

    nightSensorSaysItIs(light_sensor);
  }

  //id, from, to, message, message hex, analyzing, description
  debugLog(data.id, " | ", IbusDevices.getDeviceName(data.src), "|", IbusDevices.getDeviceName(data.dst), "|", data.msg, "|", buffMsgHex, "|", data, "|", msgDescryption);

  // debugLog('[app] Analyzing: ', new Buffer.from(data), '\n');

  let msgDate = new Date();

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

// implementation
// process.on('SIGINT', onSignalInt);
process.on("exit", onSignalInt);

function onSignalInt() {
  ibusInterface.shutdown(function () {
    process.exit();
  });
}

// send to CAN

// https://github.com/kmalinich/node-bmw-ref/blob/master/ibus/bus-lib.txt
// to check

function sendCAN(request, arg1, arg2) {
  try {
    if (ibusInterface) {
      switch (request) {
        // request for fuel consumption 1
        case "fuel_consumption_1":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: new Buffer.from([0x41, 0x04, 0x01]),
            //3B 05 80 41 04 01
          });
          break;
        // request for fuel consumption 2
        case "fuel_consumption_2":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: new Buffer.from([0x41, 0x05, 0x01]),
            //3B 05 80 41 05 01
          });
          break;
        // request for outside temperature
        case "temp_outside":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: new Buffer.from([0x41, 0x03, 0x01]),
          });
          break;
        // request for total kilometers
        // Odometer request
        case "distance":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: new Buffer.from([0x41, 0x07, 0x01]),
          });
          break;
        // request range
        case "range":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: new Buffer.from([0x41, 0x06, 0x01]),
          });
          break;
        // request avg speed
        case "avg_speed":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: new Buffer.from([0x41, 0x0a, 0x01]),
          });
          break;
        //request obc
        case "obc":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: new Buffer.from([0x41, 0x19]),
          });
          break;

        // set DSP
        case "dsp-on-concert-hall":
          ibusInterface.sendMessage({
            src: 0x68,
            dst: 0x6a,
            msg: new Buffer.from([0x34, 0x09]),
          });
          break;

        // request time
        case "time":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: new Buffer.from([0x41, 0x01, 0x01]),
          });
          break;

        // update time
        // arg1->Hours, arg2->minutes
        case "update-time":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: new Buffer.from([0x40, 0x01, arg1, arg2]),
          });
          break;

        // update date
        // arg1->day, arg2->month, arg3->year
        case "update-date":
          ibusInterface.sendMessage({
            src: 0x3b,
            dst: 0x80,
            msg: new Buffer.from([0x40, 0x02, arg1, arg2, arg3]),
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

//// ibus part end

function nightSensorSaysItIs(dayOrNightString) {
  if (dayOrNightString == "day") {
    setPreviousTheme();
  }
  if (dayOrNightString == "night") {
    setDarkTheme();
  }
}
