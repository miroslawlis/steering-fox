const translation_en = require('./translations/en.json');
const translation_pl = require('./translations/pl.json');

function languageSwitch(element) {
    // switch language
    // in html need to be default string in english (same as in jsons files, left side in file)

    if (element.value == 'pol') {
        let elesToTranslate = document.querySelectorAll('.totranslate');
        elesToTranslate.forEach(function (ele) {
            ele.innerText = translation_pl[ele.innerText];
        });
    } 
    // else if (element.value == 'eng') {
    //     let elesToTranslate = document.querySelectorAll('.totranslate');
    //     elesToTranslate.forEach(function (ele) {
    //         ele.innerText = translation_en[ele.innerText];
    //     });
    // }

}