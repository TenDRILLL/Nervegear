import {app, Menu, ipcMain, dialog, shell, Tray, MenuItemConstructorOptions} from "electron";
import {Client} from "discord-rpc";
import {get} from "https";
import Window from "./js/Window";
import Games from "./js/Games";

const clientId = "785953967129493516";
let rpc = new Client({transport: "ipc"});
let startTime, currentStatus, reconnectAttempts = 0;
let reconnect: boolean = false;

const productName = "Nervegear";
const version = "2.3.0a";

const dev = process.argv[2] ?? false;

console.log(`
Booting up ${productName} v${version}...
                                                    
   ____  ___  ______   _____  ____ ____  ____ ______
  / __ \\/ _ \\/ ___/ | / / _ \\/ __ \`/ _ \\/ __ \`/ ___/
 / / / /  __/ /   | |/ /  __/ /_/ /  __/ /_/ / /    
/_/ /_/\\___/_/    |___/\\___/\\__, /\\___/\\__,_/_/     
                           /____/                   ${version}
 ~Developed by: Ten#0010
 
The fact you can read this, either means you're browsing the source
or ran this executable from a terminal... Why would you do that?`);

rpcController(new Client({transport: "ipc"}));

function rpcController(rpc2){
    rpc2.on("connected",()=>{
        console.log("Connected to Discord.");
        reconnectAttempts = 0;
        reconnect = false;
        startTime = Date.now();
        if(currentStatus !== null){
            rpc.setActivity(currentStatus);
        } else {
            rpcMenu();
        }
    });

    rpc2.on("disconnected",()=>{
        reconnect = true;
        reconnectAttempts++;
        rpcController(new Client({transport: "ipc"}));
    });

    rpc2.login({clientId}).then(x => {
        rpc = x;
    });
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

function changeGame(game,e){
    let i = 0;
    const loop = setInterval(()=>{
        if(i >= game.id){
            clearInterval(loop);
            currentStatus = {
                details: "playing " + game.name,
                startTimestamp: startTime,
                largeImageKey: game.id.toString(),
                largeImageText: game.name,
                smallImageKey: "nvgsmalllogo",
                smallImageText: "Nervegear"
            };
            rpc.setActivity(currentStatus);
            e.reply("loadFinished",game);
        } else {
            currentStatus = null;
            rpc.setActivity({
                details: `loading ${game.name}...`,
                state: `${i} of ${game.id} (${(i/game.id*100).toFixed()}%)`,
                largeImageKey: "nvgloading",
                largeImageText: game.loadTxt
            });
        }
        i = Math.floor(Math.random() * (i+100 - i+1) ) + i+1;
    }, 180);
}

app.once("ready", ()=>{
    renderLoad();
});
app.on("window-all-closed", ()=>{
    app.quit();
});

function renderLoad(){
    const window = new Window({ file: `${__dirname}/html/load.html` });
    window.setMenu(null);
    setTimeout(()=>{render(window);}, 2500);
}

function render(window){
    window.loadFile(`${__dirname}/html/index.html`);
    const menu: Array<MenuItemConstructorOptions> = [
        {
            label: "NVG-Menu",
            submenu: [
                {label: "Check for updates", click: ()=>{checkForUpdates(window, false);}},
                {label: "Open repository", click: ()=>{shell.openExternal("https://github.com/TenDRILLL/Nervegear");}},
                {label: "Hide to tray", click: ()=>{window.hide(); trayCreator(window);}},
                {type: "separator"},
                {label: `${productName} ${version}`, enabled: false},
                {label: "Created by Ten#0010", click: ()=>{shell.openExternal("https://discord.com/users/484419124433518602");}},
                {type: "separator"},
                {label: "Exit", click: ()=>{app.quit();}}
            ]
        }];
    if(dev){ //This is mainly for development and debugging purposes, shouldn't be present on a public build.
        menu.push({
            label: "Dev",
            submenu: [
                {label: "Reload", click: ()=>{window.loadFile(`${__dirname}/html/index.html`);}},
                {label: "Dev-tools", click: ()=>{window.webContents.openDevTools();}}
            ]
        });
    }
    window.setMenu(Menu.buildFromTemplate(menu));
    rpcMenu();
    checkForUpdates(window,true);
}

function checkForUpdates(window,init){
    get("https://raw.githubusercontent.com/TenDRILLL/Nervegear/uwu/version.txt", res => {
        let newVersion = "";
        res.on('data', data => {
            newVersion += data;
        });
        res.on('end', ()=>{
            if(newVersion.split("\n")[0] === version){
                if(init){
                    console.log(`${productName} ${version} loaded.`);
                } else {
                    window.webContents.send("update",false);
                }
            } else {
                console.log(`Update available ${version} -> ${newVersion.split("\n")[0]}`);
                window.webContents.send("update",true);
            }
        });
    });
}

function trayCreator(window){
    let tray = new Tray(`${__dirname}/nvg.ico`);
    tray.setContextMenu(Menu.buildFromTemplate([
        {label: "(Re)open app", click: ()=>{window.show(); tray.destroy();}},
        {label: "Quit", click: ()=>{app.quit();}}
    ]));
    tray.setToolTip(`Nervegear v${version}`);
    tray.on("double-click",()=>{
        window.show();
        tray.destroy();
    });
}

ipcMain.on('gameChange', (event, input) =>{
    let found = false;
    Games.forEach(game => {
        if(game.id === input){
            changeGame(game,event);
            event.reply("gameChange",game);
            found = true;
        }
    });
    if(!found) event.reply(null);
});

ipcMain.on('updateRPC',(event,input)=>{
    if(currentStatus !== null){
        let newAct = currentStatus;
        newAct["details"] = input.details;
        if(input.state === ""){
            delete newAct["state"];
        } else {
            newAct["state"] = input.state;
        }
        rpc.setActivity(newAct);
        currentStatus = newAct;
    }
});

ipcMain.on('logout', (event, input) =>{
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
    setTimeout(()=>{
        event.reply("logout","");
        rpcMenu();
    },5000);
});

ipcMain.on("quit",()=>{ app.quit(); });

process.on("unhandledRejection", (err: Error)=>{
    if(reconnect) {
        console.log(`Discord not found, reconnect attempt ${reconnectAttempts}`);
        reconnectAttempts++;
        return setTimeout(()=>{rpcController(new Client({transport: "ipc"}))},5000);
    }
    if(err.message === "RPC_CONNECTION_TIMEOUT"){
        console.log("It would seem your Discord is out of sync with the application. Please reload Discord with CTRL+R.");
        dialog.showErrorBox("RPC_CONNECTION_TIMEOUT","It would seem your Discord is out of sync with the application. Please reload Discord with CTRL+R.");
        app.quit();
    } else if(err.message === "connection closed"){
        console.log(`${productName} has lost access to your Discord, please restart the application.`);
        dialog.showErrorBox("Connection closed",`${productName} has lost access to your Discord, please restart the application.`);
        app.quit();
    } else if(err.message === "Could not connect"){
        console.log("Discord not running, please start Discord.");
        dialog.showErrorBox("Couldn't connect", "Discord is not running or couldn't be detected. Please (re)start Discord.");
        app.quit();
    } else {
        console.log(err);
    }
});