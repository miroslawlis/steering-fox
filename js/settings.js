exports.init = () => {

    let fuel_1_ele = document.querySelector('#main .fuel_cons1 .data');

    document.querySelector(".settings").addEventListener('change', function () {
        saveSettingsToFile();
    }, false);

    function saveSettingsToFile() {

        let contentObject = {};
        let themeOption = '';

        try {
            debugLog("Saving settings to file");

            if (document.querySelector(".settings .settingsfile").files && document.querySelector(".settings .settingsfile").files.length != 0) {
                musicFolder = document.querySelector(".settings .settingsfile").files[0].path;
            }

            let themeElement = document.querySelector(".settings .themeOption");
            // check if egzist
            if (themeElement.length > 0) {
                themeOption = themeElement.selectedOptions[0].value;
            }

            if (fuel_1_ele.innerText) {
                contentObject.lastFuel1Con = fuel_1_ele.innerText;
            }
            // adding options to object
            contentObject.musicFolder = musicFolder;
            contentObject.themeOptionFile = themeOption;
            contentObject.audioVolume = document.getElementById("audio").volume;

            // converting object to string
            contentObject = JSON.stringify(contentObject);

            debugLog("musicFolder: " + musicFolder);
            debugLog("settingsFileName: " + settingsFileName);
            debugLog("contentObject: " + contentObject);

        } catch (err) {
            debugLog(err);
        }

        try {
            // send request to main proces - to save file with gicen content
            window.apiMain.send('saveToSettingsFile', contentObject);
        }
        catch (e) { debugLog("FAILD to save setting file " + e); }
    }

    function updateGUIwithSettings(themOpt = document.querySelector(".settings .themeOption"), fileOpt = document.querySelector(".settings .item .filepath"), audioOpt = audio.volume) {

        // update GUI
        let themeElement = document.querySelector(".settings .themeOption");
        let musicFolderEl = document.querySelector(".settings .item .filepath");

        musicFolderEl.innerText = fileOpt;
        themeElement.value = themOpt;
        audioElement.volume = audioOpt;
    }
};

