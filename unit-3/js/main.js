window.onload = setMap();

function setMap(){
    // d3.csv(), d3.json() methods read csv, topojson files
    // promises container is created to hold the promise
    var promises = [d3.csv("data/D3_Lab_Wisc_Counties.csv"),
        d3.json("data/Wisc_counties.topojson")];
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

        // translate Wisconsin counties from topojson to geojson
        var wisconsinCounties = topojson.feature(wisconsin, wisconsin.objects.Wisc_counties);
        // To check the conversion result 
        console.log(wisconsinCounties);

    };

};