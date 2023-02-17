import Keyboard from "./keyboard";
import dialogCloseHandler from "./modal";
import debugLog from "./utils";

// var exec = require("child_process").exec;
const currentWifi = "";

// executing OS commands
function executeCommand(command) {
  debugLog(`executeCommand: ${command}`);
  // exec(command, function (error, stdout, stderr) {
  //   callback(stdout);
  // });
}

export function getWifiInfo() {
  debugLog("Getting wifi info");

  window.electronAPI.getWifiSSID().then((data) => {
    const SSID = data.replace(/SSID:\s+|\n|\s+/g, "");
    console.log(SSID);
    document.querySelector(
      "#wifi-modal-with-settings .currentNetwork"
    ).innerHTML = `<p>Connected to: ${currentWifi}</p>`;
  });

  window.electronAPI
    .getListOfAvailableNetworks()
    .then((data) => {
      const wifiNetworkList = data
        .trimRight()
        .replace(/\s+ESSID:"/g, "")
        .split('"');

      // clear
      document.querySelector(
        "#wifi-modal-with-settings .availableNetworks .data"
      ).innerHTML = "";
      // populate
      wifiNetworkList.forEach((element) => {
        document.querySelector(
          "#wifi-modal-with-settings .availableNetworks .data"
        ).innerHTML += `<div class="ssid" onclick="selectedWiFitoConnect(this);">${element}</div>`;
      });
    })
    .catch((err) => {
      document.querySelector(
        "#wifi-modal-with-settings .availableNetworks .data"
      ).innerHTML = err;
    });
}

function wifiDisconnect() {
  if (window.appData.isLinux) {
    // Linux
    // nop
  } else {
    // Windows
    window.electronAPI
      .disconnectFromWifi()
      .then((data) => debugLog("disconnected from wifi", data));
  }
}

export default function wifiConnect() {
  const selectedWiFitoConnectEl = document.querySelector(
    "#settings .wifi .data .ssid.selectedWiFi"
  );
  let wifiPasswordDialog;

  if (window.appData.isLinux) {
    // Linux
    try {
      // connect to WiFi network
      // https://unix.stackexchange.com/questions/92799/connecting-to-wifi-network-through-command-line
      // using wpa_cli
      // first get network id, wpa_cli add_network
      executeCommand("wpa_cli add_network", (outputNetworkId) => {
        const networkId = outputNetworkId.match(/^\d/m)[0];
        debugLog(networkId);
        // connect to selected WiFi
        //
        executeCommand(
          `wpa_cli set_network ${networkId} ssid '"${selectedWiFitoConnectEl.innerText}"' psk '"${wifiPasswordDialog}"'`,
          (outputWpaCli) => {
            debugLog(`output_wpa_cli: ${outputWpaCli}`);
            document.querySelector(
              "#settings .wifi .currentNetwork"
            ).innerHTML = `<p>Connected to: ${currentWifi}</p>`;
            debugLog(
              `conected to Wi-Fi network: ${selectedWiFitoConnectEl.innerText}`
            );
          }
        );
      });
    } catch (error) {
      debugLog(error);
    }
  } else {
    // Windows
    try {
      // connect to WiFi network
      executeCommand(
        `netsh wlan connect name="${selectedWiFitoConnectEl.innerText}"`,
        (output) => {
          document.querySelector(
            "#settings .wifi .currentNetwork"
          ).innerHTML = `<p>Connected to: ${currentWifi}</p>`;
          debugLog(
            `conected to Wi-Fi network: ${selectedWiFitoConnectEl.innerText}`
          );

          const stringHelper = `There is no profile "${selectedWiFitoConnectEl.innerText}" assigned to the specified interface.`;
          const outputTrimed = output.trimRight();

          debugLog(outputTrimed);

          // no password, show password input
          if (outputTrimed === stringHelper && !wifiPasswordDialog) {
            showWifiDialog();
            // document.getElementById('wifiPasswordDialog').classList.toggle('hide');
            document.querySelector("#wifiPasswordDialog input").focus();
            debugLog("Enter wifi password");
          }
        }
      );
    } catch (error) {
      debugLog(error);
    }
  }
}

// for marking purposes
function selectedWiFitoConnect(element) {
  document
    .querySelectorAll("#settings .wifi .availableNetworks .data .selectedWiFi")
    .forEach((ele) => {
      ele.classList.remove("selectedWiFi");
    });
  element.classList.toggle("selectedWiFi");
}

export function showWifiDialog() {
  document.getElementById("wifiPasswordDialog").showModal();

  // for modal popup, after entering password
  document.querySelector("#wifiPasswordDialog .wifipassconnect").onclick =
    function () {
      wifiConnect();
    };

  // second init, for inputs in modal that was created
  Keyboard.reinitForInputs();
}

function showWifiNetworkListModal() {
  document.getElementById("wifi-modal-with-settings").showModal();
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("show-wifi-settings-dialog")
    .addEventListener("click", showWifiNetworkListModal);
  document.getElementById("wifiClose").addEventListener("click", (e) => {
    dialogCloseHandler(e.target);
  });
  document.getElementById("wifiDisconnect").addEventListener("click", () => {
    wifiDisconnect();
  });
  document.getElementById("wifiConnect").addEventListener("click", () => {
    wifiConnect();
  });
  document.getElementById("wifiRefreshList").addEventListener("click", () => {
    getWifiInfo();
  });
});
