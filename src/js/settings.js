import debugLog from "./utils";
import { SETTINGS_FILE_NAME } from "./var";

export function getUserPath() {
  // eslint-disable-next-line no-return-await
  return window.electronAPI
    .getUserDataPath()
    .then((userPath) =>
      window.electronAPI
        .pathJoin([userPath, SETTINGS_FILE_NAME])
        .then((path) => path)
    );
}

export function saveSettingsToFile() {
  let contentObject = {};
  let themeOption = "";

  try {
    debugLog("Saving settings to file");

    const musiFolderPathEl = document.getElementById("music-folder-path");
    const { musicFolder } = window.appData.settingsFile;

    window.electronAPI
      .pathDirname(musiFolderPathEl?.files[0]?.path || musicFolder)
      .then((response) => {
        console.log(`saveSettingsToFile response: `, response);
        window.appData.settingsFile.musicFolder = response;
        const themeElement = document.querySelector("#settings .themeOption");
        // check if egzist
        if (themeElement.length > 0) {
          themeOption = themeElement.selectedOptions[0].value;
        }

        const fuel_1_ele = document.querySelector("#main .fuel_cons1 .data");

        if (fuel_1_ele.innerText) {
          contentObject.lastFuel1Con = fuel_1_ele.innerText.replace(
            /^\s+|\n|-|\s+$/gm,
            ""
          );
        }
        // adding options to object
        contentObject.musicFolder = window.appData.settingsFile.musicFolder;
        contentObject.theme = themeOption;
        contentObject.audioVolume = window.appData.audio.audio.volume;

        // converting object to string
        contentObject = JSON.stringify(contentObject);

        debugLog(`musicFolder: ${window.appData.settingsFile.musicFolder}`);
        debugLog(`SETTINGS_FILE_NAME: ${SETTINGS_FILE_NAME}`);
        debugLog(`contentObject: ${contentObject}`);

        try {
          window.electronAPI
            .writeFile([window.appData.userPath, contentObject])
            .then(() => {
              console.log(
                `The file has been saved! ${window.appData.userPath}`
              );
              window.appData.settingsFile = JSON.parse(contentObject);
            });
        } catch (e) {
          debugLog(`FAILD to save setting file ${e}`);
        }
      });
  } catch (err) {
    console.error(err);
  }
}

export function updateGUIwithSettings(settingsObj) {
  // update GUI
  const themeElement = document.querySelector("#settings .themeOption");
  const musicFolderEl = document.querySelector("#settings .item .filepath");

  musicFolderEl.innerText = settingsObj.musicFolder;

  themeElement.value = settingsObj.theme;
  const event = new Event("change");
  themeElement.dispatchEvent(event);

  window.appData.audio.audio.volume = settingsObj.audioVolume;
}

export function settingsFileContentHandler(fileContentObject) {
  // if settings file contain folderPath (and it's not empty string) then use it in var musicFolder else use "/Music/"
  if (!fileContentObject) return;

  debugLog("Settings file, loading content...");

  try {
    if (!("musicFolder" in fileContentObject)) {
      console.log("invalid content - not JSON");
      return;
    }

    window.appData.settingsFile = fileContentObject;

    updateGUIwithSettings(window.appData.settingsFile);
    //
    // TODO
    // switchTheme();
  } catch (error) {
    console.error(error);
  }
}

export function checkForSettingsFileCreate() {
  // check if settings.json file dose not egzist in app folder
  // if it's not there then create it that file with default data
  // try {
  return window.electronAPI
    .existsSync(window.appData.userPath)
    .then((exist) => {
      if (exist) {
        return window.electronAPI
          .readFileSync(window.appData.userPath)
          .then((settingsFileContent) => {
            // file exist and no error
            const parsed = JSON.parse(settingsFileContent);
            window.appData.settingsFile = parsed;
            debugLog("Settings file exist");
            settingsFileContentHandler(parsed);
            return parsed;
          });
      }
      // file not exist or empty
      debugLog("Settings file not exist or empty, creating...");

      const defaultSettingsFileContent = {
        musicFolder: "",
        theme: "light",
        audioVolume: 0.5,
      };

      return window.electronAPI.writeFileSync([
        window.appData.userPath,
        JSON.stringify(defaultSettingsFileContent),
      ]);
    });
  // } catch (err) {
  //   console.error(`Setting file: ${err}`);
  // }
}

export function listenForUIchanges() {
  // add events listners responsible for saving when user interacts with UI
  const elToWatch = document.querySelectorAll(".settings-watcher");

  elToWatch.forEach((el) => {
    el.addEventListener(
      "change",
      () => {
        console.log(`listenForUIchanges`);
        saveSettingsToFile();
      },
      false
    );
  });
  window.appData.audio.audio.onvolumechange = () => {
    console.log(`volumechange`);
  };

  // theme and language chages and saves to settings file are handled in elements on click functions
}

export function settingsInit() {
  return getUserPath().then((userPath) => {
    window.appData.userPath = userPath;
    listenForUIchanges();
    return checkForSettingsFileCreate();
  });
}
