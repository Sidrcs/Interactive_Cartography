window.onload = function(){
    var w = 900, h = 500;

    var container = d3.select("body") // Selecting body from DOM
        .append("svg") //adding an SVG element
        .attr("width", w) //assig width
        .attr("height",h) //assign height
        .attr("class", "container") //assign a class name
        .style("background-color","rgba(0,0,0,0.2)"); //ending the block

    //inner rect
    var innerRect = container.append("rect") //add <rect> element
            .datum(400)
            .attr("width",function(d){
                return d*2
            }) //assign width
            .attr("height",function(d){
                return d
            })//assign height
            .attr("class", "innerRect")
            .attr("x",50)
            .attr("y",50)
            .style("fill","#FFFFFF")

    //Example
    /*
    var dataArray = [10, 20, 30, 40, 50];

    var circles = container.selectAll(".circles") //but wait--there are no circles yet!
        .data(dataArray) //here we feed in an array
        .enter() //one of the great mysteries of the universe
        .append("circle") //add a circle for each datum
        .attr("class", "circles") //apply a class name to all circles
        .attr("r", function(d, i){ //circle radius
            console.log("d:", d, "i:", i); //let's take a look at d and i
            return d;
        })
        .attr("cx", function(d, i){ //x coordinate
            return 70 + (i * 180);
        })
        .attr("cy", function(d){ //y coordinate
            return 450 - (d * 5);
        });

    console.log(container)
    console.log(innerRect)*/

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

    //Example
    var circles = container.selectAll(".circles") //create an empty selection
        .data(cityPop) //here we feed in an array
        .enter() //one of the great mysteries of the universe
        .append("circle") //inspect the HTML--holy crap, there's some circles there
        .attr("class", "circles")
        .attr("id", function(d){
            return d.city;
        })
        .attr("r", function(d){
            //calculate the radius based on population value as circle area
            var area = d.population * 0.01;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d, i){
            //use the index to place each circle horizontally
            return 90 + (i * 180);
        })
        .attr("cy", function(d){
            //subtract value from 450 to "grow" circles up from the bottom instead of down from the top of the SVG
            return 450 - (d.population * 0.0005);
        });
}
