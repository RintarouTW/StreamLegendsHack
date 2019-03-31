'use strict';

function handleClick(evt) {
	
	let data = {};

	data[evt.target.name] = evt.target.checked;

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		// save to the storage
		chrome.storage.local.set(data);
    });
}

const checkboxes = document.getElementsByClassName("booleanSetting");

let keys = [];

for (let checkbox of checkboxes) {
	checkbox.onclick = handleClick;
	keys.push(checkbox.name);
}
//console.warn(keys);

/* loadOptions */
chrome.storage.local.get(keys, function(data) {

	for (let key in data) {
		let checkbox = document.getElementById(key);
		//console.warn(key, checkbox);
		if (checkbox) checkbox.checked = data[key];
	}
});
