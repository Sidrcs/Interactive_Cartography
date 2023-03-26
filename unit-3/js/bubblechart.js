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
            .style("fill","#FFFFFF");

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

    var x = d3.scaleLinear() //create the scale
        .range([90, 750]) //output min and max
        .domain([0, 3]); //input min and max

    //find the minimum value of the array
    var minPop = d3.min(cityPop, function(d){
        return d.population;
    });

    //find the maximum value of the array
    var maxPop = d3.max(cityPop, function(d){
        return d.population;
    });

    //scale for circles center y coordinate
    var y = d3.scaleLinear()
        .range([450, 50]) //was 440, 95
        .domain([0, 700000]); //was minPop, maxPop

    var color = d3.scaleLinear()
        .range([
            "#FDBE85",
            "#D94701"
        ])
        .domain([
            minPop, 
            maxPop
        ]);

    var yAxis = d3.axisLeft(y);

    var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("Major Cities Population (Wisconsin)");

    //create axis g element and add axis
    var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50, 0)")
        .call(yAxis);
    

    //Example
    var circles = container.selectAll(".circles") //create an empty selection
        .data(cityPop) //here we feed in an array
        .enter() //one of the great mysteries of the universe
        .append("circle") //inspect the HTML - holy crap, there's some circles there
        .attr("class", "circles")
        .attr("id", function(d){
            return d.city;
        })
        .attr("r", function(d){
            //calculate the radius based on population value as circle area
            var area = d.population * 0.01;
            return Math.sqrt(area/Math.PI).toFixed(2);
        })
        .attr("cx", function(d, i){
            //use the scale generator with the index to place each circle horizontally
            return x(i);
        })
        .attr("cy", function(d){
            return y(d.population);
        })
        .style("fill", function(d, i){ //add a fill based on the color scale generator
            return color(d.population);
        })
        .style("stroke", "#000"); //black circle stroke

    //create format generator
    var format = d3.format(",");

    var labels = container.selectAll(".labels")
        .data(cityPop)
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("y", function(d){
            //vertical position centered on each circle
            return y(d.population) + 5;
        });

    //first line of label
    var nameLine = labels.append("tspan")
        .attr("class", "nameLine")
        .attr("x", function(d,i){
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .attr("dy", "-5")
        .text(function(d){
            return d.city;
        });

    //second line of label
    var popLine = labels.append("tspan")
        .attr("class", "popLine")
        .attr("x", function(d,i){
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .attr("dy", "15") //vertical offset
        .text(function(d){
            return "Pop: " + format(d.population);
        });
    }
