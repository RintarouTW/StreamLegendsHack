import { opt } from "./option.js";
import io from "./socket.io.module.js";

var AutoToggle;

var socket;

function connectToServer(autoToggle) {

    AutoToggle = autoToggle;

    socket = io('http://localhost');

    // listen to the commands
    socket.on('bot-command', function (cmd, players, data) {

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
            case "updateOptions":
                document.dispatchEvent(new CustomEvent("UpdateOptions", { detail: data }) );
            break;
        }
    });

    // subscribe
    socket.emit('subscribe', opt /* user info */);
}

export { connectToServer }