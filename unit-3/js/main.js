(function(){

//pseudo-global variable    
var attrArray = ["Total households_2016-20", "Total persons_2016-20", "Households with children_ %_2016-20", 	"Children_ %_2016-20", 	"Seniors_ %_2016-20",	"Education less than high school_ %_2016-20",	"English spoken at home_ %_2016-20",	"Asian language spoken at home_ %_2016-20",	"White_ %_2016-20",	"African American_ %_2016-20",	"Asian_ %_2016-20",	"American Indian_ %_2016-20",	"Hispanic or Latino_ %_2016-20", "Noncitizens_ %_2016-20", "Workers driving/carpooling to work_ %_2016-20",	"Poverty rate (all persons)_ %_2020",	"Poverty rate (age 5-17)_ %_2020", "Poverty rate (all persons)_ %_2016-20",	"Poverty rate (children)_ %_2016-20", 	"Gini Index Of Income Inequality_2016-20",	"Households renting home_ %_2016-20",	"Households without vehicle_ %_2016-20"];

var expressed = attrArray[0]; //initial attribute

window.onload = setMap();

// setup a choropleth map
function setMap(){
    // map frame dimensions
    var width = 900,
        height = 500;

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

    var path = d3.geoPath()
        .projection(projection);

   
    // promises container is created to hold the promise
    var promises = [];

    // d3.csv(), d3.json() methods read csv, topojson files
    promises.push(d3.csv("data/wisconsin_counties_data.csv"));
    promises.push(d3.json("data/Wisc_counties.topojson"));

    // helps to load the data asynchronously
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

        // add enumeration units to the map
        setEnumerationUnits(wisconsinCounties, map, path)
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

function setEnumerationUnits(wisconsinCounties, map, path){

     // add Wisconsin to map
    var state = map.selectAll(".state")
      .data(wisconsinCounties)
      .enter()
      .append("path")
      .attr("class", function(d){
          return "counties " + d.properties.NAMELSAD;
      })
      .attr("d", path);
};

})();