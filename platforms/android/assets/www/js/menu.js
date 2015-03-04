var menu = {
	on : false,
	show : function() {
		$(".menu").show();
		$(".menu").removeClass("menu_out");
		$(".menu").addClass("menu_in");
		setTimeout(function() {
			$(".menu").removeClass("menu_in");
		}, 600);
		menu.on = true;
	},
	hide : function() {
		$(".menu").addClass("menu_out");
		setTimeout(function() {
			$(".menu").hide();
		}, 500);
		menu.on = false;
	},
	showProfile : function() {
		$(".menu-title-icon").html('<i class="fa fa-bars"></i>');
		var title = '<i class="fa fa-user"></i> Profile';
		menu.setSubMenu(title);
		$(".menu-options").hide();
		$(".menu-profile").fadeIn();
	},
	showSubscriptions : function() {
		if (localStorage.user_subscriptions != null) {
			menu.subscriptions = localStorage.user_subscriptions.split(",");
		}

		$(".menu-title-icon").html('<i class="fa fa-bars"></i>');
		var title = '<i class="fa fa-th-list"></i> Subscriptions';
		menu.setSubMenu(title);
		$(".menu-options").hide();
		$(".menu-subscriptions").fadeIn();
		menu.populateSubscriptions();
	},
	showFavorites : function() {

	},
	back : function() {
		$(".menu-profile").hide();
		$(".menu-subscriptions").hide();
		$(".menu-options").fadeIn();
		if ($(".menu-sub").html() != "") {
			menu.setSubMenu("");
			$(".menu-title-icon").html('<img class="logo" src="img/logo.png">');
		} else {
			menu.hide();
		}
	},
	setSubMenu : function(title) {
		if (title != "") {
			title = " > " + title;
		}
		$(".menu-sub").html(title);
	},
	plusSubscription : function() {
		if ($(".menu-subscriptions-add").css("display") == "none") {
			$("#menu-subscriptions-add-input").val("");
			$(".menu-subscriptions-add").fadeIn();
			$(".menu-subscriptions-list").hide();
			menu.getSuggestions();
		} else {
			menu.addSubscription($("#menu-subscriptions-add-input").val());

		}

	},
	subscriptions : [],
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
	removeSubscription : function(name) {
		menu.subscriptions.splice(menu.subscriptions.indexOf(name), 1);
		menu.saveSubscriptions();
		menu.populateSubscriptions();
	},
	addSubscription : function(name) {
		if (name != "") {
			menu.subscriptions.push(name);
			menu.populateSubscriptions();
			menu.saveSubscriptions();
			$(".menu-subscriptions-add").hide();
			$(".menu-subscriptions-list").fadeIn();
		}

	},
	saveSubscriptions : function() {
		localStorage.user_subscriptions = menu.subscriptions.join();
		service.register_notifications(localStorage.android_id, function(d) {

		});
	},
	subscriptionTag : function(label) {
		if (label.indexOf("@") == 0) {
			return '<i class="fa fa-twitter"></i>';
		} else {
			return '<i class="fa fa-tag"></i>';
		}
	},
	populateSubscriptions : function() {
		$(".menu-subscriptions-list").html("");
		if (menu.subscriptions.length == 0) {
			menu.plusSubscription();
		} else {
			menu.subscriptions.forEach(function(datum) {
				var item = "<li>" + menu.subscriptionTag(datum) + ' ' + datum + ' <i class="fa fa-minus-square menu-remove" onclick="menu.removeSubscription(\'' + datum + '\')"></i></li>';
				$(".menu-subscriptions-list").prepend(item);
			});
		}
	},
	suggestions : [],
	getSuggestions : function() {
		if (menu.suggestions.length == 0) {
			service.suggestions(function(res) {
				menu.suggestions = res.result;
			});
		}
	},
	suggestionFilter : function(key) {
		$(".menu-subscriptions-suggestions").html("");
		var regex = new RegExp(key.toLowerCase().split(" ").join("|"));

		result = $.grep(menu.suggestions, function(s) {
			return s.toLowerCase().match(regex);
		});

		result.forEach(function(s) {
			$(".menu-subscriptions-suggestions").append("<li onclick='menu.addSubscription(\"" + s + "\")'>" + menu.subscriptionTag(s) + ' ' + s + "</li>");
		});

	},
};
