import debugLog, { clampNumbers } from "./utils";

function checkIfHasSourceAndPlay(audioElement, trackId) {
  if (audioElement.src) {
    audioElement
      .play()
      .then(() => {
        window.appData.currentSongId = trackId;
        console.log("playing");
      })
      .catch((err) => console.error(err));
  } else {
    console.log("Audio element has no source");
  }
}

export default async function playAudio(songObj = {}) {
  console.log("playAudio");
  window.appData.audio.audio = new Audio();
  const { audio } = window.appData.audio;
  const { path } = songObj;

  if (!path) return;

  window.electronAPI.getSong(path).then((data) => {
    audio.src = data;
    audio.load();

    if (
      document
        .querySelector("#music-player .play.button")
        .classList.contains("active")
    ) {
      audio.pause();
    } else {
      checkIfHasSourceAndPlay(audio, songObj.id);
    }
  });
}

export function pauseAudio() {
  if (!window.appData.audio.audio.paused) {
    window.appData.audio.audio.pause();
  } else {
    checkIfHasSourceAndPlay(window.appData.audio.audio);
  }
}

export function muteAudio() {
  // works only for "music"

  const muteButton = document.querySelector("#music-player .mute.button");

  if (window.appData.audio.audio.muted === true) {
    window.appData.audio.audio.muted = false;

    debugLog("audio unmuted");
    // remove class
    muteButton.classList.toggle("active");

    // hide mute icon on tom of nav element
    document.querySelector("#notifications-persistant .mute-icon").style.opacity = 0;
  } else {
    window.appData.audio.audio.muted = true;
    debugLog("audio muted");

    // remove class
    muteButton.classList.toggle("active");

    // show mute icon on tom of nav element
    document.querySelector("#notifications-persistant .mute-icon").style.opacity = 1;
  }
}

export function volUp() {
  window.appData.audio.audio.volume = clampNumbers(
    (window.appData.audio.audio.volume + 0.1).toFixed(2),
    0,
    1
  );
  debugLog("volUp");
}

export function volDown() {
  window.appData.audio.audio.volume = clampNumbers(
    (window.appData.audio.audio.volume - 0.1).toFixed(2),
    0,
    1
  );
  debugLog("volDown");
}

export function shuffl() {
  console.log("TODO");
}

export function currentVolume() {
  const sliVmValue = window.appData.sliderVolumeMusicEl.value;

  // update slider value
  // sliVmValue = window.appData.audio.audio.volume*100;
  // set slider attribute from slider value
  window.appData.sliderVolumeMusicEl.setAttribute("value", sliVmValue);
  // set window.appData.audio.audio volume "globaly", value from slider value
  window.appData.audio.audio.volume = sliVmValue / 100;

  // debugLog(window.appData.audio.audio.volume.toFixed(2));
  // debugLog("sliderVolMusicValue: " + sliderVolMusicValue);
}

export function GetThreeSongsToGUI() {
  const previousSongHTMLObject = document.getElementById("previousSong");
  const currentSongHTMLObject = document.getElementById("currentSong");
  const nextSongHTMLObject = document.getElementById("nextSong");

  const currentSongID =
    window.appData.currentSongId || window.appData.songsObj[0].id;

  if (currentSongID < 0) return;

  const currentSongIndex = Math.abs(
    window.appData.songsObj.findIndex((obj) => obj.id === currentSongID)
  );

  let nextSongIndex = currentSongIndex + 1;
  // if this is last song then go to first
  if (nextSongIndex >= window.appData.songsObj.length) {
    nextSongIndex = 0;
  }
  let prevSongIndex = currentSongIndex - 1;
  // if this is first song then go to last song
  if (prevSongIndex < 0) {
    prevSongIndex = window.appData.songsObj.length - 1;
  }

  // update HTML with songs
  previousSongHTMLObject.innerText = window.appData.songsObj[prevSongIndex].name
    ? window.appData.songsObj[prevSongIndex].name
    : "";
  currentSongHTMLObject.innerText = window.appData.songsObj[currentSongIndex]
    .name
    ? window.appData.songsObj[currentSongIndex].name
    : "";
  nextSongHTMLObject.innerText = window.appData.songsObj[nextSongIndex].name
    ? window.appData.songsObj[nextSongIndex].name
    : "";
}

export function nextSong() {
  const currentSongID = window.appData.currentSongId;
  const currentSongIndex = window.window.appData.songsObj.findIndex(
    (obj) => obj.id === currentSongID
  );
  let nextSongIndex = currentSongIndex + 1;

  if (window.appData.songsObj[0]) {
    // if this is last song then go to first
    if (nextSongIndex >= window.window.appData.songsObj.length) {
      nextSongIndex = 0;
    }
    window.appData.currentSongId = window.appData.songsObj[nextSongIndex].id;
    window.appData.audio.audio.pause();
    playAudio(window.appData.songsObj[nextSongIndex]);
    // HTML update
    GetThreeSongsToGUI();
    debugLog("next song");
  }
}

export function previousSong() {
  const currentSongID = window.appData.currentSongId;
  const currentSongIndex = window.window.appData.songsObj.findIndex(
    (obj) => obj.id === currentSongID
  );
  let prevSongIndex = currentSongIndex - 1;

  if (window.appData.songsObj[0]) {
    // if this is first song then go to last song
    if (prevSongIndex < 0) {
      prevSongIndex = window.appData.songsObj.length - 1;
    }

    window.appData.currentSongId = window.appData.songsObj[prevSongIndex].id;
    window.appData.audio.audio.pause();
    playAudio(window.appData.songsObj[prevSongIndex]);
    // HTML update
    GetThreeSongsToGUI();
    debugLog("previous song");
  }

  // HTML update
  GetThreeSongsToGUI();
}

export function musicEventRegister() {
  const plyButon = document.querySelector("#music-player .play.button");
  const pauseButon = document.querySelector("#music-player .pause.button");

  // setting sliders values to default window.appData.audio.audio value (at start they are different)
  window.appData.sliderVolumeMusicEl.value =
    window.appData.audio.audio.volume * 100;
  window.appData.sliderVolumeMusicEl.setAttribute(
    "value",
    window.appData.sliderVolumeMusicEl.value
  );

  // second time as above
  // on every volume change update slider as well
  window.appData.audio.audio.onvolumechange = function () {
    window.appData.sliderVolumeMusicEl.value =
      window.appData.audio.audio.volume * 100;
    window.appData.sliderVolumeMusicEl.setAttribute(
      "value",
      window.appData.sliderVolumeMusicEl.value
    );
  };

  // hook to play event and manage DOM classes
  window.appData.audio.audio.onplay = function () {
    // start time messure
    window.electronAPI.profileStartTime().then((startTime) => {
      console.log(
        "app start time (to play event): ",
        (Date.now() - startTime) / 1000,
        " s"
      );
    });

    //
    debugLog("event PLAY occured");

    // add classes for Play button
    plyButon.classList.add("playing");
    plyButon.classList.add("active");

    // remove class for pause button
    pauseButon.classList.remove("active");
  };

  // hook to pause event and manage DOM classes
  window.appData.audio.audio.onpause = function () {
    debugLog("event PAUSE occured");

    // remove classes for play button
    plyButon.classList.remove("playing");
    plyButon.classList.remove("active");

    // add class for pause button
    pauseButon.classList.add("active");
  };

  window.appData.audio.audio.onended = function () {
    // start new song when "current" song ends
    debugLog("event ENDED occured");
    nextSong();
  };
}
