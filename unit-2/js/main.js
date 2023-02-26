/* Map of GeoJSON data from oil_data_center.geojson */

//declare map var in global scope
var map;
var minValue;

//function to instantiate the Leaflet map
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
    //creating an empty array to store all values
    var allValues = [];

    //looping through each city [each feature is loaded as city]
    for (var city of data.features){
        for (var year = 1981; year <= 2021; year += 1){
            var value = city.properties['prod_'+str(year)]

            //push each value from the each city feature into allValues array
            allValues.push(value);

        }
    }
    //calulating min value of the array allValues
    var minValue = Math.min(allValues)
    return minValue;

};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};


function createPropSymbols(data){
    //variable to store one column value for now
    var attribute = "prod_1981"

    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            var attValue = Number(feature.properties[attribute]);

            console.log(feature.properties, attValue);
            console.log(typeof attValue)

            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};

//function to create circle markers for each feature
function pointToLayer(feature, latlng) {
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#969696",
        color: "#525252",
        weight:1,
        opacity:1,
        fillOpacity: 0.7
    };

    return L.circleMarker(latlng,geojsonMarkerOptions);
};

//function to create popups for each feature
function onEachFeature(feature, layer) {
    //create a popup of html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + "<strong>" + property + "</strong>" + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

function getData(){
    //load the data using fetch 
    fetch("data/oil_data_center.geojson")
        .then(function(response){ //chaining the output with then and returning a json object
            return response.json();
        })
        .then(function(json){ //which is then chained as json into function
            createPropSymbols(json)
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                pointToLayer: pointToLayer,
                onEachFeature: onEachFeature
            }).addTo(map);
        })  
};

function credits(){
    var cred = document.getElementById('credits').innerHTML = 'Ⓒ Sid (ramavajjala@wisc.edu)';
};


function myContent(){
    var cred = document.getElementById('mycontent').innerHTML = 'Oil Production Map of U.S 1981 - 2021';
}


document.addEventListener('DOMContentLoaded',createMap);