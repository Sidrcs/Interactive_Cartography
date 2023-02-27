//declare map variable globally so all functions have access
var map;
var minValue;

//step 1 create map
function createMap(){

    //create the map
    map = L.map('map', {
        center: [41.25, -99.29],
        zoom:4
    });

    //add Carto base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
    minZoom: 4, //setting min zoom level
	maxZoom: 7 //seeting max zoom level
    }).addTo(map);

    //call getData function
    getData(map);

    //calling HTML elements
    credits();
    myContent();
};

function calculateMinValue(data){
    //create empty array to store all non-zero data values
    var nonZeroValues = [];
    //loop through each city
    for(var city of data.features){
        //loop through each year
        for(var year = 1981; year <= 2021; year+=1){
              //get production value for current year
              var value = city.properties["prod_"+ String(year)];
              //if the value is non-zero, add it to the nonZeroValues array
              if (value !== 0) {
                  nonZeroValues.push(value);
              }
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...nonZeroValues);

    console.log(minValue)
    return minValue;
};

function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 0.015;

    if (attValue === 0) {
        // assign radius of 1 for zero attribute values
        return 1;
    } else {
        // perform Flannery Appearance Compensation formula for non-zero attribute values
        var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;
        return radius;
    }
};


//Step 3: Add circle markers for point features to the map
function pointToLayer(data){

    //Step 4: Determine which attribute to visualize with proportional symbols
    var attribute = "prod_2021";

    //create marker options
    var geojsonMarkerOptions = {
        fillColor: "#969696",
        color: "#525252",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
        radius: 8
    };

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            //Step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            //create circle markers
            var layer = L.circleMarker(latlng, geojsonMarkerOptions);

            //HTML pop content or label on display
            var popupContent = "<b>City:</b> " + feature.properties.City + "<br>";

            var year = attribute.split('_')[1] //retrieving only year
            popupContent += "<b>Oil production in " + year + ":</b> " + ((feature.properties[attribute]*1000)/1000000).toFixed(1) + " million barrels<br>";

            //Bind popup to the circle marker and set an offset
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-geojsonMarkerOptions.radius) 
            });
            return layer
        }
    }).addTo(map)
};

//Add circle markers for point features to the map
function createPropSymbols(data, map){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};

//Step 2: Import GeoJSON data
function getData(){
    //load the data
    fetch("data/oil_data_center.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json);
        })
};

function credits(){
    var cred = document.getElementById('credits').innerHTML = 'Ⓒ Sid (ramavajjala@wisc.edu)';
};


function myContent(){
    var cred = document.getElementById('mycontent').innerHTML = 'Oil Production Map of U.S 1981 - 2021';
}

document.addEventListener('DOMContentLoaded',createMap)