import {BrowserWindow} from "electron";
const defaultSettings = {
    width: 800,
    height: 600,
    show: false,
    resizable: false,
    icon: "nvg.ico",
    webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false
    }
};

export default class Window extends BrowserWindow {
    constructor({file, ...settings}){
        super({...defaultSettings, ...settings});
        this.loadFile(file);
        this.once("ready-to-show",()=>{
            this.show();
        });
    }
}