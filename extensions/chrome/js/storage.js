function clearStorage() {
	delete localStorage["rb_settings"];
	delete localStorage["rb_showArchive"];
}

function initStorage() {
	if (Object.keys(localStorage).indexOf("rb_settings") == -1 ) {
		settings.set ( {
			"live_alert": 1,
			"showRequest_startAt": -3,
			"showRequest_limit": 13
		} );
	}

	if (Object.keys(localStorage).indexOf("rb_showArchive") == -1 ) {
		showArchive.set( [] );
	}
}