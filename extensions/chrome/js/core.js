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
/// Constants
//// 
var localizedDays = {
	"days": ["montag", "dienstag", "mittwoch", "donnerstag", "freitag", "samstag", "sonntag"]
};

var classes = {
	"Live": {
		content: "Live!",
		regex: /^\[L\]\s*/g
	},
	"Neu": {
		content: "Neu!",
		regex: /^\[N\]\s*/g
	},
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

// converts a prepared event object to HTML
function renderEvent(eventObj) {
	var today = new Date();
	eventObj.date = new Date(eventObj.date);
	var eventDate = new Date(eventObj.date);	// clone the date, since we modify it to check if it's still "today"

	var tagClass = "";
	var tagContent = "";

	for (key in classes) {
		if ( classes[key].regex.test(eventObj.title) ) {
			tagClass = key;
			break;
		}
	}

	return '<tr><td class="tag {0}">{1}</td><td class="day">{2}</td><td class="time">{3}</td><td class="title">{4}</td></tr>'.format(
		tagClass,
		tagClass == "" ? "" : classes[tagClass].content,
		((today.setHours(0, 0, 0, 0) == eventDate.setHours(0, 0, 0, 0)) ? "heute" : localizedDays.days[eventObj.date.getDay()] ).capitalizeFirstLetter(),
		eventObj.date.getHours().pad(2) + ":" + eventObj.date.getMinutes().pad(2),
		eventObj.title.replace(/^\[\w\s*\]/, "")
	);
}

// loops over the prepared events, generates the HTML and renders it in the window
function renderJSONContent(content) {
	document.querySelector("body").className = "";

	for (var timing in content) {
		// reset
		document.querySelector("table.preview tbody."+timing).innerHTML = "";

		// push every event available
		for (var i = 0; i < content[timing].length; i++) {
			var show = content[timing][i];
			document.querySelector("table.preview tbody."+timing).innerHTML += renderEvent(show);
		}

		// set the size of the body for the opening animation
		document.querySelector("body").style.height = (document.querySelector("table").offsetHeight + 50) + "px";
		document.querySelector("body").style.width = document.querySelector("table").offsetWidth + "px";
	}
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

function initalLoad(content) {
	// only show the specified amount of shows
	var shownShows = showArchive.get();
	var remaining = settings.get()["showRequest_limit"];

	if (settings.get()["showRequest_startAt"] < 0) {	
		shownShows.sent = shownShows.sent.slice( shownShows.sent.length+settings.get()["showRequest_startAt"] );
		remaining -= shownShows.sent.length;
	} else {
		shownShows.sent = [];
	}

	if (settings.get()["showRequest_startAt"] <= 0 && remaining > 0) {
		shownShows.now = shownShows.now;
		remaining -= shownShows.now.length;
	} else {
		shownShows.now = [];
	}

	if (remaining > 0) {
		shownShows.comingup = shownShows.comingup.slice( 0, remaining );
	} else {
		shownShows.comingup = [];
	}

	renderJSONContent(shownShows);
}

////
/// DOM-events
//// 
function toggleAlarm() {
	settings.set("live_alert", settings.get()["live_alert"] == 1 ? 0 : 1);

	document.querySelector(".buttons .reminder").className = settings.get()["live_alert"] == 1 ? "reminder on" : "reminder off";
}

var tabURLs = {
	"web": 'http://rocketbeans.tv/',
	"twitch": 'http://www.twitch.tv/rocketbeanstv',
	"amazon": 'http://www.amazon.de/?_encoding=UTF8&camp=1638&creative=19454&linkCode=ur2&site-redirect=de&tag=rocketbeansde-21',
	"reddit": 'http://www.reddit.com/r/rocketbeans'
};

function openTab(type) {
	if (Object.keys(tabURLs).indexOf(type) > -1) {
		chrome.tabs.create({url: tabURLs[type]});
	}
}

document.addEventListener('DOMContentLoaded', function() {
	initStorage();

	// update UI with usersettings
	document.querySelector(".buttons .reminder").className = settings.get()["live_alert"] == 1 ? "reminder on" : "reminder off";

	// bind DOM-events
	document.querySelector(".buttons .web").onclick = function () { openTab("web"); };
	document.querySelector(".buttons .twitch").onclick = function () { openTab("twitch"); };
	document.querySelector(".buttons .amazon").onclick = function () { openTab("amazon"); };
	document.querySelector(".buttons .reddit").onclick = function () { openTab("reddit"); };
	document.querySelector(".buttons .reminder").onclick = function () { toggleAlarm(); };

	initalLoad();
});