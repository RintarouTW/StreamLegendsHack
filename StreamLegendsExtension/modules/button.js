'use strict';

import { GameDoc } from "./common.js";

/* Button Class Name Mapping */
const BTN_COLLECT_LOOT      = 0;
const BTN_RAID_BACK_TO_MAP  = 1;
const BTN_ONWARDS_FAIL_SAVE = 2;
const BTN_ONWARDS_NEW_ITEM  = 3;
const BTN_ONWARDS_CONTINUE  = 4;
const BTN_ONWARDS_COMBATLOG = 5;
const BTN_FIGHT     		= 6;
const BTN_SELL_SELECTED		= 7;
const BTN_CLASSNAME_TABLE = [
	["<COLLECT LOOT>", "srpg-button available post-fight-button srpg-button-reward btn btn-default"],
	["<Back To Map>" , "srpg-button srpg-button-maps btn btn-default"],
	["<ONWARDS> Errors", "srpg-button srpg-button-continue btn btn-default"],
	["<ONWARDS> EQUIP", "player-api-btn srpg-button srpg-button-continue btn btn-default"],
	["<ONWARD> Continue", "player-api-btn srpg-button srpg-button-continue btn btn-default"],
	["<ONWARDS> COMBAT LOG", "player-api-btn srpg-button available post-fight-button btn btn-default"],
	["<FIGHT>", "player-api-btn srpg-button btn btn-default"],
	["<Sell Selected>", "player-api-btn  btn btn-default"]
];

function clickButton(btnIdx) {
	
	var btn = GameDoc.getElementsByClassName(BTN_CLASSNAME_TABLE[btnIdx][1])[0];
	if (!btn) return false; // button not found

	// button is buzy awaiting request.
	if(btn.className.includes("srpg-awaiting-request-spinner")) return false;

	btn.click();
	console.log(BTN_CLASSNAME_TABLE[btnIdx][0]);	// Log it.
	return true;	// pressed
}

export { BTN_COLLECT_LOOT,
BTN_RAID_BACK_TO_MAP,
BTN_ONWARDS_FAIL_SAVE,
BTN_ONWARDS_NEW_ITEM,
BTN_ONWARDS_CONTINUE,
BTN_ONWARDS_COMBATLOG,
BTN_FIGHT,
BTN_SELL_SELECTED,
clickButton
};