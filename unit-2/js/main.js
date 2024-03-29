/* Map of GeoJSON data from oil_data_center.geojson */
// declare map var in global scope
var map;
var minValue;
var dataStats = {};

//contentfunction controls text layer on the map
/*
function contentFunction() {
    var dots = document.getElementById("dots");
    var moreText = document.getElementById("more");
    var btnText = document.getElementById("myBtn");
  
    if (dots.style.display === "none") {
      dots.style.display = "inline";
      btnText.innerHTML = "Read more"; 
      moreText.style.display = "none";
    } else {
      dots.style.display = "none";
      btnText.innerHTML = "Read less"; 
      moreText.style.display = "inline";
    }
  } */


function createMap(){
    // Calculating width and change zoom levels based on screen width
    var width = window.innerWidth;
    if (width > 764) {
        var minZoom = 4;
        var maxZoom = 6;
        var zoom = 4;
    }
    else  {
        var minZoom = 2; 
        var maxZoom = 6;
        var zoom = 3;
    } 
    // create the map
    // L.map creates an instance of map object inside the <div> element with id = 'map'
    map = L.map('map', {
        center: [44.5, -100],
        minZoom: minZoom, // setting min zoom level
        maxZoom: maxZoom, // setting max zoom level
        zoom: zoom
    });
    //Adding digital map scale using L.control method
    if (width > 764) {
        L.control.scale({
            position: 'topright'
        }).addTo(map);
    }
    // add Carto base tilelayer
    // L.tileLayer creates an instance of tile layer object using provided URL
    if (width > 764){
        var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
    else {
        attribution = ''
    }
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: attribution,
	subdomains: 'abcd'
    }).addTo(map);

    // call getData function
    getData(map);

    // calling HTML elements
    document.getElementById('title').innerHTML =  'Crude Oil Production in the U.S (1981 - 2020)'; 

    document.getElementById('mapcontent').innerHTML = "<p><font size = '+2'>D</font>ue to recession in the west, there is a record decline in oil production in <b> 1981 </b> by 6% to previous year <sup> <a href = 'https://www.nytimes.com/1982/01/06/business/world-oil-o-utput-off-6-in-1981.html'> 1</a></sup> . However, between 1981-2020, U.S oil imports remained mostly stable,<span id = 'dots'></span> <span id = 'more'> anywhere between 200,000 - 400,000 thousand barrels/month <sup><a href = 'https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=MTTIMUS1&f=M'>2</a></sup> . Interestingly, The production decline in <b> Alaska </b> is compensated by <b> North Dakota </b>. While <b> Texas </b> remained the top producer and there are approximately <b>18 least-producing states</b>. <sup><a href = 'https://worldpopulationreview.com/state-rankings/oil-production-by-state'>3</a></sup></span></p>";

   
     /* document.getElementById('mapcontent').insertAdjacentHTML('beforeend',"<button onclick = 'contentFunction()' id = 'myBtn'> Read more </button>") */

    document.getElementById('credits').innerHTML = 'Forward button (+4 yrs), backward button (-1yr) | Mbbl : Million barrels <br>' + "<p> Data Source: <a href = 'https://www.eia.gov/dnav/pet/pet_crd_crpdn_adc_mbbl_a.htm'> U.S Energy Information Adiminstration</a> | " + "Oil Rig icon : Noun Project |  Cartographer : <a href = 'https://sidrcs.github.io/maps/index.html'>Siddharth Ramavajjala</a> (ramavajjala@wisc.edu) </p>";
};

function calculateMinValue(data){
    // create empty array to store all non-zero data values
    var nonZeroValues = [];
    // loop through each city feature
    for(var city of data.features){
        // loop through each year
        for(var year = 1981; year <= 2021; year += 1){
              // get production values for a current year
              var value = city.properties["prod_"+ String(year)];
              // if the value is non-zero, then add it to the nonZeroValues array
              if (Number(value) > 0) {
                  nonZeroValues.push(value);
              }
        }
    }
    // get minimum value of nonZeroValues array
    var minValue = Math.min(...nonZeroValues);
    return minValue;
};

