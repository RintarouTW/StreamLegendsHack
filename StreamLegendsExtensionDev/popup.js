'use strict';

/* Force Low Level */
function handleClick(evt) {
	
	let data = {};

	//console.warn(evt.target.name);
	console.warn(evt.target.value);
	switch(evt.target.name) {
		case "radios":
			data = {ForceLowLevel : evt.target.value};
		break;		
		case "radios2":
			data = {CleanDuplicatedRareItems : evt.target.value};
		break;
		case "radios3":
			data = {CleanDuplicatedEpicItems : evt.target.value};
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
chrome.storage.local.get(['ForceLowLevel', 'CleanDuplicatedRareItems', 'CleanDuplicatedEpicItems'], function(data) {

	if (data.ForceLowLevel) 
		document.ForceLowLevel[0].checked = true;
	else 
		document.ForceLowLevel[1].checked = true;

	if (data.CleanDuplicatedRareItems)
		document.CleanDuplicatedRareItems[0].checked = true;
	else 
		document.CleanDuplicatedRareItems[1].checked = true;

	if (data.CleanDuplicatedEpicItems)
		document.CleanDuplicatedEpicItems[0].checked = true;
	else 
		document.CleanDuplicatedEpicItems[1].checked = true;
});
