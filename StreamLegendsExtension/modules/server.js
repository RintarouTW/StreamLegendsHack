import { opt, updateOptions } from "./option.js";
import io from "./socket.io.module.js";

var AutoToggle;

var socket;

function connectToServer(autoToggle) {

    AutoToggle = autoToggle;

    socket = io('http://localhost');

    // listen to the commands
    socket.on('commandToBot', function (cmd, players, data) {

        //console.log(cmd, players, data);

        if(!players.includes(opt.PlayerName)) return;
        
        switch (cmd) {
            case "stop":
                if (AutoToggle.className.includes('on')) AutoToggle.click();
            break;
            case "start":
                if (AutoToggle.className.includes('off')) AutoToggle.click();
            break;
            case "reload":
                window.location.reload();
            break;
            case "pause":
                AutoToggle.children[1].style.backgroundColor = "#ffdc2b";
                opt.isPaused = true;
            break;
            case "resume":
                AutoToggle.children[1].style.backgroundColor = "#2fea85";
                opt.isPaused = false;                
            break;
            case "startNewRaid":
                let evt = new CustomEvent("StartNewRaid", {});
                document.dispatchEvent(evt);
            break;
            case "updateOptions":
                updateOptions(data);
            break;
        }

        // send the updated info to server
        updateBotInfo();
    });

    
    socket.on('connect', function() {

        // auto subscribe
        socket.emit('subscribe', opt.PlayerName);
    });
}

function updateBotInfo() {
    socket.emit('updateBotInfo', opt /* user info */); 
}

function raidInfoFromBot (infoType, info) {
    if(info.length)
        socket.emit('raidInfoFromBot', infoType, info);
}

export { connectToServer, raidInfoFromBot, updateBotInfo }