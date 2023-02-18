// Add all scripts to the JS folder

/* HELLO WORLD Script
function myFunc(){
    var mydiv = document.getElementById('mydiv');
    mydiv.innerHTML='Hello World!';
}
window.onload = myFunc();*/

//initialize function called when the script loads
function initialize(){
    cities();
};


function initialize(){
    cities();
}

function cities(){
    var cityPop = [
        { 
            city: 'Madison',
            population: 233209
        },
        {
            city: 'Milwaukee',
            population: 594833
        },
        {
            city: 'Green Bay',
            population: 104057
        },
        {
            city: 'Superior',
            population: 27244
        }
    ];

    var table = document.createElement('table');

    var headerRow = document.createElement('tr');

    var cityHeader = document.createElement('th');
    cityHeader.innerHTML = 'City';
    headerRow.appendChild(cityHeader);

    var popHeader = document.createElement('th');
    popHeader.innerHTML = 'Population';
    headerRow.appendChild(popHeader);

    table.appendChild(headerRow);
    for (var i = 0; i < cityPop.length; i++){
        var tr = document.createElement("tr");
    
        var city = document.createElement("td");
        //first conditional block
            if (cityPop[i].city == 'Madison'){
                city.innerHTML = 'Badgerville';
            } else if (cityPop[i].city == 'Green Bay'){
                city.innerHTML = 'Packerville';
            } else {
                city.innerHTML = cityPop[i].city;
            }
    
            tr.appendChild(city);
    
            var pop = document.createElement("td");
        //second conditional block        
            if (cityPop[i].population < 500000){
                pop.innerHTML = cityPop[i].population;
            } else {
                pop.innerHTML = 'Too big!';
            };
    
            tr.appendChild(pop);
    
            table.appendChild(tr);
        }
        
        /*
         cityPop.forEach(function(cityobject){
        var tr = document.createElement('tr');
        for (property in cityobject){
            var td = document.createElement('td');
            td.innerHTML = cityobject[property];
            tr.appendChild(td);
        };
        
        table.appendChild(tr);
    });*/

    document.querySelector("#mydiv").appendChild(table);
;
};

window.onload = initialize();
