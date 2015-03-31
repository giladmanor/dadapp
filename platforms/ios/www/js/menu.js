var menu = {
	on : false,
	show : function(code) {
		$(".menu").show();
		$(".menu").removeClass("menu_out");
		$(".menu").addClass("menu_in");
		setTimeout(function() {
			$(".menu").removeClass("menu_in");
		}, 600);
		menu.on = true;

		if (code === "subscriptions") {
			menu.showSubscriptions();
		} else if (code === "favorites") {
			menu.showFavorites();
		} else {
			//do nothing
		}

	},
	hide : function() {
		$(".menu").addClass("menu_out");
		setTimeout(function() {
			$(".menu").hide();
		}, 500);
		menu.on = false;
	},
	showProfile : function() {
		//$(".menu-title-icon").html('<i class="fa fa-bars"></i>');
		var title = '<i class="fa fa-user"></i> Profile';
		menu.setSubMenu(title);
		$(".menu-options").hide();
		$(".menu-profile").fadeIn();
	},
	showSubscriptions : function() {
		menu.loadSuggestions();
		if (localStorage.user_subscriptions != null) {
			menu.subscriptions = localStorage.user_subscriptions.split(",");
		}

		//$(".menu-title-icon").html('<i class="fa fa-bars"></i>');
		var title = 'Subscriptions';
		menu.setSubMenu(title);
		$(".menu-options").hide();
		$(".menu-subscriptions").fadeIn();

	},
	showFavorites : function() {

	},
	back : function() {
		$(".menu-profile").hide();
		$(".menu-subscriptions").hide();
		// $(".menu-options").fadeIn();
		// if ($(".menu-sub").html() != "") {
		// menu.setSubMenu("");
		// // $(".menu-title-icon").html('<img class="logo" src="img/logo.png">');
		// } else {
		// menu.hide();
		// }
		menu.hide();
	},
	setSubMenu : function(title) {
		if (title != "") {
			title = title;
		}
		$(".menu-sub").html(title);
	},

	///////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////

	subscriptions : [],
	suggestions : [],
	suggestions_ref : {},

	getDigestInfo : function() {
		if (menu.subscriptions.length == 0 && localStorage.user_subscriptions != null) {
			menu.subscriptions = localStorage.user_subscriptions.split(",");
		}
		var o = {
			subscriptions : menu.subscriptions,
			last_updated_at : new Date()
		};
		return o;
	},

	removeSubscription : function(key) {
		menu.subscriptions.splice(menu.subscriptions.indexOf(key), 1);
		menu.populateSubscriptions();
		menu.saveSubscriptions();

	},

	addSubscription : function(key) {
		if (key != "") {
			menu.subscriptions.push(key);
			menu.populateSubscriptions();
			menu.saveSubscriptions();
			$(".menu-subscriptions-suggestions").fadeOut();
			$("#menu-subscriptions-add-input").val("");
		}

	},
	saveSubscriptions : function() {
		localStorage.user_subscriptions = menu.subscriptions;
		service.register_notifications(localStorage.android_id, menu.getDigestInfo(), function(d) {
		});
	},

	subscriptionLabel : function(key) {
		if (menu.suggestions_ref[key] != null) {
			return menu.suggestions_ref[key].name;
		} else {
			return key;
		}
	},
	subscriptionTag : function(key) {
		if (menu.suggestions_ref[key] != null) {
			return '<img class="menu-avatar" src="' + menu.suggestions_ref[key].avatar + '"/>';
		} else {
			return '<i class="fa fa-tag"></i>';
		}
	},
	subscriptionKey : function(label) {
		if (menu.suggestions_ref[label] != null) {
			return menu.suggestions_ref[label].twitter;
		} else {
			return label;
		}
	},

	loadSuggestions : function() {
		if (menu.suggestions.length == 0) {
			service.suggestions(function(res) {
				menu.suggestions = Object.keys(res.result);
				menu.suggestions_ref = res.result;
				menu.populateSubscriptions();
			});
		}
	},
	suggestionFilter : function(key) {
		$(".menu-subscriptions-suggestions").fadeIn();
		$(".menu-subscriptions-suggestions").html("");

		var regex = new RegExp(key.toLowerCase().split(" ").join("|"));
		result = $.grep(menu.suggestions, function(s) {
			return s.toLowerCase().match(regex);
		});

		result.forEach(function(key) {
			if (menu.subscriptions.indexOf(key) < 0) {
				$(".menu-subscriptions-suggestions").append("<li onclick='menu.addSubscription(\"" + key + "\")'>" + menu.subscriptionTag(key) + " " + menu.subscriptionLabel(key) + "</li>");
			}

		});
	},

	populateSubscriptions : function() {
		$(".menu-subscriptions-list").html("");
		menu.subscriptions.forEach(function(key) {
			if (menu.suggestions.indexOf(key) > -1) {
				$(".menu-subscriptions-list").append("<li >" + menu.subscriptionTag(key) + " " + menu.subscriptionLabel(key) + "<i class='fa fa-minus-square menu-remove' onclick='menu.removeSubscription(\"" + key + "\")'></li>");
			}
			//var item = "<li>" + menu.subscriptionTag(datum) + ' ' + datum + ' <i class="fa fa-minus-square menu-remove" onclick="menu.removeSubscription(\'' + datum + '\')"></i></li>';
		});
	},
};
