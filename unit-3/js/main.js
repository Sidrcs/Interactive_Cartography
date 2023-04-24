(function(){

//pseudo-global variable    
var attrArray = ["stfid", "adm2_code",	"NAME",	"hh1620_est",	"persons1620_est",	"hhkids1620_est",	"kids1620_est",	"seniors1620_est",	"edlesshs1620_est",	"langeng1620_est",	"langasn1620_est",	"racewhite1620_est",	"raceaa1620_est",	"raceasian1620_est",	"raceamind1620_est",	"hispanic1620_est",	"noncitizens1620_est",	"drive1620_est", "prateacs1620_est",	"pratekidsacs1620_est",	"gini1620_est",	"renters1620_est",	"noveh1620_est"];

var arrayDict = {"stfid" : "Unique ID",	"adm2_code" : "admin2 code","NAME" : "County name", "hh1620_est":"Percent Households",	"persons1620_est":"Percent persons (Total)",	"hhkids1620_est":"Percent Household with children",	"kids1620_est":"Percent Children",	"seniors1620_est":" Percent Seniors",	"edlesshs1620_est":"Education less than high school (%)",	"langeng1620_est":"English spoken at home (%)",	"langasn1620_est":"Asian language spoken at home (%)",	"racewhite1620_est":"Percent White", "raceaa1620_est":"Percent African American", "raceasian1620_est":"Percent Asian",	"raceamind1620_est":"Percent Native Americans",	"hispanic1620_est":"Percent Hispanic", "noncitizens1620_est":"Percent Non-citizens",	"drive1620_est":"Workers driving or carpooling to work (%)", "prateacs1620_est":"Poverty (all persons %)",	"pratekidsacs1620_est":"Poverty (kids %)",	"gini1620_est":"Gini index of income inequality",	"renters1620_est":"Households renting home (%)", "noveh1620_est":"Households without vehicle (%)"};

var arrayObj = [{data:"hh1620_est", text:"Percent Households"}, {data:"persons1620_est", text:"Percent persons (Total)"}, {data:"hhkids1620_est", text:"Percent Household with children"}, {data:"kids1620_est", text:"Percent Children"}, {data:"seniors1620_est", text:"Percent Seniors"}, {data:"edlesshs1620_est", text:"Education less than high school (%)"}, {data:"langeng1620_est", text:"English spoken at home (%)"}, {data:"langasn1620_est", text:"Asian language spoken at home (%)"}, {data:"racewhite1620_est", text:"Percent White"}, {data:"raceaa1620_est", text:"Percent African American"}, {data:"raceasian1620_est", text:"Percent Asian"}, {data:"raceamind1620_est", text:"Percent Native Americans"}, {data:"hispanic1620_est", text:"Percent Hispanic"}, {data:"noncitizens1620_est", text:"Percent Non-citizens"}, {data:"drive1620_est", text:"Workers driving or carpooling to work"}, {data:"prateacs1620_est", text:"Poverty (all persons %)"}, {data:"pratekidsacs1620_est", text:"Poverty (kids %)"}, {data:"gini1620_est", text:"Gini index of income inequality"}, {data:"renters1620_est", text:"Households renting home"}, {data:"noveh1620_est", text:"Households without vehicle (%)"}];

var expressed = attrArray[20]; // loaded attribute based on index

// create chart dimensions
var chartWidth = window.innerWidth * 0.425,
chartHeight = 473,
leftPadding = 25,
rightPadding = 2,
topBottomPadding = 5,
chartInnerWidth = chartWidth - leftPadding - rightPadding,
chartInnerHeight = chartHeight - topBottomPadding * 2,
translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

// create a scale to size lines proportionally to frame and for axis
var yScale = d3.scaleLinear()
.range([463, 0])
.domain([0, 0.6]);

window.onload = setMap();

// setup a choropleth map
function setMap(){
    // map frame dimensions
    var width = window.innerWidth * 0.475;
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

        // place graticule on the map. But it is not used in map
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

        // add dropdown to the map
        createDropdown(csvData);

        // add dotplot visualization to the map
        setDotPlot(csvData, colorScale);

        // add color legend
        makeColorLegend(colorScale);
       
    };
};

// Drawing county data to map frame
function setEnumerationUnits(wisconsinCounties, map, path, colorScale){
    // add Wisconsin to map
   var counties = map.selectAll(".counties")
     .data(wisconsinCounties)
     .enter()
     .append("path")
     .attr("class", function(d){
         // console.log("counties",d.properties.adm2_code)
         return "counties " + d.properties.adm2_code;
     })
     .attr("d", path)
     .style("fill", function(d){            
       var value = d.properties[expressed];            
       if(value) {                
           return colorScale(d.properties[expressed]);            
       } else {                
           return "#ccc";            
       }    
   })
   // mouseover, mouseout events for highlighting or dehighlighting
   .on("mouseover", function(event, d){
       highlight(d.properties);
   })
   .on("mouseout", function(event, d){
       dehighlight(d.properties);
   })
   // label event listener
   .on("mousemove", moveLabel);

   // county dehighlight solution
   var desc = counties.append("desc")
       .text('{"stroke": "#464545", "stroke-width": "0.5px"}');
};

// setGraticule generates graticule for map
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

// joinData() combines TopoJSON & CSV data based on primary key
function joinData(wisconsinCounties, csvData){
    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
        var csvRegion = csvData[i]; //the current region
        var csvKey = csvRegion.adm2_code; //the CSV primary key

        //loop through geojson counties to find correct region
        for (var a=0; a<wisconsinCounties.length; a++){

        var geojsonProps = wisconsinCounties[a].properties; //the current region geojson properties
        var geojsonKey = geojsonProps.adm2_code; //the geojson primary key

        //where primary keys match, transfer csv data to geojson properties object
        if (geojsonKey === csvKey){

            //assign all attributes and values
            attrArray.forEach(function(attr){
                var val = parseFloat(csvRegion[attr]); //get csv attribute value
                geojsonProps[attr] = val; //assign attribute and value to geojson properties
            });
            geojsonProps.adm2_code = csvRegion.adm2_code;
        };
        };
    };
    console.log("GeoJSON info below", wisconsinCounties)
    return wisconsinCounties
    
};

