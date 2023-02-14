// const translation_en = require("../translations/en.json");
const translationPl = require("../translations/pl.json");

// eslint-disable-next-line no-unused-vars
function languageSwitch(element) {
  // switch language
  // in html need to be default string in english (same as in jsons files, left side in file)

  if (element.value === "pol") {
    const elesToTranslate = document.querySelectorAll(".totranslate");
    elesToTranslate.forEach((ele) => {
      // eslint-disable-next-line no-param-reassign
      ele.innerText = translationPl[ele.innerText];
    });
  }
  // else if (element.value == 'eng') {
  //     let elesToTranslate = document.querySelectorAll('.totranslate');
  //     elesToTranslate.forEach(function (ele) {
  //         ele.innerText = translation_en[ele.innerText];
  //     });
  // }
}
