function detectAmazonTab() {
	localStorage["newAmazonCheckAt"] = typeof localStorage["newAmazonCheckAt"] == "undefined" ? -1 : localStorage["newAmazonCheckAt"];
	
	if (new Date().getTime() > localStorage["newAmazonCheckAt"]) {
		chrome.tabs.query({
			url: "<all_urls>"
		}, function (foundTabs) {
			for (i = 0; i < foundTabs.length; i++) {
				var urlSplit = foundTabs[i].url.match( /\w*:\/\/.*amazon\.\w*\// );
				if ( !!urlSplit ) {
					if (foundTabs[i].active) {
						if (urlSplit.status == "loading" && urlSplit[0].indexOf("rocketbeans") != -1) {
							console.log("already beans!");
						} else {
							if (true /* want to watch twitch now?-check*/) {
								console.log("beans!");
							} else {
								console.log("no beans!");
							}
							localStorage["newAmazonCheckAt"] = new Date().getTime() + 24 * 60 * 60;
						}
					}
				}
			}
		});
	}
}

chrome.tabs.onUpdated.addListener(detectAmazonTab);
