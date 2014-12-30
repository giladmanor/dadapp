var service = {
	post : function(action, data, onSuccess) {
		$.ajax({
			type : "POST",
			url : app.server + action,
			crossDomain : true,
			data : data,
			success : onSuccess,
			error : function(e) {
				alert('Something went wrong!');
				console.log(e);
			}
		});
	},
	get : function(action, data, onSuccess){
		$.ajax({
			type : "GET",
			url : app.server + action,
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
		app.post("/api/record_view/" + id, {}, onSuccess);
	},
	record_like : function(id, onSuccess) {
		app.post("/api/viz/like/" + id, {}, onSuccess);
	},
};
