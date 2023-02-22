
//L.map creates an instance of map object inside the <div> elemnt with id = 'map'
var map = L.map('map').setView([40.64, -103.45],5)

//L.tileLayer creates an instance of tile layer object using provided URL
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map);


//creating a variable in geojson format
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//creates a geojson Layer and adds to map object
L.geoJSON(geojsonFeature).addTo(map);

var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];


var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

L.geoJSON(myLines, {
    style: myStyle // A function that defines the style options for polygons and lines
}).addTo(map);

var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) { //Switch condition based styling for polygon feature
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);


var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var someGeojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

var layer1 = L.geoJSON(someGeojsonFeature, {
        //A default function used to spawn (display) points (default: marker) based LatLng
        //But here instead of default L.marker, L.circle is used.
        pointToLayer: function (feature, latlng) { 
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);


//Function is called once on each feature and styled as layer
//onEachFeature iterates through each feature
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        //Both are objects, feature is data and layer is style layer
        //console.log(typeof feature) || console.log(typeof layer)

        //bindPopup method binds popup to the layer
        layer.bindPopup(feature.properties.popupContent);
    }
}

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: onEachFeature
}).addTo(map);


var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "amenity": "Baseball Stadium",
        "popupContent": "I don't know what it is!",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

L.geoJSON(someFeatures, {
    //filter function decides whether to include a feature or not based on feature property
    filter: function(feature, layer) { 
        return feature.properties.show_on_map;
    },
    onEachFeature: onEachFeature
}).addTo(map);

function credits(){
    var cred = document.getElementById('credits').innerHTML = 'Ⓒ Sid (ramavajjala@wisc.edu)';
};

credits();


function myContent(){
    var cred = document.getElementById('mycontent').innerHTML = 'Leaflet Tutorial';
}

myContent();