//function to create color scale generator
function makeColorScale(data){
    // sequential color schemes are adopted from ColorBrewer (Green Below)
    var colorClasses = ["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"];
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

// Redesigned code from Stackoverflow (via Annika Anderson)
function makeColorLegend(color) {
    var width = 300,
        height = 300;
        topBottomPadding = 5;

    var left = document.querySelector(".map").getBoundingClientRect().left,
        bottom  = document.querySelector(".map").getBoundingClientRect().bottom;

    var svg = d3.select("body")
        .append("svg")
        .attr("class", "legend")
        .attr("width", width)
        .attr("height", height)
        .style("left", left - 90)
        .style("top", bottom - 120);

    var legend = svg.selectAll("g.legendEntry")
        .data(color.range().reverse())
        .enter()
        .append("g").attr("class", "legendEntry")
        .style("float", "left");
        
    legend.append("rect")
        .style("float", 'left')
        .attr("x", width - 200)
        .attr("y", function (d, i) {
            return i * 20;
        })
        .attr("width", 26)
        .attr("height", 22)
        .style("stroke", "#bdbdbd")
        .style("stroke-width", 0.5)
        .style("fill", function (d) { return d; });

    //the data objects are the fill colors
    legend.append("text")
        .attr("x", width - 170) //leave 5 pixel space after the <rect>
        .attr("y", function (d, i) {
            return i * 22.5;
        })
        .attr("dy", "0.8em") //place text one line *below* the x,y point
        .text(function (d, i) {
            var extent = color.invertExtent(d);
            //extent will be a two-element array
            var format = d3.format("0.2f");
            return format(+extent[0]) + " - " + format(+extent[1]);
        }) 
        .style("color", "#464545");
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
            return parseFloat(b[expressed])-parseFloat(a[expressed])
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

    var desc = counties.append("desc")
        .text('{"stroke": "#464545", "stroke-width": "1px"}');
};

// function to create coordinated lollipop chart from https://d3-graph-gallery.com/graph/lollipop_basic.html
function setDotPlot(csvData, colorScale){
    // create chart dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 20,
        rightPadding = 0.5,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    // create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

     // create a rectangle for chart background fill
     var chartBackground = chart.append("rect")
     .attr("class", "chartBackground")
     .attr("width", chartInnerWidth)
     .attr("height", chartInnerHeight)
     .attr("transform", translate);

    // create a scale to size lines proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 0.6]);

    // set lines for each county
    var lines = chart.selectAll(".line")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return parseFloat(b[expressed])-parseFloat(a[expressed])
        })
        .attr("class", function(d){
            // console.log("line", d.adm2_code)
            return "line " + d.adm2_code;
        })
        .attr("width", "0.5")
        .attr("x", function(d, i){
            return i * (chartInnerWidth / csvData.length) + (leftPadding+2.75)
        })
        .attr("y", function(d, i){
            console.log("Dot plot value",expressed)
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .on("mouseover", function(event, d){
            highlight(d);
        })
        .on("mouseout", function(event, d){
            dehighlight(d);
        })
        .on("mousemove", moveLabel);

     // circles
     var circles = chart.selectAll(".circle")
        .data(csvData)
        .join("circle")
        .sort(function(a, b){
            return parseFloat(b[expressed])-parseFloat(a[expressed])
        })
        .attr("class", function(d){
            // console.log("line", d.adm2_code)
            return "circle " + d.adm2_code;
        })
        .attr("cx", function(d, i) {
            return i * (chartInnerWidth / csvData.length) + leftPadding + ((chartInnerWidth / csvData.length) / 2);
            
        })
        .attr("cy", function(d){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .attr("r", "4")
        .style("fill", function(d){
            return colorScale(d[expressed])
        })
        .attr("stroke", "#636363")
        .on("mouseover", function(event, d){
            highlight(d);
        })
        .on("mouseout", function(event, d){
            dehighlight(d);
        })
        .on("mousemove", moveLabel);

    //create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 40)
        .attr("y", 30)
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

    // set line & circle positions, heights, and colors
    updateChart(lines, circles, csvData.length, colorScale);

    var desc = lines.append("desc")
        .text('{"stroke": "none", "stroke-width": "0px"}');

    var desc2 = circles.append("desc")
     .text('{"stroke": "#636363", "stroke-width": "1px"}');

};

// creates dropdown based on arrayObj array
function createDropdown(csvData){

    var left = document.querySelector('.map').getBoundingClientRect().left + 8,
        top = document.querySelector('.map').getBoundingClientRect().top + 6;
        bottom = document.querySelector('.map').getBoundingClientRect().bottom;

    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .style("left", left + "px")
        .style("top", top + "px")
        .on("change", function(){
            changeAttribute(this.value, csvData)
        });

    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Attribute");

    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(arrayObj)
        .enter()
        .append("option")
        .attr("value", function(d){ return d.data })
        .text(function(d){ return d.text });
};

//dropdown change event handler
function changeAttribute(attribute, csvData) {

    // change the expressed attribute
    expressed = attribute;

    // recreate color scale
    var colorScale = makeColorScale(csvData);

    // recolor counties
    var counties = d3.selectAll(".counties")
        .transition()
        .duration(1000)
        .style("fill", function (d) {
            var value = d.properties[expressed];
            if (value) {
                return colorScale(d.properties[expressed]);
            } else {
                return "#ccc";
            }
        });

    // set lines for each county
    var lines = d3.selectAll(".line")
        .sort(function(a, b){
            return parseFloat(b[expressed])-parseFloat(a[expressed])
        })
        .transition() //add animation
        .delay(function(d, i){
            return i * 10
        })
        .duration(500);

    // circles
    var circles = d3.selectAll("circle")
        .sort(function(a, b){
            return parseFloat(b[expressed])-parseFloat(a[expressed])
        })

    var domainArray = [];
    for (var i=0; i<csvData.length; i++){
        var val = parseFloat(csvData[i][expressed]);
        domainArray.push(val);
    };
    var max = d3.max(domainArray);

    yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, max+(0.1*max)]);

    var yAxis = d3.axisLeft()
        .scale(yScale);

    d3.select(".axis").call(yAxis)

    d3.select(".legend").remove();
    makeColorLegend(colorScale);

    // set line & circle positions, heights, and colors
    updateChart(lines, circles, csvData.length, colorScale);
};

//function to position, size, and color lines in chart
function updateChart(lines, circles, n, colorScale){
    
    //position lines
    lines.attr("x", function(d, i){
            return i * (chartInnerWidth / n) + (leftPadding + 2.75)
        })
        // resize lines
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })

    // position circles
    circles.attr("cx", function(d, i) {
            return i * (chartInnerWidth / n) + leftPadding + ((chartInnerWidth / n) / 2);
        })
        .attr("cy", function(d){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .attr("r", "4")
        // recolor circles
        .style("fill", function(d){            
            var value = d[expressed];            
            if(value) {                
                return colorScale(value);            
            } else {                
                return "#ccc";            
            }  
        })
        .attr("stroke", "#636363");

    var chartLabel = arrayDict[expressed] + " in each county";

    var chartTitle = d3.select(".chartTitle")
        .text(chartLabel);
};

//function to highlight enumeration units and bars
function highlight(props){
    //change stroke
    var selected = d3.selectAll("." + props.adm2_code)
        .style("stroke", "#252525")
        .style("stroke-width", "3");
        
    setLabel(props);
};
//function to reset the element style on mouseout
function dehighlight(props){
    var selected = d3.selectAll("." + props.adm2_code)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);
        return styleObject[styleName];
    };

    //remove info label
    d3.select(".infolabel").remove();
};

function setLabel(props){
    //label content
    var labelAttribute = "<b style='font-size:25px;'>" + props[expressed] + 
    "</b> <b>" + arrayDict[expressed] + "</b>";

    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.adm2_code + "_label")
        .html(labelAttribute);

    var countyName = infolabel.append("div")
        .attr("class", "labelname")
        .html(props.NAMELSAD);
};

// function to move info label with mouse
function moveLabel(){
    //get width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;

    // use coordinates of mousemove event to set label coordinates
    var x1 = event.clientX + 10,
        y1 = event.clientY - 75,
        x2 = event.clientX - labelWidth - 10,
        y2 = event.clientY + 25;

    // horizontal label coordinate, testing for overflow
    var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
    // vertical label coordinate, testing for overflow
    var y = event.clientY < 75 ? y2 : y1; 

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};


})();