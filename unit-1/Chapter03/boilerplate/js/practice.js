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

    cityPop.forEach(function(cityobject){
        var tr = document.createElement('tr');

        for (property in cityobject){
            var td = document.createElement('td');
            td.innerHTML = cityobject[property];
            tr.appendChild(td);
        };
        table.appendChild(tr);
    });

    var mydiv = document.getElementById('mydiv');
    mydiv.appendChild(table);
};

window.onload = initialize();
