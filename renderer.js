// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


window.addEventListener('DOMContentLoaded', function () {

    // window.apiMain.send('electron_command_line_arguments');
    // window.apiMain.receive('output_electron_command_line_arguments', (data => {
    //     startParameters = data;
    //     if (startParameters.includes("debug") || startParameters.includes('remote-debugging-port=8315')) {
    //         debugMode = true;
    //     }
    // }));

    let startParameters = window.apiMain.args;
    if (startParameters.includes("debug") || startParameters.includes('remote-debugging-port=8315')) {
        debugMode = true;
    }

    let loaderEl = document.getElementById('loader-wrapper');
    document.body.removeChild(loaderEl);

    // for global access
    var songsObj = [];

    audioElement = document.querySelector("#audio");

    document.getElementById('settings').addEventListener('click', function () {
        // on click fire this function
        getIPs();
        wifiInfo();
    });

    // minimizing and closing
    document.getElementById('minimize').addEventListener("click", function () {
        window.apiMain.send('minimize');
    });
    document.getElementById('closeApp').addEventListener("click", function () {
        window.apiMain.send('close');
    });
    //

    // bluetooth
    document.getElementById('bluetooth').addEventListener("click", function () {
        // show/hide bluetooth settings
        document.querySelector('.settings .bluetooth').classList.toggle('hide');
    });
    document.getElementById('btClose').addEventListener("click", function () {
        document.querySelector('.settings .bluetooth').classList.toggle('hide');
    });

    // initiall start
    window.apiMain.send('getIPs');
    window.apiMain.send('wifiInfo');
    window.apiMain.send('settingsFileAndMusic');
    window.apiMain.receive('output_settingsFileAndMusic', (data) => {
        console.log('settings file content: ', data);
        // reads music files in folder and generate object with songs (paths and more)
        try {

            songsObj = window.apiMain.createSongsObject(data.musicFolder);

            window.apiMain.addRowsToMusicTable;
            // randomize songs
            songsObj = shuffl(songsObj);
            // // HTML update
            getThreeSongsToGUI(songsObj);
            //auto play at start
            playAudio();

        } catch (error) {
            console.log(error)
        }
    });

    asksCANforNewData();
    // and repeate checking and asking if necessery every x miliseconds
    setInterval(asksCANforNewData, 500);

    dateAndTime();
    setInterval(dateAndTime, 30000);

    guiUpdateData();
    setInterval(guiUpdateData, 1000);

    window.apiMain.debugLog(window.apiMain.ifaces);

});

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

function asksCANforNewData() {
    // checks if variable is empty, if soo then ask CAN for new data

    if (!window.apiMain.canData.fuel_consumption_1) {
        window.apiMain.sendCAN('fuel_consumption_1');
    }
    if (!window.apiMain.canData.fuel_consumption_2) {
        window.apiMain.sendCAN('fuel_consumption_2');
    }
    if (!window.apiMain.canData.temp_outside) {
        window.apiMain.sendCAN('temp_outside');
    }
    if (!window.apiMain.canData.distance) {
        window.apiMain.sendCAN('distance');
    }
    if (!window.apiMain.canData.range) {
        window.apiMain.sendCAN('range');
    }
    if (!window.apiMain.canData.avg_speed) {
        window.apiMain.sendCAN('avg_speed');
    }
    if (!window.apiMain.canData.time_instrument_cluster) {
        window.apiMain.sendCAN('time');
    }

}

function dateAndTime() {

    let dateObj = new Date();
    let date = dateObj.toLocaleDateString('pl-PL').replace(/\./g, '-');
    let time = dateObj.toLocaleTimeString('pl-PL').substr(0, 5);
    let timeDateElement = document.querySelector('#main .info .curent_time');
    // get time from instrument claster (CAN)

    if (window.apiMain.canData.time_instrument_cluster) {
        // get time from instrument claster (CAN)
        timeDateElement.innerHTML = '<span class="time">' + window.apiMain.canData.time_instrument_cluster + '</span>' + '<span class="date">' + date + '</span>';
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

function guiUpdateData() {

    //neerest town
    if (window.apiMain.canData.town_nav) {
        // document.querySelector('.grid-cell.nearest_town .data').innerText = town_nav;
    }

    // alltitude, with conversion
    if (window.apiMain.canData.gps_altitude) {
        document.querySelector('.grid-cell.altitude .data').innerHTML = window.apiMain.canData.gps_altitude + '<div class="small text">m</div>';
    }

    // Temperature outside
    let temp_outside = window.apiMain.canData.temp_outside;
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

    if (window.apiMain.canData.coolant_temp) {
        document.querySelector('.grid-cell.coolant_temp .data').innerText = window.apiMain.canData.coolant_temp + ' \xB0C';
    }

    //fuel consumption 1
    if (window.apiMain.canData.fuel_consumption_1) {
        document.querySelector('#main .fuel_cons1 .data').innerHTML = '<div class="data1">' + window.apiMain.canData.fuel_consumption_1 + '</div><div class="small text">l/100km</div>';
    }
    //fuel consumption 2
    if (window.apiMain.canData.fuel_consumption_2) {
        document.querySelector('.grid-cell.fuel_cons2 .data').innerHTML = window.apiMain.canData.fuel_consumption_2 + '<div class="small text">l/100km</div>';
    }

    // light sensor in place of weather forecast
    if (window.apiMain.canData.light_sensor) {
        document.querySelector('.grid-cell.weather_forecast').innerText = window.apiMain.canData.light_sensor;
    }

    // range 
    if (window.apiMain.canData.range) {
        document.querySelector('.grid-cell.range .data').innerHTML = window.apiMain.canData.range + '<div class="small text">km</div>';
    }

    // avg_speed 
    if (window.apiMain.canData.avg_speed) {
        document.querySelector('.grid-cell.avg_speed .data').innerHTML = window.apiMain.canData.avg_speed + '<div class="small text">km/h</div>';
    }

    CPUtemp();

}

function CPUtemp() {

    if (window.apiMain.isLinux) {
        try {

            temp = window.apiMain.spawn('cat', ['/sys/class/thermal/thermal_zone0/temp']);
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

function updateSourceWithSong(tableRow) {

    audioElement.setAttribute('src', path.join(musicFolder, tableRow.querySelector(".file").innerText));
    // add attribute with song number
    audioElement.setAttribute('itemId', tableRow.querySelector('.itemid').innerText);

    playAudio(true);

}