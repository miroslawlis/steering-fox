import debugLog, { clampNumbers } from "./utils";

export default async function playAudio(songObj = {}) {
  console.log("playAudio");
  const { audio } = window.appData.audio;
  const { path } = songObj;

  if (!path) return;

  window.electronAPI.getSong(path).then((data) => {
    // window.appData.audio.audio.currentTime = 0;
    // window.appData.audio.audio.pause();
    audio.src = data;
    audio.load();
    window.appData.currentSongId = songObj.id;
  });
}

export function pauseAudio() {
  if (!window.appData.audio.audio.paused) {
    window.appData.audio.audio.pause();
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
    document.querySelector(
      "#notifications-persistant .mute-icon"
    ).style.opacity = 0;
  } else {
    window.appData.audio.audio.muted = true;
    debugLog("audio muted");

    // remove class
    muteButton.classList.toggle("active");

    // show mute icon on tom of nav element
    document.querySelector(
      "#notifications-persistant .mute-icon"
    ).style.opacity = 1;
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
  console.log("currentVolume");
  const sliVmValue = window.appData.sliderVolumeMusicEl.valueAsNumber;

  // update slider value
  // set window.appData.audio.audio volume "globaly", value from slider value
  window.appData.audio.audio.volume = sliVmValue;

  // debugLog(window.appData.audio.audio.volume.toFixed(2));
  // debugLog("sliderVolMusicValue: " + sliderVolMusicValue);
}

export function updateThreeSongsInHTML() {
  const previousSongHTMLObject = document.getElementById("previousSong");
  const currentSongHTMLObject = document.getElementById("currentSong");
  const nextSongHTMLObject = document.getElementById("nextSong");

  const currentSongID =
    window.appData.currentSongId || window.appData.songsObj[0].id;

  if (currentSongID < 0) return;

  const currentSongIndex = window.appData.songsObj.findIndex(
    (obj) => obj.id === currentSongID
  );
  let nextSongIndex = currentSongIndex + 1;
  // if this is last song then go to first
  if (nextSongIndex === window.appData.songsObj.length) {
    nextSongIndex = 0;
  }
  let prevSongIndex = currentSongIndex - 1;
  // if this is first song then go to last song
  if (prevSongIndex < 0) {
    prevSongIndex = window.appData.songsObj.length - 1;
  }

  // update HTML with songs
  nextSongHTMLObject.innerText = window.appData.songsObj[nextSongIndex].name
    ? window.appData.songsObj[nextSongIndex].name
    : "";

  currentSongHTMLObject.innerText = window.appData.songsObj[currentSongIndex]
    .name
    ? window.appData.songsObj[currentSongIndex].name
    : "";

  previousSongHTMLObject.innerText = window.appData.songsObj[prevSongIndex].name
    ? window.appData.songsObj[prevSongIndex].name
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

    debugLog(
      `previous song - prevSongIndex: ${prevSongIndex}, currentSongIndex: ${currentSongIndex}`
    );

    playAudio(window.appData.songsObj[prevSongIndex]);
  }
}

export function musicEventRegister() {
  const plyButon = document.querySelector("#music-player .play.button");
  const pauseButon = document.querySelector("#music-player .pause.button");

  // setting sliders values to default window.appData.audio.audio value (at start they are different)
  window.appData.sliderVolumeMusicEl =
    document.getElementById("volume-music-bar");
  window.appData.sliderVolumeMusicEl.value = window.appData.audio.audio.volume;
  window.appData.sliderVolumeMusicEl.setAttribute(
    "value",
    window.appData.sliderVolumeMusicEl.value
  );

  // second time as above
  // on every volume change update slider as well
  window.appData.audio.audio.onvolumechange = function () {
    window.appData.sliderVolumeMusicEl.value =
      window.appData.audio.audio.volume;
    window.appData.sliderVolumeMusicEl.setAttribute(
      "value",
      window.appData.sliderVolumeMusicEl.value
    );
  };

  // hook to play event and manage DOM classes
  window.appData.audio.audio.addEventListener("play", () => {
    if (!window.appData.hasFirstPlayStarted) {
      window.appData.hasFirstPlayStarted = true;
      // start time messure
      window.electronAPI.profileStartTime().then((startTime) => {
        console.log(
          "app start time (to play event): ",
          (Date.now() - startTime) / 1000,
          " s"
        );
      });
    }

    //
    debugLog("event PLAY occured");

    // add classes for Play button
    plyButon.classList.add("playing");
    plyButon.classList.add("active");

    // remove class for pause button
    pauseButon.classList.remove("active");
  });

  window.appData.audio.audio.addEventListener("canplaythrough", () => {
    window.appData.audio.audio
      .play()
      .then(() => {
        updateThreeSongsInHTML();
        console.log("playing currentSongId: ", window.appData.currentSongId);
      })
      .catch((err) => {
        console.error(err);
        window.appData.currentSongId = 0;
      });
  });

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
    debugLog("audio event ENDED occured");
    nextSong();
  };

  window.appData.sliderVolumeMusicEl.addEventListener("input", () =>
    currentVolume()
  );
}
