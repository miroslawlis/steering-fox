// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const path = require('path');
const electron = require('electron');
var recursive = require("recursive-readdir");
const os = require('os');
var ifaces = os.networkInterfaces();
var spawn = require('child_process').spawn;
var win = electron.remote.getCurrentWindow();
var isLinux = process.platform === 'linux';
const remote = require('electron').remote;
const brightness = require('brightness');

const settings = require('./js/settings.js');
//for debugLog()
const startParameters = remote.process.argv.slice(2);

if (startParameters.includes("debug") || startParameters.includes('remote-debugging-port=8315')) {
    var debugMode = true;
}
//
songsObj = [];

window.addEventListener('DOMContentLoaded', function () {
    let loaderEl = document.getElementById('loader-wrapper');
    document.body.removeChild(loaderEl);

    audioElement = document.querySelector("#audio");

    document.getElementById('settings').addEventListener('click', function () {
        // on click fire this function
        getIPs();
        wifiInfo();
    });

    // minimizing and closing
    document.getElementById('minimize').addEventListener("click", function () {
        win.minimize();
    });
    document.getElementById('closeApp').addEventListener("click", function () {
        win.close();
    });
    //
    // bluetooth
    document.getElementById('bluetooth').addEventListener("click", function () {
        // show/hide bluetooth settings
        document.querySelector('.settings .bluetooth').classList.toggle('hide');
    });
    document.getElementById('btClose').addEventListener("click", function () {
        document.querySelector('.settings .bluetooth').classList.toggle('hide');
    })

    // initiall start
    getIPs();
    wifiInfo();

    sendCAN('fuel_consumption_1');
    sendCAN('fuel_consumption_2');
    sendCAN('outside_temp');
    sendCAN('distance');
    sendCAN('range');
    sendCAN('avg_speed');
    sendCAN('time');

    dateAndTime();
    setInterval(dateAndTime, 30000);

    guiUpdateData();
    setInterval(guiUpdateData, 1000);

    debugLog(os.networkInterfaces());

});


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

function menuHideToggle(element) {

    let actiElems = document.querySelectorAll("#nav .element.active");
    let actiElemsMain = document.querySelectorAll("#main .element.active");

    if (element.classList.contains("active") == false) {

        // info
        if (element.id == "info") {
            // remove from rest nav
            for (let i = 0, l = actiElems.length; i < l; i++) {
                actiElems[i].classList.remove("active");
            }
            // remove from rest main
            for (let i = 0, l = actiElems.length; i < l; i++) {
                actiElemsMain[i].classList.remove("active");
            }
            // add class nav
            document.getElementById("info").classList.add("active");
            // add class main
            document.querySelector("#main .info").classList.add("active");
        }

        // music
        if (element.id == "music") {
            // remove from rest nav
            for (let i = 0, l = actiElems.length; i < l; i++) {
                actiElems[i].classList.remove("active");
            }
            // remove from rest main
            for (let i = 0, l = actiElems.length; i < l; i++) {
                actiElemsMain[i].classList.remove("active");
            }
            // add class nav
            document.getElementById("music").classList.add("active");
            // add class main
            document.querySelector("#main .music").classList.add("active");
        }

        // youtube
        if (element.id == "youtube") {
            // remove from rest nav
            for (let i = 0, l = actiElems.length; i < l; i++) {
                actiElems[i].classList.remove("active");
            }
            // remove from rest main
            for (let i = 0, l = actiElems.length; i < l; i++) {
                actiElemsMain[i].classList.remove("active");
            }
            // add class nav
            document.getElementById("youtube").classList.add("active");
            // add class main
            document.querySelector("#main .youtube").classList.add("active");
        }

        // map
        if (element.id == "map") {
            // remove from rest nav
            for (let i = 0, l = actiElems.length; i < l; i++) {
                actiElems[i].classList.remove("active");
            }
            // remove from rest main
            for (let i = 0, l = actiElems.length; i < l; i++) {
                actiElemsMain[i].classList.remove("active");
            }
            // add class nav
            document.getElementById("map").classList.add("active");
            // add class main
            document.querySelector("#main .map").classList.add("active");
        }

        // settings
        if (element.id == "settings") {
            // remove from rest nav
            for (let i = 0, l = actiElems.length; i < l; i++) {
                actiElems[i].classList.remove("active");
            }
            // remove from rest main
            for (let i = 0, l = actiElems.length; i < l; i++) {
                actiElemsMain[i].classList.remove("active");
            }
            // add class nav
            document.getElementById("settings").classList.add("active");
            // add class main
            document.querySelector("#main .settings").classList.add("active");
        }

    }
}

function updateSourceWithSong(tableRow) {

    audioElement.setAttribute('src', path.join(musicFolder, tableRow.querySelector(".file").innerText));
    // add attribute with song number
    audioElement.setAttribute('itemId', tableRow.querySelector('.itemid').innerText);

    playAudio(true);

}

