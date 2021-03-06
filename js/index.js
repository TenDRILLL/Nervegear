/*********************************************
*           LOGIC FOR BUTTONS AND            *
* COMMUNICATION WITH RPC VIA ELECTRON REMOTE *
*********************************************/

const selectbutton = document.getElementById("selBtn");
const startbutton = document.getElementById("startBtn");
const logoutBtn = document.getElementById("logoutBtn");
const gameDiv = document.getElementById("subItemsDiv");
const gameNameField = document.getElementById("gameName");
const alertOk = document.getElementById("alert-ok");
const alertCancel = document.getElementById("alert-cancel");
const rpcTxt1 = document.getElementById("gameTxt-1");
const rpcTxt2 = document.getElementById("gameTxt-2");
const subItemsArr = [document.getElementById("0"),document.getElementById("1"),document.getElementById("arrow"),document.getElementById("2"),document.getElementById("3")];
const { remote, ipcRenderer, shell } = require("electron");
const { app } = remote;
document.title = app.name + " " + require("../package.json").version;
let timeouts = [], inApp = false, tempID = 0, game, showingGames = false;

selected(0,"Choose game");

selectbutton.onclick = (e)=>{
    if(!inApp) { toggleShowing(); } else {
        ipcRenderer.send("updateRPC",{
            details: rpcTxt1.value,
            state: rpcTxt2.value
        });
    }
};

function toggleShowing(){
    if(showingGames){
        gameDiv.style.display = "none";
        subItemsArr.forEach(si => {
            si.animate([{ opacity: '1'}, { opacity: '0'}],{duration: 0, fill: "forwards"});
        });
        timeouts.forEach(x => {clearTimeout(x);});
    } else {
        gameDiv.style.display = "inline-block";
        for(let i = 0; i < 5; i++){
            if(i === 2){
                timeouts.push(setTimeout(()=>{subItemsArr[i].animate([{ opacity: '0'}, { opacity: '1'}],{duration: 250, fill: "forwards"});},80));
            } else {
                timeouts.push(setTimeout(()=>{subItemsArr[i].animate([{ opacity: '0'}, { opacity: '1'}],{duration: 250, fill: "forwards"});},80*i));
            }
        }
    }
    showingGames = !showingGames;
}

document.getElementById("0").onclick = (e)=>{ selected(1337, "SAO"); toggleShowing(); }
document.getElementById("1").onclick = (e)=>{ selected(1506, "GGO"); toggleShowing(); }
document.getElementById("2").onclick = (e)=>{ selected(1221, "ALO"); toggleShowing(); }
document.getElementById("3").onclick = (e)=>{ selected(2536, "UW"); toggleShowing();}

startbutton.onclick = (e) =>{
    if(!inApp){
        startbutton.innerText = "Connecting..."; startbutton.disabled = true; startbutton.className = "btn btn-gray"; startbutton.style.cursor = "not-allowed";
        selectbutton.className = "btn btn-gray";
        ipcRenderer.send("gameChange",tempID);
        ipcRenderer.on("gameChange", (e, reply) => {
            if(reply !== null){
                game = reply; gameNameField.innerText = "Connecting to " + game.runTxt;
                selectbutton.disabled = true; selectbutton.style.cursor = "not-allowed";
            }
        });
    } else {
        ipcRenderer.send("logout",game);
        gameNameField.innerText = game.logoutTxt;
        startbutton.innerText = "Logging out..."; startbutton.disabled = true; startbutton.style.cursor = "not-allowed"; startbutton.className = "btn btn-gray";
        selectbutton.disabled = true; selectbutton.style.cursor = "not-allowed"; selectbutton.className = "btn btn-gray";
        inApp = false; game = undefined;
        rpcTxt1.style.visibility = "hidden"; rpcTxt2.style.visibility = "hidden";
        ipcRenderer.on("logout", (e,reply)=>{
            selected(0,"Choose game");
            changeBackground("menu");
            selectbutton.disabled = false; selectbutton.className = "btn btn-blue"; selectbutton.style.cursor = "pointer";
            startbutton.innerText = "Start";
            gameNameField.innerText = "In System Menu";
        });
    }
};

ipcRenderer.on("loadFinished", (e, reply)=>{
    changeBackground(game.gameName);
    gameNameField.innerText = "Connected to: " + game.runTxt; inApp = true;
    startbutton.innerText = "Logout"; startbutton.disabled = false; startbutton.style.cursor = "pointer"; startbutton.className = "btn btn-red";
    selectbutton.style.cursor = "pointer"; selectbutton.className = "btn btn-blue"; selectbutton.innerText = "Edit status"; selectbutton.disabled = false;
    rpcTxt1.style.visibility = "visible"; rpcTxt2.style.visibility = "visible";
});

async function selected(id,gameName){
    selectbutton.innerText = gameName;
    tempID = id;
    if(id <= 0){ startbutton.className = "btn btn-gray"; startbutton.disabled = true; startbutton.style.cursor = "not-allowed";
    } else { startbutton.className = "btn btn-green"; startbutton.disabled = false; startbutton.style.cursor = "pointer"; }
}

alertOk.onclick = (e)=>{ shell.openExternal("https://github.com/TenDRILLL/Nervegear/releases"); }
alertCancel.onclick = (e)=>{ document.getElementById("alert").style.visibility = "hidden"; document.getElementById("content").style.visibility = "visible"; }
logoutBtn.onclick = (e)=>{ ipcRenderer.send("quit",true); }

ipcRenderer.on("update", (e, c)=>{
    if(c){ document.getElementById("alert").style.visibility = "visible"; document.getElementById("content").style.visibility = "hidden";
    } else {
        document.getElementById("latest-txt").style.visibility = "visible";
        document.getElementById("latest-txt").animate([{ transform: 'translateX(-100%)'}, { transform: 'translateX(0)'}],{duration: 1000});
        setTimeout(()=>{document.getElementById("latest-txt").animate([{ transform: 'translateX(0)'}, { transform: 'translateX(-100%)'}],{duration: 1000});},3000);
        setTimeout(()=>{ document.getElementById("latest-txt").style.visibility = "hidden"; },4000);
    }
});

function changeBackground(value){
    canvas.style.visibility = value === "menu" ? "visible" : "hidden";
    switch(value){
        case "menu": document.body.style.backgroundImage = ""; break;
        case "sao": document.body.style.backgroundImage = "url('../images/saobg.png')"; break;
        case "alo": document.body.style.backgroundImage = "url('../images/alobg.png')"; break;
        case "ggo": document.body.style.backgroundImage = "url('../images/ggobg.png')"; break;
        case "alice": document.body.style.backgroundImage = "url('../images/uwbg2.png')"; break;
        default: document.body.style.backgroundImage = "";
    }
}