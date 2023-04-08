window.onload = setMap();

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
    promises.push(d3.csv("data/D3_Lab_Wisc_Counties.csv"));
    promises.push(d3.json("data/Wisc_counties.topojson"));

    // helps to load the data asynchronously
    // bind the output into callback function
    Promise.all(promises).then(callback);

    // callback reads the output response of promises (read files - csv, topojson)
    // retrieves the file information
    function callback(data){
        csvData = data[0];
        wisconsin = data[1];

        // testing whether the files are loaded correctly or not
        console.log(csvData);
        console.log(wisconsin);

        /*
        // create graticule generator
        var graticule = d3.geoGraticule()
            .step([2, 1]); //place graticule lines every 5 degrees of longitude and latitude
        
        // create graticule background
        var gratBackground = map.append("path")
            // bind graticule background
            .datum(graticule.outline()) 
            // assign class for styling
            .attr("class", "gratBackground") 
            // project graticule
            .attr("d", path) 

        // create graticule lines
        // select graticule elements that will be created
        var gratLines = map.selectAll(".gratLines") 
            // bind graticule lines to each element to be created
            .data(graticule.lines()) 
            // create an element for each datum
            .enter() 
            // append each element to the svg as a path element
            .append("path") 
            // assign class for styling
            .attr("class", "gratLines") 
            // project graticule lines
            .attr("d", path); */

        // translate Wisconsin counties from topojson to geojson
        var wisconsinCounties = topojson.feature(wisconsin, wisconsin.objects.Wisc_counties).features;

        // add Wisconsin to map
        var state = map.selectAll(".state")
            .data(wisconsinCounties)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "counties " + d.properties.NAMELSAD;
            })
            .attr("d", path);

        // check the conversion result 
        console.log(wisconsinCounties);

    };

};