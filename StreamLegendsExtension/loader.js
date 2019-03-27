/* Update Option to the hack script. */
function updateOptions(data) {

	let evt = new CustomEvent("UpdateOptions", { detail: data });
	
	document.dispatchEvent(evt);
}

function setup() {

	/* the hack script would ask to load options after install too */
	document.addEventListener("LoadOptions", function(evt) {

		chrome.storage.local.get(['forceLowLevel', 'cleanDuplicatedRareItems', 'cleanDuplicatedEpicItems'], function(data) {

			updateOptions(data);

		});

	});

	/* Insert the hack script to the head */
	var s = document.createElement('script');
	s.type = "module";
	s.src = chrome.runtime.getURL('StreamLegendsAuto.js');
	s.onload = function() {
	    this.remove();
	};
	(document.head || document.documentElement).appendChild(s);

	/* Regiester for Popup's commands */
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

		updateOptions(request.data);
		
		sendResponse("done");
	});
}

(async () => {

	// Default Configuration
  	const config = await import("./default.js");

	if (config.DebugMode == "YES") {
		
		// Insert to the top most frame anyway.
		if (window.top == window) setup();

	} else {

		if (document.title == "StreamLegends" /* GameTitle */) setup();

	}
})();