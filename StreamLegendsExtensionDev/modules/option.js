'use strict';

/* Game Options */
var opt = {
	ForceLowLevel : false,
	CleanDuplicatedRareItems : false,
	CleanDuplicatedEpicItems : false,
	DiscardCommonUncommonItems : true,
	EnableAutoClean : true,
	NumNewItemsToAutoClean : 20,
	MaxCleanItems : 100,
	IgnoreRaid : false,
	HasRaid : false
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

	for (let key of Object.keys(data)) {

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