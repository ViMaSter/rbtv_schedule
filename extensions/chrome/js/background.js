////
/// localStorage helper functions
//// 
window.showArchive = {
	set: function (obj) {
		try {
			localStorage["rb_showArchive"] = JSON.stringify(obj);
		} catch (e) {
			localStorage["rb_showArchive"] = JSON.stringify([]);
		}
	},
	get: function () {
		var returner = null;
		try {
			returner = JSON.parse(localStorage["rb_showArchive"]);
		} catch (e) {
			returner = JSON.parse( {} );
		}
		return returner;
	}
};

window.settings = {
	/*
		Usage:
		Overwrite the complete settings using only one parameter
		Set a certain setting using the key and value pair
	 */
	set: function (objOrKey, value) {
		if (typeof value == "undefined") {
			try {
				localStorage["rb_settings"] = JSON.stringify(objOrKey);
			} catch (e) {
				localStorage["rb_settings"] = {};
			}
		} else {
			try {
				var tmpSettings = settings.get();
					tmpSettings[objOrKey] = value;
				settings.set(tmpSettings);
			} catch (e) {
			}
		}
	},
	get: function () {
		var returner = null;
		try {
			returner = JSON.parse(localStorage["rb_settings"]);
		} catch (e) {
			returner = {};
		}
		return returner;
	}
};

////
/// Parser and tool-specific helper functions
//// 
function orderShowsByBegin(a, b) {
	var timeA = new Date(parseicsDate(a.dtstart[0].value, a.dtstart[0].params));
	var timeB = new Date(parseicsDate(b.dtstart[0].value, b.dtstart[0].params));
	if ( timeA == timeB ) {
		return 0;
	}

	return ( timeA < timeB ) ? -1 : 1;
}

// prepares the icsObjects to eliminate unnecessary info
function generateJSON(icsEvents) {
	icsEvents.sort(orderShowsByBegin);

	var availableShows = {
		"sent": [],
		"now": [],
		"comingup": []
	};

	for (i = 0; i < icsEvents.length; i++) {
		var date = parseicsDate(icsEvents[i].dtstart[0].value, icsEvents[i].dtstart[0].params);
		if ( date < new Date() ) {
			availableShows.sent.push({
				"id": icsEvents[i].uid[0].value,
				"title": icsEvents[i].summary[0].value,
				"date": date
			});
		} else {
			availableShows.comingup.push({
				"id": icsEvents[i].uid[0].value,
				"title": icsEvents[i].summary[0].value,
				"date": date
			});
		}
	}

	availableShows.now.push( availableShows.sent.pop() );

	return availableShows;
}



if ( Object.keys(settings.get()).indexOf("live_alert") <= -1) {
	settings.get()["live_alert"] = 1;
}

function setBrowserIcon(state) {
	switch (state) {
		case -1:
			chrome.browserAction.setIcon({path: '/img/icon/32/offline.png'});
			break;
		case 0:
			chrome.browserAction.setIcon({path: '/img/icon/32/recorded.png'});
			break;
		case 1:
			chrome.browserAction.setIcon({path: '/img/icon/32/live.png'});
			break;
	}
}

function between(x, min, max) {
  return x >= min && x <= max;
}

function isLiveColor(r, g, b) {
	return (
		between(r, 150, 255)
		&&
		between(g, 0, 60)
		&&
		between(b, 0, 60)
	);
}

function updateSchedule() {
	// ajax-request for .ics-file
	var url = "https://www.google.com/calendar/ical/h6tfehdpu3jrbcrn9sdju9ohj8%40group.calendar.google.com/public/basic.ics";
	var data = "";
	var method = 'GET';
	var async = true;

	doAjax(url, method, async, function (content) {
		if (this.readyState==4 && this.status==200) {		
			icalParser.icals = [];
			icalParser.parseIcal(this.responseText);

			// update the schedule only if the ajax-content is parsable and not empty
			if (icalParser.icals[0].events.length > 0) {
				showArchive.set(generateJSON(icalParser.icals[0].events));
			}
		}
	}, data);
}

var beansAreLiveState = -2;
function beansAreLive() {
	var ctx = document.querySelector("canvas").getContext("2d");
	var imgObj = new Image();
	imgObj.crossOrigin = "Anonymous";
	imgObj.onload = function () {
		ctx.drawImage(this, 0, 0);
		var imgData = ctx.getImageData(43, 34, 1, 1);
			imgData = imgData.data;
		beansAreLiveCallback( isLiveColor(imgData[0], imgData[1], imgData[2]) ? 1 : 0 );
	};
	imgObj.onerror = function () {
		beansAreLiveCallback(-1);
	};
	imgObj.src = "http://static-cdn.jtvnw.net/previews-ttv/live_user_rocketbeanstv-1280x720.jpg?time="+(new Date().getTime());
}

var isLiveNotification = 0;
function beansAreLiveCallback(response) {
	setBrowserIcon(response);
	switch (response) {
		case -1:
			// offline
			
			break;
		case 0:
			// ondemand
			
			break;
		case 1:
			// live
			if (beansAreLiveState != -2 && beansAreLiveState != 1 && settings.get()["live_alert"]==1) {
				chrome.tabs.query({
					url: "*://*.twitch.tv/rocketbeanstv*"
				}, function (foundTabs) {

					var showCache = showArchive.get();
					var title = showCache.now[0].title.replace(/\[\w\]\s*/, "");

					if (foundTabs.length > 0) {
						if (showCache.now.length >= 1) {
							currentShowString = 'Und zwar mit "'+title+'"! ';
						}

						var isLiveNotification = new Notification("Hey, die Beans sind live!", {
							icon: '/img/icon/80/live.png',
							body: currentShowString+"Aber du bist schon auf Twitch, also anklicken und zum Tab wechseln!"
						});
						isLiveNotification.onclick = function () {
							chrome.tabs.update(foundTabs[0].id, {selected: true});
						};

					} else {
						// twitch is not open
						if (confirm("RocketBeans.TV ist live!\nLaut Plan dran: \""+title+"\". \n\nEinschalten?")) {
							var newURL = "http://www.twitch.tv/rocketbeanstv";
							chrome.tabs.create({ url: newURL });
						}
					}
				});
			}
			break;
	}
	if (beansAreLiveState != response) {
		console.log("Change from %s to %s", beansAreLiveState, response);
	} else {
		console.log("Same %s.", beansAreLiveState);
	}
	beansAreLiveState = response;
}

window.onload = function () {
	beansAreLive();
	updateSchedule();
};

setInterval(beansAreLive, 6 * 1000);
setInterval(updateSchedule, 5 * 60 * 1000);