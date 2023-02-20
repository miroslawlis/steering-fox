import path from "path";

const fs = require("fs");

export function wrtieIBUSdataToFile(...args) {
  return new Promise((resolve, reject) => {
    const pipFilePath = path.join(
      __dirname,
      `DATA_FROM_IBUS_${new Date().toISOString().split("T")[0]}.txt`
    );

    const outputFile = fs.createWriteStream(pipFilePath, { flags: "a" });

    outputFile.on("error", (error) => {
      console.error(error);
    });
    outputFile.write(`${args.join(", ")}\n`);
    outputFile.end();

    outputFile.on("finish", () => {
      outputFile.close(() => {
        resolve(`IBUS data saved to: ${pipFilePath}`);
      });
    });
    outputFile.on("error", (err) => {
      fs.unlink(pipFilePath);
      reject(err);
    });
  });
}

export const some = true;