function calcPropRadius(attValue) {
    // constant factor adjusts symbol sizes evenly - set lowest as values explode in our case
    var minRadius = 0.015;
    if (attValue === 0) {
        // assign minRadius if the attribute value (production) is zero for a particular year
        return minRadius;
    } else {
        // perform Flannery Appearance Compensation formula for non-zero attribute values
        var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;
        return radius;
    }
};

// function to handle popup content using city, attribute ~ prod_[year]
function createPopupContent(properties, attribute){
    // city is added to pop up string
    var popupContent = "<b>State:</b> " + properties.State + "<br>";
    // converting attValue to a number
    var attValue = Number(properties[attribute]);
    // attValue is evaluated for No Data case and loaded into
    var popupValue;
    if (attValue > 0)
        popupValue = ((attValue*1000)/1000000).toFixed(1);
    else
        popupValue = "No Data"
    // formatting the popup content
    var year = attribute.split("_")[1];
    popupContent += "Production in <b>" + year + ":</b> " + popupValue + " Mbbl";

    return popupContent;
};


// Add circle markers for point features to the map
function pointToLayer(feature, latlng, attributes){

    // determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    // create marker options
    var geojsonMarkerOptions = {
        fillColor: "#969696",
        color: "#525252",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    };
    // for each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    // assign radius to marker based on attribute value
    geojsonMarkerOptions.radius = calcPropRadius(attValue);

    // create circle marker layer
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);

    // build popup content string starting with city
    var popupContent = createPopupContent(feature.properties, attribute);

    // bind the popup to the circle marker
    layer.bindPopup(popupContent, {
          offset: new L.Point(0,-geojsonMarkerOptions.radius)
      });

    // returns the circle marker to the L.geoJson pointToLayer option
    return layer;
};
    

// add circle markers for point features to the map
function createPropSymbols(data, attributes){
    // create a leaflet geoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

function updatePropSymbols(attribute){
    // returns date to the legend
    var year = attribute.split("_")[1];
    // update temporal legend moving through the sequence
    document.querySelector("span.year").innerHTML = "<b>" + year + "</b>"

    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute] >=0){
          // access feature properties
           var props = layer.feature.properties;
           var attValue = props[attribute]
           // update each feature's radius based on new attribute values
           var radius = calcPropRadius(props[attribute]);
           layer.setRadius(radius);
           // add city to popup content string
           var popupContent = createPopupContent(props, attribute);

           // update popup with new content
           popup = layer.getPopup();
           popup.setContent(popupContent).update();

        };
    });
};

function processData(data){
    // empty array to hold attributes
    var attributes = [];

    // properties of the first feature in the dataset
    var properties = data.features[0].properties;

    // push each attribute name into attributes array
    for (var attribute in properties){
        // only take attributes with population values
        if (attribute.indexOf("prod") > -1){
            attributes.push(attribute);
        };
    };

    // array of prod_[year] names
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

            // create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/reverse.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/forward.png"></button>'); 

            // disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new SequenceControl());    // add listeners after adding control

    // set slider attributes
    document.querySelector(".range-slider").max = 39;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    var steps = document.querySelectorAll('.step');

    steps.forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            // increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index = Number(index) + 4; // roll forward for 4 years
                console.log(index)
                // if past the last attribute, wrap around to first attribute
                index = index > 39 ? 0 : index;
            } else if (step.id == 'reverse'){
                index=Number(index) - 1; // Roll backwards for one year

                // if past the first attribute, wrap around to last attribute
                index = index < 0 ? 39 : index;
            };
            // update slider
            document.querySelector('.range-slider').value = index;

            // pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    })
    // input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        // get the new index value
        var index = this.value;

        // pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });

        // keyboard arrow key event listeners
        document.addEventListener('keydown', function(event) {
            var index = document.querySelector('.range-slider').value;
    
            if (event.code === 'ArrowRight') {
                index=Number(index) + 4; //ArrowRight - forward for 4 years
    
                // if crosses high value of index, wrap around to start
                index = index > 39 ? 0 : index;
    
                // update slider index position
                document.querySelector('.range-slider').value = index;
    
                // pass new attribute to update symbols
                updatePropSymbols(attributes[index]);
            } else if (event.code === 'ArrowLeft') {
                index=Number(index) - 1; //Arrowleft - backwards for one year
    
                // if crosses low value of index, wrap around to end
                index = index < 0 ? 39 : index;
    
                // update slider
                document.querySelector('.range-slider').value = index;
    
                // pass new attribute to update symbols
                updatePropSymbols(attributes[index]);
            }
        });    
};

