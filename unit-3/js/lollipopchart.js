// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 40, left: 100},
    width = 1000 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Parse the Data
d3.csv("Data/wisconsin_counties_data.csv").then( function(data) {

  // Add X axis
  const x = d3.scaleLinear()
    .domain([0, 13000])
    .range([ 0, width]);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

// Y axis
const y = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(function(d) { return d.NAMELSAD; }))
  .padding(1);
svg.append("g")
  .call(d3.axisLeft(y))


// Lines
svg.selectAll("myline")
  .data(data)
  .enter()
  .append("line")
    .attr("x1", function(d) { return x(d.hh1620_est); })
    .attr("x2", x(0))
    .attr("y1", function(d) { return y(d.NAMELSAD); })
    .attr("y2", function(d) { return y(d.NAMELSAD); })
    .attr("stroke", "grey")

// Circles
svg.selectAll("mycircle")
  .data(data)
  .enter()
  .append("circle")
    .attr("cx", function(d) { return x(d.hh1620_est); })
    .attr("cy", function(d) { return y(d.NAMELSAD); })
    .attr("r", "4")
    .style("fill", "#69b3a2")
    .attr("stroke", "black")
})