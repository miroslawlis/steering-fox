import { THEMES_NAMES } from "./var";

export function setHTMLtheme(themeName = "") {
  document.querySelector("html").setAttribute("data-theme", themeName);
}

export function switchTheme(ele) {
  if (!ele) return;
  // update css in html
  // based on select drop down change OR from setting file

  const theme =
    ele.options[ele.options.selectedIndex].value ||
    window.appData.settingsFile.theme;
  // save settings to file - changed theme
  console.log(`switchTheme`);
  setHTMLtheme(theme);
}

export function setDarkTheme() {
  setHTMLtheme(THEMES_NAMES.dark_grey);
}
export function setPreviousTheme() {
  // TODO
  // switchTheme();
}
