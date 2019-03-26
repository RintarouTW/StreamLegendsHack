'use strict';

/* Commonly Used */
const isReleaseMode = (window.top != window);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/* DOM Elements */
var GameDoc;
var FightTab;
var GearTab;
var AutoToggle;
var FightRounds;

function updateFightRounds(numFights) {

	if (FightRounds) FightRounds.innerHTML = numFights;
}

// for auto contribution
var guildTimer;

function autoContribute() {

	var contributeBtnClassName = "player-api-btn srpg-button srpg-button-reward  btn btn-default";
	var btns = GameDoc.getElementsByClassName(contributeBtnClassName);

	// find the contribute btn (selected)
	for (var i = btns.length - 1; i >= 0; i--) {

		var containerClassName = btns[i].parentElement.parentElement.parentElement.className;
		if (containerClassName.includes("srpg-building-selected")) {
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

function checkFatalError() {

	/* ONWARDS Button when Errors : Fail safe - reload & auto start */
	var errorWindow = GameDoc.getElementsByClassName("StreamRpgError srpg-takeover-window")[0];

	if (errorWindow) {
		stop();
		console.debug("fatal error window shows, reload the game.");
		window.location.reload();
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
	GearTab = GameDoc.getElementById("srpg-nav-tab-GEAR");

	if (!GearTab) return false;

	GearTab.onclick = function() {

		if (GameDoc.getElementsByClassName("srpg-gear-multi-delete-button").length >=2 ) return;

		// Insert Clean Button
		wait(400).then(() => {
		
			var deleteBar = GameDoc.getElementsByClassName("srpg-gear-multi-delete-bar")[0];

			if (!deleteBar || deleteBar.children.length > 1) return;

			var cleanBtn = document.createElement("li");
			cleanBtn.className = "srpg-gear-multi-delete-button";
			cleanBtn.innerHTML = "<a><div>CLEAN</div><i class='fa fa-trash-o'></i></a>";
			cleanBtn.onclick = cleanItems;

			deleteBar.appendChild(cleanBtn);
		});
	}

	var orgPopup = GameDoc.getElementsByClassName("srpg-top-bar-popout")[0];

	if (!orgPopup) return false;

	orgPopup.remove();

	var topbar = GameDoc.getElementsByClassName("srpg-top-bar")[0];

	if (!topbar) return false;

	/* Auto Toggle */
	AutoToggle = document.createElement("div");
	AutoToggle.className = "ToggleSwitch off";
	AutoToggle.innerHTML = '<div class="toggle-switch-text toggle-switch-on-text">ON</div><div class="toggle-switch-circle"></div><div class="toggle-switch-text toggle-switch-off-text">OFF</div>';

	AutoToggle.onclick = () => {

		AutoToggle.classList.toggle("on");
		AutoToggle.classList.toggle("off");
		AutoToggle.className.includes('on') ? startAutoTimer() : stopAutoTimer();

		var isAutoStart = AutoToggle.className.includes('on') ? "YES" : "NO";
		
		// save to the session only		
		sessionStorage.setItem('AutoStart', isAutoStart);
	}
	
	var toggleContainer = document.createElement("div");

	toggleContainer.className = "StreamRpgAutoFightToggle";
	toggleContainer.innerHTML = '<div class="auto-fight-text" style="font-size: smaller;">AUTO<p id="FightRounds" ' +
	'style="margin: 0px; font-size: xx-small; font-weight: lighter; font-family: DINPro-Regular; text-align: right;"></p></div>';
	toggleContainer.appendChild(AutoToggle);
	
	topbar.appendChild(toggleContainer);

	FightRounds = GameDoc.getElementById("FightRounds");

	// load options
	document.dispatchEvent(new CustomEvent("LoadOptions"));			

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
	updateFightRounds
};