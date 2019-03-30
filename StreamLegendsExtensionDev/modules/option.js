'use strict';

/* Game Options */
var opt = {
	DebugMode : false,
	ForceLowLevel : false,
	CleanDuplicatedRareItems : false,
	CleanDuplicatedEpicItems : false,
	CleanDuplicatedLegendaryItems : false,
	DiscardAllCommonUncommonItems : false,
	EnableAutoClean : false,
	NumNewItemsToAutoClean : 20,
	CleanItemsLimit : 100,
	IgnoreRaid : false,
	// following are runtime changed, don't save to storage
	HasRaid : false,
	PlayerName : "",
	PlayerLevel : 0
};

const autoRaidURL = "http://localhost:8000/raid.txt";	// Auto Raid control server

var xmlhttp;

function checkNewRaid() {

	if (!xmlhttp) {

		xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() {

			if (this.readyState == 4 && this.status == 200) {
	    		opt.HasRaid = (this.responseText.replace(/[\n]/g,"") == "YES");
	    		xmlhttp = 0;
	    	}
		};

		xmlhttp.open("GET", autoRaidURL, true);
		xmlhttp.setRequestHeader("Cache-Control", "no-cache");
		xmlhttp.send();
	}
}

/* Handle options changed event from content script */
document.addEventListener("UpdateOptions", event => {

	let data = event.detail;

	for (const key in data) {

		if (key == "PlayerName" || key == "PlayerLevel") continue;

		if ( typeof (opt[key]) == typeof (data[key]) ) {
			console.log("[ " + key + " : " + data[key] + " ]");
			opt[key] = data[key];
		} else {
			console.warn("Type Error - [ " + key + " : " + data[key] + " ]");
			console.warn("should be " + (typeof (opt[key])) + ", but it's " + (typeof (data[key])));
		}
	}
});

export {opt, checkNewRaid};