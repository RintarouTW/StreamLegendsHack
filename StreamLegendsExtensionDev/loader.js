/* Update Option to the hack script. */
function updateOptions(data) {

	let evt = new CustomEvent("UpdateOptions", { detail: data });
	
	document.dispatchEvent(evt);
}

function setup() {

	/* the hack script would ask to load options after install too */
	document.addEventListener("LoadOptions", function(evt) {

		chrome.storage.local.get(['ForceLowLevel', 'CleanDuplicatedRareItems', 'CleanDuplicatedEpicItems'], function(data) {

			updateOptions(data);

		});

	});

	/* Config chanced by Popup/Option page */
	chrome.storage.onChanged.addListener(function(changes, namespace) {
		
		if(namespace != "local") return;

		let data = {};

        for (var key in changes)
        	data[key] = changes[key].newValue;

    	updateOptions(data);
    });

	/* Insert the hack script to the head */
	var s = document.createElement('script');
	s.type = "module";
	s.src = chrome.runtime.getURL('StreamLegendsAuto.js');
	s.onload = function() {
	    this.remove();
	};
	(document.head || document.documentElement).appendChild(s);

}

(async () => {

	// Default Configuration
  	const { DebugMode } = await import("./default.js");

	if (DebugMode) {
		
		// Insert to the top most frame anyway.
		if (window.top == window) setup();

	} else {

		if (document.title == "StreamLegends" /* GameTitle */) setup();

	}

})();