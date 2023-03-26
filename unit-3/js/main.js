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


    console.log(container)
    console.log(innerRect)
}
