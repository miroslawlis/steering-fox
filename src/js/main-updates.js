import { autoUpdater } from "electron";

export default function initUpdates() {
  autoUpdater.on("checking-for-update", () => {
    // eslint-disable-next-line no-console
    console.log("checking-for-update");
  });

  autoUpdater.on("update-available", () => {
    // eslint-disable-next-line no-console
    console.log("update-available");
  });

  autoUpdater.on("update-not-available", () => {
    // eslint-disable-next-line no-console
    console.log("update-not-available");
  });

  autoUpdater.on(
    "update-downloaded",
    (event, releaseNotes, releaseName, date) => {
      // eslint-disable-next-line no-console
      console.log(
        "update-downloaded | ",
        "event: ",
        event,
        " releaseNotes: ",
        releaseNotes,
        " releaseName: ",
        releaseName,
        " date: ",
        date
      );
      // The update will automatically be installed the next time the
      // app launches. If you want to, you can force the installation
      // now:
      // autoUpdater.quitAndInstall();
    }
  );

  autoUpdater.checkForUpdates();
}
