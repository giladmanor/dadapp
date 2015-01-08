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
		document.addEventListener("backbutton", app.back, true);

		localStorage.device_uuid = device.uuid;
		service.login(localStorage.device_uuid, localStorage.device_uuid, function(d) {
			console.log("logged in! " + d.user_id);
		});

	},
	back : function(e) {
		if (app.mode === "zoom") {
			app.zoomOut();
			app.mode="";
		}else{
			navigator.app.exitApp();
		}

	},
	centerImage : function(id) {
		

	},
	zoomOut:function(){
		$(".zoom").fadeOut();
		app.shareOut();
		//app.backOut();
	},
	zoomIn : function(id) {
		app.mode = "zoom";
		$(".zoom").html($("#image_container_" + id).html());
		// $("#image_container_"+id).
		$(".zoom").fadeIn();
		
		var image = $(".zoom img").last();

		setTimeout(function() {
			var h = $(".zoom").height() - image.height();
			var w = $(".zoom").width() - image.width();
			image.css("margin-top","-"+h+"px");
			image.css("margin-left",w+"px");
			$(".flight-controll").html("< "+h+","+w+">");
			if(h<w){
				//image.css("max-width",$(".zoom").width());
			}else{
				//image.css("max-height",$(".zoom").height());
			}
		}, 200);

		app.shareIn();
		//app.backIn();

	},
	pointDistance : function(event) {
		if (event.touches.length == 2) {
			return Math.sqrt(Math.pow(event.touches[0].pageX - event.touches[1].pageX, 2) + Math.pow(event.touches[0].pageY - event.touches[1].pageY, 2));
		} else {
			return 1;
		}
	},
	zoomStart:function(event){
		if (event.touches.length == 2) {
			app.zoom_pivot = app.pointDistance(event);
		}
	},
	zoomMove:function(event){
		var image = $(".zoom img").last();
		if (event.touches.length == 2) {
			var s = app.pointDistance(event) / app.zoom_pivot;
			image.css("transform", "scale(" + s + "," + s + ")");
		}
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
