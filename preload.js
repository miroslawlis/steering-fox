// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

// rewrite to https://stackoverflow.com/a/54560886/2893810
// https://stackoverflow.com/questions/54544519/electron-require-is-not-defined

const path = require('path');
const fs = require('fs');
const ibus = require('./js/ibus');

const os = require('os');
var ifaces = os.networkInterfaces();
var spawn = require('child_process').spawn;
const isLinux = process.platform === 'linux';
// const settings = require('./js/settings.js');

//for debugLog()
let startParameters;
let debugMode = false;

function debugLog(...args) {

    // let args = arguments;
    var output = '';

    if (debugMode === true) {
        args.forEach(function (arg, index) {

            if (typeof (arg) === 'object') {

                // console.log(JSON.stringify(arg, null, 4));
                for (var property in arg) {
                    output += property + ': ' + JSON.stringify(arg[property]) + ';\n';
                }
                console.log(output);

            } else if (args.lastIndexOf('colorGREEN') >= 0) {

                args.pop();
                console.log('%c%s', 'background: green;', arg);

            } else if (args.lastIndexOf('colorORANGE') >= 0) {

                args.pop();
                console.log('%c%s', 'background: orange; color: black;', arg);

            } else {

                console.log(arg);
            }
        });

    }
}

function addRowsToMusicTable() {
    // populates table with data from songsObj, this table is used to play music
    // debugLog(Array.isArray(songsObj));
    // debugLog("songsObj: ");
    // debugLog(songsObj);

    // clear table
    document.querySelector("#main .music table tbody").innerHTML = '';

    for (let item of songsObj) {
        document.querySelector("#main .music table tbody").innerHTML += '<tr class="itemIDrow' + item['id'] + '" onclick="updateSourceWithSong(this);"><td class="itemid">' + item['id'] + `</td><td class="file">` + item['name'] + '</td><td class="length">' + item['length'] + '</td></tr>';
    }

    // set src (first audio from table) of audio element
    audioElement.setAttribute('src', path.join(musicFolder, document.querySelector("#main .music table tbody td.file").innerText));
    // add attribute with song number
    audioElement.setAttribute('itemId', document.querySelector('#main .music table tbody td.itemid').innerText);

}

// // do settings file stuff
// settings.init();

function createSongsObject(musicFolderPath) {
    // reads music files in foler and generate object with songs (paths and more)
    // only call after geting path to music folder (present in API or variable)
    // add record to songsObjInternal for each audio file in musicFolder
    var songsObjInternal = [];
    var list = fs.readdirSync(musicFolderPath);

    list.forEach(function (file, i) {

        file = path.join(musicFolderPath, file).toLowerCase();

        // get only .mp3 audio files
        if (file.split('.').pop() == 'mp3') {
            var stat = fs.statSync(file);

            if (stat && stat.isDirectory()) {
                /* Recurse into a subdirectory */
                songsObjInternal = songsObjInternal.concat(walk(file));
            } else {
                /* Is a file */
                // songsObjInternal.push(file);
                songsObjInternal.push({ id: i, name: file.split('\\').pop().split('/').pop(), length: '', path: file });
            }
        }

    });
    return songsObjInternal;
}

// async version
// const { resolve } = require('path');
// const { readdir } = require('fs').promises;

// async function getFiles(dir) {
//     const dirents = await readdir(dir, { withFileTypes: true });
//     const files = await Promise.all(dirents.map((dirent) => {
//         const res = resolve(dir, dirent.name);
//         return dirent.isDirectory() ? getFiles(res) : res;
//     }));
//     return Array.prototype.concat(...files);
// }
////


// function getIPs() {

//     //clear DOM
//     document.getElementById("ipslist").innerHTML = '';

//     Object.keys(ifaces).forEach(function (ifname) {
//         var alias = 0;

//         ifaces[ifname].forEach(function (iface) {
//             if ('IPv4' !== iface.family || iface.internal !== false) {
//                 // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
//                 return;
//             }

//             if (alias >= 1) {
//                 // this single interface has multiple ipv4 addresses
//                 debugLog(ifname + ':' + alias, iface.address);
//                 document.getElementById("ipslist").innerHTML += '<span class="ip">' + ifname + ': ' + alias + ' ' + iface.address + '</span>';
//             } else {
//                 // this interface has only one ipv4 adress
//                 debugLog(ifname + ": " + iface.address);
//                 document.getElementById("ipslist").innerHTML += '<span class="ip">' + ifname + ': ' + iface.address + '</span>';
//             }
//             ++alias;
//         });
//     });
// }


// function hex_to_ascii(str1) {
//     if (str1 == ' ' || str1.length < 7) {
//         return;
//     }
//     var hex = str1.toString();
//     var str = '';
//     for (var n = 0; n < hex.length; n += 2) {
//         str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
//     }
//     return str;
// }

// function updateTimeCANfromInput(element) {

//     let hour = document.querySelector('#modalTwoInputs.modal input.hour.time').value;
//     let minutes = document.querySelector('#modalTwoInputs.modal input.minutes.time').value;

