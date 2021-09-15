const fs = require('fs');

var settings_app = {
    settingsFileName: 'settings.json',
    musicFolder: '/Music/',
    fuel_1_ele: document.querySelector('#main .fuel_cons1 .data'),

    get_user_path() {
        this.filePathAndName = path.join(this.user_path, this.settingsFileName);
    },
    init() {
        this.get_user_path();
        this.listen_for_UI_changes();
        this.check_for_settings_file_create();
    },
    check_for_settings_file_create() {
        // check if settings.json file dose not egzist in app folder 
        // if it's not there then create it that file with default data
        try {

            const settingsFileContent = {};
            settingsFileContent.musicFolder = "";
            settingsFileContent.themeOptionFile = 5;

            if (!fs.existsSync(this.filePathAndName) || fs.readFileSync(this.filePathAndName).length < 1) {
                // file not exist or empty
                debugLog('Settings file not exist or empty, creating...');

                fs.writeFile(this.filePathAndName, JSON.stringify(settingsFileContent), (err) => {
                    if (err) {
                        console.error('Error in creating settings file: ' + err);
                    } else {
                        // no error === succes
                        // after crating file, load content
                        debugLog('Settings file created');
                        this.readSettingfile();
                    }
                });
            } else {
                // file exist and no error
                debugLog('Settings file exist');
                this.readSettingfile();
            }
        } catch (err) {
            console.error('Setting file: ' + err);
        }
    },
    listen_for_UI_changes() {
        // add events listners responsible for saving when user interacts with UI
        document.querySelector(".settings input").addEventListener('change', function () {
            settings_app.saveSettingsToFile();
            // generate new songs
            createSongsObject();
        }, false);
        document.getElementById("audio").addEventListener('volumechange', () => settings_app.saveSettingsToFile(true), false);

        // theme and language chages and saves to settings file are handled in elements on click functions
    },
    saveSettingsToFile(saveOnly = true) {

        let contentObject = {};
        let themeOption = '';

        try {
            debugLog("Saving settings to file");

            let musiFolderPathEl = document.getElementById('music-folder-path');

            if (musiFolderPathEl.files && musiFolderPathEl.files.length != 0) {
                this.musicFolder = path.dirname(musiFolderPathEl.files[0].path);
            }

            let themeElement = document.querySelector(".settings .themeOption");
            // check if egzist
            if (themeElement.length > 0) {
                themeOption = themeElement.selectedOptions[0].value;
            }


            if (this.fuel_1_ele.innerText) {
                contentObject.lastFuel1Con = this.fuel_1_ele.innerText;
            }
            // adding options to object
            contentObject.musicFolder = this.musicFolder;
            contentObject.themeOptionFile = themeOption;
            contentObject.audioVolume = document.getElementById("audio").volume;

            // converting object to string
            contentObject = JSON.stringify(contentObject);

            debugLog("musicFolder: " + this.musicFolder);
            debugLog("settingsFileName: " + this.settingsFileName);
            debugLog("contentObject: " + contentObject);

        } catch (err) {
            console.error(err);
        }

        try {
            fs.writeFile(this.filePathAndName, contentObject, (err) => {
                if (err) throw err;
                console.log('The file has been saved! ' + this.filePathAndName);

                if (!saveOnly) {
                    createSongsObject();
                }
            });
        }
        catch (e) { debugLog("FAILD to save setting file " + e); }
    },
    readSettingfile() {
        // if settings file contain folderPath (and it's not empty string) then use it in var musicFolder else use "/Music/"

        debugLog('Settings file, loading content...');

        try {
            settingFromFileObj = fs.readFileSync(this.filePathAndName);

            if (!isJsonString(settingFromFileObj)) {
                console.log('invalid content - not JSON');
                return false;
            }
            settingFromFileObj = JSON.parse(settingFromFileObj);

            if (settingFromFileObj.musicFolder != '') {

                this.musicFolder = settingFromFileObj.musicFolder;
                debugLog('musicFolder !="" : ' + this.musicFolder);

            }
            // fuel_consumption_1 = settingFromFileObj.lastFuel1Con;

            this.updateGUIwithSettings(settingFromFileObj.themeOptionFile, settingFromFileObj.musicFolder, settingFromFileObj.audioVolume);
            //
            switchTheme();
            createSongsObject();

        } catch (error) {
            console.error(error);
        }

    },
    updateGUIwithSettings(themOpt = document.querySelector(".settings .themeOption"), fileOpt = document.querySelector(".settings .item .filepath"), audioOpt = audio.volume) {

        // update GUI
        let themeElement = document.querySelector(".settings .themeOption");
        let musicFolderEl = document.querySelector(".settings .item .filepath");

        musicFolderEl.innerText = fileOpt;
        themeElement.value = themOpt;
        audioElement.volume = audioOpt;
    },
};

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function setDarkTheme() {
    let styleTag = document.getElementById("themeColor");

    styleTag.setAttribute("href", "css/themes/dark_grey.css");
}
function setPreviousTheme() {
    switchTheme();
}