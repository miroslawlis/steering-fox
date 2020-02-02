Instrukcja budowania aplikacji

electron-packager musi być zainstalowany
Lokalnie:
# for use in npm scripts
npm install electron-packager --save-dev

albo globalnie:
npm install electron-packager -g

Dla windows:
electron-packager ./ -all test --platform=win32 --arch=x64

electron-packager <sourcedir> <appname> --platform=win32 --arch=x64


https://stackoverflow.com/questions/40615837/how-to-compile-an-electron-application-to-a-exe