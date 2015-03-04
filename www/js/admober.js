var admober = {
	id : "ca-app-pub-1355216097380523/8977928296",
	pause : 0,
	show : function() {

		if (admober.pause > 0) {

			setTimeout(function() {
				admober.show();
			}, admober.pause);

			admober.pause = 0;
			return;
		}

		var defaultOptions = {
			// bannerId: admobid.banner,
			// interstitialId: admobid.interstitial,
			adSize : 'SMART_BANNER',
			// width: integer, // valid when set adSize 'CUSTOM'
			// height: integer, // valid when set adSize 'CUSTOM'
			position : AdMob.AD_POSITION.BOTTOM_CENTER,
			// offsetTopBar: false, // avoid overlapped by status bar, for iOS7+
			bgColor : '#ff665a', // color name, or '#RRGGBB'
			// x: integer,		// valid when set position to 0 / POS_XY
			// y: integer,		// valid when set position to 0 / POS_XY
			isTesting : false, // set to true, to receiving test ad for testing purpose
			// autoShow: true // auto show interstitial ad when loaded, set to false if prepare/show
		};
		AdMob.setOptions(defaultOptions);
		admober.createSelectedBanner();
	},
	createSelectedBanner : function() {
		var overlap = false;
		var offsetTopBar = true;
		AdMob.createBanner({
			adId : admober.id,
			overlap : overlap,
			offsetTopBar : offsetTopBar
		});
	}
};

setTimeout(function() {
	//admober.show();
}, 7000);

