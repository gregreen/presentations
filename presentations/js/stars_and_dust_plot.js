(function () {
"use strict";

////////////////////////////////////////////////////////////////////////////////
//
// Stars and dust "problem statement" plot
//
////////////////////////////////////////////////////////////////////////////////

function initStarsAndDustPlot() {
  var containerID = "#stars-and-dust-plot-container";

  var fullWidth = $(containerID).width(),
      fullHeight = $(containerID).height();

  console.log("stars and dust plot: fullHeight = " + fullHeight);
  console.log("stars and dust plot: fullWidth = " + fullWidth);

  var scaling = 1;
  //var scaling = d3.min([d3.max([fullWidth/600, 0.5]), 2.0]);  // Scaling bounded by [0.5, 2.0]

  console.log("stars and dust plot: scaling = " + scaling);

  var labelSize = 14 * scaling;
  var tickSize = 10 * scaling;

  var margins = {
    left:   0 * scaling,
    right:  0 * scaling,
    bottom: 0 * scaling,
    top:    0 * scaling
  };

  var width = fullWidth - margins.left - margins.right,
      height = fullHeight - margins.bottom - margins.top,
      aspect = width/height;

  var bounds = {
      x0: -1.0,
      x1:  1.0,
      y0: -1.0 / aspect,
      y1:  1.0 / aspect
  };

  var xScale = d3.scale.linear()
    .domain([bounds.x0, bounds.x1])
    .range([0, width]);

  var yScale = d3.scale.linear()
    .domain([bounds.y0, bounds.y1])
    .range([height, 0]);

  var svg = d3.select(containerID).append("svg")
    .attr("width", fullWidth)
    .attr("height", fullHeight)
    .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight);

  var defs = svg.append("defs")

  // Arrow head definition
  defs.append("marker")
		.attr({
			"id": "problem-arrow",
			"viewBox": "0 -5 10 10",
			"refX": 5,
			"refY": 0,
			"markerWidth": 6,
			"markerHeight": 6,
			"orient": "auto"
		})
		.append("path")
			.attr("d", "M0,-5L10,0L0,5")
			.attr("class", "arrowHead")
      .style("fill", "#fff");

  var mainGroup = svg.append("g")
    .attr("id", "problem-main-group")
    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

  // Generate stellar properties
  var nStars = 2500;
  var starProp = d3.range(0, nStars).map(function() {
    var xStar = bounds.x0 + (bounds.x1-bounds.x0) * Math.random(),
        yStar = bounds.y0 + (bounds.y1-bounds.y0) * Math.random();

    var thetaStar = Math.atan2(yStar, xStar),
        distStar = Math.sqrt(xStar*xStar + yStar*yStar);

    var tStar = 1.5 * (Math.random()-0.5),
        rStar = 0.8 - 0.8 * distStar * Math.pow(Math.cos(3.*thetaStar), 2);

    return {
      x:  xStar,
      y:  yStar,
      t:  tStar,
      r:  rStar
    };
  });

  // Interpolate between blue and red
  function starColor(c) {
    return d3.interpolateRgb(d3.rgb(255, 122, 0), d3.rgb(162, 192, 255))(c).toString();
  }

  // Stars
  mainGroup.append("g")
      .attr("id", "problem-star-group")
    .selectAll("#problem-star")
      .data(starProp)
    .enter()
      .append("circle")
        .attr("id", "problem-star")
        .attr("r", 3)
        .attr("cx", function(d) { return xScale(d.x); })
        .attr("cy", function(d) { return yScale(d.y); })
        .style("fill", "#fff")
        .style("opacity", 0.);

  // Lines dividing sightlines
  mainGroup.append("g")
      .attr("id", "problem-divider-group")
    .selectAll("#problem-divider")
      .data(d3.range(0., 2.*Math.PI, Math.PI/16.).map(function(d) {
        var xDivider = 1.42 * Math.cos(d),
            yDivider = 1.42 * Math.sin(d);
        var xyDivScale = 1. / d3.max([Math.abs(xDivider), Math.abs(yDivider)]);
        return {
          x: xDivider * xyDivScale,
          y: yDivider * xyDivScale
        };
      }))
    .enter()
      .append("line")
        .attr("id", "problem-divider")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", function(d) { return xScale(d.x); })
        .attr("y2", function(d) { return yScale(d.y); })
        .style("stroke", "#000")
        .style("stroke-width", 3)
        .style("opacity", 0.);

  // Sol
  mainGroup.append("circle")
    .attr("id", "problem-sol")
    .attr("r", 9)
    .attr("cx", xScale(0))
    .attr("cy", xScale(0))
    .style("fill", "#fff")
    .style("stroke", "#444")
    .style("stroke-width", 4);

  // Distance Arrow
  var distGroup = mainGroup.append("g")
    .attr("id", "problem-distance-group")
    .attr("transform", "translate(30, 0) rotate(-50, " + xScale(0) + "," + yScale(0) + ")")
    .style("opacity", 0.);

  distGroup.append("line")
    .attr("class", "arrow")
    .attr("marker-end", "url(#problem-arrow)")
    .attr("x1", xScale(0))
    .attr("x2", xScale(1))
    .attr("y1", yScale(0))
    .attr("y2", yScale(0))
    .style("stroke", "#fff")
    .style("stroke-width", 4);

  distGroup.append("text")
    .attr("x", xScale(0.5))
    .attr("y", yScale(0))
    .attr("dy", "30pt")
    .style("text-anchor", "middle")
    .style("fill", "#fff")
    .style("font-family", "'Quicksand', sans-serif")
    .text("extinction(distance)");

  // Transition functions
  var dt = 1500;

  function problemToggleElement(elemID, t) {
    d3.selectAll("#problem-" + elemID)
      .transition()
        .duration(dt)
        .style("opacity", t);
  }

  function setStarColor(useReddening, useTemp) {
    d3.selectAll("#problem-star")
      .data(starProp)
    .transition()
      .duration(dt)
      .style("fill", function(d) { return (useTemp || useReddening) ? starColor(useReddening * d.r + useTemp * d.t) : "#fff"; });
  }

  function highlightStars(nRays, rayIdx, bgOpacity) {
    d3.selectAll("#problem-star")
      .data(starProp)
    .transition()
      .duration(dt)
      .style("opacity", function(d) {
        return Math.round(Math.atan2(d.y, d.x) * (nRays / (2.*Math.PI))) == rayIdx ? 1.0 : bgOpacity;
      });
  }

  Reveal.addEventListener('fragmentshown', function(event) {
    if(event.fragment.id == 'problem-show-stars') {
      problemToggleElement("star", 1);
    } else if(event.fragment.id == 'problem-show-reddening') {
      setStarColor(1, 0);
    } else if(event.fragment.id == 'problem-highlight-los') {
      highlightStars(32, 5, 0.15);
    } else if(event.fragment.id == 'problem-show-arrow') {
      problemToggleElement("distance-group", 1);
    } else if(event.fragment.id == 'problem-show-temp') {
      setStarColor(1, 1);
    }
  });

  Reveal.addEventListener('fragmenthidden', function(event) {
    if(event.fragment.id == 'problem-show-stars') {
      problemToggleElement("star", 0);
    } else if(event.fragment.id == 'problem-show-reddening') {
      setStarColor();
    } else if(event.fragment.id == 'problem-highlight-los') {
      highlightStars(32, 5, 1.0);
    } else if(event.fragment.id == 'problem-show-arrow') {
      problemToggleElement("distance-group", 0);
    } else if(event.fragment.id == 'problem-show-temp') {
      setStarColor(1, 0);
    }
  });
}

$(document).ready(function() {
  initStarsAndDustPlot();
});

})();
