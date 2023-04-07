window.onload = setMap();

function setMap(){

    var promises = [d3.csv("data/D3_Lab_Wisc_Counties.csv"),
        d3.json("data/Wisc_counties.topojson")]
    
    Promise.all(promises).then(callback);

    function callback(data){
        csvData = data[0];
        wisconsin = data[1];

        console.log(csvData);
        console.log(wisconsin);
    };

};