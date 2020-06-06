const fs = require('fs');

function settingsInit() {

    UserPath = '';
    settingsFileName = 'settings.json';
    musicFolder = '/Music/';
    UserPath = (electron.app || electron.remote.app).getPath('userData');
    filePathAndName = path.join(UserPath, settingsFileName);

    let fuel_1_ele = document.querySelector('#main .fuel_cons1 .data');

    function createSettingsFileDefault() {
        // creates new file with default values

        debugLog('Settings file not exist, creating...');

        const settingsFileContent = {};
        settingsFileContent.musicFolder = "";
        settingsFileContent.themeOptionFile = 'dark_gray';

        try {

            fs.writeFileSync(filePathAndName, JSON.stringify(settingsFileContent));
            // no error
            // after crating file, load content
            debugLog('Settings file created');
            readSettingfile();

        } catch (err) {
            console.error('Error in creating settings file: ' + err);
        }
    }

    // check if settings.json file dose not egzist in app folder 
    // if it's not there then create it that file with default data
    try {
        if (!fs.existsSync(filePathAndName)) {
            // file not exist
            createSettingsFileDefault();

        } else {
            // file exist and no error
            debugLog('Settings file exist');
            readSettingfile();
        }
    } catch (err) {
        console.error('Setting file: ' + err);
    }

    setTimeout(() => {
        document.querySelector(".settings").addEventListener('change', function () {
            saveSettingsToFile();
        }, false);
    }, 2000);

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
            if (themeElement.length > 0 && themeElement.selectedIndex > -1) {
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
            fs.writeFileSync(filePathAndName, contentObject);

            console.info('The file has been saved! ' + filePathAndName);

            createSongsObject();

        }
        catch (error) { debugLog("FAILD to save setting file " + error); }
    }

    // if settings file contain folderPath (and it's not empty string) then use it in var musicFolder else use "/Music/"
    function readSettingfile() {

        debugLog('Settings file, loading content...');

        try {
            settingFromFileObj = fs.readFileSync(filePathAndName);
            try {
                settingFromFileObj = JSON.parse(settingFromFileObj)
            } catch (error) {
                // probobly content is with error, create new file with default values
                createSettingsFileDefault();
            };

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

