'use strict';

import { opt } from "./option.js";
import { connectToServer, raidInfoFromBot } from "./server.js"

/* Commonly Used */
const isReleaseMode = (window.top != window);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/* DOM Elements */
var GameDoc;
var FightTab;
var GearTab;
var AutoToggle;
var FightRounds;
var GuildTab;

function updateFightRounds(numFights) {

	if (FightRounds) FightRounds.innerHTML = numFights;
}

// user info
function getPlayerInfo() {

	// todo click rank tab first
	const rankTab = GameDoc.getElementById("srpg-nav-tab-RANK");

	rankTab.click();

	return wait(3000).then(() => {

		const rankRow = GameDoc.getElementsByClassName("you")[0];

		if (rankRow) {
			
			opt.PlayerLevel = Number(GameDoc.getElementsByClassName("srpg-top-bar-lvl-number")[0].innerText);

			if (rankRow.children[1].firstChild.innerText != "")
				opt.PlayerName = rankRow.children[1].firstChild.innerText;
			
			document.title = opt.PlayerName;

			console.log(`Name: ${opt.PlayerName} Level: ${opt.PlayerLevel}`);

			if (!opt.isReleaseMode) {
				const num = Number(opt.PlayerName.replace(/[a-z ]/gi, ''));
				window.moveTo( 320 * (num % 2), 22);
			}
		}

		FightTab.click();
	});
}

/// start a new raid
function startNewRaid() {

	if (opt.AutoStartNewRaid == 0) return;

	GuildTab = GameDoc.getElementById("srpg-nav-tab-GUILD");
	FightTab = GameDoc.getElementById("srpg-nav-tab-FIGHT");		

	GuildTab.click();

	const raidRows = GameDoc.getElementsByClassName("srpg-building-label-toggle");

	raidRows[3].click();

	const buyRaidBtns = GameDoc.getElementsByClassName("srpg-building-item-buy");

	console.log(`buyRaidBtns.length = ${buyRaidBtns.length}`);

	wait(1000).then(() => {

		const btnIdxes = [10, 14, 18, 9, 13, 17, 8, 12, 16, 7, 11, 15];

		if (btnIdxes[10].innerText == "OTHER RAID ACTIVE")
			return; // other raid has been activated.

		const startedIdx = btnIdxes.length - 3 * opt.AutoStartNewRaid;

		for (let i = startedIdx; i < btnIdxes.length; i++) {

			let x = btnIdxes[i];

			if (buyRaidBtns[x].innerText == "OTHER RAID ACTIVE")
				return; // other raid has been activated.


			if (buyRaidBtns[x].innerText.includes('5000') ||
				buyRaidBtns[x].innerText.includes('2500') ||
				buyRaidBtns[x].innerText.includes('1000') ||
				buyRaidBtns[x].innerText.includes('500')) {

				buyRaidBtns[x].click();
				console.log(buyRaidBtns[x], "clicked ", buyRaidBtns[x].innerText);
				raidInfoFromBot("AutoStartNewRaid", opt.PlayerName);
				return;
			}
		}

		// if nothing found, try to find from the begining again.
		for (let x of btnIdxes) {

			if (buyRaidBtns[x].innerText == "OTHER RAID ACTIVE")
				return; // other raid has been activated.

			if (buyRaidBtns[x].innerText.includes('5000') ||
				buyRaidBtns[x].innerText.includes('2500') ||
				buyRaidBtns[x].innerText.includes('1000') ||
				buyRaidBtns[x].innerText.includes('500')) {

				buyRaidBtns[x].click();
				console.log(buyRaidBtns[x], "clicked ", buyRaidBtns[x].innerText);
				raidInfoFromBot("AutoStartNewRaid", opt.PlayerName);
				return;
			}
		}

	}).then(() => {

		wait(1000).then(() => {
			FightTab.click();
		});		
	});
}


// for auto contribution
var guildTimer;

function autoContribute() {

	const contributeBtnClassName = "player-api-btn srpg-button srpg-button-reward  btn btn-default";
	const btns = GameDoc.getElementsByClassName(contributeBtnClassName);

	// find the contribute btn (selected)
	for (const btn of btns) {

		const containerClassName = btn.parentElement.parentElement.parentElement.className;
		
		if (containerClassName.includes("srpg-building-selected")) {
			btn.click();
			return;			
		}
	}

	if (guildTimer) {

		clearInterval(guildTimer);
		guildTimer = 0;
		return;
	}
}

