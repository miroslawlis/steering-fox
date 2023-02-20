// const { fs } = require("fs");

// export default function debugLog(...args) {
//   // let args = arguments;
//   let output = "";

//   if (window.appData.debugMode === true) {
//     args.forEach((arg) => {
//       if (typeof arg === "object") {
//         // console.log(JSON.stringify(arg, null, 4));
//         Object.keys(arg).forEach((property) => {
//           output += `${property}: ${JSON.stringify(arg[property])};\n`;
//         });

//         console.log(output);
//       } else if (args.lastIndexOf("colorGREEN") >= 0) {
//         args.pop();
//         console.log("%c%s", "background: green;", arg);
//       } else if (args.lastIndexOf("colorOwindow.CANdata.range") >= 0) {
//         args.pop();
//         console.log(
//           "%c%s",
//           "background: owindow.CANdata.range; color: black;",
//           arg
//         );
//       } else {
//         console.log(arg);
//       }
//     });
//   }
// }
export default function debugLog(...args) {
  if (window.appData.debugMode) {
    // eslint-disable-next-line prefer-spread
    console.log.apply(console, args);
  }
}

export function hexToAscii(str) {
  if (str === " " || str.length < 7) {
    return null;
  }
  const hex = str.toString();
  let output = "";
  for (let n = 0; n < hex.length; n += 2) {
    output += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return output;
}

export function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function clampNumbers(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
