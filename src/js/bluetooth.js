// {
//   // var exec = require('child_process').exec;
//   const bt = require("bluetoothctl");
//   const btConnectedTo = (btAvailableDevices = "");

//   const selectedMAC = "";

//   window.addEventListener("DOMContentLoaded", () => {
//     document.getElementById("bluetooth").addEventListener("click", () => {
//       // bluetoothctl init
//       try {
//         bt.Bluetooth();

//         const btConnectedDevicesDOM = document.querySelector(
//           ".settings .bluetooth .pairedDevices .devices"
//         );

//         bt.on(bt.bluetoothEvents.ScaningEnded, () => {
//           debugLog("ScaningEnded");

//           btAvailableDevices = bt.devices;
//           const btScanedDevicesDOM = document.querySelector(
//             ".settings .bluetooth .scanedDevices .devices"
//           );

//           // clear DOM element for new data after scanning
//           btScanedDevicesDOM.innerHTML = "";

//           for (let i = 0, l = btAvailableDevices.length; i < l; i++) {
//             btScanedDevicesDOM.innerHTML +=
//               `<div class="device" onclick="markDeviceToPair(this)"><div class="name">${ 
//               btAvailableDevices[i].name 
//               }</div><div class="mac">${ 
//               btAvailableDevices[i].mac 
//               }</div></div>`;
//           }
//           debugLog("btAvailableDevices: ", btAvailableDevices);
//         });

//         bt.on(bt.bluetoothEvents.PassKey, (passkey) => {
//           debugLog(`Confirm passkey:${  passkey}`);
//           bt.confirmPassKey(true);
//         });

//         bt.on(bt.bluetoothEvents.Connected, () => {
//           debugLog("Connected");

//           // clear DOM element for new data after scanning
//           btConnectedDevicesDOM.innerHTML = "";

//           btConnectedTo = bt.devices.filter(
//             (element) => element.connected === "yes"
//           );
//           btConnectedTo.forEach((element) => {
//             btConnectedDevicesDOM.innerHTML +=
//               `<div class="device"><div class="name">${ 
//               element.name 
//               }</div><div class="mac">${ 
//               element.mac 
//               }</div></div>`;
//           });
//         });

//         bt.on(bt.bluetoothEvents.Device, () => {
//           debugLog("Event Device");
//           // clear DOM element for new data after scanning
//           btConnectedDevicesDOM.innerHTML = "";

//           btConnectedTo = bt.devices.filter(
//             (element) => element.connected === "yes"
//           );
//           btConnectedTo.forEach((element) => {
//             btConnectedDevicesDOM.innerHTML +=
//               `<div class="device"><div class="name">${ 
//               element.name 
//               }</div><div class="mac">${ 
//               element.mac 
//               }</div></div>`;
//           });
//         });
//       } catch (error) {
//         console.log("Bluetooth error:", error);
//       }
//     });

//     document.getElementById("btScan").addEventListener("click", () => {
//       btScan();
//     });

//     document.getElementById("btClose").addEventListener("click", () => {
//       bt.close;
//     });

//     document.getElementById("btPair").addEventListener("click", () => {
//       const macAdresSelectedDevice = document.querySelector(
//         ".settings .bluetooth .scanedDevices .devices .device.selected .mac"
//       );

//       bt.pair(macAdresSelectedDevice.innerText);
//       debugLog(
//         `macAdresSelectedDevice.innerText: ${  macAdresSelectedDevice.innerText}`
//       );
//     });

//     document
//       .getElementById("btDisconnect")
//       .addEventListener("click", () => {
//         bt.disconnect(
//           document.querySelector(
//             ".settings .bluetooth .pairedDevices .devices .device .mac"
//           ).innerText
//         );
//       });
//   });

//   function btScan() {
//     // check if bluetooth is ready, exist and it's not scaning curently
//     if (
//       bt.isBluetoothReady === true &&
//       bt.isBluetoothControlExists === true &&
//       bt.isScanning === false
//     ) {
//       // start scaning
//       bt.scan(true);
//       debugLog("bluetoooth scaning...");
//       // stop scaning after 7sec
//       setTimeout(() => {
//         debugLog("stopping scan");
//         bt.scan(false);
//       }, 5000);
//     }
//   }

//   function btConnect(MAC) {
//     bt.pair(MAC);
//   }

//   function markDeviceToPair(element) {
//     // remove class from already selected element
//     const alreadySelected = document.querySelector(
//       ".settings .bluetooth .scanedDevices .devices .device.selected"
//     );
//     if (alreadySelected) {
//       alreadySelected.classList.toggle("selected");
//     }

//     element.classList.toggle("selected");
//   }
// }
