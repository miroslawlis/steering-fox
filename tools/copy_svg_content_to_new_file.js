const fs = require('fs');
const path = require('path');
const svg_folder = './svg/';

let result = '';

fs.readdir(svg_folder, (error, files) => {
    if (error) {
        console.error(error);
        return;
    }

    files.forEach(file => {

        try {
            let data = fs.readFileSync(path.join(svg_folder, file), 'utf8');

            data = data.replace(/(style|stroke|stroke\-linecap|stroke\-linejoin|fill)\=\"(.*?)"/gm, '');
            result += data.replace('<svg', `<svg id="${file.slice(0, -4)}_svg"`).replace('<?xml version="1.0" encoding="UTF-8"?>', '');
        } catch (error) {
            console.log(error);
            return;
        }

        console.log(`${file} - done`);
    });

    fs.writeFileSync(path.join('./tools/', 'output.txt'), result);
});