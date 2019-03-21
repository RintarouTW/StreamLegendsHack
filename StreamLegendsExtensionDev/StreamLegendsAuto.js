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

var GameTitle = "StreamLegends";

/* Game Options */
var forceLowLevel = false;
var cleanDuplicatedRareItems = false;
var cleanDuplicatedEpicItems = false;
var autoStart = false;
var MAX_CLEAN_ITEMS = 100;

/* Internally Used */
var autoTimer;
var GameDoc;
var fightTab;
var gearTab;
var autoToggle;
var numSelectedItem = 0;
var prevLevel = false;
var cleanBtn;
var guildTimer;
var fightRounds;

/* Statistics */
var isFighting = false;
var isOnwarding = 0;
var fightingTicks = 0;	/* num seconds of the last fight */
var totalFightingTicks = 0;
var numFights = 0;
var numItems = 0;

/* Handle options changed event from content script */
document.addEventListener("SetOption", event => {

	switch(event.detail.optionName) {
		case "forceLowLevel":
			forceLowLevel = (event.detail.value == "YES");
		break;
		case "cleanDuplicatedRareItems":
			cleanDuplicatedRareItems = (event.detail.value == "YES");
		break;
		case "cleanDuplicatedEpicItems":
			cleanDuplicatedEpicItems = (event.detail.value == "YES");
		break;
	}
});

function stop() {

	clearInterval(autoTimer);

	autoTimer = 0;

	fightRounds.innerHTML = "";

	if (numFights == 0) return;

	console.info("Avg Fight Costs ( " + totalFightingTicks + " / " + numFights + " ) : " + (totalFightingTicks/numFights).toFixed(2) + " seconds");
	console.info("Avg Drops Per Fight ( " + numItems + " / " + numFights + " ) : " + (numItems * 100 / numFights).toFixed(2) + "%");
}

function start() {

	numFights = 0;
	numItems  = 0;
	fightingTicks = 0;
	totalFightingTicks = 0;
	isFighting = false;
	isOnwarding = 0;

	if (autoTimer) stop();

	autoTimer = setInterval(onAutoTimer, 1000);
}

function overMaxSelected() {

	if (numSelectedItem > MAX_CLEAN_ITEMS) {

		console.info(MAX_CLEAN_ITEMS + " max items selected at a time. clean others next time!");
		numSelectedItem = 0;
		return true;
	}
		
	return false;
}

function selectItemsByClassName(itemClassName, typeIdx) {

	var j = 0, last_item_name = "", last_one_hand_item_name = "";

	var itemTypes = ["common", "uncommon", "rare", "epic"];

	var items = GameDoc.getElementsByClassName(itemClassName);

	for(var i = items.length - 1; i >= 0 ; i--) {

		if (overMaxSelected()) {

			if (j > 0) console.info("selected " + j + " " + itemTypes[typeIdx] + " items"); 
			return false; // it's over max, don't continue
		}

		if(last_item_name != items[i].className) {

			last_item_name = items[i].className;	/* reserve the last one */

			if (last_item_name.includes("_1h_") && 
				!last_item_name.includes("backpack-item-item_scifi_1h_portable_black_hole_generator_tier_")) 
				last_one_hand_item_name = last_item_name;

			continue;

		} else {

			/* reserver another one hand item again */
			if ((last_one_hand_item_name != "") && 
				(items[i].className == last_one_hand_item_name)) {
					last_one_hand_item_name = "";
					continue;
			}
		}

		items[i].click();
		numSelectedItem++;
		j++;
	}

	if (j > 0) console.info("selected " + j + " " + itemTypes[typeIdx] + " items");
	return true; // it's ok to continue;
}

/* item types : epic > rare > uncommon > common */
async function cleanItems() {

	var btns = GameDoc.getElementsByClassName("srpg-gear-multi-delete-button");

	if (btns.length == 2 )

		btns[0].firstChild.click();	/* click the SELECT button */

	numSelectedItem = 0;

	if (!selectItemsByClassName("backpack-item-common", 0)) return;
	if (!selectItemsByClassName("backpack-item-uncommon", 1)) return;

	if (cleanDuplicatedRareItems && !selectItemsByClassName("backpack-item-rare", 2)) return;
	if (cleanDuplicatedEpicItems && !selectItemsByClassName("backpack-item-epic", 3)) return;
	
	console.info("Totally selected " + numSelectedItem + " items");
}

function autoContribute() {

	var btns = GameDoc.getElementsByClassName("player-api-btn srpg-button srpg-button-reward  btn btn-default");

	// find the contribute btn (selected)
	for (var i = btns.length - 1; i >= 0; i--) {

		if (btns[i].parentElement.parentElement.parentElement.className.includes("srpg-building-selected")) {
			btns[i].click();
			return;			
		}
	}

	if (guildTimer) {
		clearInterval(guildTimer);
		guildTimer = 0;
		return;
	}

}


