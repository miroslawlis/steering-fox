const fs = require('fs');

function settingsInit() {

    UserPath = '';
    settingsFileName = 'settings.json';
    musicFolder = '/Music/';
    UserPath = (electron.app || electron.remote.app).getPath('userData');
    filePathAndName = path.join(UserPath, settingsFileName);

    let fuel_1_ele = document.querySelector('#main .fuel_cons1 .data');

    // check if settings.json file dose not egzist in app folder 
    // if it's not there then create it that file with default data
    try {

        const settingsFileContent = {};
        settingsFileContent.musicFolder = "";
        settingsFileContent.themeOptionFile = 5;

        if (!fs.existsSync(filePathAndName)) {
            // file not exist
            debugLog('Settings file not exist, creating...');

            fs.writeFile(filePathAndName, JSON.stringify(settingsFileContent), (err) => {
                if (err) {
                    console.error('Error in creating settings file: ' + err);
                } else {
                    // no error === succes
                    // after crating file, load content
                    debugLog('Settings file created');
                    readSettingfile();
                }
            });

        } else if (fs.readFileSync(filePathAndName).length < 1) {   
        // empty file
        fs.writeFile(filePathAndName, JSON.stringify(settingsFileContent), (err) => {
            if (err) {
                console.error('Error in creating settings file: ' + err);
            } else {
                // no error === succes
                // after crating file, load content
                debugLog('Settings file created');
                readSettingfile();
            }
        });
        } else {
            // file exist and no error
            debugLog('Settings file exist');
            readSettingfile();
        }
    } catch (err) {
        console.error('Setting file: ' + err);
    }

    document.querySelector(".settings").addEventListener('change', function () {
        saveSettingsToFile();
    }, false);
    document.getElementById("volume-music-bar").addEventListener('change', () => saveSettingsToFile(true), false);

    function saveSettingsToFile(saveOnly = true) {

        let contentObject = {};
        let themeOption = '';

        try {
            debugLog("Saving settings to file");

            let musiFolderPathEl = document.getElementById('music-folder-path');

            if (musiFolderPathEl.files && musiFolderPathEl.files.length != 0) {
                musicFolder = path.dirname(musiFolderPathEl.files[0].path);
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
            console.error(err);
        }

        try {
            fs.writeFile(filePathAndName, contentObject, (err) => {
                if (err) throw err;
                console.log('The file has been saved! ' + filePathAndName);

                if (!saveOnly) {
                    createSongsObject();
                }
            });
        }
        catch (e) { debugLog("FAILD to save setting file " + e); }
    }

    // if settings file contain folderPath (and it's not empty string) then use it in var musicFolder else use "/Music/"
    function readSettingfile() {

        debugLog('Settings file, loading content...');

        try {
            settingFromFileObj = fs.readFileSync(filePathAndName);
            if (!isJsonString(settingFromFileObj)) {
                console.log('invalid content - not JSON');
                return false;
            }
            settingFromFileObj = JSON.parse(settingFromFileObj);
            
            if (settingFromFileObj.musicFolder != '') {

                musicFolder = settingFromFileObj.musicFolder;
                debugLog('musicFolder !="" : ' + musicFolder);

            }
            // fuel_consumption_1 = settingFromFileObj.lastFuel1Con;

            updateGUIwithSettings(settingFromFileObj.themeOptionFile, settingFromFileObj.musicFolder, settingFromFileObj.audioVolume);
            //
            switchTheme();
            createSongsObject();

        } catch (error) {
            console.error(error);
        }

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

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
