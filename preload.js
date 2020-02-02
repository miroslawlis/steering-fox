// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const app = require('electron').remote;
const electron = require('electron');
const path = require('path');
fs = require('fs');

var recursive = require("recursive-readdir");
// var renderer = require('./renderer');

