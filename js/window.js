/*************************************************
* A WINDOW MODULE FOR EASIER EDITING OF SETTINGS *
*************************************************/

const { BrowserWindow } = require("electron");
const defaultProps = {
    width: 800,
    height: 600,
    show: false,
    resizable: false,
    icon: "./nvg.ico",
    webPreferences:{
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false
    }
};
class Window extends BrowserWindow {
    constructor({file, ...windowSettings}){
        super({...defaultProps, ...windowSettings});
        this.loadFile(file);
        this.once("ready-to-show", ()=>{
            this.show();
        });
    }
}
module.exports = Window;