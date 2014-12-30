var app = {
	init : function() {
		console.log(".");
		setTimeout(function() {
			console.log("!");
			app.shareIn();
		}, 3000);
	},
	showNav:function(){
		$(".navbar").show();
		$(".navbar").addClass("navshow");
		$(".navbar").removeClass("navhide");
		//$(".navbar").removeClass("navshow");
	},
	hideNav : function() {
		$(".navbar").removeClass("navshow");
		$(".navbar").addClass("navhide");
		$(".navbar").fadeOut("slow");
	},
	showSearch:function(){
		$(".searchbar").show();
		$(".searchbar").addClass("searchshow");
		setTimeout(function() {
			$(".searchbar").removeClass("searchshow");
		}, 500);
	},
	hideSearch:function(){
		$(".searchbar").removeClass("searchshow");
		$(".searchbar").addClass("searchhide");
		setTimeout(function() {
			$(".searchbar").hide();
			$(".searchbar").removeClass("searchhide");
		}, 500);
	},
	share:function(){
		app.shareOut();
	},
	shareOut:function(){
		$(".share").removeClass("rolein");
		$(".share").addClass("roleout");
		setTimeout(function() {
			$(".share").hide();
			$(".share").removeClass("roleout");
		}, 500);
		
	},
	shareIn:function(){
		$(".share").show();
		$(".share").addClass("rolein");
	},
	like:function(){
		$(".like").show();
		$(".like").addClass("heartbeet");
		setTimeout(function() {
			$(".like").hide();
			$(".like").removeClass("heartbeet");
		}, 1000);
	},
	touchStart:function(event){
		//$(".flight-controll").html(event.touches[0].pageY);
		app.startTouch = event.touches[0].pageY;
	},
	touchMove:function(event){
		$(".flight-controll").html(event.touches[0].pageY - app.startTouch);
		if(event.touches[0].pageY - app.startTouch < 0){
			app.hideNav();
		}else{
			app.showNav();
		}
	},
};