function calcStats(data){
    // create empty array to store all data values
    var allValues = [];
    // loop through each city
    for(var city of data.features){
        // loop through each year
        for(var year = 1981; year <= 2021; year+=1){
              // get production value for current year
              var value = city.properties["prod_"+ String(year)];
              // if the value is non-zero, add it to the allValues array
              if (Number(value) > 60000) {
                allValues.push(value);
              }
        }
    }

    // get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);

    // calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;

    // printing values to check whether values are loaded here
    console.log(dataStats.min, dataStats.mean, dataStats.max)

}


function calcPropRadiusLegend(attValue) {
    // constant factor adjusts symbol sizes evenly - set lowest as values explode
    var minRadius = 0.0076;

    if (attValue === 0) {
        // assign minRadius, if attribute value (production value for an year) is zero
        return minRadius;
    } else {
        // perform Flannery Appearance Compensation formula for non-zero attribute values
        var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;
        return radius;
    }
};

function createLegend(attributes){
    var width = window.innerWidth;
    if (width > 764)
        var position = 'bottomright'
    else    
        var position = 'topright'
   
    var LegendControl = L.Control.extend({
        options: {
            position: position // legend placement
        },
        
        onAdd: function () {
            // creating a new div element with a tag and loading into a container variable
            var container = L.DomUtil.create("div", "legend-control-container");

            container.innerHTML = '<p class="temporalLegend">Production in <span class="year"> <b>1981</b> </span></p>';

            // SVG attribute string for legend placement
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            // creating an array of text elements for legend circle elements
            var circles = ["max", "mean", "min"]; 

            // loop to add each circle of three circles and text to svg string  
            for (var i=0; i<circles.length; i++){  

                // Assigning radius (r) and center of y value (cy) attributes  
                var radius = calcPropRadiusLegend(dataStats[circles[i]]);  
                var cy = 60 - radius;  

                // circle string  
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#969696" fill-opacity="0.7" stroke="#525252" cx="30"/>';  
          
            
            // Adding spacing through each i value i = 0,1,2
            // 19, 39.5, 60 values which are loaded in Y - vertical values            
            var textY = i * 20.5 + 19;            

            // text string            
            svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + (Math.round(dataStats[circles[i]]*1000)/1000000).toFixed(1) + " Mbbl" + '</text>';
            
            };

            //close svg string  
            svg += "</svg>"; 

            // inserting the svg element to the container
            container.insertAdjacentHTML('beforeend',svg);

            return container;

        }
    });

    map.addControl(new LegendControl());
};

// import geoJSON data
function getData(map){
    // load the data
    fetch("data/Main_Oil_Data.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json)
            calcStats(json); 
            // calculate minimum data value
            minValue = calculateMinValue(json);
            // call function to create proportional symbols
            createPropSymbols(json, attributes);
            // call function to enable timeline sequence
            createSequenceControls(attributes);
            // call function to create legend
            createLegend(attributes);    
        })
};

document.addEventListener('DOMContentLoaded', createMap)