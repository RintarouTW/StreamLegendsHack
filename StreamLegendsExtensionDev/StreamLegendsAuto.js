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

import { opt } from "./modules/option.js";

import { 
	isReleaseMode,
	GameDoc,
	FightTab,
	AutoToggle,
	wait, 
	updateFightRounds,
	installHooks,
	checkFatalError,
	startNewRaid
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

import {
	raidInfoFromBot
} from "./modules/server.js";

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

	autoTimer = setInterval(onAutoTimer, 700);
}

function install(showError = false) {

	if (AutoToggle) return true; // already installed

	let gameDoc = document;

	/* search local first */
	if ((document.title == GameTitle) 
		&& installHooks(gameDoc, cleanItems, startAutoTimer, stopAutoTimer))
		return gameDoc;
	
	/* search for StreamLegends iframes document */
	for (let i = window.frames.length - 1; i >= 0; i--) {
		
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

function sendRaidRankingToServer() {
	// Log the Raid Ranking, update to server.
	let rows = GameDoc.getElementsByClassName("contribution-entry contribution-row");

	if (rows) {
		let isTop5 = false;
		let top5 = [];
		for(let i = 0; i < 5; i++) {
			let row = rows[i];
			if (row) {
				let str = row.children[0].innerText + " " + row.children[1].innerText + "\t" + row.children[2].innerText;
				if (row.children[1].innerText == opt.PlayerName) {
					str = "> " + str;
					isTop5 = true;
				}					
				console.log(str);
				let numXP = Number(row.children[2].innerText.replace(/[a-z ,]/gi, ''));
				top5.push( { name: row.children[1].innerText, xp: numXP } );
			}
		}
		
		raidInfoFromBot("rank", top5);
		
		if (!isTop5) {
			let row = rows[5];
			if (row) {
				let str = "< " + row.children[0].innerText + " " + row.children[1].innerText + "\t" + row.children[2].innerText + " >";
				console.log(str);
			}
		}
	}
}

function onAutoTimer() {

	if (checkFatalError()) return;

	if (opt.isPaused) return;

	if (FightTab.className.includes("fight-active")) {

		fightingTicks++;

		opt.PlayerLevel = Number(GameDoc.getElementsByClassName("srpg-top-bar-lvl-number")[0].innerText);

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
				if (opt.EnableAutoClean 
					&& (numNewItems % opt.NumNewItemsToAutoClean == 0))
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

		if (!opt.IgnoreRaid) {
			/* Level Selection (Raid > ForceLowLevel > newLevel > highest 2 levels) */
			let raidLevel = GameDoc.getElementsByClassName("map-raid")[0];

			if (raidLevel) {

				let expireText = GameDoc.getElementsByClassName("srpg-map-list-node-lvl font-medium")[0].innerText;

				isRaiding = true;
				console.log(">> Enter Raid ( " + expireText + " )");

				if (!isReleaseMode) raidInfoFromBot("expire", expireText);

				raidLevel.click();
				return;
			} else {
				if (GameDoc.getElementsByClassName("srpg-map-list")[0]) {
					isRaiding = false;
					console.log(">> End of Raid");

					// Try to start a new raid
					if (!isReleaseMode) {
						startNewRaid();
						return;
					}
				}
			}
		}

		let newLevel = GameDoc.getElementsByClassName("map-selected")[0];

		let levels = GameDoc.getElementsByClassName("map-completed");

		if ((!levels.length || !opt.ForceLowLevel) && newLevel) {

			isRaiding = false;
			console.log(">> Select New Level");
			newLevel.click();
			return;
		}
		
		if (levels.length) {

			isRaiding = false;

			if (opt.ForceLowLevel) {				
				console.log(">> Force Low Level");				
				levels[0].click();
				return;
			}

			let lvlIdx = (prevLevel) ? (levels.length - 1) : (levels.length - 2);

			console.log(">> Select Level item[" + lvlIdx + "]");

			prevLevel = !prevLevel;

			levels[lvlIdx].click();
			return;
		}

		if (!isReleaseMode) sendRaidRankingToServer();

		if (clickButton(BTN_RAID_BACK_TO_MAP)) return;

		// Auto Raid for debug only
		if (!isReleaseMode && !isRaiding) {

			let mapCloseBtn = GameDoc.getElementsByClassName("srpg-map-close")[0];

			if (mapCloseBtn && opt.HasRaid) {

				opt.HasRaid = false; // check once only.
				mapCloseBtn.click();
				return;
			}
		}

		// click FIGHT!
		if (clickButton(BTN_FIGHT)) {

			let raidXP = GameDoc.getElementsByClassName("raid-progress-xp")[0];

			if (raidXP) {
				
				if (!isReleaseMode) raidInfoFromBot("progress", raidXP.innerText);
				console.log("Raid Progress: " + raidXP.innerText);
			}			

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
