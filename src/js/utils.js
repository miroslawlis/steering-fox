// const { fs } = require("fs");

export default function debugLog(...args) {
  // let args = arguments;
  let output = "";

  if (window.appData.debugMode === true) {
    args.forEach((arg) => {
      if (typeof arg === "object") {
        // console.log(JSON.stringify(arg, null, 4));
        Object.keys(arg).forEach((property) => {
          output += `${property}: ${JSON.stringify(arg[property])};\n`;
        });

        console.log(output);
      } else if (args.lastIndexOf("colorGREEN") >= 0) {
        args.pop();
        console.log("%c%s", "background: green;", arg);
      } else if (args.lastIndexOf("colorOwindow.CANdata.range") >= 0) {
        args.pop();
        console.log(
          "%c%s",
          "background: owindow.CANdata.range; color: black;",
          arg
        );
      } else {
        console.log(arg);
      }
    });
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

export function wrtieIBUSdataToFile(...args) {
  const captureIBUSandSave = document.getElementById(
    "checkbox-ibus-collect"
  ).checked;
  // const output_file = fs.createWriteStream(
  //   `DATA_FROM_IBUS_${new Date().toISOString().split("T")[0]}.txt`,
  //   { flags: "a" }
  // );

  if (!captureIBUSandSave) {
    return;
  }

  // output_file.on("error", (error) => {
  //   console.error(error);
  // });
  // output_file.write(`${args.join(", ")}\n`);
  // output_file.end();

  debugLog("ibus data saved to file");
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
