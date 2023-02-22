/* Map of GeoJSON data from oil_data_center.geojson */
//declare map var in global scope
var map;
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
    getData();  
    
    //calling HTML elements
    credits();
    myContent();
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