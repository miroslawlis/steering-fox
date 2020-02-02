// var exec = require('child_process').exec;
var bt = require("bluetoothctl");
var btConnectedTo = btAvailableDevices = '';

var selectedMAC = '';


window.addEventListener('DOMContentLoaded', function () {

    document.getElementById('bluetooth').addEventListener("click", function () {
        // bluetoothctl init
        bt.Bluetooth();

        let btConnectedDevicesDOM = document.querySelector('.settings .bluetooth .pairedDevices .devices');

        bt.on(bt.bluetoothEvents.ScaningEnded, function () {

            debugLog("ScaningEnded");

            btAvailableDevices = bt.devices;
            let btScanedDevicesDOM = document.querySelector('.settings .bluetooth .scanedDevices .devices');

            //clear DOM element for new data after scanning
            btScanedDevicesDOM.innerHTML = '';

            for (let i = 0, l = btAvailableDevices.length; i < l; i++) {
                btScanedDevicesDOM.innerHTML += '<div class="device" onclick="markDeviceToPair(this)"><div class="name">' + btAvailableDevices[i]['name'] + '</div><div class="mac">' + btAvailableDevices[i]['mac'] + '</div></div>';
            }
            debugLog("btAvailableDevices: ", btAvailableDevices);

        });

        bt.on(bt.bluetoothEvents.PassKey, function (passkey) {
            debugLog('Confirm passkey:' + passkey);
            bt.confirmPassKey(true);
        });

        bt.on(bt.bluetoothEvents.Connected, function () {
            debugLog("Connected");

            //clear DOM element for new data after scanning
            btConnectedDevicesDOM.innerHTML = '';

            btConnectedTo = bt.devices.filter(element => element.connected === 'yes');
            btConnectedTo.forEach(element => {
                btConnectedDevicesDOM.innerHTML += '<div class="device"><div class="name">' + element['name'] + '</div><div class="mac">' + element['mac'] + '</div></div>';
            });
        });


        bt.on(bt.bluetoothEvents.Device, function () {

            debugLog('Event Device');
            //clear DOM element for new data after scanning
            btConnectedDevicesDOM.innerHTML = '';

            btConnectedTo = bt.devices.filter(element => element.connected === 'yes');
            btConnectedTo.forEach(element => {
                btConnectedDevicesDOM.innerHTML += '<div class="device"><div class="name">' + element['name'] + '</div><div class="mac">' + element['mac'] + '</div></div>';
            });

        });

    });

    document.getElementById('btScan').addEventListener('click', function () {
        btScan();
    });

    document.getElementById('btClose').addEventListener('click', function () {
        bt.close;
    });

    document.getElementById('btPair').addEventListener('click', function () {
        let macAdresSelectedDevice = document.querySelector('.settings .bluetooth .scanedDevices .devices .device.selected .mac');

        bt.pair(macAdresSelectedDevice.innerText);
        debugLog("macAdresSelectedDevice.innerText: " + macAdresSelectedDevice.innerText);
    });

    document.getElementById('btDisconnect').addEventListener('click', function () {
        bt.disconnect(document.querySelector('.settings .bluetooth .pairedDevices .devices .device .mac').innerText);
    });

});




function btScan() {

    // check if bluetooth is ready, exist and it's not scaning curently
    if (bt.isBluetoothReady === true && bt.isBluetoothControlExists === true && bt.isScanning === false) {
        //start scaning
        bt.scan(true);
        debugLog("bluetoooth scaning...");
        //stop scaning after 7sec
        setTimeout(function () {
            debugLog('stopping scan');
            bt.scan(false);
        }, 5000);

    }
}

function btConnect(MAC) {
    bt.pair(MAC);
}

function markDeviceToPair(element) {

    // remove class from already selected element
    let alreadySelected = document.querySelector('.settings .bluetooth .scanedDevices .devices .device.selected');
    if (alreadySelected) {
        alreadySelected.classList.toggle('selected');
    }

    element.classList.toggle('selected');
}