function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var app = {
	init : function() {
		console.log(".");
		app.vizTpl = Handlebars.compile($("#viz-tpl").html());

		service.load("top", function(viz) {
			app.showViz(viz);
			//app.zoom(viz.id);
			app.preload();
		});

		document.addEventListener('deviceready', this.onDeviceReady, false);

	},
	onDeviceReady : function() {
		//document.addEventListener("backbutton", app.back, true);
		document.addEventListener("backbutton", app.back, true);

		localStorage.device_uuid = device.uuid;
		service.login(localStorage.device_uuid, localStorage.device_uuid, function(d) {
			console.log("logged in! " + d.user_id);
		});

		window.plugins.webintent.getUri(function(url) {
			if (url !== "" && url != null) {
				url = url.toLowerCase();
				id = "top";
				if (url.indexOf("dadaviz.com/i/") > -1) {
					id = url.split("dadaviz.com/i/")[1];

				}
				//alert(id);
				if (id != "undefined") {
					service.record_open_url(id);
					service.load(id, function(viz) {
						app.showViz(viz, true);
					});
				}

			}
		});

		var pushNotification = window.plugins.pushNotification;
		pushNotification.register(function(result) {
			//alert('pushNotification Success! Result = ' + result);
		}, function(error) {
			//alert(error);
		}, {
			"senderID" : "321817843821",
			"ecb" : "app.onNotificationGCM"
		});

	},
	onNotificationGCM : function(e) {
		switch( e.event ) {
		case 'registered':
			if (e.regid.length > 0) {
				console.log("Regid " + e.regid);
				localStorage.android_id = e.regid;
				service.register_notifications(e.regid, function(d) {
					//alert("register success");
				});
			}
			// var say = "";
			// Object.keys(e).forEach(function(i) {
			// say += " " + i;
			// });
			// alert(say);

			break;

		case 'message':

			var id = e.payload.viz_id;
			service.load(id, function(viz) {
				app.showViz(viz, true);
			});

			app.pushMessageRenderer(e.payload);

			service.record_open_url(id);
			service.record_action("open_from_GCM", id);
			break;

		case 'error':
			//alert('GCM error = ' + e.msg);
			break;

		default:
			//alert('An unknown GCM event has occurred');
			break;
		}
	},
	pushMessageRenderer : function(data) {
		switch( data.type ) {
		case 'toast':
			admober.pause = data.suspend_admob || 0;
			setTimeout(function() {
				$(".toast").show();
				$(".toast").addClass("toast_in");
				$(".toast-message").html(data.toast_message);
			}, 4000);

			break;

		default:

			break;
		}
	},
	hideToast : function() {
		$(".toast").removeClass("toast_in");
		$(".toast").addClass("toast_out");
		setTimeout(function() {
			$(".toast").hide();
		}, 500);

	},
	back : function(e) {
		if (app.mode === "zoom") {
			app.zoomOut();
			app.mode = "";
		}else if(menu.on){
			menu.back();
		}else {
			navigator.app.exitApp();
		}

	},
	centerImage : function(id) {

	},
	zoomOut : function() {
		$(".zoom").fadeOut();
		app.shareOut();

	},
	zoomIn : function(id) {
		app.mode = "zoom";
		$(".zoom").html($("#image_container_" + id).html());
		//app.shareTitle = $(".zoom .vizTitle").html();
		app.shareId = id;
		// $("#image_container_"+id).
		$(".zoom").fadeIn();
		var image = $(".zoom img").last();
		//$(".flight-controll").html("<  " + $(".zoom").innerHeight() + ":::" + $(".zoom").height() + " >");
		var h = $(".zoom").innerHeight();
		var w = $(".zoom").innerWidth();
		var rp = image.height() / image.width();
		var rl = image.width() / image.height();
		setTimeout(function() {
			if (image.height() > image.width()) {
				//portrait -> adjust to width
				//$(".flight-controll").html("< P  >");
				image.animate({
					width : w,
					height : w * rp
				}, 1000);
				$(".zoom").scrollTop(w / 4);
			} else {
				//landscape -> adjust to height
				//$(".flight-controll").html("< L >");
				image.animate({
					width : h * rl,
					height : h
				}, 1000);
				$(".zoom").scrollLeft(h / 4);
			}
		}, 100);
		app.shareIn();
	},
	reservePointDistance : 1,
	pointDistance : function(event) {
		if (event.touches.length == 2) {
			app.reservePointDistance = Math.sqrt(Math.pow(event.touches[0].pageX - event.touches[1].pageX, 2) + Math.pow(event.touches[0].pageY - event.touches[1].pageY, 2));
			return app.reservePointDistance;
		} else {
			return app.reservePointDistance;
		}
	},
	zoomStart : function(event) {
		if (event.touches.length == 2) {
			app.zoom_pivot = app.pointDistance(event);
			var image = $(".zoom img").last();
			app.zoom_w = image.css("width").replace("px", "");
			app.zoom_h = image.css("height").replace("px", "");
			//$(".flight-controll").html("< "+app.zoom_h+">");
		}
	},
	zoomMove : function(event) {
		//$(".flight-controll").html("<--->");
		var image = $(".zoom img").last();
		if (event.touches.length == 2) {
			var s = app.pointDistance(event) / app.zoom_pivot;
			image.css("width", app.zoom_w * s);
			image.css("height", app.zoom_h * s);
		}
	},
	share : function() {
		var title = "";
		var id = app.shareId;

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
	showViz : function(viz, first) {
		if (app.buffer.indexOf(viz.id) == -1) {
			app.buffer.push(viz.id);
			app.loading.slice(app.loading.indexOf(viz.id), 1);
			viz.data_source_name = app.urlTrim(viz.data_source_url);
			viz.views = numberWithCommas(viz.views);
			if (first) {
				$('.viz-container').prepend(app.vizTpl(viz));
			} else {
				$('.viz-container').append(app.vizTpl(viz));
			}

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
		$("#searchTextInput").focus();
		$(".searchbar").addClass("searchshow");
		setTimeout(function() {
			$(".searchbar").removeClass("searchshow");

		}, 500);
		app.presearch = null;
		app.presearchBuffer = null;
	},
	hideSearch : function() {
		$(".searchbar").removeClass("searchshow");
		$(".searchbar").addClass("searchhide");
		setTimeout(function() {
			$(".searchbar").hide();
			$(".searchbar").removeClass("searchhide");
		}, 500);

		if (app.presearch != null) {
			$('.viz-container').html(app.presearch);
			app.buffer = app.presearchBuffer;
		}

	},
	backOut : function() {
		$(".back").removeClass("rolein");
		$(".back").addClass("roleout");
		setTimeout(function() {
			$(".back").hide();
			$(".back").removeClass("roleout");
		}, 500);

	},
	backIn : function() {
		$(".back").show();
		$(".back").addClass("rolein");
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
	like : function(id) {
		service.record_like(id, function(d) {
			$(".likable_" + d.id).html('<div><i class="fa fa-heart"></i>&nbsp<span class="likes_value">' + d.likes + '</span></div>');
		});
		$(".like").show();
		$(".like").addClass("heartbeet");
		setTimeout(function() {
			$(".like").hide();
			$(".like").removeClass("heartbeet");
		}, 1000);
	},
	search : function(formObj) {

		$(".searchLoading").fadeIn();
		app.presearch = $('.viz-container').html();
		app.presearchBuffer = app.buffer;

		service.quary(formObj, function(res) {
			$(".searchLoading").fadeOut();
			//$(".flight-controll").html( res.length);
			app.buffer = [];
			$('.viz-container').html("");

			if (res.length > 0) {
				$("#searchTextInput").blur();
				res.forEach(function(viz) {
					//app.buffer.push(viz.id);
					app.showViz(viz);
				});
			} else {
				$(".searchNoResult").fadeIn();
				setTimeout(function() {
					$(".searchNoResult").fadeOut("slow");
				}, 1000);
			}

		});
	},

	loading : [],
	buffer : [],
	recordView : function() {
		var vizCount = $(".viz-container li.vizContainer").length;
		var h = $(".viz-container").height() / vizCount;
		var vizIndex = $(".real").scrollTop() / h;
		var id = app.buffer[Math.round(vizIndex)];
		if (app.lastViewed != id) {
			app.lastViewed = id;
			service.record_view(id);
		}

		//$(".flight-controll").html( app.buffer[Math.round(vizIndex)] );
	},
	preload : function() {
		app.recordView();
		var scrolloc = $(".viz-container").height() - $(".real").scrollTop() - 5 * $(".real").height();

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
