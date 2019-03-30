'use strict';

import { GameDoc, GearTab, FightTab, wait } from "./common.js";
import { opt } from "./option.js";
import { BTN_SELL_SELECTED, clickButton } from "./button.js";

var numSelectedItem = 0;

function overMaxSelected() {

	if (numSelectedItem >= opt.CleanItemsLimit) {

		console.info(opt.CleanItemsLimit + " items selected at once. clean the others next time!");
		numSelectedItem = 0;
		return true;
	}

	return false;
}

function selectItemsByClassName(itemClassName, typeIdx, noReserve = false) {

	let j = 0, last_item_name = "", last_one_hand_item_name = "";

	let itemTypes = ["common", "uncommon", "rare", "epic", "legendary"];

	let items = GameDoc.getElementsByClassName(itemClassName);

	let reservedItems = [];

	for(const item of items) {

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
		// The locked svg icon clientWidth is 20, the equipped svg icon clientWidth is 16.
		if ((item.children.length == 3) && (item.firstChild.clientWidth == 16)){
			
			let reservItem = reservedItems.pop();

			if ((reservItem.children.length == 3) && (reservItem.firstChild.clientWidth == 16)) {
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
	
	let noReserve = (opt.PlayerLevel >= 14) ? opt.DiscardAllCommonUncommonItems : false;

	if (!selectItemsByClassName("backpack-item-common", 0, noReserve)) return;
	if (!selectItemsByClassName("backpack-item-uncommon", 1, noReserve)) return;

	if (opt.CleanDuplicatedRareItems && !selectItemsByClassName("backpack-item-rare", 2, false)) return;
	if (opt.CleanDuplicatedEpicItems && !selectItemsByClassName("backpack-item-epic", 3, false)) return;
	if (opt.CleanDuplicatedLegendaryItems && !selectItemsByClassName("backpack-item-legendary", 4, false)) return;
	
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

		return wait(100).then(clickButton(BTN_SELL_SELECTED));

	}).catch(() => {

		console.debug("delete buttons not found");

	}).then(() => {

		return wait(100).then(FightTab.click());

	});
}

export { cleanItems, autoClean };