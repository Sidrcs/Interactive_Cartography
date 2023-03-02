/* Map of GeoJSON data from oil_data_center.geojson */
//declare map var in global scope
var map;
var minValue;

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
	maxZoom: 7 //setting max zoom level
    }).addTo(map);

    //call getData function
    getData(map);

    //calling HTML elements
    document.getElementById('mycontent').innerHTML = 'Oil Production Map of U.S 1981 - 2021';
    document.getElementById('credits').innerHTML = 'Ⓒ Sid (ramavajjala@wisc.edu)';
    document.getElementById('panelOne').innerHTML = 'Now, you are in the year: ' + currentYearFunc();
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
        return 20;
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
        popupValue = ((attValue*1000)/1000000).toFixed(1) + "million barrels";
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
    map.eachLayer(function(layer){
      console.log("Update Prop Symbols!");

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
                popupValue = ((attValue*1000)/1000000).toFixed(1) + "million barrels";
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
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

    //set slider attributes
    document.querySelector(".range-slider").max = 39;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    //add step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse"></button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward"></button>');

    //replace button content with images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>")

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
            var currentYear = ((attributes[index].split('_')[1]));
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



//Import GeoJSON data
function getData(map){
    //load the data
    fetch("data/oil_data_center.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json)
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        })
};

document.addEventListener('DOMContentLoaded', createMap)