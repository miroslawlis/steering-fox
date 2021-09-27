var audio = document.getElementById("audio");
var sliderVolumeMusic = document.getElementById("volume-music-bar");
var audioVolBefore,
  ShuffledSongsObject,
  currentSongID,
  nextSongID,
  currentSongIndex,
  nextSongIndex,
  prevSongID,
  prevSongIndex,
  curentSongNumberInObj;

window.addEventListener("DOMContentLoaded", function () {
  // setting sliders values to default audio value (at start they are different)
  sliderVolumeMusic.value = audio.volume * 100;
  sliderVolumeMusic.setAttribute("value", sliderVolumeMusic.value);

  //second time as above
  //on every volume change update slider as well
  audio.onvolumechange = function () {
    sliderVolumeMusic.value = audio.volume * 100;
    sliderVolumeMusic.setAttribute("value", sliderVolumeMusic.value);
  };

  let plyButon = document.querySelector("#music-player .play.button");
  let pauseButon = document.querySelector("#music-player .pause.button");

  // get current song ID from GUI after load
  currentSongID = parseInt(audio.getAttribute("itemid"));

  //hook to play event and manage DOM classes
  audio.onplay = function () {
    // start time messure
    console.log(
      "app start time (to play event): ",
      (Date.now() - remote.getGlobal("profile_startTime")) / 1000,
      " s"
    );
    //
    debugLog("event PLAY occured");

    // add classes for Play button
    plyButon.classList.add("playing");
    plyButon.classList.add("active");

    // remove class for pause button
    pauseButon.classList.remove("active");

    //marking curent song (row in table)
    markCurentSongInTable();
  };

  //hook to pause event and manage DOM classes
  audio.onpause = function () {
    debugLog("event PAUSE occured");

    // remove classes for play button
    plyButon.classList.remove("playing");
    plyButon.classList.remove("active");

    // add class for pause button
    pauseButon.classList.add("active");
  };

  audio.onended = function () {
    //start new song when "current" song eneded
    debugLog("event ENDED occured");
    nextSong();
  };
});

function playAudio(forcePlay) {
  if (
    document
      .querySelector("#music-player .play.button")
      .classList.contains("active") &&
    forcePlay !== true
  ) {
    audio.pause();
  } else {
    audio.play();
  }
}

function pauseAudio() {
  if (!audio.paused) {
    audio.pause();
  } else {
    audio.play();
  }
}

function muteAudio(muteBtn) {
  // works only for "music"

  let musicNavEl = document.getElementById("music");

  if (audio.muted == true) {
    audio.muted = false;

    // and set audio volume to level before muted
    audio.volume = audioVolBefore;
    // remove class
    muteBtn.classList.toggle("active");

    // hide mute icon on tom of nav element
    musicNavEl.querySelector(".mute-icon").style.opacity = 0;
  } else {
    audio.muted = true;

    // remember audio level before muting
    audioVolBefore = audio.volume;
    // and set audio volume to 0 for slider
    audio.volume = 0;

    // remove class
    muteBtn.classList.toggle("active");

    // show mute icon on tom of nav element
    musicNavEl.querySelector(".mute-icon").style.opacity = 1;
  }
}

function volUp() {
  if (audio.volume <= 0.95 && audio.volume >= 0) {
    audio.volume = (audio.volume + 0.05).toFixed(2);
  }
}

function volDown() {
  if (audio.volume <= 1 && audio.volume >= 0.05) {
    audio.volume = (audio.volume - 0.05).toFixed(2);
  }
}

function shuffl() {
  // store songs data in randomized order
  ShuffledSongsObject = [];
  let numberOfSongs;

  if (songsObj[0]) {
    numberOfSongs = songsObj.length;

    songsObj.forEach(function (val) {
      let index = Math.floor(Math.random() * numberOfSongs + 1);
      ShuffledSongsObject.splice(index, 0, {
        id: val.id,
        name: val.name,
        length: "",
        path: val.path,
      });
    });

    // replace oryginall songObj with shuffeled one
    // so it can be used instade (random songs in use)
    songsObj = ShuffledSongsObject;
    debugLog(songsObj);
  }
}