//     if (hour.match(/^[0-9][0-9]$/) != null && minutes.match(/^[0-9][0-9]$/) != null) {
//         sendCAN("update-time", hour, minutes);
//         modalClose(element)
//     }

// }

// function timeSetModal(params) {
//     let modal_time;
//     let contentLink = linkModal.import;
//     let elemModal = contentLink.getElementById('modalTwoInputs');

//     modal_time = document.createElement('div');
//     modal_time.id = 'timeModalSet';
//     modal_time.classList = modalClasses[0] + ' ' + modalClasses[1];

//     modal_time.innerHTML = elemModal.outerHTML;

//     document.body.appendChild(modal_time);

//     // add attribute "onclick" to template file
//     // fire chnage time CAN fucntion
//     document.querySelector('#timeModalSet .modal .confirm').setAttribute('onclick', 'updateTimeCANfromInput(this)');

//     // second init, for inputs in modal that was created
//     Keyboard.reinitForInputs();

//     // set focus on first input to show keyboard
//     document.querySelector('#timeModalSet .modal input').focus();
// }

// function wifiModal() {
//     let modal_wifi;
//     let contentLink = linkModal.import;
//     let elemModal = contentLink.getElementById('wifiPassword');

//     modal_wifi = document.createElement('div');
//     modal_wifi.id = 'wifipasswordModal';
//     modal_wifi.classList = modalClasses[0] + ' ' + modalClasses[1];

//     modal_wifi.innerHTML = elemModal.outerHTML;

//     document.body.appendChild(modal_wifi);

//     // for modal popup, after entering password
//     document.querySelector('#wifiPassword .wifipassconnect').onclick = function () {
//         wifiConnect();
//     };

//     // second init, for inputs in modal that was created
//     Keyboard.reinitForInputs();

// }

// function fuelConsResetModal(arg) {
//     let modal_fuel_reset;
//     let contentLink = linkModal.import;
//     let elemModal = contentLink.getElementById('modalConfirm');

//     modal_fuel_reset = document.createElement('div');
//     modal_fuel_reset.id = 'modalConfirmWrap';
//     modal_fuel_reset.classList = modalClasses[0] + ' ' + modalClasses[1];

//     modal_fuel_reset.innerHTML = elemModal.outerHTML;

//     document.body.appendChild(modal_fuel_reset);

//     // add attribute "onclick" to template file

//     document.querySelector('#modalConfirmWrap .modal .confirm').click(function () {
//         // fire reset fuel1 CAN function
//     });

// }

// function switchTheme(ele) {
//     // update css in html
//     // based on select drop down change OR from setting file

//     let styleTag = document.getElementById('themeColor');

//     if (ele) {
//         let attribute = ele.options[ele.options.selectedIndex].value;

//         switch (attribute) {
//             case ('green'):
//                 styleTag.setAttribute('href', 'css/themes/green.css');
//                 break;
//             case ('dark_grey'):
//                 styleTag.setAttribute('href', 'css/themes/dark_grey.css')
//                 break;
//             case ('purpule'):
//                 styleTag.setAttribute('href', 'css/themes/purpule.css')
//                 break;
//             case ('rainbow'):
//                 styleTag.setAttribute('href', 'css/themes/rainbow.css');
//                 break;
//             default:
//                 styleTag.setAttribute('href', 'css/themes/dark_grey.css');
//                 break;
//         }
//     } else {
//         // no element provided in parameter then read saved option from setting file

//         let attribute = settingFromFileObj.themeOptionFile;

//         switch (attribute) {
//             case ('green'):
//                 styleTag.setAttribute('href', 'css/themes/green.css');
//                 break;
//             case ('dark_grey'):
//                 styleTag.setAttribute('href', 'css/themes/dark_grey.css')
//                 break;
//             case ('purpule'):
//                 styleTag.setAttribute('href', 'css/themes/purpule.css')
//                 break;
//             case ('rainbow'):
//                 styleTag.setAttribute('href', 'css/themes/rainbow.css');
//                 break;
//             default:
//                 styleTag.setAttribute('href', 'css/themes/dark_grey.css');
//                 break;
//         }
//     }
// }



const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "apiMain", {
    send: (channel, data) => {
        // whitelist channels
        let validChannels = ["minimize", "settingsFileAndMusic", "saveToSettingsFile", "electron_command_line_arguments"];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ["fromMain", "output_settingsFileAndMusic", "output_electron_command_line_arguments"];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    createSongsObject: (pathToMusicFolder) => createSongsObject(pathToMusicFolder),
    addRowsToMusicTable: addRowsToMusicTable,
    debugLog: (args) => debugLog(args),
    args: process.argv.slice(2),
    canData: ibus.canData,
    sendCAN: ibus.sendCAN,
    isLinux: isLinux,
    spawn: (arg1, arg2) => spawn(arg1, arg2),
    ifaces: ifaces
    //wifiInfo: wifiInfo,
}
);

// window.apiMain.getIPs = getIPs();