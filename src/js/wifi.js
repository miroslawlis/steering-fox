import { wifiModal } from "../renderer";
import debugLog from "./utils";

// var exec = require("child_process").exec;
let currentWifi = "";

// executing OS commands
function executeCommand(command) {
  debugLog(`executeCommand: ${command}`);
  // exec(command, function (error, stdout, stderr) {
  //   callback(stdout);
  // });
}

export function wifiInfo() {
  debugLog("Getting wifi info");

  if (window.appData.isLinux) {
    // Linux
    try {
      // current wifi SSID
      // https://unix.stackexchange.com/questions/92799/connecting-to-wifi-network-through-command-line
      executeCommand("iw wlan0 link | grep SSID", (SSID) => {
        currentWifi = SSID;
        currentWifi = currentWifi.replace(/SSID:\s+|\n|\s+/g, "");
        // debugLog("currentWifi: " + currentWifi);

        // // list o available networks
        executeCommand("iwlist wlan0 scan | grep ESSID", (wifiListOutput) => {
          // trimRight removes white spaces and new lines from end
          debugLog(`wifiNetworkList: ${wifiListOutput}`);
          const wifiNetworkList = wifiListOutput
            .trimRight()
            .replace(/\s+ESSID:"/g, "")
            .split('"');

          document.querySelector(
            "#settings .wifi .currentNetwork"
          ).innerHTML = `<p>Connected to: ${currentWifi}</p>`;
          // clear DOM object
          document.querySelector(
            "#settings .wifi .availableNetworks .data"
          ).innerHTML = "";

          wifiNetworkList.forEach((element) => {
            document.querySelector(
              "#settings .wifi .availableNetworks .data"
            ).innerHTML += `<div class="ssid" onclick="selectedWiFitoConnect(this);">${element}</div>`;
          });
        });
      });
    } catch (error) {
      debugLog(error);
    }
  } else {
    // Windows
    try {
      // current wifi SSID
      executeCommand(
        'netsh wlan show interface name="Wi-Fi" | findstr "\\<SSID\\>"',
        (SSID) => {
          // list o available networks
          executeCommand(
            'netsh wlan show networks | findstr "SSID"',
            (wifiListOutput) => {
              currentWifi = SSID;
              currentWifi = currentWifi.replace(/ |S|I|D|:|\n/g, "");
              // trimRight removes white spaces and new lines from end
              const wifiNetworkList = wifiListOutput
                .trimRight()
                .replace(/SSID [0-9] : /g, "")
                .replace(/\n+/g, "\n")
                .split("\n");

              document.querySelector(
                "#settings .wifi .currentNetwork"
              ).innerHTML = `<p>Connected to: ${currentWifi}</p>`;
              // clear DOM object
              document.querySelector(
                "#settings .wifi .availableNetworks .data"
              ).innerHTML = "";

              wifiNetworkList.forEach((element) => {
                document.querySelector(
                  "#settings .wifi .availableNetworks .data"
                ).innerHTML += `<div class="ssid" onclick="selectedWiFitoConnect(this);">${element}</div>`;
              });
            }
          );
        }
      );
    } catch (error) {
      debugLog(error);
    }
  }
}

function wifiDisconnect() {
  if (window.appData.isLinux) {
    // Linux
    try {
      // disconnect from WiFi network
      executeCommand("", () => {
        debugLog(`disconected from Wi-Fi network: ${currentWifi}`);
      });
    } catch (error) {
      debugLog(error);
    }
  } else {
    // Windows
    try {
      // disconnect from WiFi network
      executeCommand("netsh wlan disconnect", () => {
        debugLog(`disconected from Wi-Fi network: ${currentWifi}`);
        document.querySelector("#settings .wifi .currentNetwork").innerHTML =
          '<p class="warning">No connection</p>';
      });
    } catch (error) {
      debugLog(error);
    }
  }
}

export default function wifiConnect() {
  const selectedWiFitoConnectEl = document.querySelector(
    "#settings .wifi .data .ssid.selectedWiFi"
  );
  let wifiPassword;

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
          `wpa_cli set_network ${networkId} ssid '"${selectedWiFitoConnectEl.innerText}"' psk '"${wifiPassword}"'`,
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
          if (outputTrimed === stringHelper && !wifiPassword) {
            wifiModal();
            // document.getElementById('wifiPassword').classList.toggle('hide');
            document.querySelector("#wifiPassword input").focus();
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

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("wifi").addEventListener("click", () => {
    document.querySelector("#settings .wifi").classList.toggle("hide");
  });
  document.getElementById("wifiClose").addEventListener("click", () => {
    document.querySelector("#settings .wifi").classList.toggle("hide");
  });
  document.getElementById("wifiDisconnect").addEventListener("click", () => {
    wifiDisconnect();
  });
  document.getElementById("wifiConnect").addEventListener("click", () => {
    wifiConnect();
  });
  document.getElementById("wifiRefreshList").addEventListener("click", () => {
    wifiInfo();
  });
});