function installHooks() {

	if (GameDoc.getElementsByClassName("StreamRpgError srpg-takeover-window")[0]) {
		window.location.reload();
		return;
	}

	fightTab = GameDoc.getElementById("srpg-nav-tab-FIGHT");

	if (!fightTab) return false;

	// Auto Contribute Hook
	var guildTab = GameDoc.getElementById("srpg-nav-tab-GUILD");

	if (!guildTab) return false;

	guildTab.onclick = function() {

		if (guildTimer) {
			clearInterval(guildTimer);
			guildTimer = 0;
			return;
		}

		guildTimer = setInterval(autoContribute, 1000);
	}

	// Clean Button Hook
	gearTab = GameDoc.getElementById("srpg-nav-tab-GEAR");

	if (!gearTab) return false;

	gearTab.onclick = function() {

		if (GameDoc.getElementsByClassName("srpg-gear-multi-delete-button").length >=2 ) return;

		// Insert Clean Button
		setTimeout(() => {
		
			var deleteBar = GameDoc.getElementsByClassName("srpg-gear-multi-delete-bar")[0];

			if (deleteBar.children.length > 1) return;

			cleanBtn = document.createElement("li");
			cleanBtn.className = "srpg-gear-multi-delete-button";
			cleanBtn.innerHTML = "<a><div>CLEAN</div><i class='fa fa-trash-o'></i></a>";
			cleanBtn.onclick = cleanItems;

			deleteBar.appendChild(cleanBtn);

		}, 400);		
	}

	var orgPopup = GameDoc.getElementsByClassName("srpg-top-bar-popout")[0];

	if (!orgPopup) return false;

	orgPopup.remove();

	var topbar = GameDoc.getElementsByClassName("srpg-top-bar")[0];

	if (!topbar) return false;

	/* Auto Switch */
	autoToggle = document.createElement("div");
	autoToggle.className = "ToggleSwitch off";
	autoToggle.innerHTML = '<div class="toggle-switch-text toggle-switch-on-text">ON</div><div class="toggle-switch-circle"></div><div class="toggle-switch-text toggle-switch-off-text">OFF</div>';

	autoToggle.onclick = () => {

		autoToggle.classList.toggle("on");
		autoToggle.classList.toggle("off");
		autoToggle.className.includes('on') ? start() : stop();

		// ask content script to save to storage.
		var isAutoStart = autoToggle.className.includes('on') ? "YES" : "NO";
		
		sessionStorage.setItem('autoStart', isAutoStart);
	}
	
	var toggleContainer = document.createElement("div");

	toggleContainer.className = "StreamRpgAutoFightToggle";
	toggleContainer.innerHTML = '<div class="auto-fight-text" style="font-size: smaller;">AUTO<p id="fightRounds" ' +
	'style="margin: 0px; font-size: xx-small; font-weight: lighter; font-family: DINPro-Regular; text-align: right;"></p></div>';
	toggleContainer.appendChild(autoToggle);
	
	topbar.appendChild(toggleContainer);

	fightRounds = GameDoc.getElementById("fightRounds");

	// load options
	document.dispatchEvent(new CustomEvent("LoadOptions"));

	console.info("Installed. Enjoy it!");

	// Auto Start
	autoStart = (sessionStorage.getItem('autoStart') == "YES");

	if (autoStart) autoToggle.click();

	return true;
}

function install(showError = false) {

	if (autoToggle) return true; // already installed

	GameDoc = document;

	/* search local first */
	if (document.title == GameTitle) return installHooks();

	/* search for StreamLegends iframes document */
	for (var i = window.frames.length - 1; i >= 0; i--) {
		if (!window.frames[i].frames[0]) continue;

		GameDoc = window.frames[i].frames[0].document;

		if (GameDoc && (GameDoc.title == GameTitle))
			return installHooks();
	}

	if (showError)
		console.debug("Failed to find " + GameTitle);

	GameDoc = 0;

	return false;	// not found
}

/* Button Class Name Mapping */
const BTN_COLLECT_LOOT      = 0;
const BTN_RAID_BACK_TO_MAP  = 1;
const BTN_ONWARDS_FAIL_SAVE = 2;
const BTN_ONWARDS_NEW_ITEM  = 3;
const BTN_ONWARDS_CONTINUE  = 4;
const BTN_ONWARDS_COMBATLOG = 5;
const BTN_FIGHT     		= 6;
const BTN_CLASSNAME_TABLE = [
	["<COLLECT LOOT>", "srpg-button available post-fight-button srpg-button-reward btn btn-default"],
	["<Back To Map>" , "srpg-button srpg-button-maps btn btn-default"],
	["<ONWARDS> Errors", "srpg-button srpg-button-continue btn btn-default"],
	["<ONWARDS> EQUIP", "player-api-btn srpg-button srpg-button-continue btn btn-default"],
	["<ONWARD> Continue", "player-api-btn srpg-button srpg-button-continue btn btn-default"],
	["<ONWARDS> COMBAT LOG", "player-api-btn srpg-button available post-fight-button btn btn-default"],
	["<FIGHT>", "player-api-btn srpg-button btn btn-default"]
];


