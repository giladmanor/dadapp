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
	postBody : function(action, data, onSuccess) {
		$.ajax({
			processData : false,
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
	record_open_url : function(id) {
		ga_storage._trackEvent('mobile_app', "open_url", id);
		service.post("/api/record_view/" + id, {}, function(){});
	},
	record_view : function(id) {
		ga_storage._trackEvent('mobile_app', "view", id);
		service.post("/api/record_view/" + id, {}, function(){});
	},
	record_like : function(id, onSuccess) {
		ga_storage._trackEvent('mobile_app', "like", id);
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
	quary : function(formObj,successFunc) {
		var postData = $(formObj).serializeArray();
		//console.log(postData[0].value);
		ga_storage._trackEvent('mobile_app', "search", postData[0].value);
		service.postBody("/search/viz", [postData[0].value], successFunc);
	},
};
