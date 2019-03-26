/* StreamLegends Auto Runner ******
 * -- For Safari --
 * 1. open -na '/Applications/Safari.app' --args --disable-web-security
 * 2. Run this in Developer Console. (Disable Cross-Origin Restriction)
 * -- For Chrome --
 * 1. open -na Google\ Chrome --args --disable-web-security --user-data-dir="/tmp/chrome_dev" --disable-site-isolation-trials
 * 2. Run this code in Developer Console
 * ---
 * Author: shuho.chou@gmail.com 2019.03.08
 */

'use strict';

import {
	opt, 
	checkNewRaid
} from "./modules/option.js";

import { 
	isReleaseMode,
	GameDoc,
	FightTab,
	AutoToggle,
	wait, 
	updateFightRounds,
	installHooks,
	checkFatalError
} from "./modules/common.js";

import { 
	BTN_COLLECT_LOOT,
	BTN_RAID_BACK_TO_MAP,
	BTN_ONWARDS_FAIL_SAVE,
	BTN_ONWARDS_NEW_ITEM,
	BTN_ONWARDS_CONTINUE,
	BTN_ONWARDS_COMBATLOG,
	BTN_FIGHT,
	BTN_SELL_SELECTED,
	clickButton
} from "./modules/button.js";

import { 
	cleanItems, 
	autoClean 
} from "./modules/clean.js";

const GameTitle = "StreamLegends";

var autoTimer;
var prevLevel = false;
var shouldAutoClean = false;

var isRaiding = false;
var isOnwarding = 0;

/* Statistics */
var fightingTicks = 0;	/* num seconds of the last fight */
var totalFightingTicks = 0;
var numFights = 0;
var numNewItems = 0;

function stopAutoTimer() {

	if (autoTimer) clearInterval(autoTimer);
	
	autoTimer = 0;

	updateFightRounds("");

	if (numFights == 0) return;

	console.info("Avg Fight Costs ( " + totalFightingTicks + " / " + numFights + " ) : " + (totalFightingTicks/numFights).toFixed(2) + " seconds");
	console.info("Avg Drops Per Fight ( " + numNewItems + " / " + numFights + " ) : " + (numNewItems * 100 / numFights).toFixed(2) + "%");
}

function startAutoTimer() {

	if (autoTimer) stop();

	numFights = 0;
	numNewItems  = 0;
	fightingTicks = 0;
	totalFightingTicks = 0;
	isOnwarding = 0;

	autoTimer = setInterval(onAutoTimer, 1000);
}

function install(showError = false) {

	if (AutoToggle) return true; // already installed

	var gameDoc = document;

	/* search local first */
	if ((document.title == GameTitle) 
		&& installHooks(gameDoc, cleanItems, startAutoTimer, stopAutoTimer))
		return gameDoc;
	
	/* search for StreamLegends iframes document */
	for (var i = window.frames.length - 1; i >= 0; i--) {
		
		if (!window.frames[i].frames[0]) continue;

		gameDoc = window.frames[i].frames[0].document;

		if (gameDoc 
			&& (gameDoc.title == GameTitle) 
			&& installHooks(gameDoc, cleanItems, startAutoTimer, stopAutoTimer))
			return gameDoc;
	}

	if (showError)
		console.debug("Failed to find " + GameTitle);

	return false;	// not found
}

