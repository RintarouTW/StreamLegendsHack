'use strict';

/* Game Options */
var opt = {
	DebugMode : false,
	ForceLowLevel : false,
	CleanDuplicatedRareItems : false,
	CleanDuplicatedEpicItems : false,
	CleanDuplicatedLegendaryItems : false,
	DiscardAllCommonUncommonItems : false,
	EnableAutoClean : false,
	NumNewItemsToAutoClean : 20,
	CleanItemsLimit : 100,
	IgnoreRaid : false,
	// following are runtime changed, don't save to storage
	HasRaid : false,
	isPaused : false,
	PlayerName : "",
	PlayerLevel : 0
};

/* Handle options changed event from content script */
document.addEventListener("UpdateOptions", event => {

	let data = event.detail;

	for (const key in data) {

		if (key == "PlayerName" || key == "PlayerLevel") continue;

		if ( typeof (opt[key]) == typeof (data[key]) ) {
			console.log("[ " + key + " : " + data[key] + " ]");
			opt[key] = data[key];
		} else {
			console.warn("Type Error - [ " + key + " : " + data[key] + " ]");
			console.warn("should be " + (typeof (opt[key])) + ", but it's " + (typeof (data[key])));
		}
	}
});

export { opt };