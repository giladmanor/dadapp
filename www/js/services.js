var service = {
	server:"http://dadaviz.com",
	post : function(action, data, onSuccess) {
		$.ajax({
			type : "POST",
			url : service.server + action,
			crossDomain : true,
			data : data,
			success : onSuccess,
			error : function(e) {
				alert('Something went wrong!');
				console.log(e);
			}
		});
	},
	get : function(action, onSuccess) {
		$.ajax({
			type : "GET",
			url : service.server + action,
			crossDomain : true,
			data : {},
			dataType : 'json',
			success : onSuccess,
			error : function(e) {
				alert('Something went wrong!');
				console.log(e);
			}
		});
	},
	record_view : function(id, onSuccess) {
		service.post("/api/record_view/" + id, {}, onSuccess);
	},
	record_like : function(id, onSuccess) {
		service.post("/api/viz/like/" + id, {}, onSuccess);
	},
	login : function(user, password, onSuccess) {
		service.post("/api/silantlogin", {
			username : "mobile_" + user,
			password : password
		}, onSuccess);
	},
	load:function(id,successFunc){
		service.get("/api/viz/" + id,successFunc);
	},
	quary : function(formObj) {
		var postData = $(formObj).serializeArray();
		console.log(postData[0].value);
		$(".searchLoading").addClass("shake");
		service.post("/search/viz", [postData[0].value], function(res) {
			$(".searchLoading").removeClass("shake");
			console.log(res.length);
			app.buffer = res;
			search.backToViz = app.currentViz.id;
			var removed = app.currentViz.id;
			$("#viz_" + removed).remove();
			if (res.length > 0) {
				app.buffer = res;
				var removed = app.currentViz.id;
				$("#viz_" + removed).remove();
				app.getViz(res[0].id, function() {
					$("#searchTextInput").blur();
					// console.log("BLUR");
				});
				// console.log("BLUR");
				// $("#searchTextInput").blur();

			} else {
				$(".searchNoResult").fadeIn();
				setTimeout(function() {
					$(".searchNoResult").fadeOut("slow");
				}, 1000);
			}

		});
	},
};