function onAutoTimer() {

	if (checkFatalError()) return;	

	if (FightTab.className.includes("fight-active")) {

		fightingTicks++;

		if (shouldAutoClean) {
			shouldAutoClean = false;
			wait(2000).then(autoClean());
		}
		return;
	}

	if (FightTab.className.includes("unclaimed-reward")) {

		// end fighting
		if (fightingTicks > 0) {
			totalFightingTicks += fightingTicks;
			console.log("Fight ends in " + fightingTicks + " / " + totalFightingTicks + " seconds");
			fightingTicks = 0;	/* reset ticks */
		}

		/* Automation only works when the Fight tab is selected, leave other tabs work as normal */		
		if (!FightTab.className.includes('nav-selected')) return;

		if (isOnwarding++ > 30) {
			console.debug("onwarding timtout, reload the game.");
			window.location.reload(); // timeout
			return;
		}

		if (GameDoc.getElementsByClassName("srpg-button-secondary")[0]) {

			/* COLLECT LOOT */
			if (clickButton(BTN_COLLECT_LOOT)) return;

			/* ONWARDS Button when got new item */
			if (clickButton(BTN_ONWARDS_NEW_ITEM)) {			
				numNewItems++;
				console.log("Got ( " + numNewItems + " ) New Items");
				if (opt.enableAutoClean 
					&& (numNewItems % opt.numNewItemsToAutoClean == 0))
					shouldAutoClean = true;

				return;
			}

			/* ONWARDS Button with COMBAT LOG only */
			if (clickButton(BTN_ONWARDS_COMBATLOG)) return;

		} else {

			if (clickButton(BTN_ONWARDS_CONTINUE)) return;
		}

		return;
	}

	if (FightTab.className.includes("fight-ready")) {

		isOnwarding = 0;

		/* Automation only works when the Fight tab is selected, leave other tabs work as normal */		
		if (!FightTab.className.includes('nav-selected')) return;

		if (!opt.ignoreRaid) {
			/* Level Selection (Raid > forceLowLevel > newLevel > highest 2 levels) */
			var raidLevel = GameDoc.getElementsByClassName("map-raid")[0];

			if (raidLevel) {

				var expireText = GameDoc.getElementsByClassName("srpg-map-list-node-lvl font-medium")[0].innerText;

				isRaiding = true;
				console.log(">> Enter Raid ( " + expireText + " )");
				raidLevel.click();
				return;
			} else {
				if (GameDoc.getElementsByClassName("srpg-map-list")[0]) {
					isRaiding = false;
					console.log(">> End of Raid");
				}
			}
		}

		var newLevel = GameDoc.getElementsByClassName("map-selected")[0];

		var levels = GameDoc.getElementsByClassName("map-completed");

		if ((!levels.length /* no completed levels, */ || !opt.forceLowLevel) && newLevel) {
			isRaiding = false;
			console.log(">> Select New Level");
			newLevel.click();
			return;
		}
		
		if (levels.length) {

			isRaiding = false;

			if (opt.forceLowLevel) {				
				console.log(">> Force Low Level");				
				levels[0].click();
				return;
			}

			var lvlIdx = (prevLevel) ? (levels.length - 1) : (levels.length - 2);

			console.log(">> Select Level item[" + lvlIdx + "]");

			prevLevel = !prevLevel;

			levels[lvlIdx].click();
			return;
		}

		var rows = GameDoc.getElementsByClassName("contribution-entry contribution-row");

		if (rows) {
			for(var i = 0; i < 5; i++) {
				var row = rows[i];
				if (row) {
					var str = row.children[0].innerText + " " + row.children[1].innerText + "\t" + row.children[2].innerText;
					console.log(str);
				}
			}
		}

		if (clickButton(BTN_RAID_BACK_TO_MAP)) return;

		// Auto Raid for debug only
		if (!isReleaseMode && !isRaiding) {

			var mapCloseBtn = GameDoc.getElementsByClassName("srpg-map-close")[0];

			if (mapCloseBtn) {

				checkNewRaid(); // only check new raid in the map state.

				if (opt.hasRaid) {
					mapCloseBtn.click();
					return;
				}
			}
		}

		// click FIGHT!
		if (clickButton(BTN_FIGHT)) {

			var raidXP = GameDoc.getElementsByClassName("raid-progress-xp")[0];
			if (raidXP) console.log("Raid Progress: " + raidXP.innerText);

			updateFightRounds((numFights++));
			console.log("Round -< " + numFights + " >-");
			return;
		}

		return;
	}

}

(function RetryInstallWhileGameLoading() {

	if(!install())
		wait(1000).then(RetryInstallWhileGameLoading);

})(); // Auto Install
