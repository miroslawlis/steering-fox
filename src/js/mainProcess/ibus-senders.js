import { ibusInterface } from "./ibus";

export default function sendMsgToCAN(requestName, arg1, arg2, arg3) {
  switch (requestName) {
    // request for fuel consumption 1
    case "fuelConsumption1":
      ibusInterface.sendMessage({
        src: 0x3b,
        dst: 0x80,
        msg: Buffer.from([0x41, 0x04, 0x01]),
        // 3B 05 80 41 04 01
      });
      break;
    // request for fuel consumption 2
    case "fuelConsumption2":
      ibusInterface.sendMessage({
        src: 0x3b,
        dst: 0x80,
        msg: Buffer.from([0x41, 0x05, 0x01]),
        // 3B 05 80 41 05 01
      });
      break;
    // request for outside temperature
    case "tempOutside":
      ibusInterface.sendMessage({
        src: 0x3b,
        dst: 0x80,
        msg: Buffer.from([0x41, 0x03, 0x01]),
      });
      break;
    // request for total kilometers
    // Odometer request
    case "distance":
      ibusInterface.sendMessage({
        src: 0x3b,
        dst: 0x80,
        msg: Buffer.from([0x41, 0x07, 0x01]),
      });
      break;
    // request window.CANdata.range
    case "range":
      ibusInterface.sendMessage({
        src: 0x3b,
        dst: 0x80,
        msg: Buffer.from([0x41, 0x06, 0x01]),
      });
      break;
    // request avg speed
    case "avgSpeed":
      ibusInterface.sendMessage({
        src: 0x3b,
        dst: 0x80,
        msg: Buffer.from([0x41, 0x0a, 0x01]),
      });
      break;
    // request obc
    case "obc":
      ibusInterface.sendMessage({
        src: 0x3b,
        dst: 0x80,
        msg: Buffer.from([0x41, 0x19]),
      });
      break;

    // set DSP
    case "dsp-on-concert-hall":
      ibusInterface.sendMessage({
        src: 0x68,
        dst: 0x6a,
        msg: Buffer.from([0x34, 0x09]),
      });
      break;

    // request time
    case "time":
      ibusInterface.sendMessage({
        src: 0x3b,
        dst: 0x80,
        msg: Buffer.from([0x41, 0x01, 0x01]),
      });
      break;

    // update time
    // arg1->Hours, arg2->minutes
    case "updateTime":
      ibusInterface.sendMessage({
        src: 0x3b,
        dst: 0x80,
        msg: Buffer.from([0x40, 0x01, arg1, arg2]),
      });
      break;

    // update date
    // arg1->day, arg2->month, arg3->year
    case "update-date":
      ibusInterface.sendMessage({
        src: 0x3b,
        dst: 0x80,
        msg: Buffer.from([0x40, 0x02, arg1, arg2, arg3]),
      });
      break;

    default:
      break;
  }
}