function checkFatalError() {

	/* ONWARDS Button when Errors : Fail safe - reload & auto start */
	let errorWindow = GameDoc.getElementsByClassName("StreamRpgError srpg-takeover-window")[0];
	let spinner = GameDoc.getElementsByClassName("spinner")[0];
	if (errorWindow) {
		stop();
		console.debug("fatal error window shows, reload the game.");
		wait(3000).then(() => window.location.reload());
		return true;
	}

	return false;
}

function installHooks(gameDoc, cleanItems, startAutoTimer, stopAutoTimer) {

	GameDoc = gameDoc;

	if (checkFatalError()) return false;

	if (!isReleaseMode) window.resizeTo(320, 620);	// for debug only.

	FightTab = GameDoc.getElementById("srpg-nav-tab-FIGHT");

	if (!FightTab) return false;

	// Auto Contribute Hook
	GuildTab = GameDoc.getElementById("srpg-nav-tab-GUILD");

	if (!GuildTab) return false;

	GuildTab.onclick = function() {

		if (guildTimer) {
			clearInterval(guildTimer);
			guildTimer = 0;
			return;
		}

		guildTimer = setInterval(autoContribute, 1000);
	}

	// Clean Button Hook
	GearTab = GameDoc.getElementById("srpg-nav-tab-GEAR");

	if (!GearTab) return false;

	GearTab.onclick = function() {

		if (GameDoc.getElementsByClassName("srpg-gear-multi-delete-button").length >=2 ) return;

		// Insert Clean Button
		wait(400).then(() => {
		
			let deleteBar = GameDoc.getElementsByClassName("srpg-gear-multi-delete-bar")[0];

			if (!deleteBar || deleteBar.children.length > 1) return;

			let cleanBtn = document.createElement("li");
			cleanBtn.className = "srpg-gear-multi-delete-button";
			cleanBtn.innerHTML = "<a><div>CLEAN</div><i class='fa fa-trash-o'></i></a>";
			cleanBtn.onclick = cleanItems;

			deleteBar.appendChild(cleanBtn);
		});
	}

	let orgPopup = GameDoc.getElementsByClassName("srpg-top-bar-popout")[0];

	if (!orgPopup) return false;

	orgPopup.remove();

	let topbar = GameDoc.getElementsByClassName("srpg-top-bar")[0];

	if (!topbar) return false;

	/* Auto Toggle */
	AutoToggle = document.createElement("div");
	AutoToggle.className = "ToggleSwitch off";
	AutoToggle.innerHTML = '<div class="toggle-switch-text toggle-switch-on-text">ON</div><div class="toggle-switch-circle"></div><div class="toggle-switch-text toggle-switch-off-text">OFF</div>';

	AutoToggle.onclick = () => {

		if (opt.isPaused) return;

		AutoToggle.classList.toggle("on");
		AutoToggle.classList.toggle("off");
		AutoToggle.className.includes('on') ? startAutoTimer() : stopAutoTimer();

		let isAutoStart = AutoToggle.className.includes('on') ? "YES" : "NO";
		
		// save to the session only		
		sessionStorage.setItem('AutoStart', isAutoStart);
	}
	
	let toggleContainer = document.createElement("div");

	toggleContainer.className = "StreamRpgAutoFightToggle";
	toggleContainer.innerHTML = `<div class="auto-fight-text" style="font-size: smaller;">AUTO
	<p id="FightRounds" style="margin: 0px; font-size: xx-small; font-weight: lighter; font-family: DINPro-Regular; text-align: right;"></p>
	</div>`;
	toggleContainer.appendChild(AutoToggle);
	
	topbar.appendChild(toggleContainer);

	FightRounds = GameDoc.getElementById("FightRounds");

	// load options
	document.dispatchEvent(new CustomEvent("LoadOptions"));

	if (!isReleaseMode) {

		getPlayerInfo().then(() => {
			connectToServer(AutoToggle);
		});
	} 

	// Auto Start
	if (sessionStorage.getItem('AutoStart') == "YES") AutoToggle.click();

	console.info("Installed. Enjoy it!");

	return true;
}

export {	
	GameDoc,
	FightTab,
	GearTab,
	AutoToggle,
	isReleaseMode,
	wait,
	installHooks,
	checkFatalError,
	updateFightRounds,
	startNewRaid
};