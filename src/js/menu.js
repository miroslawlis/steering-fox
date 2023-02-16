export const menuHideToggle = (element) => {
  const activeMainNavigationEl = document.querySelector("#nav > .active");
  const activeMainView = document.querySelector("#main > .active");

  if (element.classList.contains("active") === false) {
    // info
    if (element.id === "info-main-nav") {
      // remove class from currently active in nav
      activeMainNavigationEl.classList.remove("active");
      // remove class from currently active in main
      activeMainView.classList.remove("active");

      // add class nav
      element.classList.add("active");
      // add class main
      document.querySelector("#info").classList.add("active");
    }

    // music
    if (element.id === "music-main-nav") {
      // remove class from currently active in nav
      activeMainNavigationEl.classList.remove("active");
      // remove class from currently active in main
      activeMainView.classList.remove("active");

      // add class nav
      element.classList.add("active");
      // add class main
      document.querySelector("#music").classList.add("active");
    }

    // youtube
    if (element.id === "youtube-main-nav") {
      // remove class from currently active in nav
      activeMainNavigationEl.classList.remove("active");
      // remove class from currently active in main
      activeMainView.classList.remove("active");

      // add class nav
      element.classList.add("active");
      // add class main
      document.querySelector("#youtube").classList.add("active");
    }

    // map
    if (element.id === "map-main-nav") {
      // remove class from currently active in nav
      activeMainNavigationEl.classList.remove("active");
      // remove class from currently active in main
      activeMainView.classList.remove("active");

      // add class nav
      element.classList.add("active");
      // add class main
      document.querySelector("#map").classList.add("active");
    }

    // settings
    if (element.id === "settings-main-nav") {
      // remove class from currently active in nav
      activeMainNavigationEl.classList.remove("active");
      // remove class from currently active in main
      activeMainView.classList.remove("active");

      // add class nav
      element.classList.add("active");
      // add class main
      document.querySelector("#settings").classList.add("active");
    }
  }
};

export const menuDumy = "";
