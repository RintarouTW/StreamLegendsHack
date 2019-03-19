'use strict';

chrome.runtime.onInstalled.addListener(function() {
  // Default Options
  chrome.storage.local.set( {forceLowLevel: "NO", cleanDuplicatedRareItems: "NO", cleanDuplicatedEpicItems: "NO"} );

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'www.twitch.tv'},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
  });

});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.cmd == "updateTooltip") {
      chrome.pageAction.setTitle({ tabId: sender.tab.id, title: "Hacked" });
  }

  sendResponse("resp");
});


