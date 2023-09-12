(function () {

////////////////////////////////////////////////////////////////////////////////
//
// Illustration of a dust grain
//
////////////////////////////////////////////////////////////////////////////////

function initGrainPlot() {
  var containerID = "grain-plot-container";

  var container = document.getElementById(containerID);

  var fullWidth = container.clientWidth;
  var fullHeight = fullWidth/2;
  /*var fullHeight = container.clientHeight;*/
  var scaling = d3.min([d3.max([fullWidth/600, 0.5]), 2.0]);  // Scaling bounded by [0.5, 2.0]

  console.log("fullWidth: " + fullWidth);
  console.log("fullHeight: " + fullHeight);
  console.log("problem plot scaling: " + scaling);

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

  var svg = d3.select("#"+containerID).append("svg")
    .attr("width", fullWidth)
    .attr("height", fullHeight)
    .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight)
    .attr("id", "grain-svg");

  var mainGroup = svg.append("g")
    .attr("id", "grain-main-group")
    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

  // Photon paths
  var pathsGroup = mainGroup.append("g")
    .attr("id", "photonPaths");

  var line = d3.svg.line()
    .interpolate("monotone")
    .x(function(d) {return xScale(d.x);})
    .y(function(d) {return yScale(d.y);});

  var blueColor = "steelblue";
  var redColor = "#FFA62F";
  var irColor = "#8C001A";

  var photonData = [
    { // Absorbed photon
      'class': 'absorbed',
      'color': blueColor,
      'path': [
        {"x":  1.00, "y":  0.0},
        {"x":  0.05, "y":  0.0}
      ]
    },
    { // Absorbed photon
      'class': 'absorbed',
      'color': redColor,
      'path': [
        {"x":  1.00, "y":  0.04},
        {"x":  0.05, "y":  0.04}
      ]
    },
    { // Scattered photon
      'class': 'scattered',
      'color': blueColor,
      'path': [
        {"x":  1.0, "y":  0.065},
        {"x":  0.1, "y":  0.065},
        {"x": -1.0, "y": -0.3}
      ]
    },
    { // Scattered photon
      'class': 'scattered',
      'color': redColor,
      'path': [
        {"x":  1.0, "y":  0.068},
        {"x":  0.1, "y":  0.068},
        {"x": -1.0, "y": -0.5}
      ]
    },
    { // Scattered photon
      'class': 'scattered',
      'color': blueColor,
      'path': [
        {"x":  1.0, "y": -0.068},
        {"x":  0.1, "y": -0.068},
        {"x": -1.0, "y":  0.8}
      ]
    },
    { // Transmitted photon
      'class': 'transmitted',
      'color': blueColor,
      'path': [
        {"x":  1.0, "y":  0.08},
        {"x": -1.0, "y":  0.08}
      ]
    },
    { // Transmitted photon
      'class': 'transmitted',
      'color': redColor,
      'path': [
        {"x":  1.0, "y":  -0.08},
        {"x": -1.0, "y":  -0.08}
      ]
    },
    { // Transmitted photon
      'class': 'transmitted',
      'color': redColor,
      'path': [
        {"x":  1.0, "y": -0.095},
        {"x": -1.0, "y": -0.095}
      ]
    },
    { // Emitted photon
      'class': 'emitted-unseen',
      'color': irColor,
      'path': [
        {"x":  0.05, "y":  0.0},
        {"x":  0.25, "y":  1.0}
      ]
    },
    { // Emitted photon
      'class': 'emitted-unseen',
      'color': irColor,
      'path': [
        {"x":  0.0, "y":  0.0},
        {"x": -0.7, "y": -1.0}
      ]
    },
    { // Emitted photon
      'class': 'emitted-unseen',
      'color': irColor,
      'path': [
        {"x": -0.03, "y":  0.0},
        {"x": -0.60, "y":  1.0}
      ]
    },
    { // Emitted photon
      'class': 'emitted-seen',
      'color': irColor,
      'path': [
        {"x": -0.05, "y":  0.0},
        {"x": -1.00, "y":  0.0}
      ]
    }
  ];

  var photonPaths = pathsGroup.selectAll("path")
    .data(photonData)
    .enter()
      .append("path")
      .attr("d", function(d) { return line(d.path); })
      .attr("class", function(d) { return "photon-"+d.class; })
      .attr("stroke", function(d) { return d.color; })
      .attr("stroke-width", "2")
      .attr("fill", "none")
      .attr("opacity", 1);

  // Add image of grain
  var grainHref = d3.select("#grain-img").attr("src");
  console.log(grainHref);
  var grainImg = mainGroup.append("svg:image")
    .attr("width", fullWidth)
    .attr("height", fullHeight)
    .attr("x", 0)
    .attr("y", 0)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("xlink:href", grainHref);

  // Add image of telescope
  var telescopeHref = d3.select("#telescope-img").attr("src");
  console.log(telescopeHref);
  var telescopeImg = mainGroup.append("svg:image")
    .attr("width", 0.80*fullWidth)
    .attr("height", 1.00*fullHeight)
    .attr("x", -0.50*fullWidth)
    .attr("y", 0.*fullHeight)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("xlink:href", telescopeHref)
    .attr("opacity", 0);

  // Add radial gradient definition
  var blueStarInner = "#D2F6FF";
  var blueStarOuter = "#12CFFB";
  var redStarInner = "#AA885B";//"#FFD296";
  var redStarOuter = "#A76B1A";//"#F99B1E";
  var defs = svg.append("defs");
  var starGradient = defs.append("radialGradient")
    .attr("id", "starGradient");
  starGradient.append("stop")
    .attr("offset", "80%")
    .attr("stop-color", blueStarInner)
    .attr("id", "star-inner");
  starGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", blueStarOuter)
    .attr("id", "star-outer");

  // Add circle for star
  var starRadius = 0.5 * fullHeight;
  var starCircle = mainGroup.append("circle")
    .attr("cx", fullWidth + 0.7*starRadius)
    .attr("cy", 0.5*fullHeight)
    .attr("r", starRadius)
    .attr("fill", "url(#starGradient)")
    .attr("opacity", 0);

  // Transitions
  var dt = 2000;

  var shrinkGrain = function() {
    grainImg.transition()
      .duration(dt)
        .attr("x", 0.425*fullWidth)
        .attr("y", 0.425*fullHeight)
        .attr("width", 0.15*fullWidth)
        .attr("height", 0.15*fullHeight);
  }

  var growGrain = function() {
    grainImg.transition()
      .duration(dt)
        .attr("x", 0.)
        .attr("y", 0.)
        .attr("width", fullWidth)
        .attr("height", fullHeight);
  }

  var showStar = function(opVal) {
    starCircle.transition()
      .duration(dt)
        .attr("opacity", opVal);
  }

  var showTelescope = function(opVal) {
    telescopeImg.transition()
      .duration(dt)
        .attr("opacity", opVal);
  }

  var resetPhotons = function(photonClass) {
    console.log(".photon-"+photonClass);
    pathsGroup.selectAll(".photon-"+photonClass).each(function() {
      console.log(this);
      var totalLength = this.getTotalLength();
      d3.select(this)
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength);
    });
  };

  var animatePhotons = function(photonClass) {
    pathsGroup.selectAll(".photon-"+photonClass)
      .transition()
      .duration(dt)
        .ease("linear")
        .attr("stroke-dashoffset", 0);
  };

  var fadePhotons = function(photonClass, opVal) {
    pathsGroup.selectAll(".photon-"+photonClass)
      .transition()
      .duration(dt)
        .attr("opacity", opVal);
  };

  var setStarColor = function(innerColor, outerColor) {
    defs.select("#star-inner")
      .transition().duration(dt)
        .attr("stop-color", innerColor);
    defs.select("#star-outer")
      .transition().duration(dt)
        .attr("stop-color", outerColor);
  }

  // All photon paths begin invisible
  resetPhotons("absorbed");
  resetPhotons("scattered");
  resetPhotons("transmitted");
  resetPhotons("emitted-seen");
  resetPhotons("emitted-unseen");

  Reveal.addEventListener('fragmentshown', function(event) {
    if(event.fragment.id == 'grain-initialize') {
      shrinkGrain();
      showStar(1);
      showTelescope(1);
    } else if(event.fragment.id == 'grain-absorbed') {
      animatePhotons("absorbed");
    } else if(event.fragment.id == 'grain-scattered') {
      animatePhotons("scattered");
    } else if(event.fragment.id == 'grain-transmitted') {
      animatePhotons("transmitted");
    } else if(event.fragment.id == 'grain-fade-unseen') {
      fadePhotons("absorbed", 0.2);
      fadePhotons("scattered", 0.2);
    } else if(event.fragment.id == 'grain-redden-star') {
      setStarColor(redStarInner, redStarOuter);
    } else if(event.fragment.id == 'grain-emit') {
      animatePhotons("emitted-seen");
      animatePhotons("emitted-unseen");
    } else if(event.fragment.id == 'grain-fade-emitted') {
      fadePhotons("emitted-unseen", 0.35);
    }
  });

  Reveal.addEventListener('fragmenthidden', function(event) {
    if(event.fragment.id == 'grain-initialize') {
      growGrain();
      showStar(0);
      showTelescope(0);
      resetPhotons("absorbed");
      resetPhotons("scattered");
      resetPhotons("transmitted");
      resetPhotons("emitted-seen");
      resetPhotons("emitted-unseen");
    } else if(event.fragment.id == 'grain-absorbed') {
      resetPhotons("absorbed");
    } else if(event.fragment.id == 'grain-scattered') {
      resetPhotons("scattered");
    } else if(event.fragment.id == 'grain-transmitted') {
      resetPhotons("transmitted");
    } else if(event.fragment.id == 'grain-fade-unseen') {
      fadePhotons("absorbed", 1);
      fadePhotons("scattered", 1);
    } else if(event.fragment.id == 'grain-redden-star') {
      setStarColor(blueStarInner, blueStarOuter);
    } else if(event.fragment.id == 'grain-emit') {
      resetPhotons("emitted-seen");
      resetPhotons("emitted-unseen");
    } else if(event.fragment.id == 'grain-fade-emitted') {
      fadePhotons("emitted-unseen", 1);
    }
  });
}

// Initialize plots
(function() {
  var grainPlotInitialized = false;
  Reveal.addEventListener('grain-plot-slide', function() {
    if(!grainPlotInitialized) {
      initGrainPlot();
      grainPlotInitialized = true;
    }
  }, false);
})();

})();
