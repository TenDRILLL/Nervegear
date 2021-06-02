/********************************
* THE ACTUAL APPLICATION ITSELF *
********************************/

const {app, Menu, ipcMain, dialog, shell, Tray, nativeImage} = require("electron");
const rpcM = require("discord-rpc");
const rpc = new rpcM.Client({transport: "ipc"});
const https = require("https");
let startTime; let confirm = 0;
let appName = require("./package.json").name;
let appVersion = require("./package.json").version;
const client_id = "785953967129493516";
const Window = require("./js/window.js");
const games = require("./js/games.js");
let currentStatus;

console.log("\nBooting up Nervegear v" + appVersion + "...\n");
console.log("   ____  ___  ______   _____  ____ ____  ____ ______" +
    "\n  / __ \\/ _ \\/ ___/ | / / _ \\/ __ `/ _ \\/ __ `/ ___/" +
    "\n / / / /  __/ /   | |/ /  __/ /_/ /  __/ /_/ / /" +
    "\n/_/ /_/\\___/_/    |___/\\___/\\__, /\\___/\\__,_/_/" +
    "\n                           /____/                     " + appVersion);
console.log(" ~Developed by: Ten#0010");
console.log("\nThe fact you can read this, either means you're browsing the source" +
    "\nor ran this executable from a terminal... Why would you do that?");

rpc.once("ready", ()=>{
    startTime = new Date();
    renderLoad();
});

function render(window){
    window.loadFile("./html/index.html");
    let tmp = [
        {
            label: "NVG-Menu",
            submenu: [
                {label: "Check for updates", click: ()=>{checkForUpdates(window);}},
                {label: "Open repository", click: ()=>{shell.openExternal("https://github.com/TenDRILLL/Nervegear");}},
                {label: "Hide to tray", click: ()=>{window.hide(); trayCreator(window);}},
                {type: "separator"},
                {label: appName + " " + appVersion, enabled: false},
                {label: "Created by Ten#0010", enabled: false},
                {type: "separator"},
                {label: "Exit", click: ()=>{app.quit();}}
            ]
        }/*, //This is mainly for development and debugging purposes, shouldn't be present on a public build.
        {
            label: "Dev",
            submenu: [
                {label: "Reload", click: ()=>{window.loadFile("./html/index.html");}},
                {label: "Dev-tools", click: ()=>{window.webContents.openDevTools();}}
            ]
        }*/
    ];
    let mMenu = Menu.buildFromTemplate(tmp);
    window.setMenu(mMenu);
    rpcMenu();
    checkForUpdates(window,true);
}

function renderLoad(){
    if(confirm < 1) return confirm++;
    let load = new Window({
        file: "./html/load.html"
    });
    load.setMenu(null);
    setTimeout(()=>{render(load);}, 2500);
}

function rpcMenu(){
    currentStatus = null;
    rpc.setActivity({
        details: "in System Menu",
        startTimestamp: startTime,
        largeImageKey: "nvglogo",
        largeImageText: "Nervegear"
    });
}

function trayCreator(window){
    let tray = new Tray("nvg.ico");
    tray.setContextMenu(Menu.buildFromTemplate([
        {label: "(Re)open app", click: ()=>{window.show(); tray.destroy();}},
        {label: "Quit", click: ()=>{app.quit();}}
    ]));
    tray.setToolTip("Nervegear v" + appVersion);
    tray.on("double-click",()=>{
        window.show();
        tray.destroy();
    });
}

app.once("ready", renderLoad);
app.on("window-all-closed", ()=>{
    app.quit();
});
rpc.login({ clientId: client_id });

rpcM.register(client_id);

ipcMain.on('gameChange', (e, input) =>{
    let found = false;
    games.forEach(g => {
       if(g.id === input){
           startLoading(g,e);
           e.reply("gameChange",g);
           found = true;
       }
    });
    if(!found) e.reply(null);
});

ipcMain.on('updateRPC',(e,input)=>{
    if(currentStatus !== null){
        rpc.setActivity({
            details: input.details ? input.details : currentStatus.details,
            state: input.state ? input.state : currentStatus.state,
            largeImageKey: currentStatus.largeImageKey,
            largeImageText: currentStatus.largeImageText,
            startTimestamp: currentStatus.startTimestamp
        });
    }
});

function startLoading(game,e){
    let fileAmount = game.id;
    let name = game.name;
    let imgtxt = game.loadTxt;
    let i = 0;
    let loop = setInterval(()=>{
        if(i >= fileAmount){
            clearInterval(loop);
            gameLoaded(game);
            e.reply("loadFinished",game);
        } else {
            currentStatus = null;
            rpc.setActivity({
                details: "loading " + name + "...",
                state: i + " of " + fileAmount + " (" + (i/fileAmount*100).toFixed() + "%)",
                largeImageKey: "nvgloading",
                largeImageText: imgtxt
            });
        }
        i = Math.floor(Math.random() * (parseInt(i)+100 - parseInt(i)+1) ) + parseInt(i)+1;
    }, 180);
}

function gameLoaded(game){
    let args = {
        details: "playing " + game.name,
        startTimestamp: startTime,
        largeImageKey: game.id.toString(),
        largeImageText: game.name,
        smallImageKey: "nvgsmalllogo",
        smallImageText: "Nervegear"
    };
    rpc.setActivity(args);
    currentStatus = args;
}

ipcMain.on('logout', (e, input) =>{
    currentStatus = null;
    rpc.setActivity({
        details: "logging out...",
        state: input.logoutTxt,
        largeImageKey: input.id.toString(),
        largeImageText: input.name,
        smallImageKey: "nvgsmalllogo",
        smallImageText: "Nervegear"
    });
    setTimeout(()=>{
        rpc.setActivity({
            details: "logged out",
            largeImageKey: input.id.toString(),
            largeImageText: input.name,
            smallImageKey: "nvgsmalllogo",
            smallImageText: "Nervegear"
        });
    },3500);

    setTimeout(()=>{e.reply("logout",""); rpcMenu();},5000);
});

ipcMain.on("quit",()=>{
    app.quit();
});

function checkForUpdates(window,init){
    https.get("https://raw.githubusercontent.com/TenDRILLL/Nervegear/uwu/version.txt", res => {
        let newVersion = "";
        res.on('data', data => {
            newVersion += data;
        });
        res.on('end', ()=>{
            if(newVersion.split("\n")[0] === appVersion){
                if(init){
                    console.log("Nervegear " + appVersion + " loaded.");
                } else {
                    window.webContents.send("update",false);
                }
            } else {
                console.log("Update available " + appVersion + " -> " + newVersion.split("\n")[0]);
                window.webContents.send("update",true);
            }
        });
    });
}

process.on("unhandledRejection", (err)=>{
    if(err.message === "RPC_CONNECTION_TIMEOUT"){
        console.log("It would seem your Discord is out of sync with the application." +
            "\nPlease reload Discord with CTRL+R.");
        dialog.showErrorBox("RPC_CONNECTION_TIMEOUT","It would seem your Discord is out of sync with the application. Please reload Discord with CTRL+R.");
        app.quit();
    } else if(err.message === "connection closed"){
        console.log("Nervegear has lost access to your Discord, please restart the application.");
        dialog.showErrorBox("Connection closed","Nervegear has lost access to your Discord, please restart the application.");
        app.quit();
    } else if(err.message === "Could not connect"){
        console.log("Discord not running, please start Discord.");
        dialog.showErrorBox("Couldn't connect", "Discord is not running or couldn't be detected. Please (re)start Discord.");
        app.quit();
    } else {
        console.log(err);
    }
});