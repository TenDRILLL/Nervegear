import { remote, ipcRenderer, shell } from "electron";
const { app } = remote;

const selectbutton = document.getElementById("selBtn") as HTMLButtonElement;
const startbutton = document.getElementById("startBtn") as HTMLButtonElement;
const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;
const gameDiv = document.getElementById("subItemsDiv") as HTMLElement;
const gameNameField = document.getElementById("gameName") as HTMLElement;
const alertOk = document.getElementById("alert-ok") as HTMLButtonElement;
const alertCancel = document.getElementById("alert-cancel") as HTMLButtonElement;
const rpcTxt1 = document.getElementById("gameTxt-1") as HTMLInputElement;
const rpcTxt2 = document.getElementById("gameTxt-2") as HTMLInputElement;
const subItemsArr = [
    document.getElementById("0") as HTMLElement,
    document.getElementById("1") as HTMLElement,
    document.getElementById("arrow") as HTMLElement,
    document.getElementById("2") as HTMLElement,
    document.getElementById("3") as HTMLElement
];
let timeouts: Array<NodeJS.Timeout> = [], inApp = false, tempID = 0, game, showingGames = false;

document.title = `${app.name} ${app.getVersion()}`;

selected(0,"Choose game");

selectbutton.onclick = () => {
    if(!inApp) {
        toggleShowing();
    } else {
        ipcRenderer.send("updateRPC",{
            details: rpcTxt1.value === "" ? `playing ${game.name}...` : rpcTxt1.value,
            state: rpcTxt2.value
        });
    }
}

function selected(id,gameName){
    selectbutton.innerText = gameName;
    tempID = id;
    if(id <= 0){
        startbutton.className = "btn btn-gray";
        startbutton.disabled = true;
        startbutton.style.cursor = "not-allowed";
    } else {
        startbutton.className = "btn btn-green";
        startbutton.disabled = false;
        startbutton.style.cursor = "pointer";
    }
}

function toggleShowing(){
    if(showingGames){
        gameDiv.style.display = "none";
        subItemsArr.forEach(subItem => {
            subItem.animate([
                { opacity: '1'},
                { opacity: '0'}
            ],{
                duration: 0, fill: "forwards"
            });
        });
        timeouts.forEach(timeout => {
            clearTimeout(timeout);
        });
    } else {
        gameDiv.style.display = "inline-block";
        for(let i = 0; i < 5; i++){
            timeouts.push(
                setTimeout(()=>{
                    subItemsArr[i].animate([
                        { opacity: '0'},
                        { opacity: '1'}
                    ],{
                        duration: 250, fill: "forwards"
                    });
                },i === 2 ? 80*i : 80)
            );
        }
    }
    showingGames = !showingGames;
}

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

subItemsArr[0].onclick = ()=>{ selected(1337, "SAO"); toggleShowing(); }
subItemsArr[1].onclick = ()=>{ selected(1506, "GGO"); toggleShowing(); }
subItemsArr[3].onclick = ()=>{ selected(1221, "ALO"); toggleShowing(); }
subItemsArr[4].onclick = ()=>{ selected(2536, "UW"); toggleShowing(); }
alertOk.onclick = ()=>{ shell.openExternal("https://github.com/TenDRILLL/Nervegear/releases"); }
alertCancel.onclick = ()=>{ document.getElementById("alert")!.style.visibility = "hidden"; document.getElementById("content")!.style.visibility = "visible"; }
logoutBtn.onclick = ()=>{ ipcRenderer.send("quit",true); }

startbutton.onclick = () =>{
    if(!inApp){
        if(showingGames){
            toggleShowing();
        }
        ipcRenderer.send("gameChange",tempID);
        startbutton.innerText = "Connecting...";
        startbutton.disabled = true;
        startbutton.className = "btn btn-gray";
        startbutton.style.cursor = "not-allowed";
        selectbutton.className = "btn btn-gray";
    } else {
        ipcRenderer.send("logout",game);
        gameNameField.innerText = game.logoutTxt;
        startbutton.innerText = "Logging out...";
        startbutton.disabled = true;
        startbutton.style.cursor = "not-allowed";
        startbutton.className = "btn btn-gray";
        selectbutton.disabled = true;
        selectbutton.style.cursor = "not-allowed";
        selectbutton.className = "btn btn-gray";
        inApp = false;
        game = undefined;
        rpcTxt1.style.visibility = "hidden";
        rpcTxt2.style.visibility = "hidden";
    }
};

ipcRenderer.on("gameChange", (event, reply) => {
    if(reply !== null){
        game = reply;
        gameNameField.innerText = `Connecting to ${game.runTxt}`;
        selectbutton.disabled = true;
        selectbutton.style.cursor = "not-allowed";
    }
});

ipcRenderer.on("logout", ()=>{
    selected(0,"Choose game");
    changeBackground("menu");
    selectbutton.disabled = false;
    selectbutton.className = "btn btn-blue";
    selectbutton.style.cursor = "pointer";
    startbutton.innerText = "Start";
    gameNameField.innerText = "In System Menu";
});

ipcRenderer.on("loadFinished", ()=>{
    changeBackground(game.gameName);
    gameNameField.innerText = `Connected to: ${game.runTxt}`;
    inApp = true;
    startbutton.innerText = "Logout";
    startbutton.disabled = false;
    startbutton.style.cursor = "pointer";
    startbutton.className = "btn btn-red";
    selectbutton.style.cursor = "pointer";
    selectbutton.className = "btn btn-blue";
    selectbutton.innerText = "Edit status";
    selectbutton.disabled = false;
    rpcTxt1.style.visibility = "visible";
    rpcTxt2.style.visibility = "visible";
});

ipcRenderer.on("update", (event, update)=>{
    if(update){
        document.getElementById("alert")!.style.visibility = "visible";
        document.getElementById("content")!.style.visibility = "hidden";
    } else {
        document.getElementById("latest-txt")!.style.visibility = "visible";
        document.getElementById("latest-txt")!.animate([
            { transform: 'translateX(-100%)'},
            { transform: 'translateX(0)'}],{
            duration: 1000
        });
        setTimeout(()=>{
            document.getElementById("latest-txt")!.animate([
                { transform: 'translateX(0)'},
                { transform: 'translateX(-100%)'}
            ],{
                duration: 1000
            });
        },3000);
        setTimeout(()=>{
            document.getElementById("latest-txt")!.style.visibility = "hidden";
        },4000);
    }
});