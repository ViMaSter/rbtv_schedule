var amazonTabID = -1;
var amazonNotification = null;

function changeAmazonTab() {
	if (amazonTabID != -1) {
		chrome.tabs.update(amazonTabID, {url: "http://www.amazon.de/?_encoding=UTF8&camp=1638&creative=19454&linkCode=ur2&site-redirect=de&tag=rocketbeansde-21"});
	}
}

function detectAmazonTab() {
	localStorage["newAmazonCheckAt"] = typeof localStorage["newAmazonCheckAt"] == "undefined" ? -1 : localStorage["newAmazonCheckAt"];
	
	if (new Date().getTime() > localStorage["newAmazonCheckAt"]) {
		chrome.tabs.query({
			url: "<all_urls>"
		}, function (foundTabs) {
			for (i = 0; i < foundTabs.length; i++) {
				var urlSplit = foundTabs[i].url.match( /\w*:\/\/.*amazon\.\w*\/(.*)/ );
				if ( !!urlSplit && foundTabs[i].status == "loading" ) {
					if (urlSplit[1].indexOf("rocketbeans") != -1) {
						console.log("already beans!");
						var amazonNotification = new Notification("Ich glaube du bist auf Amazon...", {
							icon: '/img/icon/80/recorded.png',
							body: "...und... du hast bereits den RocketBeans-Ref-Link benutzt. Spitzenklasse, ich lass dich die nächsten 24 Stunden in Ruhe."
						});
					} else {
						var amazonNotification = new Notification("Ich glaube du bist auf Amazon...", {
							icon: '/img/icon/80/recorded.png',
							body: "Aber ohne RocketBeans-Power! Zumindest der URL zu urteilen - soll ich f"+unescape("%FC")+"r dich die Startseite mit RocketBeans-Ref-Link "+unescape("%F6")+"ffnen?"
						});
						amazonNotification.onclick = changeAmazonTab;
						amazonTabID = foundTabs[i].id;
					}
					localStorage["newAmazonCheckAt"] = new Date().getTime() + 24 * 60 * 60;
				}
			}
		});
	}
}

chrome.tabs.onUpdated.addListener(detectAmazonTab);
