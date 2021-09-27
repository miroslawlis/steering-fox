var exec = require("child_process").exec;
var currentWifi = (wifiNetworkList = "");

window.addEventListener("DOMContentLoaded", function () {
  document.getElementById("wifi").addEventListener("click", function () {
    document.querySelector(".settings .wifi").classList.toggle("hide");
  });
  document.getElementById("wifiClose").addEventListener("click", function () {
    document.querySelector(".settings .wifi").classList.toggle("hide");
  });
  document
    .getElementById("wifiDisconnect")
    .addEventListener("click", function () {
      wifiDisconnect();
    });
  document.getElementById("wifiConnect").addEventListener("click", function () {
    wifiConnect();
  });
  document
    .getElementById("wifiRefreshList")
    .addEventListener("click", function () {
      wifiInfo();
    });
});

// executing OS commands
function executeCommand(command, callback) {
  debugLog("executeCommand: " + command);
  exec(command, function (error, stdout, stderr) {
    callback(stdout);
  });
}

function wifiInfo() {
  debugLog("Getting wifi info");

  if (isLinux) {
    // Linux
    try {
      // current wifi SSID
      // https://unix.stackexchange.com/questions/92799/connecting-to-wifi-network-through-command-line
      executeCommand("iw wlan0 link | grep SSID", function (SSID) {
        currentWifi = SSID;
        currentWifi = currentWifi.replace(/SSID:\s+|\n|\s+/g, "");
        // debugLog("currentWifi: " + currentWifi);

        // // list o available networks
        executeCommand(
          "iwlist wlan0 scan | grep ESSID",
          function (wifiListOutput) {
            // trimRight removes white spaces and new lines from end
            debugLog("wifiNetworkList: " + wifiListOutput);
            wifiNetworkList = wifiListOutput.trimRight();
            wifiNetworkList = wifiNetworkList.replace(/\s+ESSID:\"/g, "");
            wifiNetworkList = wifiNetworkList.split('"');

            document.querySelector(
              ".settings .wifi .currentNetwork"
            ).innerHTML = "<p>Connected to: " + currentWifi + "</p>";
            // clear DOM object
            document.querySelector(
              ".settings .wifi .availableNetworks .data"
            ).innerHTML = "";

            wifiNetworkList.forEach((element) => {
              document.querySelector(
                ".settings .wifi .availableNetworks .data"
              ).innerHTML +=
                '<div class="ssid" onclick="selectedWiFitoConnect(this);">' +
                element +
                "</div>";
            });
          }
        );
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
        function (SSID) {
          // list o available networks
          executeCommand(
            'netsh wlan show networks | findstr "SSID"',
            function (wifiListOutput) {
              currentWifi = SSID;
              currentWifi = currentWifi.replace(/ |S|I|D|:|\n/g, "");
              // trimRight removes white spaces and new lines from end
              wifiNetworkList = wifiListOutput.trimRight();
              wifiNetworkList = wifiNetworkList
                .replace(/SSID [0-9] : /g, "")
                .replace(/\n+/g, "\n");
              wifiNetworkList = wifiNetworkList.split("\n");

              document.querySelector(
                ".settings .wifi .currentNetwork"
              ).innerHTML = "<p>Connected to: " + currentWifi + "</p>";
              // clear DOM object
              document.querySelector(
                ".settings .wifi .availableNetworks .data"
              ).innerHTML = "";

              wifiNetworkList.forEach((element) => {
                document.querySelector(
                  ".settings .wifi .availableNetworks .data"
                ).innerHTML +=
                  '<div class="ssid" onclick="selectedWiFitoConnect(this);">' +
                  element +
                  "</div>";
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
  if (isLinux) {
    // Linux
    try {
      // disconnect from WiFi network
      executeCommand("", function (output) {
        debugLog("disconected from Wi-Fi network: " + currentWifi);
      });
    } catch (error) {
      debugLog(error);
    }
  } else {
    // Windows
    try {
      // disconnect from WiFi network
      executeCommand("netsh wlan disconnect", function (output) {
        debugLog("disconected from Wi-Fi network: " + currentWifi);
        document.querySelector(".settings .wifi .currentNetwork").innerHTML =
          '<p class="warning">No connection</p>';
      });
    } catch (error) {
      debugLog(error);
    }
  }
}

function wifiConnect(e) {
  let selectedWiFitoConnect = document.querySelector(
    ".settings .wifi .data .ssid.selectedWiFi"
  );
  let wifi_password;

  if (isLinux) {
    // Linux
    try {
      // connect to WiFi network
      // https://unix.stackexchange.com/questions/92799/connecting-to-wifi-network-through-command-line
      // using wpa_cli
      // first get network id, wpa_cli add_network
      executeCommand("wpa_cli add_network", function (output_Network_id) {
        output_Network_id = output_Network_id.match(/^\d/m)[0];
        debugLog(output_Network_id);
        // connect to selected WiFi
        //
        executeCommand(
          "wpa_cli set_network " +
            output_Network_id +
            " ssid '\"" +
            selectedWiFitoConnect.innerText +
            "\"' psk '\"" +
            wifi_password +
            "\"'",
          function (output_wpa_cli) {
            debugLog("output_wpa_cli: " + output_wpa_cli);
            document.querySelector(
              ".settings .wifi .currentNetwork"
            ).innerHTML = "<p>Connected to: " + currentWifi + "</p>";
            debugLog(
              "conected to Wi-Fi network: " + selectedWiFitoConnect.innerText
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
        'netsh wlan connect name="' + selectedWiFitoConnect.innerText + '"',
        function (output) {
          document.querySelector(".settings .wifi .currentNetwork").innerHTML =
            "<p>Connected to: " + currentWifi + "</p>";
          debugLog(
            "conected to Wi-Fi network: " + selectedWiFitoConnect.innerText
          );

          let stringHelper =
            'There is no profile "' +
            selectedWiFitoConnect.innerText +
            '" assigned to the specified interface.';
          output = output.trimRight();

          debugLog(output);

          // no password, show password input
          if (output == stringHelper && !wifi_password) {
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
    .querySelectorAll(".settings .wifi .availableNetworks .data .selectedWiFi")
    .forEach((ele) => {
      ele.classList.remove("selectedWiFi");
    });
  element.classList.toggle("selectedWiFi");
}