function currentVolume() {
  let sliVmValue = sliderVolumeMusic.value;

  // update slider value
  // sliVmValue = audio.volume*100;
  //set slider attribute from slider value
  sliderVolumeMusic.setAttribute("value", sliVmValue);
  //set audio volume "globaly", value from slider value
  audio.volume = sliVmValue / 100;

  // debugLog(audio.volume.toFixed(2));
  // debugLog("sliderVolMusicValue: " + sliderVolMusicValue);
}

sliderVolumeMusic.oninput = currentVolume;

function nextSong() {
  currentSongID = parseInt(audio.getAttribute("itemid"));
  currentSongIndex = songsObj.findIndex((obj) => {
    return obj.id === currentSongID;
  });

  nextSongIndex = currentSongIndex + 1;

  if (songsObj[0]) {
    // if this is last song then go to first
    if (nextSongIndex >= songsObj.length) {
      nextSongIndex = 0;
    }

    // set attributes for audio tag
    audio.setAttribute("src", songsObj[nextSongIndex]["path"]);
    audio.setAttribute("itemId", songsObj[nextSongIndex]["id"]);

    playAudio(true);
  }

  // HTML update
  GetThreeSongsToGUI();
}

function previousSong() {
  currentSongID = parseInt(audio.getAttribute("itemid"));
  currentSongIndex = songsObj.findIndex((obj) => {
    return obj.id === currentSongID;
  });

  prevSongIndex = currentSongIndex - 1;

  if (songsObj[0]) {
    // if this is first song then go to last song
    if (prevSongIndex < 0) {
      prevSongIndex = songsObj.length - 1;
    }

    // set attributes for audio tag
    audio.setAttribute("src", songsObj[prevSongIndex]["path"]);
    audio.setAttribute("itemId", songsObj[prevSongIndex]["id"]);

    playAudio(true);
  }

  // HTML update
  GetThreeSongsToGUI();
}

function markCurentSongInTable() {
  //first remove class curentlyPlaying from all rows in table
  let rowsWithClass = document.querySelectorAll(
    "#wrapperMtable .curentlyPlaying"
  );
  rowsWithClass.forEach((row) => {
    row.classList.remove("curentlyPlaying");
  });
  //add class curentlyPlaying to one row
  document
    .querySelector(".itemIDrow" + audio.getAttribute("itemid"))
    .classList.add("curentlyPlaying");

  // move view to curently playing element - center
  // document.getElementsByClassName('curentlyPlaying')[0].scrollIntoView({behavior: "smooth", block: "center"})
}

function GetThreeSongsToGUI() {
  let previousSongHTMLObject = document.getElementById("previousSong");
  let currentSongHTMLObject = document.getElementById("currentSong");
  let nextSongHTMLObject = document.getElementById("nextSong");

  currentSongID = parseInt(audio.getAttribute("itemid"));
  currentSongIndex = songsObj.findIndex((obj) => {
    return obj.id === currentSongID;
  });

  nextSongIndex = currentSongIndex + 1;
  // if this is last song then go to first
  if (nextSongIndex >= songsObj.length) {
    nextSongIndex = 0;
  }
  prevSongIndex = currentSongIndex - 1;
  // if this is first song then go to last song
  if (prevSongIndex < 0) {
    prevSongIndex = songsObj.length - 1;
  }

  // update HTML with songs
  previousSongHTMLObject.innerText = songsObj[prevSongIndex]["name"]
    ? songsObj[prevSongIndex]["name"]
    : "";
  currentSongHTMLObject.innerText = songsObj[currentSongIndex]["name"]
    ? songsObj[currentSongIndex]["name"]
    : "";
  nextSongHTMLObject.innerText = songsObj[nextSongIndex]["name"]
    ? songsObj[nextSongIndex]["name"]
    : "";
}
