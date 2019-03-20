const DEBUG_MODE = false;

/* Update Option to the hack script. */
function updateOption(name, value) {

	var evt = new CustomEvent("SetOption", { detail: { optionName: name, value : value}});
	
	document.dispatchEvent(evt);
}

function setup() {

	/* the hack script would ask to load options after install too */
	document.addEventListener("LoadOptions", function(evt) {

		chrome.storage.local.get(['forceLowLevel', 'cleanDuplicatedRareItems', 'cleanDuplicatedEpicItems'], function(data) {

			updateOption('forceLowLevel', data.forceLowLevel);
			updateOption('cleanDuplicatedRareItems', data.cleanDuplicatedRareItems);
			updateOption('cleanDuplicatedEpicItems', data.cleanDuplicatedEpicItems);

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

		updateOption(request.cmd, request.value);
		
		sendResponse("done");
	});

}

if (DEBUG_MODE) {
	
	// Insert to the top most frame anyway.
	if (window.top == window) setup();

} else {

	if (document.title == "StreamLegends" /* GameTitle */) setup();

}
