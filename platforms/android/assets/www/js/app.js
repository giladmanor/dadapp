var app = {
	init : function() {
		console.log(".");
		app.vizTpl = Handlebars.compile($("#viz-tpl").html());
		setTimeout(function() {
			console.log("!");

		}, 3000);

		service.load("top", function(viz) {
			app.showViz(viz);
			//app.zoom(viz.id);
			app.preload();
		});

		document.addEventListener('deviceready', this.onDeviceReady, false);
		

	},
	onDeviceReady : function() {
		//document.addEventListener("backbutton", app.back, true);
		
		localStorage.device_uuid = device.uuid;
		service.login(localStorage.device_uuid, localStorage.device_uuid, function(d) {
			console.log("logged in! " + d.user_id);
		});

	},
	back : function(e) {
		if (app.mode === "zoom") {
			$(".zoom").fadeOut();
		} 
		if(ionic){
			alert("ionic");
		}
		
		navigator.app.exitApp();
	},
	zoom : function(id) {
		app.mode = "zoom";
		$(".zoom").html($("#image_container_" + id).html());
		// $("#image_container_"+id).
		$(".zoom").fadeIn();
	},
	share : function(title, id) {
		window.plugins.socialsharing.share(title, null, null, 'http://dadaviz.com/i/' + id);
	},
	urlTrim : function(str) {
		if (!str || str === "") {
			return "dadaviz.com";
		} else {
			var res = str.replace("http://","").replace("https://","").split("/")[0];
			return res;
		}

	},
	showViz : function(viz) {
		if (app.buffer.indexOf(viz.id) == -1) {
			app.buffer.push(viz.id);
			app.loading.slice(app.loading.indexOf(viz.id), 1);
			viz.data_source_name = app.urlTrim(viz.data_source_url);
			$('.viz-container').append(app.vizTpl(viz));
		}
	},
	showNav : function() {
		$(".navbar").show();
		$(".navbar").addClass("navshow");
		$(".navbar").removeClass("navhide");
	},
	hideNav : function() {
		$(".navbar").removeClass("navshow");
		$(".navbar").addClass("navhide");
		$(".navbar").fadeOut("slow");
	},
	showSearch : function() {
		$(".searchbar").show();
		$(".searchbar").addClass("searchshow");
		setTimeout(function() {
			$(".searchbar").removeClass("searchshow");
		}, 500);
	},
	hideSearch : function() {
		$(".searchbar").removeClass("searchshow");
		$(".searchbar").addClass("searchhide");
		setTimeout(function() {
			$(".searchbar").hide();
			$(".searchbar").removeClass("searchhide");
		}, 500);
	},

	shareOut : function() {
		$(".share").removeClass("rolein");
		$(".share").addClass("roleout");
		setTimeout(function() {
			$(".share").hide();
			$(".share").removeClass("roleout");
		}, 500);

	},
	shareIn : function() {
		$(".share").show();
		$(".share").addClass("rolein");
	},
	like : function() {
		$(".like").show();
		$(".like").addClass("heartbeet");
		setTimeout(function() {
			$(".like").hide();
			$(".like").removeClass("heartbeet");
		}, 1000);
	},

	loading : [],
	buffer : [],
	preload : function() {
		var scrolloc = $(".viz-container").height() - $(".real").scrollTop() - 5 * $(".real").height();
		//$(".flight-controll").html(scrolloc);
		var prev = $(".vizContainer").last().attr('prev');
		if (scrolloc < 0 && app.loading.indexOf(prev) == -1) {
			app.loading.push(prev);

			service.load(prev, function(viz) {
				app.showViz(viz);
				app.preload();

			});
		}
	},
	goTop : function() {
		$(".real").scrollTop(0);
	},
	touchStart : function(event) {
		//$(".flight-controll").html(event.touches[0].pageY);
		app.startTouch = event.touches[0].pageY;
	},
	touchMove : function(event) {
		if (event.touches[0].pageY - app.startTouch < 0) {
			app.hideNav();
		} else {
			app.showNav();
		}
		app.preload();
	},
};
