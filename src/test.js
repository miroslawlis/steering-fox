// SERIAL PORT MOCKING
//
const { MockBinding } = require("@serialport/binding-mock");
const { SerialPortStream } = require("@serialport/stream");
const { ReadlineParser } = require("@serialport/parser-readline");

// Create a port and enable the echo and recording.
MockBinding.createPort("/dev/ROBOT", { echo: true, record: true });
const port = new SerialPortStream({
  binding: MockBinding,
  path: "/dev/ROBOT",
  baudRate: 9600,
});

/* Add some action for incoming data. For example,
 ** print each incoming line in uppercase */
const parser = new ReadlineParser({ length: 8 });
port.pipe(parser).on("data", (line) => {
  console.log(line);
  console.log(line.toString());
});

// wait for port to open...
port.on("open", () => {
  // ...then test by simulating incoming data
  setInterval(() => {
    console.log("emitingData");
    port.port.emitData("\x50\x04\x68\x3B\x21\xA6");
  }, 1000);
});

/* Expected output:
HELLO, WORLD!
*/
