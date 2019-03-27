'use strict';

import { GameDoc, GearTab, FightTab, wait } from "./common.js";
import { opt } from "./option.js";
import { BTN_SELL_SELECTED, clickButton } from "./button.js";

var numSelectedItem = 0;

function overMaxSelected() {

	if (numSelectedItem >= opt.maxCleanItems) {

		console.info(opt.maxCleanItems + " max items selected at a time. clean the rest next time!");
		numSelectedItem = 0;
		return true;
	}

	return false;
}

function selectItemsByClassName(itemClassName, typeIdx, noReserve = false) {

	let j = 0, last_item_name = "", last_one_hand_item_name = "";

	let itemTypes = ["common", "uncommon", "rare", "epic"];

	let items = GameDoc.getElementsByClassName(itemClassName);

	let reservedItems = [];

	for(let item of items) {

		if (overMaxSelected()) {

			if (j > 0) console.info("selected " + j + " " + itemTypes[typeIdx] + " items"); 
			return false; // it's over max, don't continue
		}

		if (noReserve) {
			item.click();
			numSelectedItem++;
			j++;
			continue;
		}

		if(last_item_name != item.className) {

			last_item_name = item.className;	/* reserve the first one */

			reservedItems = [];
			reservedItems.push(item);

			if (last_item_name.includes("_1h_") && 
				!last_item_name.includes("backpack-item-item_scifi_1h_portable_black_hole_generator_tier_")) 
				last_one_hand_item_name = last_item_name;

			continue;

		} else {

			/* reserve another one hand item again */
			if ((last_one_hand_item_name != "") && 
				(item.className == last_one_hand_item_name)) {

					reservedItems.push(item);
					last_one_hand_item_name = "";
					continue;
			}
		}

		// keep the one is equiped, use one of the reservedItems instead.
		// The locked icon width is 20, the equipped icon width is 16.
		if ((item.children.length == 3) && (item.firstChild.width == 16)){
			
			let reservItem = reservedItems.pop();

			if ((reservItem.children.length == 3) && (reservItem.firstChild.width == 16)) {
				reservItem = reservedItems.pop();
			}

			reservItem.click();

		} else {
			
			item.click();
		}

		numSelectedItem++;
		j++;
	}

	if (j > 0) console.info("selected " + j + " / " + items.length + " " + itemTypes[typeIdx] + " items");
	return true; // it's ok to continue;
}

/* item types : epic > rare > uncommon > common */
async function cleanItems() {

	let btns = GameDoc.getElementsByClassName("srpg-gear-multi-delete-button");
	
	if (btns.length == 2) 
		btns[0].firstChild.click();	/* click the SELECT button */

	numSelectedItem = 0;

	if (!selectItemsByClassName("backpack-item-common", 0, opt.discardCommonUncommonItems)) return;
	if (!selectItemsByClassName("backpack-item-uncommon", 1, opt.discardCommonUncommonItems)) return;

	if (opt.cleanDuplicatedRareItems && !selectItemsByClassName("backpack-item-rare", 2, false)) return;
	if (opt.cleanDuplicatedEpicItems && !selectItemsByClassName("backpack-item-epic", 3, false)) return;
	
	console.info("Totally selected " + numSelectedItem + " items");
}

function autoClean() {

	console.log(">> Auto Clean");
	GearTab.click();	

	wait(500).then(() => {
		
		cleanItems();

		let btns = GameDoc.getElementsByClassName("srpg-gear-multi-delete-button");
		
		if(btns.length >= 2)
			btns[1].firstChild.click(); // SELL Button
		else
			throw new Error("delete buttons not found");
	}).then(() => {

		wait(100).then(clickButton(BTN_SELL_SELECTED));
	}).catch(() => {

		console.debug("delete buttons not found");
	}).then(() => {

		wait(300).then(FightTab.click());
	});
}

export { cleanItems, autoClean };