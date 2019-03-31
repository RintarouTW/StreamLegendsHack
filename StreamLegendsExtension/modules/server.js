import { opt } from "./option.js";
import io from "./socket.io.module.js";

var AutoToggle;

var socket;

function connectToServer(autoToggle) {

    AutoToggle = autoToggle;

    socket = io('http://localhost');

    // listen to the commands
    socket.on('commandToBot', function (cmd, players, data) {

        console.log(cmd, players, data);

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
                opt.isPaused = true;
                AutoToggle.children[1].style.backgroundColor = "#ffdc2b";
                socket.emit('updateBotInfo', opt /* user info */); // update info to server
            break;
            case "resume":
                opt.isPaused = false;
                AutoToggle.children[1].style.backgroundColor = "#2fea85";
                socket.emit('updateBotInfo', opt /* user info */); // update info to server
            break;
            case "updateOptions":
                document.dispatchEvent(new CustomEvent("UpdateOptions", { detail: data }) );
            break;
        }
    });

    socket.on('connect', function() {

        // auto subscribe
        socket.emit('updateBotInfo', opt /* user info */);
    });
}

function raidInfoFromBot (infoType, info) {
    if(info.length)
        socket.emit('raidInfoFromBot', infoType, info);
}

export { connectToServer, raidInfoFromBot }