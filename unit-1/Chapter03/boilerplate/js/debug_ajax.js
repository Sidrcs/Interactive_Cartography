function debugCallback(myData){
	document.querySelector("#mydiv").insertAdjacentHTML('beforeend', '<br> GeoJSON data: </br>' + JSON.stringify(myData))
};

function debugAjax(){	
	fetch("data/MegaCities.geojson")
		.then(function(response){
			return response.json();
		})
		.then(debugCallback);
};