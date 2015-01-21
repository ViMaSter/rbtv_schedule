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
				if (confirm("RocketBeans.TV ist live!\nEinschalten?")) {
					var newURL = "http://www.twitch.tv/rocketbeanstv";
					chrome.tabs.create({ url: newURL });
				}
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

window.onload = beansAreLive;
setInterval(beansAreLive, 6000);