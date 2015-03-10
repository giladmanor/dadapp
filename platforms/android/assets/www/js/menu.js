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
		
		if(code==="subscriptions"){
			menu.showSubscriptions();
		}else if(code==="favorites"){
			menu.showFavorites();
		}else {
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
		menu.getSuggestions();
		if (localStorage.user_subscriptions != null) {
			menu.subscriptions = localStorage.user_subscriptions.split(",");
		}

		//$(".menu-title-icon").html('<i class="fa fa-bars"></i>');
		var title = 'Subscriptions';
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
			title =  title;
		}
		$(".menu-sub").html(title);
	},
	plusSubscription : function() {
		$(".menu-subscriptions-suggestions").fadeOut();
		menu.addSubscription($("#menu-subscriptions-add-input").val());
		return;
		
		// if ($(".menu-subscriptions-add").css("display") == "none") {
			// $("#menu-subscriptions-add-input").val("");
			// $(".menu-subscriptions-add").fadeIn();
			// $(".menu-subscriptions-list").hide();
			// menu.getSuggestions();
		// } else {
			// menu.addSubscription($("#menu-subscriptions-add-input").val());
// 
		// }

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
			// $(".menu-subscriptions-add").hide();
			// $(".menu-subscriptions-list").fadeIn();
			$(".menu-subscriptions-suggestions").fadeOut();
		}

	},
	saveSubscriptions : function() {
		localStorage.user_subscriptions = menu.subscriptions.join();
		service.register_notifications(localStorage.android_id, function(d) {

		});
	},
	subscriptionTag : function(label) {
		if (menu.suggestions_ref[label]!=null) {
			return '<img class="menu-avatar" src="'+menu.suggestions_ref[label].avatar+'"/>';
		} else {
			return '<i class="fa fa-tag"></i>';
		}
	},
	subscriptionKey : function(label) {
		if (menu.suggestions_ref[label]!=null) {
			return menu.suggestions_ref[label].twitter;
		} else {
			return label;
		}
	},
	
	populateSubscriptions : function() {
		$(".menu-subscriptions-list").html("");
		if (menu.subscriptions.length == 0) {
			menu.plusSubscription();
		} else {
			menu.subscriptions.forEach(function(s) {
				$(".menu-subscriptions-list").append("<li onclick='menu.addSubscription(\"" + menu.subscriptionKey(s) + "\")'>" + menu.subscriptionTag(s) + ' ' + s + "</li>");
				
			});
		}
	},
	suggestions : [],
	suggestions_ref : {},
	getSuggestions : function() {
		if (menu.suggestions.length == 0) {
			service.suggestions(function(res) {
				menu.suggestions = Object.keys(res.result);
				menu.suggestions_ref = res.result;
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

		result.forEach(function(s) {
			$(".menu-subscriptions-suggestions").append("<li onclick='menu.addSubscription(\"" + menu.subscriptionKey(s) + "\")'>" + menu.subscriptionTag(s) + ' ' + s + "</li>");
		});

	},
};
