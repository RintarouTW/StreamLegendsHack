'use strict';

/* Force Low Level */
function handleClick(evt) {
	
	let data = {};

	//console.warn(evt.target.name);
	switch(evt.target.name) {
		case "radios":
			data = {forceLowLevel : evt.target.value};
		break;		
		case "radios2":
			data = {cleanDuplicatedRareItems : evt.target.value};
		break;
		case "radios3":
			data = {cleanDuplicatedEpicItems : evt.target.value};
		break;
	}

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		// save to the storage
		chrome.storage.local.set(data, function(){});
		// send the data to the loader.
		chrome.tabs.sendMessage(tabs[0].id, { data });
    });
}

document.getElementsByName("radios").forEach( function(x) { x.onclick = handleClick; });
document.getElementsByName("radios2").forEach( function(x) { x.onclick = handleClick; });
document.getElementsByName("radios3").forEach( function(x) { x.onclick = handleClick; });

/* loadOptions */
chrome.storage.local.get(['forceLowLevel', 'cleanDuplicatedRareItems', 'cleanDuplicatedEpicItems'], function(data) {

	if (data.forceLowLevel == "YES") 
		document.forceLowLevel[0].checked = true;
	else 
		document.forceLowLevel[1].checked = true;

	if (data.cleanDuplicatedRareItems == "YES")
		document.cleanDuplicatedRareItems[0].checked = true;
	else 
		document.cleanDuplicatedRareItems[1].checked = true;

	if (data.cleanDuplicatedEpicItems == "YES")
		document.cleanDuplicatedEpicItems[0].checked = true;
	else 
		document.cleanDuplicatedEpicItems[1].checked = true;
});
