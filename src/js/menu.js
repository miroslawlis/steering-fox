export const menuHideToggle = (element) => {
  const activeElementNav = document.querySelector("#nav .element.active");
  const activeElementMain = document.querySelector("#main .element.active");

  if (
    element.classList.contains("active") === false &&
    element.classList.contains("element") === true
  ) {
    // info
    if (element.id === "info") {
      // remove class from currently active in nav
      activeElementNav.classList.remove("active");
      // remove class from currently active in main
      activeElementMain.classList.remove("active");

      // add class nav
      document.getElementById("info").classList.add("active");
      // add class main
      document.querySelector("#main .info.element").classList.add("active");
    }

    // music
    if (element.id === "music") {
      // remove class from currently active in nav
      activeElementNav.classList.remove("active");
      // remove class from currently active in main
      activeElementMain.classList.remove("active");

      // add class nav
      document.getElementById("music").classList.add("active");
      // add class main
      document.querySelector("#main .music.element").classList.add("active");
    }

    // youtube
    if (element.id === "youtube") {
      // remove class from currently active in nav
      activeElementNav.classList.remove("active");
      // remove class from currently active in main
      activeElementMain.classList.remove("active");

      // add class nav
      document.getElementById("youtube").classList.add("active");
      // add class main
      document.querySelector("#main .youtube.element").classList.add("active");
    }

    // map
    if (element.id === "map") {
      // remove class from currently active in nav
      activeElementNav.classList.remove("active");
      // remove class from currently active in main
      activeElementMain.classList.remove("active");

      // add class nav
      document.getElementById("map").classList.add("active");
      // add class main
      document.querySelector("#main .map.element").classList.add("active");
    }

    // settings
    if (element.id === "settings") {
      // remove class from currently active in nav
      activeElementNav.classList.remove("active");
      // remove class from currently active in main
      activeElementMain.classList.remove("active");

      // add class nav
      document.getElementById("settings").classList.add("active");
      // add class main
      document.querySelector("#main .settings.element").classList.add("active");
    }
  }
};

export const menuDumy = "";
