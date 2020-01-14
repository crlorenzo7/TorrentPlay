"use strict";

const path = require("path");
const {BrowserWindow, app} = require("electron");
//const {getPluginEntry} = require("../index");
require("electron-debug")({showDevTools: false});

const pdir = __dirname// path.join(__dirname, "mpvjs.node");
const fullPluginPath = path.join(pdir,"..","mpvjs.node");
if (process.platform !== "linux") {process.chdir(path.join(pdir,".."));}
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("register-pepper-plugins", fullPluginPath+";application/x-mpvjs");

app.on("ready", () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 574,
    autoHideMenuBar: false,
    fullscreen:false,
    frame:true,
    icon:"icon.png",
    backgroundColor:'#1A1A1A',
    useContentSize: process.platform !== "linux",
    title: "mpv.js example player",
    
    maximizable:true,
    webPreferences: {plugins: true,nodeIntegration:true},
  });
  
  win.setMenu(null);
  win.loadURL(`file://${__dirname}/index.html`);
  
  console.log(this);
});

app.on("window-all-closed", () => {
  app.quit();
});