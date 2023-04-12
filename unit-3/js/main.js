(function(){

//pseudo-global variable    
var attrArray = ["stfid",	"NAMELSAD",	"hh1620_est",	"persons1620_est",	"hhkids1620_est",	"kids1620_est",	"seniors1620_est",	"edlesshs1620_est",	"langeng1620_est",	"langasn1620_est",	"racewhite1620_est",	"raceaa1620_est",	"raceasian1620_est",	"raceamind1620_est",	"hispanic1620_est",	"noncitizens1620_est",	"drive1620_est", "prateacs1620_est",	"pratekidsacs1620_est",	"gini1620_est",	"renters1620_est",	"noveh1620_est"];

var arrayDict = {"stfid" : "Unique ID",	"NAMELSAD" : "County name",	"hh1620_est":"Households",	"persons1620_est":"Total persons",	"hhkids1620_est":"Household with children",	"kids1620_est":"Children",	"seniors1620_est":"Seniors",	"edlesshs1620_est":"Education less than high school",	"langeng1620_est":"English spoken at home",	"langasn1620_est":"Asian language spoken at home",	"racewhite1620_est":"White",	"raceaa1620_est":"African American",	"raceasian1620_est":"Asian",	"raceamind1620_est":"Native Americans",	"hispanic1620_est":"Hispanic",	"noncitizens1620_est":"Non-citizens",	"drive1620_est":"Workers driving or carpooling to work", "prateacs1620_est":"Poverty (all persons)",	"pratekidsacs1620_est":"Poverty(kids)",	"gini1620_est":"Gini index of income inequality",	"renters1620_est":"Households renting home", "noveh1620_est":"Households without vehicle"};

var expressed = attrArray[19]; // loaded attribute based on index

window.onload = setMap();

// setup a choropleth map
function setMap(){
    // map frame dimensions
    var width = window.innerWidth * 0.5,
        height = 473;

    // create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    // create Albers equal area conic projection centered on Wisconsin
    var projection = d3.geoAlbers()
        .center([0, 44.5])
        .rotate([90, -0.5, 0])
        .parallels([42.5, 47.5])
        .scale(4500)
        .translate([width / 2, height / 2]);

    // geopath() method helps in drawing the geometries
    var path = d3.geoPath()
        .projection(projection); // path holds projection and helps in rendering the projection

    // promises container is created to hold the promise
    var promises = [];

    // d3.csv(), d3.json() methods read csv, topojson files
    promises.push(d3.csv("data/wisconsin_counties_data.csv"));
    promises.push(d3.json("data/Wisc_counties.topojson"));

    // Promise helps to load the data asynchronously
    // bind the output into callback function
    Promise.all(promises).then(callback);

    // callback reads the output response of promises (read files - csv, topojson)
    // retrieves the file information
    function callback(data){
        var csvData = data[0], wisconsin = data[1];

        // place graticule on the map
        // setGraticule(map,path);

        // testing whether the files are loaded correctly or not
        console.log("CSV data below",csvData);
        console.log("TopoJSON data below",wisconsin);

        // translate Wisconsin counties from topojson to geojson
        var wisconsinCounties = topojson.feature(wisconsin, wisconsin.objects.Wisc_counties).features;

        // join data of Wisconsin counties
        wisconsinCounties = joinData(wisconsinCounties,csvData);

        // create a colorscale
        var colorScale = makeColorScale(csvData);

        // add enumeration units to the map
        setEnumerationUnits(wisconsinCounties, map, path, colorScale)

        //add coordinated visualization to the map
        setDotPlot(csvData, colorScale);
       
    };
};

function setGraticule(map,path){
        // create graticule generator
        var graticule = d3.geoGraticule()
            .step([2, 2]); //place graticule lines every 1 degree of longitude and latitude
        
        // create graticule background
        var gratBackground = map.append("path") 
            .datum(graticule.outline()) // bind graticule background
            .attr("class", "gratBackground") // assign class for styling
            .attr("d", path) // project graticule

        // create graticule lines
        var gratLines = map.selectAll(".gratLines")  // select graticule elements that will be created
            .data(graticule.lines()) // bind graticule lines to each element to be created
            .enter() // create an element for each datum
            .append("path") // append each element to the svg as a path element
            .attr("class", "gratLines") // assign class for styling
            .attr("d", path); // project graticule lines
};

function joinData(wisconsinCounties, csvData){
    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
        var csvRegion = csvData[i]; //the current region
        var csvKey = csvRegion.NAMELSAD; //the CSV primary key

        //loop through geojson regions to find correct region
        for (var a=0; a<wisconsinCounties.length; a++){

        var geojsonProps = wisconsinCounties[a].properties; //the current region geojson properties
        var geojsonKey = geojsonProps.NAMELSAD; //the geojson primary key

        //where primary keys match, transfer csv data to geojson properties object
        if (geojsonKey == csvKey){

            //assign all attributes and values
            attrArray.forEach(function(attr){
                var val = parseFloat(csvRegion[attr]); //get csv attribute value
                geojsonProps[attr] = val; //assign attribute and value to geojson properties
            });
        };
        };
    };
    console.log("GeoJSON info below", wisconsinCounties)
    return wisconsinCounties
    
};
//function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#ffffcc",
        "#c2e699",
        "#78c679",
        "#31a354",
        "#006837"
    ];

    //create color scale generator
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //assign array of expressed values as scale domain
    colorScale.domain(domainArray);

    return colorScale;
};

