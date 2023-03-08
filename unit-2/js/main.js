/* Map of GeoJSON data from oil_data_center.geojson */
//declare map var in global scope
var map;
var minValue;
var dataStats = {};

function createMap(){

    //create the map
    map = L.map('map', {
        center: [41.25, -99.29],
        minZoom: 3, //setting min zoom level
        maxZoom: 7, //setting max zoom level
        zoom:4
    });

    L.control.scale({
        position: 'topright'
    }).addTo(map);

    //add Carto base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd'
    }).addTo(map);

    //call getData function
    getData(map);

    //calling HTML elements
    document.getElementById('mycontent').innerHTML =  'Crude Oil Production in the U.S (1981 - 2021)';     
    document.getElementById('credits').innerHTML = 'Forward button (+5 yrs), backward button (-1yr) | Mbbl : Million barrels';
};

function calculateMinValue(data){
    //create empty array to store all non-zero data values
    var nonZeroValues = [];
    //loop through each city feature
    for(var city of data.features){
        //loop through each year
        for(var year = 1981; year <= 2021; year+=1){
              //get production value for current year
              var value = city.properties["prod_"+ String(year)];
              //if the value is non-zero, add it to the nonZeroValues array
              if (Number(value) > 0) {
                  nonZeroValues.push(value);
              }
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...nonZeroValues);
    return minValue;
};

function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly - set lowest as values explode
    var minRadius = 0.015;

    if (attValue === 0) {
        // assign radius of 1 for zero attribute values
        return minRadius;
    } else {
        // perform Flannery Appearance Compensation formula for non-zero attribute values
        var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;
        return radius;
    }
};


//Add circle markers for point features to the map
function pointToLayer(feature, latlng, attributes){

    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    //create marker options
    var geojsonMarkerOptions = {
        fillColor: "#969696",
        color: "#525252",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
    };
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    //build popup content string starting with city
    var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

    var popupValue;
    if (attValue > 0)
        popupValue = ((attValue*1000)/1000000).toFixed(1) + " million barrels";
    else
        popupValue = "No Data"

    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<b>Oil production in " + year + ":</b> " + popupValue + "<br>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
          offset: new L.Point(0,-geojsonMarkerOptions.radius)
      });

    //returns the circle marker to the L.geoJson pointToLayer option
    return layer;
};
    

//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

function updatePropSymbols(attribute){
    var year = attribute.split("_")[1];
    //update temporal legend
    document.querySelector("span.year").innerHTML = year
    //document.getElementById('year').innerHTML = attribute.split('_')[1];

    map.eachLayer(function(layer){

        if (layer.feature && layer.feature.properties[attribute] >=0){
          //access feature properties
           var props = layer.feature.properties;
           var attValue = props[attribute]

           //update each feature's radius based on new attribute values
           var radius = calcPropRadius(props[attribute]);
           layer.setRadius(radius);

           //add city to popup content string
           var popupContent = "<p><b>City:</b> " + props.City + "</p>";

           var popupValue;
           if (attValue > 0)
                popupValue = ((attValue*1000)/1000000).toFixed(1) + " million barrels";
            else
                popupValue = "No Data"
            
           //add formatted attribute to panel content string
           var year = attribute.split("_")[1];
           popupContent += "<b>Oil production in " + year + ":</b> " + popupValue + "<br>";

           //update popup with new content
           popup = layer.getPopup();
           popup.setContent(popupContent).update();

        };
    });
};

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("prod") > -1){
            attributes.push(attribute);
        };
    };

    //array of prod_[year] names
    return attributes;
};

function createSequenceControls(attributes){

    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/reverse.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/forward.png"></button>'); 

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new SequenceControl());    // add listeners after adding control

    //set slider attributes
    document.querySelector(".range-slider").max = 39;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    var steps = document.querySelectorAll('.step');

    steps.forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            //increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index=Number(index) + 5; //Roll forward for 5 years
                console.log(index)
                //if past the last attribute, wrap around to first attribute
                index = index > 39 ? 0 : index;
            } else if (step.id == 'reverse'){
                index=Number(index) - 1; //Roll backwards for one year

                //if past the first attribute, wrap around to last attribute
                index = index < 0 ? 39 : index;
            };
            //update slider
            document.querySelector('.range-slider').value = index;

            //pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    })
    //input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        //get the new index value
        var index = this.value;

        //pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
};

function calcStats(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var city of data.features){
        //loop through each year
        for(var year = 1981; year <= 2021; year+=1){
              //get production value for current year
              var value = city.properties["prod_"+ String(year)];
              //if the value is non-zero, add it to the allValues array
              if (Number(value) > 0) {
                allValues.push(value);
              }
        }
    }

    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);

    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;
    console.log(dataStats.min, dataStats.mean, dataStats.max)

}


function calcPropRadiusLegend(attValue) {
    //constant factor adjusts symbol sizes evenly - set lowest as values explode
    var minRadius = 0.0076;

    if (attValue === 0) {
        // assign radius of 1 for zero attribute values
        return minRadius;
    } else {
        // perform Flannery Appearance Compensation formula for non-zero attribute values
        var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;
        return radius;
    }
};

function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        
        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create("div", "legend-control-container");

            container.innerHTML = '<p class="temporalLegend">Production in <span class="year"> 1981 </span></p>';

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            ///array of circle names to base loop on  
            var circles = ["max", "mean", "min"]; 

            //Step 2: loop to add each circle and text to svg string  
            for (var i=0; i<circles.length; i++){  

            //Step 3: assign the r and cy attributes  
                var radius = calcPropRadiusLegend(dataStats[circles[i]]);  
                var cy = 59 - radius;  

            //circle string  
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#969696" fill-opacity="0.7" stroke="#525252" cx="30"/>';  
          
            
            //evenly space out labels            
            var textY = i * 20.5 + 19;            

            //text string            
            svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + (Math.round(dataStats[circles[i]]*1000)/1000000).toFixed(1) + " Mbbl" + '</text>';
            
            };

            //close svg string  
            svg += "</svg>"; 
            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend',svg);

            return container;

        }
    });

    map.addControl(new LegendControl());
};

//Import GeoJSON data
function getData(map){
    //load the data
    fetch("data/oil_data_center.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json)
            calcStats(json); 
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
            createLegend(attributes);    
        })
};

document.addEventListener('DOMContentLoaded', createMap)