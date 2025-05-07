(function () {
  class CurveAnimation {
    constructor(x, y0, y1, c0, c1, v0, v1,
                c_fg="black", c_bg="white",
                n_intermediate=10, n_circles=50,
                wl_B=440, wl_V=550) {
      // Find container
      const container_id = '#Rv-grain-plot-container'
      const container = d3.select(container_id);
      //var container_width = parseInt(container.style('width'));
      if(d3.select('body').style('--slide-width') == '100%px') {
        var container_width = $(container_id).width(),
            container_height = $(container_id).height();
      } else {
        var container_width = parseInt(d3.select('body').style('--slide-width'));
        var container_height = parseInt(d3.select('body').style('--slide-height'));
      }
      console.log(container_width + 'x' + container_height);

      // Margins, width, height, etc.
      this.cbar_margin_left = 20;
      this.cbar_width = 20;
      this.margin = {
        top: 30,
        right: 65+this.cbar_margin_left+this.cbar_width,
        bottom: 55,
        left: 65
      };
      this.full_width = 0.9*container_width;
      this.full_height = 0.8*container_height;
      this.width = this.full_width - this.margin.left - this.margin.right;
      this.height = this.full_height - this.margin.top - this.margin.bottom;

      this.x = x;
      this.y0 = y0;
      this.y1 = y1;
      this.c0 = c0;
      this.c1 = c1;
      this.v0 = v0;
      this.v1 = v1;
      this.c_fg = c_fg;
      this.c_bg = c_bg;

      this.intermediate_curves = this.generateIntermediateCurves(n_intermediate);

      this.svg = container//d3.select("#Rv-grain-plot-container")
        .append("svg")
        .attr("width", this.full_width)
        .attr("height", this.full_height)
        .attr("viewbox", `0 0 ${this.full_width} ${this.full_height}`)
        .attr("color", this.c_fg)
        .style("background", this.c_bg)
        .append("g")
        .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

      this.xScale = d3.scaleLinear()
        .domain([d3.min(x), d3.max(x)])
        .range([0, this.width]);

      this.yScale = d3.scaleLinear()
        .domain([
          Math.min(d3.min(y0), d3.min(y1)), 
          1.15*Math.max(d3.max(y0), d3.max(y1))
        ])
        .range([this.height, 0]);

      this.colorScale = d3.scaleLinear()
        .domain([v0, v1])
        .range([this.height, 0]);

      this.line = d3.line()
        .x((d, i) => this.xScale(this.x[i]))
        .y(d => this.yScale(d));

      // Generate circles
      this.circles = this.generateCircles(n_circles);

      this.createColorGradient();
      this.addAxes();

      this.plotIntermediateCurves();
      this.plotCircles();

      this.path = this.svg.append("path")
        .datum(this.y0)
        .attr("fill", "none")
        .attr("stroke", this.c0)
        .attr("stroke-width", 3)
        .attr("d", this.line);

      // Create vertical dotted lines for B and V
      [{x:wl_B,c:"#00ffff",s:"B"},{x:wl_V,c:"#ffbfca",s:"V"}].map(d => {
        this.svg.append("line")
          .attr("x1", this.xScale(d.x)) // Replace someXValue with the x-coordinate where you want the line
          .attr("y1", this.yScale.range()[0])  // Start at the top of the y-range
          .attr("x2", this.xScale(d.x)) // Same x-coordinate as x1
          .attr("y2", this.yScale.range()[1])  // End at the bottom of the y-range
          .attr("stroke", d.c)        // Set the color of the line
          .attr("stroke-width", 3)        // Set the thickness of the line
          .attr("stroke-dasharray", "4")  // Make the line dotted
          .attr("opacity", 0.3);
        this.svg.append("text")
          .attr("x", this.xScale(d.x))
          .attr("y", this.yScale.range()[1]-10)
          .attr("text-anchor", "middle")
          .attr("font-size", 24)
          .attr("fill", d.c)
          .attr("opacity", 0.7)
          .text(d.s);
      });

      // Create R(V) definition
      this.svg.append("text")
        .attr("x", 0.98*this.xScale.range()[1]+0.02*this.xScale.range()[0])
        .attr("y", 0.5*(this.yScale.range()[0]+this.yScale.range()[1]))
        .attr("text-anchor", "end")
        .attr("fill", this.c_fg)
        .attr("font-style", "italic")
        .attr("font-size", 26)
        .attr("opacity", 0.7)
        .style("font-family", "sans-serif")
        .text("R(V) ≡ A(V) / E(B-V)");
    }

    getCircleRadius(x) {
      return Math.pow(0.5 + 0.05*x, 0.8);
    };

    generateCircles(n_circles) {
      const circles = [];
      const lam = 7.0; // Exponential distribution constant
      for (let i = 0; i < n_circles; i++) {
        // Random x position between 0 and 0.7 of x-axis width,
        // with truncated lambda=5 exponential distribution
        //const x = this.width * (0.5*Math.random() + 0.1);
        //const x = 0.5*this.width * Math.pow(d3.randomNormal(0,1)(),2);
        //const x = this.width * d3.min([d3.randomExponential(10)(), 0.7]);
        const u = (i + Math.random()) / n_circles;
        const x = -0.7 * this.width * Math.log(1 - u*(1-Math.exp(-lam))) / lam;
        console.log(`x_${i} = ${x}, u = ${u}`);
        
        // Random y position around 0.8 of y-axis height with ±0.1 variation
        //const y = this.height * (0.15 + 0.2 * (Math.random() - 0.5));
        const y = this.height * d3.randomNormal(0.12, 0.04)();
        
        // Random shift amount for transformation
        //const xShift = (0.1+0.8*Math.random()) * (this.width - x);
        //const u1 = u + (Math.random()-0.5)/n_circles;
        //const u1 = (i+1 + Math.random()-0.5) / n_circles;
        //const x1 = this.width * (0.1 - 0.8 * Math.log(1 - u1*(1-Math.exp(-0.5*lam))) / (0.5*lam));
        //const xShift = x1 - x;
        const xShift = d3.min([
          d3.max([
            (0.2+0.3*Math.random()) * this.width,
            (0.1+0.4*Math.random()) * x,
          ]),
          0.95*this.width-x
        ]);

        circles.push({ x, y, xShift });
      }
      return circles;
    }

    plotCircles() {
      this.circleElements = this.svg.selectAll(".moving-circle")
        .data(this.circles)
        .enter()
        .append("circle")
        .attr("class", "moving-circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => this.getCircleRadius(d.x))
        .attr("fill", this.c_fg)
        .attr("fill-opacity", 0.5)
        .attr("stroke", this.c_fg)
        .attr("stroke-opacity", 0.7);
    }

    createColorGradient() {
      const gradient = this.svg.append("defs")
        .append("linearGradient")
        .attr("id", "color-gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", this.c0);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", this.c1);

      this.svg.append("rect")
        .attr("x", this.width + this.cbar_margin_left)
        .attr("y", 0)
        .attr("width", this.cbar_width)
        .attr("height", this.height)
        .style("fill", "url(#color-gradient)")
        .style("stroke", this.c_fg);

      // Color bar axis
      const colorAxis = d3.axisRight(this.colorScale)
        .ticks(6)
        .tickSize(6);

      const colorAxisGroup = this.svg.append("g")
        .attr("transform", `translate(${this.width + this.cbar_margin_left + this.cbar_width},0)`)
        .call(colorAxis);

      // Color bar label
      colorAxisGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -this.height / 2)
        .attr("y", 54)
        .attr("text-anchor", "middle")
        .attr("fill", this.c_fg)
        .attr("font-style", "italic")
        .attr("font-size", 24)
        .text("R(V)");
    }

    addAxes() {
      // X-axis with major and minor ticks
      const xAxis = d3.axisBottom(this.xScale)
        .ticks(6)  // Major ticks
        .tickSize(6);
      const xMinorAxis = d3.axisBottom(this.xScale)
        .ticks(30)  // Minor ticks
        .tickSize(3)
        .tickFormat("");

      const xAxisGroup = this.svg.append("g")
        .attr("transform", `translate(0,${this.height})`)
        .call(xAxis);

      // X-axis minor ticks
      this.svg.append("g")
        .attr("transform", `translate(0,${this.height})`)
        .call(xMinorAxis)
        .selectAll("line")
        .style("stroke-opacity", 0.5);

      // X-axis label
      xAxisGroup.append("text")
        .attr("x", this.width / 2)
        .attr("y", 45)
        .attr("fill", this.c_fg)
        .attr("font-size", 24)
        .call(function(selection) {
          selection.append("tspan")
                   .text("wavelength");
          selection.append("tspan")
                   .attr("font-style", "italic")
                   .text(" λ");
          selection.append("tspan")
                   .text(" (nm)");
        });

      // Y-axis with major and minor ticks
      const yAxis = d3.axisLeft(this.yScale)
        .ticks(6)  // Major ticks
        .tickSize(6);
      const yMinorAxis = d3.axisLeft(this.yScale)
        .ticks(30)  // Minor ticks
        .tickSize(3)
        .tickFormat("");

      const yAxisGroup = this.svg.append("g")
        .call(yAxis);

      // Y-axis minor ticks
      this.svg.append("g")
        .call(yMinorAxis)
        .selectAll("line")
        .style("stroke-opacity", 0.5);

      // Y-axis label
      yAxisGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -42)
        .attr("x", -this.height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", this.c_fg)
        .attr("font-size", 24)
        .call(function(selection) {
          selection.append("tspan")
                   .text("extinction");
          selection.append("tspan")
                   .attr("font-style", "italic")
                   .text(" A");
          selection.append("tspan")
                   .text(" (mag)");
        });

        // Tick-label formatting
        d3.selectAll(".tick").style("font-size", 16)
    }

    generateIntermediateCurves(n_intermediate) {
      const curves = [];
      for (let i = 1; i <= n_intermediate; i++) {
        const t = i / (n_intermediate + 1);
        const intermediate_curve = this.y0.map((y0_val, idx) => 
          y0_val + t * (this.y1[idx] - y0_val)
        );
        curves.push(intermediate_curve);
      }
      return curves;
    }

    plotIntermediateCurves() {
      this.intermediate_curves.forEach((curve, idx) => {
        // Interpolate color
        const t = (idx + 1) / (this.intermediate_curves.length + 1);
        const interpolatedColor = d3.interpolateRgb(this.c0, this.c1)(t);

        this.svg.append("path")
          .datum(curve)
          .attr("fill", "none")
          .attr("stroke", interpolatedColor)
          .attr("stroke-opacity", 0.2)
          .attr("stroke-width", 2)
          .attr("d", this.line);
      });
    }

    // Update the curve
    update(forward = true) {
      const targetData = forward ? this.y1 : this.y0;
      const targetColor = forward ? this.c1 : this.c0;

      // Animate transition
      this.path
        .transition()
        .duration(1000)
        .attr("stroke", targetColor)
        .attrTween("d", () => {
          const interpolate = d3.interpolate(
            forward ? this.y0 : this.y1, 
            forward ? this.y1 : this.y0
          );
          return t => this.line(interpolate(t));
        });

      // Animate circles
      this.circleElements
        .transition()
        .duration(1000)
        .attr("cx", d => forward ? d.x + d.xShift : d.x)
        .attr("r", d => forward ? this.getCircleRadius(d.x + d.xShift) : this.getCircleRadius(d.x));
        //.attr("fill", targetColor)
        //.attr("stroke", targetColor);
    }
  }

  initRvPlot = function() {
    // Example data and colors
    const x = d3.range(300, 1000, 10);
    const y0 = x.map(xx => Math.pow(xx/500,-1.2));
    const y1 = x.map(xx => Math.pow(xx/500,-0.5));
    const c0 = "red";
    const c1 = "deepskyblue";
    const v0 = 2.1;  // value corresponding to c0
    const v1 = 4.1;  // value corresponding to c1
    const c_fg = "white";
    const c_bg = "black";

    const wl_B = 440.0;
    const wl_V = 555.0;

    // Create animation instance
    const animation = new CurveAnimation(x, y0, y1, c0, c1,
                                         v0, v1, c_fg, c_bg);

    // Force a reflow
    const plotContainer = document.getElementById('Rv-grain-plot-slide');
    plotContainer.offsetHeight; // Accessing this property triggers a reflow

    // Add listeners
    Reveal.addEventListener('fragmentshown', function(event) {
      console.log('fragment shown!');
      console.log('id = ' + event.fragment.id);
      if(event.fragment.id == 'high-Rv') {
        animation.update(true);
      }
    });
    Reveal.addEventListener('fragmenthidden', function(event) {
      if(event.fragment.id == 'high-Rv') {
        animation.update(false);
      }
    });
  };

  // Immediately initialize the plot
  initRvPlot();

  // Initialize plots
  //(function() {
  //  var RvPlotInitialized = false;
  //  //Reveal.addEventListener('Rv-grain-plot-slide', function() {
  //  Reveal.addEventListener('ready', function(event) {
  //    console.log(event);
  //    if(!RvPlotInitialized && (event.currentSlide === document.getElementById('Rv-grain-plot-slide'))) {
  //      initRvPlot();
  //      RvPlotInitialized = true;
  //    }
  //  }, false);
  //})();

})();
