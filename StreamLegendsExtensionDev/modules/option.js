'use strict';

/* Game Options */
var opt = {
	forceLowLevel : false,
	cleanDuplicatedRareItems : false,
	cleanDuplicatedEpicItems : false,
	discardCommonUncommonItems : false,
	enableAutoClean : true,
	numNewItemsToAutoClean : 20,
	maxCleanItems : 100,
	ignoreRaid : false,
	hasRaid : false
};

var autoRaidURL = "http://localhost:8000/raid.txt";	// Auto Raid control server

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
document.addEventListener("SetOption", event => {

	if (typeof(opt[event.detail.optionName]) != 'undefined')
		opt[event.detail.optionName] = (event.detail.value == "YES");
});

export {opt, checkNewRaid};