function dateAndTime() {

    let dateObj = new Date();
    let date = dateObj.toLocaleDateString('pl-PL').replace(/\./g, '-');
    let time = dateObj.toLocaleTimeString('pl-PL').substr(0, 5);
    let timeDateElement = document.querySelector('#main .info .curent_time');
    // get time from instrument claster (CAN)

    if (time_instrument_cluster) {
        // get time from instrument claster (CAN)
        timeDateElement.innerHTML = '<span class="time">' + time_instrument_cluster + '</span>' + '<span class="date">' + date + '</span>';
        // to do 
        // set time and date (on OS) from CAN/car?
    } else {
        timeDateElement.innerHTML = '<span class="time">' + time + '</span>' + '<span class="date">' + date + '</span>';
    }

    //// if 'gps_utc_time' have data then get time from gps
    // if (gps_utc_time) {
    //     // current time from GPS
    //     gps_utc_time = parseInt(gps_utc_time.substring(0, 2)) + 1 + ':' + gps_utc_time.substring(2, 4) + ':' + gps_utc_time.substring(4, 6);

    // }

}

function addRowsToMusicTable() {

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
    //////////
    //auto play at start
    playAudio();
}

// do settings file stuff
settings.init();

// get files recursivly (with sub folders)
// https:// stackoverflow.com/questions/2727167/how-do-you-get-a-list-of-the-names-of-all-files-present-in-a-directory-in-node-j
// add record in songsObj for each audio file in musicFolder

function createSongsObject() {

    // clear songsObj
    songsObj = [];

    // wihout aditional libary was: "fs.readdir(musicFolder, (err, files) => {"
    recursive(musicFolder, (err, files) => {

        let i = 1;
        // get only .mp3 audio files
        files = files.filter(function (e) {
            return path.extname(e).toLowerCase() === '.mp3';
        });
        //// 
        debugLog("files.length: " + files.length);
        files.forEach(file => {
            // debugLog("createSongsObject: " + file);
            // dodaje do
            // faster
            songsObj.push({ id: i, name: file.split('\\').pop().split('/').pop(), length: '', path: file });
            // a bit slower
            // songsObj.push( { id: i, name: file.replace(/^.*[\\\/]/, ''), length: '', path: file } );
            i++;

            if (i > files.length) {
                addRowsToMusicTable();
                // renderer.addRowsToMusicTable;
                // debugLog("addRowsToMusicTable()");
                // randomize songs
                shuffl();

                // HTML update
                GetThreeSongsToGUI();

                debugLog("songsObj: ");
                debugLog(songsObj);
            }

        })
    });
}


function getIPs() {

    //clear DOM
    document.getElementById("ipslist").innerHTML = '';

    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                debugLog(ifname + ':' + alias, iface.address);
                document.getElementById("ipslist").innerHTML += '<span class="ip">' + ifname + ': ' + alias + ' ' + iface.address + '</span>';
            } else {
                // this interface has only one ipv4 adress
                debugLog(ifname + ": " + iface.address);
                document.getElementById("ipslist").innerHTML += '<span class="ip">' + ifname + ': ' + iface.address + '</span>';
            }
            ++alias;
        });
    });
}

function CPUtemp() {

    if (isLinux) {
        try {

            temp = spawn('cat', ['/sys/class/thermal/thermal_zone0/temp']);
            temp.stdout.on('data', function (data) {
                //return data/1000;
                document.querySelector('.info .cpu_temp .data').innerHTML = Math.round(data / 1000) + '<div class="small text">\xB0C</div>';
            });

        } catch (error) {
            debugLog(error);
        }
    } else {
        document.querySelector('.info .cpu_temp .data').innerHTML = Math.round('56.548') + '<div class="small text">\xB0C</div>';
    }
}

function guiUpdateData() {

    //neerest town
    if (town_nav) {
        document.querySelector('.grid-cell.nearest_town .data').innerText = town_nav;
    }

    // alltitude, with conversion
    if (gps_altitude) {
        document.querySelector('.grid-cell.altitude .data').innerHTML = gps_altitude + '<div class="small text">m</div>';
    }

    // Temperature outside
    if (temp_outside) {
        temp_outside = (temp_outside.length > 7) ? hex_to_ascii(temp_outside) : temp_outside;

        if (temp_outside.includes(' ')) {
            temp_outside = temp_outside.trim();
        } else if (temp_outside.includes('+') || temp_outside.includes('-')) {
            temp_outside = temp_outside.replace('+', '+ ');
            temp_outside = temp_outside.replace('-', '- ');
            temp_outside = temp_outside.replace('.', ',');

            document.querySelector('.grid-cell.temp_outside_car .data').innerText = temp_outside + ' \xB0C';
        }
    }

    //fuel consumption 1
    if (fuel_consumption_1) {
        fuel_1_ele.innerHTML = '<div class="data1">' + fuel_consumption_1 + '</div><div class="small text">l/100km</div>';
    }
    //fuel consumption 2
    if (fuel_consumption_2) {
        document.querySelector('.grid-cell.fuel_cons2 .data').innerHTML = fuel_consumption_2 + '<div class="small text">l/100km</div>';
    }

    // light sensor in place of weather forecast
    if (light_sensor) {
        document.querySelector('.grid-cell.weather_forecast').innerText = light_sensor;
    }

    // range 
    if (range) {
        document.querySelector('.grid-cell.range .data').innerHTML = range + '<div class="small text">km</div>';
    }

    // avg_speed 
    if (avg_speed) {
        document.querySelector('.grid-cell.avg_speed .data').innerHTML = avg_speed + '<div class="small text">km/h</div>';
    }

    CPUtemp();

}