function setEnumerationUnits(wisconsinCounties, map, path, colorScale){

     // add Wisconsin to map
    var state = map.selectAll(".state")
      .data(wisconsinCounties)
      .enter()
      .append("path")
      .attr("class", function(d){
          return "counties " + d.properties.NAMELSAD;
      })
      .attr("d", path)
      .style("fill", function(d){            
        var value = d.properties[expressed];            
        if(value) {                
            return colorScale(d.properties[expressed]);            
        } else {                
            return "#ccc";            
        }    });
};

//function to create coordinated bar chart
function setChart(csvData, colorScale){
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

    //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 0.6]);

    //set bars for each province
    var bars = chart.selectAll(".bar")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bar " + d.NAMELSAD;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartInnerWidth / csvData.length) + leftPadding;
        })
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .style("fill", function(d){
            return colorScale(d[expressed]);
        });

    //create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 40)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text( arrayDict[expressed]);

    //create vertical axis generator
    var yAxis = d3.axisLeft()
        .scale(yScale);

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
};

//function to create coordinated lollipop chart
// source URL - https://d3-graph-gallery.com/graph/lollipop_basic.html
function setDotPlot(csvData, colorScale){
    // create chart dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

     //create a rectangle for chart background fill
     var chartBackground = chart.append("rect")
     .attr("class", "chartBackground")
     .attr("width", chartInnerWidth)
     .attr("height", chartInnerHeight)
     .attr("transform", translate);

     //create a scale for the x-axis
    var xScale = d3.scalePoint()
        .range([0, chartInnerWidth])
        .domain(csvData.map(function(d) { return d.NAMELSAD; }))
        .padding(1);

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 0.6]);

    // set lines for each province
    var myline = chart.selectAll(".myline")
        .data(csvData)
        .enter()
        .append("rect")
        .attr("class", function(d){
            return "line " + d.NAMELSAD;
        })
        .attr("width", "0.5")
        .attr("x", function(d, i){
            return xScale(d.NAMELSAD) + leftPadding;
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        });

     // circles
     var mycircle = chart.selectAll(".mycircle")
        .data(csvData)
        .join("circle")
        .attr("cx", function(d){
            return xScale(d.NAMELSAD) + leftPadding;
        })
        .attr("cy", function(d){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .attr("r", "4")
        .style("fill", function(d){
            return colorScale(d[expressed])
        })
        .attr("stroke", "#636363");

    //create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 40)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text(arrayDict[expressed]);

    //create vertical axis generator
    var yAxis = d3.axisLeft()
        .scale(yScale);

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
};

})();