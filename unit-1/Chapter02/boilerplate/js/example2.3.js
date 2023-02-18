//initialize function called when script loads
function initialize(){
    cities();
};

//function to create a table with cities and their populations
function cities(){
    var cities = [
        'Madison',
        'Milwaukee',
        'Green Bay',
        'Superior'
    ];
    var population = [
        233209,
        594833,
        104057,
        27244
    ];

    //create a table element
    var table = document.createElement("table");

    //create a header row
    var headerRow = document.createElement("tr");

    //add city column to header row
    var cityHeader = document.createElement("th");
    cityHeader.innerHTML = "City";
    headerRow.appendChild(cityHeader);

    //add population column to header row
    var popHeader = document.createElement("th");
    popHeader.innerHTML = "Population";
    headerRow.appendChild(popHeader);

    //add the header row
    table.appendChild(headerRow);

    //loop to add a new row for each city
    for (var i = 0; i < cities.length; i++){
        var tr = document.createElement("tr");

        var city = document.createElement("td");
        city.innerHTML = cities[i];
        tr.appendChild(city);

        var pop = document.createElement("td");
        pop.innerHTML = population[i];
        tr.appendChild(pop);

        table.appendChild(tr);
    };

    //add the table to the div in index.html
    var mydiv = document.getElementById("mydiv");
    mydiv.appendChild(table);
};

window.onload = initialize();