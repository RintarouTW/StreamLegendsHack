import { opt, updateOptions } from "./option.js";
import io from "./socket.io.module.js";

var AutoToggle;

var socket;

function connectToServer(autoToggle) {

    AutoToggle = autoToggle;

    socket = io('http://localhost');

    // listen to the commands
    socket.on('commandToBot', function (cmd, targetPlayers, data) {

        //console.log(cmd, targetPlayers, data);

        if(!targetPlayers.includes(opt.PlayerName)) return;
        
        switch (cmd) {
            case "Stop":
                if (AutoToggle.className.includes('on')) AutoToggle.click();
            break;
            case "Start":
                if (AutoToggle.className.includes('off')) AutoToggle.click();
            break;
            case "Reload":
                window.location.reload();
            break;
            case "Pause":
                AutoToggle.children[1].style.backgroundColor = "#ffdc2b";
                opt.isPaused = true;
            break;
            case "Resume":
                AutoToggle.children[1].style.backgroundColor = "#2fea85";
                opt.isPaused = false;                
            break;
            case "StartNewRaid":
                let evt = new CustomEvent("StartNewRaid", {});
                document.dispatchEvent(evt);
            break;
            case "UpdateOptions":
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