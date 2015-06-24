function numberWithCommas(x) {
	//return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	if (x < 1000) {
		return x;
	} else if (x < 1000000) {
		return Math.round(x / 1000) + "k";
	} else {
		return Math.round(x / 1000000) + "M";
	}
}

var app = {
	init : function() {
		console.log(".");
		app.searchModeV = "";
		app.vizTpl = Handlebars.compile($("#viz-tpl").html());
		app.preloadGetter = app.preloadRegularGetter;
				
		setInterval(function() {
			if ($(".real").css("display") !== "none") {
				app.preload();
			}

		}, 700);

		document.addEventListener('deviceready', this.onDeviceReady, false);

		$(".searchBTN").on("click", function() {
			$(".searchBTN").css("background-color", "#fff");
		});

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
				service.register_notifications(e.regid, menu.getDigestInfo(), function(d) {
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
	simpleZoom : function(that) {
		console.log("zoom", $("body").scrollTop());
		app.mode = "zoom";
		app.lastScrollPosition = $(".feedContainer").scrollTop();
		//window.location = "zoomer.html?"+($(that).children("img").attr("src"));
		//$(".header").hide();
		$(".real").fadeOut();
		$(".shadow").show();
		$(".shadow").animate({
			opacity : 1
		}, 1500);
		$(".zoomer").show();
		$(".zoomer-close").show();

		$(".zoomer").panzoom({
			minScale : 1,
			maxScale : 2
		});
		$(".zoomer img").css("max-width", "");

		$(".zoomer img").attr("src", $(that).children("img").attr("src"));
		var initScale = 1;

		console.log("!", $(".zoomer").panzoom("getMatrix"));
		$(".zoomer").panzoom("setMatrix", [initScale, 0, 0, initScale, 0, 0]);
		//$(".container").panzoom("setTransform","translate(-500px -100px)");

		$(".zoomer img").load(function() {
			var h = (window.innerHeight - $(this).height()) / 2;
			$(this).css("margin-top", h + "px");
			$(this).animate({
				opacity : 1
			}, 700);
		});

		that = $(".zoomer");
		wiw = window.innerWidth;
		wih = window.innerHeight;
		iw = that.width() / 2;
		ih = $(".zoomer img").height();
		wihOih = wih / ih;
		h = (wih - ih) / 2;
		wihMihMh = wih - ih - h;

		scale = 1;
		sx = 1;
		sy = 1;
		$(".zoomer").on('panzoompan', function(e, panzoom, x, y) {
			scale = that.panzoom("getMatrix")[0] * 1;
			sx = iw * (scale - 1);
			sy = ih * (scale - 1) / 2;

			//$(".zoomer-close").html('<ul><li>'+scale+'</li><li>'+x+'</li><li>'+tx+'</li></ul>');
			//$(".zoomer-close").html('<ul><li>' + h + '</li><li>' + (y - sy ) + '</li><li>' + sy + '</li><li>' + wih + '</li></ul>');

			//limitations on panning:

			if (x > sx) {
				that.panzoom("pan", sx, y);
			} else if (x < -sx) {
				that.panzoom("pan", -sx, y);
			}

			if (scale < wihOih) {
				if (y + h - sy < 0) {
					that.panzoom("pan", x, sy - h);
				} else if (y + sy > wihMihMh) {
					that.panzoom("pan", x, wihMihMh - sy);
				}
			} else {
				if (y - sy > -h) {
					that.panzoom("pan", x, sy - h);
				} else if (y + sy < h) {
					that.panzoom("pan", x, -sy + h);
				}
			}

		});

	},
	simpleZoomOut : function() {

		$(".shadow").animate({
			opacity : 0
		}, 700, function() {
			$(".shadow").hide();
		});
		$(".real").fadeIn();
		//$(".header").show();
		$(".zoomer").fadeOut();
		$(".zoomer-close").hide();
		$(".zoomer img").css("opacity", 0);
		$(".zoomer img").attr("src", "");

		$(".feedContainer").scrollTop(app.lastScrollPosition);

	},
	back : function(e) {
		if (app.mode === "zoom") {
			app.simpleZoomOut();
			app.mode = "";
		} else if (menu.on) {
			menu.back();
		} else if (app.mode == "favorites") {
			app.hideFavorites();
		} else {
			navigator.app.exitApp();
		}

	},
	share : function(id) {
		var title = "";
		//var id = app.shareId;

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
			//viz.background_color = "#f39de1";
			
			w = window.innerWidth -42;
			fs = 0;
			if($(".bigblock").css("font-size")){
				fs = $(".bigblock").css("font-size").replace("px","")*1;
			}
			if(fs>0){
				r = w/fs ;
				console.log(r);
				$(".bigblock .image").css("width",r+"em");
				$(".bigblock .image").css("height",r+"em");
			}
			
			
			//console.log(w,fs);
			// viz.pre_height = w;
			// viz.pre_width = w;
			
			if (first) {
				$('.viz-container').prepend(app.vizTpl(viz));
			} else {
				$('.viz-container').append(app.vizTpl(viz));
			}

		}
	},
	toggleSearch : function() {
		if (app.searchModeV === "") {
			app.searchMode("request");
		} else {
			app.searchMode("");
		}

	},
	searchMode : function(mode) {
		console.log("mode",mode);
		$(".searchNoResult").hide();
		switch (mode) {
		case "request":
			app.lastScrollPosition = $(".feedContainer").scrollTop();
			app.presearch = $('.viz-container').html();
			console.log("lastScrollPosition",app.lastScrollPosition);
			app.presearchBuffer = app.buffer;
			
			$(".searchBTN").attr("src", "img/close.gif");
			app.showSearch();
			break;
		case "result":
			app.buffer = [];
			$('.viz-container').html("");
			$(".searchBTN").attr("src", "img/close.gif");
			
			app.hideSearch();
			break;
		case "no-result":
			$(".searchBTN").attr("src", "img/close.gif");
			app.showSearch();
			$(".searchNoResult").fadeIn();
			break;
		default:
			$(".searchBTN").attr("src", "img/search.gif");
			$(".searchNoResult").fadeOut();
			$('.viz-container').html(app.presearch);
			app.buffer = app.presearchBuffer;
			
			app.hideSearch(function(){$(".feedContainer").scrollTop(app.lastScrollPosition);});
		//do something
		}
		app.searchModeV = mode;
	},
	showSearch : function() {
		$(".real").fadeOut();
		$(".searchbar").show();
		$("#searchTextInput").focus();
		$(".searchbar").addClass("searchshow");
		setTimeout(function() {
			$(".searchbar").removeClass("searchshow");
		}, 500);
		// app.presearch = null;
		// app.presearchBuffer = null;
	},
	hideSearch : function(f) {
		$("#searchTextInput").blur();

		$(".searchbar").removeClass("searchshow");
		$(".searchbar").addClass("searchhide");
		setTimeout(function() {
			$(".searchbar").hide();
			$(".searchbar").removeClass("searchhide");
			$(".real").fadeIn();
			if(f){
				console.log("f");
				f();
			}
		}, 500);

		
	},
	search : function(formObj) {
		if ($("#searchTextInput").val() === "") {
			app.searchMode("");
			return;
		}

		

		service.quary(formObj, function(res) {
			console.log("search results",res);
			if (res.length > 0) {
				app.searchMode("result");
				res.forEach(function(viz) {
					//app.buffer.push(viz.id);
					app.showViz(viz);
				});
			} else {
				app.searchMode("no-result");

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
	preloadGetter : null,
	preloadRegularGetter : function(prev) {
		service.load(prev, function(vizs) {
			console.log(vizs);
			vizs.forEach(function(viz){
				app.showViz(viz);
			});
			
			app.preload();
		});
	},
	preloadFavoritesGetter : function(prev) {
		service.favorites(prev, "mobile_" + localStorage.device_uuid, function(res) {
			res.forEach(function(viz) {
				setTimeout(function() {
					app.showViz(viz);
				}, 500);
			});
			app.preload();
		});
	},
	preload : function() {
		//console.log("preload");

		//$(".search").animate({top:$("body").scrollTop()},1000);//css("top",$("body").scrollTop());

		app.recordView();
		var scrolloc = $(".viz-container").height() - $(".feedContainer").scrollTop();
		console.log("==", scrolloc);
		//$("#scrollll").text(scrolloc);
		//$(".flight-controll").html(app.mode);

		var prev = $(".vizContainer").last().attr('prev');
		if (app.mode == "favorites") {
			prev = $(".vizContainer").last().attr('viz_id');
		}

		if (scrolloc < 5000 && app.loading.indexOf(prev) == -1) {
			console.log("preload!", scrolloc);
			app.loading.push(prev);

			app.preloadGetter(prev);
		}
	},
	goTop : function() {
		$(".real").scrollTop(0);
	},
};
