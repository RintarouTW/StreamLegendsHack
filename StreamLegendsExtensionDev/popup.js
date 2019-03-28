'use strict';

/* Force Low Level */
function handleClick(evt) {
	
	let data = {};

	//console.warn(evt.target.name);
	let value = (evt.target.value == "true") ? true : false;

	switch(evt.target.name) {
		case "radios":
			data = { ForceLowLevel : value };
		break;		
		case "radios2":
			data = { CleanDuplicatedRareItems : value };
		break;
		case "radios3":
			data = { CleanDuplicatedEpicItems : value };
		break;
	}

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		// save to the storage
		chrome.storage.local.set(data);
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
