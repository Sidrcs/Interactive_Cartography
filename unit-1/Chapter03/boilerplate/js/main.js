//loads the function cities() after the DOM content is loaded
function initialize(){
	cities();
	debugAjax();
};

//Defining function cities() and population data as key:value pairs
function cities(){
	var cityPop = [
		{ 
			city: 'Madison',
			population: 233209
		},
		{
			city: 'Milwaukee',
			population: 594833
		},
		{
			city: 'Green Bay',
			population: 104057
		},
		{
			city: 'Superior',
			population: 27244
		}
	];

	// Table element is created
	var table = document.createElement('table');

	//HeaderRow element is created, where tr is tableRow
	var headerRow = document.createElement('tr');

	//City, Population added to the table as header columns (table headers) using insertAdjacentHTML method
	headerRow.insertAdjacentHTML('beforeend','<th>City</th><th>Population</th>');

	//appending headerRow to table element
	table.appendChild(headerRow);

	//Each dictionary in the CityPop[] list is read into cityobject
	cityPop.forEach(function(cityobject){
        var tr = document.createElement('tr');

		//key of the dictionary element is read as property and appended as 
        for (property in cityobject){

			//creating table data(td) element
            var td = document.createElement('td');

			//wiring the values of the dictionary object into each td cell
            td.innerHTML = cityobject[property];
            tr.appendChild(td);
        };

        table.appendChild(tr);
	});
	
	document.querySelector('#mydiv').appendChild(table);

	//adding functions to cities()
	addColumns(cityPop);
	addEvents();
};


	function addColumns(cityPop){

		//finds the tr tag and insert the following function
		document.querySelectorAll("tr").forEach(function(row, i){
	
			//if first element, then it would be a header - 'City Size'
			if (i == 0){
	
				row.insertAdjacentHTML('beforeend', '<th> City Size </th>');
				
			} else {
				
				//Variable citySize is defined is checked against following cases
				var citySize;
	
				if (cityPop[i-1].population < 100000){
					citySize = 'Small';
	
				} else if (cityPop[i-1].population < 500000){
					citySize = 'Medium';
	
				} else {
					citySize = 'Large';
				};
	
				//The outcome would be is inserted as Table data cell
				row.insertAdjacentHTML('beforeend','<td>' + citySize + '</td>');
			};
		});
	};

	
	function addEvents(){
	
		//eventListener performs an action when mouse is hovered
		document.querySelector("table").addEventListener("mouseover", function(){
			
			//Note the color = rgb(random,0,0) and randow skips position based on value of i
			//Thus generating various colors
			var color = "rgb(";
	
			for (var i=0; i<3; i++){
				
				//Random is rounded to avoid decimal values in the rgb palette
				var random = Math.round(Math.random() * 255);
	
				color += random;
	
				if (i<2){
					color += ",";
				
				} else {
					color += ")";
			};
		}

		//Add style element color to the table
		document.querySelector("table").style.color = color;
	});
	
		function clickme(){
	
			alert('Hey, you clicked me!');
		};
	
		//Adds an event, when clicked on the table
		document.querySelector("table").addEventListener("click", clickme);
	};

	function debugCallback(myData){ // loads the response.json() into the paramter as an argument
		console.log(myData); //prints out the object as it gets converted into a string (usable case)
		document.querySelector("#mydiv").insertAdjacentHTML('beforeend', '<br> GeoJSON data: </br>' + JSON.stringify(myData))
	};
	
	
	function debugAjax(){	//debugAjax executes the following

		fetch("data/MegaCities.geojson") 
		//fetch method when used communicates with server and returns an object
		// as response, and it is called a response object - which is not for console printing
			.then(function(response){
				//var myData = response;
				//console.log(myData); //Does not provide the outlook in console (non-use case)
				var res = response.json(); //converts the response object through json function
				console.log(res); //returns a promise that showcases the status of fetch request (non-use case)
				return res;
			})
			.then(debugCallback) //the return of the function is chained to push the response.json()
			// to debugcall function
	};

//initilaizes the script once DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);
