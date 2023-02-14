const { readdirSync, statSync } = require("fs");
const path = require("path");

module.exports.findMusicFilesRecursivly = (folderPath) => {
  // get files recursivly (with sub folders)
  // https://stackoverflow.com/questions/2727167/how-do-you-get-a-list-of-the-names-of-all-files-present-in-a-directory-in-node-j
  // add record in songsObj for each audio file in musicFolder
  const songs = [];
  try {
    // read files and directoryes in current directory
    const files = readdirSync(folderPath);

    files.forEach((file, index) => {
      // for each file or directory
      // check if it's file or directory
      // file = path.join(initailPath, file).toLowerCase();
      const fileFullPath = path.join(folderPath, file);
      const stat = statSync(fileFullPath); // file info

      if (stat && stat.isDirectory()) {
        // it is directory
        // Recurse into a subdirectory for curent path/directory
        this.findMusicFilesRecursivly(fileFullPath);
      }
      // Is a file
      // get only .mp3 audio files
      if (
        fileFullPath.split(".").pop() === "mp3" ||
        fileFullPath.split(".").pop() === "MP3"
      ) {
        songs.push({
          id: index,
          name: fileFullPath.split("\\").pop().split("/").pop(),
          length: "",
          path: fileFullPath,
        });
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  return songs;
};