function pressButton(btnIdx) {
	
	var btn = GameDoc.getElementsByClassName(BTN_CLASSNAME_TABLE[btnIdx][1])[0];
	
	if (!btn) return false; // button not found

	btn.click();

	console.log(BTN_CLASSNAME_TABLE[btnIdx][0]);	// Log it.

	return true;	// pressed
}


function failSave() {

	console.debug("Network delay??? try fail save!");
	pressButton(BTN_FIGHT);
	pressButton(BTN_ONWARDS_NEW_ITEM);
	pressButton(BTN_ONWARDS_CONTINUE);
}


function onAutoTimer() {

	/* ONWARDS Button when Errors : Fail safe - reload & auto start */
	var errorWindow = GameDoc.getElementsByClassName("StreamRpgError srpg-takeover-window")[0];

	if (errorWindow) {
		stop();
		window.location.reload();
		return;
	}

	if (isFighting) fightingTicks++;	/* Fighting ticks up */

	if (fightTab.className.includes('fight-active')) return; /* still fighting */

	if (isFighting) { /* Fight ends */

		if (fightTab.className.includes('fight-ready') && 
			!GameDoc.getElementsByClassName("StreamRpgMapList")[0]) {			

			// some wierd errors, such as
			// 1. Fight button didn't get clicked.
			// 2. 
			if ((fightingTicks % 4) == 0) failSave();

			if (fightingTicks > 30) window.location.reload();	// fail save failed, just reload.
			return; /* Prevent Network Delay */
		}
			
		totalFightingTicks += fightingTicks;
		console.log("Fight ends in " + fightingTicks + " / " + totalFightingTicks + " seconds");
		fightingTicks = 0;	/* reset ticks */
		isFighting = false;
	}

	/* Automation only works when the Fight tab is selected, leave other tabs work as normal */		
	if (!fightTab.className.includes('nav-selected')) return;

	/* Level Selection (Raid > forceLowLevel > newLevel > highest 2 levels) */
	var raidLevel = GameDoc.getElementsByClassName("map-raid")[0];

	if (raidLevel) {
		isFighting = false;
		isOnwarding = 0;
		console.log("> Enter Raid");		
		raidLevel.click();
		return;
	}

	var newLevel = GameDoc.getElementsByClassName("map-selected")[0];

	var levels = GameDoc.getElementsByClassName("map-completed");

	if ((!levels.length /* no completed levels, */ || !forceLowLevel) && newLevel) {
		isFighting = false;
		isOnwarding = 0;
		console.log("> Select New Level");
		newLevel.click();
		return;
	}
	
	if (levels.length) {

		isFighting = false;

		if (forceLowLevel) {
			console.log("> Force Low Level");
			levels[0].click();
			return;
		}

		var lvlIdx = (prevLevel) ? (levels.length - 1) : (levels.length - 2);

		console.log("> Select Level item[" + lvlIdx + "]");

		prevLevel = !prevLevel;

		isOnwarding = 0;
		levels[lvlIdx].click();
		return;
	}

	/* COLLECT LOOT */
	if (pressButton(BTN_COLLECT_LOOT)) return;

	/* Raid Back to Map */
	if (pressButton(BTN_RAID_BACK_TO_MAP)) return;


	if (GameDoc.getElementsByClassName("srpg-button-secondary")[0]) {

		if (isOnwarding) { /* server delay */
			isOnwarding++;
			console.debug("... Onwarding wait for server(" + isOnwarding + ") ...");

			if (fightingTicks < 4) return;

			if (isOnwarding > 60) {
				stop();
				window.location.reload();
				return;
			}

			return;
		}

		/* ONWARDS Button when got new item, special case */
		if (pressButton(BTN_ONWARDS_NEW_ITEM)) {			
			numItems++;
			isOnwarding = 0; // reset onwarding timer.
			console.log("Got ( " + numItems + " ) New Items");
			isOnwarding++;
			return;
		}

	} else {
		/* TODO, this may loop too */
		if (pressButton(BTN_ONWARDS_CONTINUE)) {
			isOnwarding++;
			return;
		}
	}

	/* ONWARDS Button with COMBAT LOG only */
	if (pressButton(BTN_ONWARDS_COMBATLOG)) {
		isOnwarding++;
		return;
	}

	/* Fight Button */
	if (pressButton(BTN_FIGHT)) {

		isFighting = true;
		isOnwarding = 0;
		numFights++;
		fightRounds.innerHTML = numFights;
		console.log("Round -< " + numFights + " >-");
		return;
	}
}

function RetryInstallWhileGameLoading() {

	if(!install())
		setTimeout(RetryInstallWhileGameLoading, 1000);	

}

// Auto Install
RetryInstallWhileGameLoading();
