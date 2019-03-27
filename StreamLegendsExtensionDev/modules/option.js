'use strict';

/* Game Options */
var opt = {
	forceLowLevel : false,
	cleanDuplicatedRareItems : false,
	cleanDuplicatedEpicItems : false,
	discardCommonUncommonItems : true,
	enableAutoClean : true,
	numNewItemsToAutoClean : 20,
	maxCleanItems : 100,
	ignoreRaid : false,
	hasRaid : false
};

const autoRaidURL = "http://localhost:8000/raid.txt";	// Auto Raid control server

var xmlhttp;

function checkNewRaid() {

	if (!xmlhttp) {
		xmlhttp = new XMLHttpRequest();			
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
	    		opt.hasRaid = (this.responseText.replace(/[\n]/g,"") == "YES");
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
		//console.log("[ " + key + " : " + data[key] + " ]");
		if (typeof (opt[key]) == "boolean")
		
			opt[key] = (data[key] == "YES");

		else if ( typeof (opt[key]) == typeof (data[key]) )
		
			opt[key] = data[key];
	}
});

export {opt, checkNewRaid};