function hex_to_ascii(str1) {
    if (str1 == ' ' || str1.length < 7) {
        return;
    }
    var hex = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}

function updateTimeCANfromInput(element) {

    let hour = document.querySelector('#modalTwoInputs.modal input.hour.time').value;
    let minutes = document.querySelector('#modalTwoInputs.modal input.minutes.time').value;

    if (hour.match(/^[0-9][0-9]$/) != null && minutes.match(/^[0-9][0-9]$/) != null) {
        sendCAN("update-time", hour, minutes);
        modalClose(element)
    }

}

function timeSetModal(params) {
    let modal_time;
    let contentLink = linkModal.import;
    let elemModal = contentLink.getElementById('modalTwoInputs');

    modal_time = document.createElement('div');
    modal_time.id = 'timeModalSet';
    modal_time.classList = modalClasses[0] + ' ' + modalClasses[1];

    modal_time.innerHTML = elemModal.outerHTML;

    document.body.appendChild(modal_time);

    // add attribute "onclick" to template file
    // fire chnage time CAN fucntion
    document.querySelector('#timeModalSet .modal .confirm').setAttribute('onclick', 'updateTimeCANfromInput(this)');

    // second init, for inputs in modal that was created
    Keyboard.reinitForInputs();

    // set focus on first input to show keyboard
    document.querySelector('#timeModalSet .modal input').focus();
}

function wifiModal() {
    let modal_wifi;
    let contentLink = linkModal.import;
    let elemModal = contentLink.getElementById('wifiPassword');

    modal_wifi = document.createElement('div');
    modal_wifi.id = 'wifipasswordModal';
    modal_wifi.classList = modalClasses[0] + ' ' + modalClasses[1];

    modal_wifi.innerHTML = elemModal.outerHTML;

    document.body.appendChild(modal_wifi);

    // for modal popup, after entering password
    document.querySelector('#wifiPassword .wifipassconnect').onclick = function () {
        wifiConnect();
    };

    // second init, for inputs in modal that was created
    Keyboard.reinitForInputs();

}

function fuelConsResetModal(arg) {
    let modal_fuel_reset;
    let contentLink = linkModal.import;
    let elemModal = contentLink.getElementById('modalConfirm');

    modal_fuel_reset = document.createElement('div');
    modal_fuel_reset.id = 'modalConfirmWrap';
    modal_fuel_reset.classList = modalClasses[0] + ' ' + modalClasses[1];

    modal_fuel_reset.innerHTML = elemModal.outerHTML;

    document.body.appendChild(modal_fuel_reset);

    // add attribute "onclick" to template file
    
    document.querySelector('#modalConfirmWrap .modal .confirm').onclick(function() {
        // fire reset fuel1 CAN function
    });

}

function switchTheme(ele) {
    // update css in html
    // based on select drop down change OR from setting file

    let styleTag = document.getElementById('themeColor');

    if (ele) {
        let attribute = ele.options[ele.options.selectedIndex].value;

        switch (attribute) {
            case ('green'):
                styleTag.setAttribute('href', 'css/themes/green.css');
                break;
            case ('dark_grey'):
                styleTag.setAttribute('href', 'css/themes/dark_grey.css')
                break;
            case ('purpule'):
                styleTag.setAttribute('href', 'css/themes/purpule.css')
                break;
            case ('rainbow'):
                styleTag.setAttribute('href', 'css/themes/rainbow.css');
                break;
            default:
                styleTag.setAttribute('href', 'css/themes/dark_grey.css');
                break;
        }
    } else {
        // no element provided in parameter then read saved option from setting file

        let attribute = settingFromFileObj.themeOptionFile;

        switch (attribute) {
            case ('green'):
                styleTag.setAttribute('href', 'css/themes/green.css');
                break;
            case ('dark_grey'):
                styleTag.setAttribute('href', 'css/themes/dark_grey.css')
                break;
            case ('purpule'):
                styleTag.setAttribute('href', 'css/themes/purpule.css')
                break;
            case ('rainbow'):
                styleTag.setAttribute('href', 'css/themes/rainbow.css');
                break;
            default:
                styleTag.setAttribute('href', 'css/themes/dark_grey.css');
                break;
        }
    }
}
