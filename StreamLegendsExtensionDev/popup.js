'use strict';

/* Force Low Level */
function handleClick(evt) {
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

		chrome.storage.local.set({forceLowLevel: evt.target.value}, function(){});
		chrome.tabs.sendMessage(tabs[0].id, {cmd : "forceLowLevel", value: evt.target.value});
    });
}

document.getElementsByName("radios").forEach( function(x) { x.onclick = handleClick; });

/* cleanDuplicatedRareItems */

function handleCleanDuplicatedRareItems(evt) {

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.storage.local.set({cleanDuplicatedRareItems: evt.target.value}, function(){});
		chrome.tabs.sendMessage(tabs[0].id, {cmd : "cleanDuplicatedRareItems", value: evt.target.value});
    });

}

document.getElementsByName("radios2").forEach( function(x) { x.onclick = handleCleanDuplicatedRareItems; });

/* loadOptions */
chrome.storage.local.get(['forceLowLevel', 'cleanDuplicatedRareItems'], function(data) {

	if (data.forceLowLevel == "YES") 
		document.forceLowLevel[0].checked = true;
	else 
		document.forceLowLevel[1].checked = true;

	if (data.cleanDuplicatedRareItems == "YES")
		document.cleanDuplicatedRareItems[0].checked = true;
	else 
		document.cleanDuplicatedRareItems[1].checked = true;

});
