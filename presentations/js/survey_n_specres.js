(function () {
  // ============================================================
  // DATA DEFINITION
  // ============================================================
  // Each point has: name, x, y, v (value for color), and labelPosition
  // labelPosition can be: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  const data = [
    { name: 'O/B star spectra', x: 350, y: 1000, lam: [0.1,1.0], v: 0.2, labelPosition: 'bottom-right' },
    { name: 'Photometry', x: 1e9, y: 5, lam: [0.3,4.5], v: 0.7, labelPosition: 'top-left' },
    { name: 'Gaia XP (DR3)', x: 220e6, y: 100, lam: [0.39,1.05], v: 0.7, labelPosition: 'top-left' },
    { name: 'Euclid', x: 0.5e6, y: 450, lam: [0.95,2.02], v: 1.4, labelPosition: 'bottom-left' },
    { name: 'SPHEREx', x: 100e6, y: 50, lam: [0.75,5.0], v: 3, labelPosition: 'bottom-left' },
    { name: 'Roman (2026)', x: 1.0e6, y: 600, lam: [1.0,2.0], v: 1.5, labelPosition: 'top-left' },
    { name: 'CSST (>2026)', x: 300e6, y: 230, lam: [0.255,1.0], v: 0.3, labelPosition: 'top-left' }
  ];
  
  // ============================================================
  // PLOT CONFIGURATION
  // ============================================================
  const config = {
    // Margin coefficients as fraction of container size
    marginCoeff: { top: 0.02, right: 0.02, bottom: 0.12, left: 0.05 },
    minMargin: { top: 10, right: 10, bottom: 40, left: 50 }, // Minimum margins in pixels
    margin: { top: 40, right: 60, bottom: 60, left: 70 }, // Will be calculated dynamically
    pointRadius: 6,
    transitionDuration: 1000,
    labelOffset: 10, // Absolute distance from point to label
    labelFracOffset: 0.01, // Fractional offset based on plot size
    axisTitle: {
      x: 'Number of Spectra',
      y: 'Spectral Resolution (R)'
    }
  };
  
  // ============================================================
  // GLOBAL STATE
  // ============================================================
  let svg, g, xScale, yScale, xAxisG, yAxisG, colorScale;
  let highlightGroup, highlightRect, highlightLabel; // background highlight and label (behind elements)
  let highlightVisible = false; // controlled via a dedicated fragment
  let currentPointIndex = 0;
  let container = d3.select('#survey-plot-container');
  let resizeObserver; // will be attached when slide is active
  let isObserved = false;
  
  // ============================================================
  // SLIDE ACTIVATION HELPERS
  // ============================================================
  function isPlotSlideActive() {
    const cur = Reveal.getCurrentSlide();
    return !!(cur && cur.id === 'survey-plot-slide');
  }
  
  function observeIfNeeded() {
    if (!resizeObserver || isObserved) return;
    const node = container.node();
    if (node) {
      resizeObserver.observe(node);
      isObserved = true;
    }
  }
  
  function unobserveIfNeeded() {
    if (!resizeObserver || !isObserved) return;
    const node = container.node();
    if (node) {
      resizeObserver.unobserve(node);
      isObserved = false;
    }
  }
  
  // ============================================================
  // FRAGMENT SYNC HELPERS
  // ============================================================
  function getVisiblePlotFragmentCount() {
    const slide = Reveal.getCurrentSlide();
    if (!slide) return 0;
    return slide.querySelectorAll('.fragment.plot-point.visible').length;
  }
  
  function syncCurrentPointIndex(animate = true) {
    if (!isPlotSlideActive()) return;
    console.log('Syncing currentPointIndex to visible fragments');
    // Tie the number of visible points to visible fragments
    currentPointIndex = Math.min(getVisiblePlotFragmentCount(), data.length);
    updateScaleDomains(animate);
    renderPoints();
  }
  
  // ============================================================
  // COLOR SCALE SETUP
  // ============================================================
  // Create color scale based on the full range of v values in the data
  const vNorm = d3.scaleLog()
    .domain(d3.extent(data, d => d.v))
    .range([0.1, 1]); // Normalize v to [0.1, 1] for color mapping
  colorScale = d3.scaleSequential(vv => d3.interpolateTurbo(vNorm(vv)));
  
  // ============================================================
  // Color gradient helper
  // ============================================================
  function createGradient(gradId, v0, v1) {
    console.log(`Creating gradient ${gradId} from ${v0} to ${v1}`);
    
    // Make sure there is a defs section in the SVG
    let defs = svg.select('defs');
    if (defs.empty()) defs = svg.append('defs');
    
    // Create a linear gradient element
    let linearGradient = defs.select(`#${gradId}`);
    if (linearGradient.empty()) {
      linearGradient = defs.append('linearGradient')
        .attr('id', gradId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    }
    
    // Generate 32 stops from v0 to v1
    const numStops = 32;
    const gradScale = d3.scaleLinear().range([v0,v1]);
    
    linearGradient.selectAll('stop')
      .data(d3.range(numStops).map(x => x/(numStops-1)))
      .enter()
      .append('stop')
      .attr('offset', vv => vv)
      .attr('stop-color', vv => d3.interpolateTurbo(gradScale(vv)));
    
    return `url(#${gradId})`;
  }
  
  // ============================================================
  // TICK FORMATTING
  // ============================================================
  // Format numbers as 10^n with superscript exponents
  function formatPowerOfTen(d) {
    const log = Math.log10(d);
    if (Math.abs(log - Math.round(log)) < 0.01) {
      const exp = Math.round(log);
      const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
      const expStr = Math.abs(exp).toString().split('').map(digit => superscripts[digit]).join('');
      return exp < 0 ? `10⁻${expStr}` : `10${expStr}`;
    }
    return d3.format('.2~s')(d);
  }
  
  // ============================================================
  // RENDER AXES AND GRIDS
  // ============================================================
  function renderAxes(animate = false) {
    const plotWidth = xScale.range()[1];
    const plotHeight = yScale.range()[0];
    
    // Create transition or not
    const t = animate ? 
    svg.transition().duration(config.transitionDuration) : 
    svg.transition().duration(0);
    
    // Update major x-axis
    const xTicks = d3.range(-10, 20)
      .map(p => Math.pow(10, p))
      .filter(v =>
        v >= xScale.domain()[0] &&
        v <= xScale.domain()[1]
      );
    // Ticks
    xAxisG
      .attr('transform', `translate(0,${plotHeight})`)
      .transition(t)
      .call(
        d3.axisBottom(xScale)
          .tickValues(xTicks)
          .tickFormat(formatPowerOfTen)
      );
    // Grid
    g.select('.x-grid-major')
      .attr('transform', `translate(0,${plotHeight})`)
      .transition(t)
      .call(
        d3.axisBottom(xScale)
          .tickValues(xTicks)
          .tickSize(-plotHeight)
          .tickFormat('')
      );
    
    // Update major y-axis
    const yTicks = d3.range(-10, 20)
      .map(p => Math.pow(10, p))
      .filter(v =>
        v >= yScale.domain()[0] &&
        v <= yScale.domain()[1]
      );
    yAxisG
      .transition(t)
      .call(
        d3.axisLeft(yScale)
          .tickValues(yTicks)
          .tickFormat(formatPowerOfTen)
      );
    // Grid
    g.select('.y-grid-major')
      .transition(t)
      .call(
        d3.axisLeft(yScale)
          .tickValues(yTicks)
          .tickSize(-plotWidth)
          .tickFormat('')
      );
  }
  
  // ============================================================
  // INITIALIZATION
  // ============================================================
  function initializePlot() {
    // Create SVG
    svg = container.append('svg');
    g = svg.append('g')
    .attr(
      'transform',
      `translate(${config.margin.left},${config.margin.top})`
    );
    
    // Create scales (will be updated as points are added)
    xScale = d3.scaleLog().base(10);
    yScale = d3.scaleLog().base(10);
    
    // Add grid lines (minor first so they're behind major)
    const xGridMinor = g.append('g')
      .attr('class', 'grid-minor x-grid-minor');
    const yGridMinor = g.append('g')
      .attr('class', 'grid-minor y-grid-minor');
    const xGridMajor = g.append('g')
      .attr('class', 'grid-major x-grid-major');
    const yGridMajor = g.append('g')
      .attr('class', 'grid-major y-grid-major');
    
    // Add minor axis groups (drawn first, behind major)
    const xAxisMinorG = g.append('g')
      .attr('class', 'x-axis-minor');
    const yAxisMinorG = g.append('g')
      .attr('class', 'y-axis-minor');
    
    // Add major axis groups
    xAxisG = g.append('g')
      .attr('class', 'x-axis-major');
    yAxisG = g.append('g')
      .attr('class', 'y-axis-major');
    
    // Add axis labels
    g.append('text')
      .attr('class', 'axis-label x-label')
      .attr('text-anchor', 'middle')
      .text(config.axisTitle.x);
    
    g.append('text')
      .attr('class', 'axis-label y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text(config.axisTitle.y);
    
    // Create groups for points and labels
    g.append('g').attr('class', 'points');
    g.append('g').attr('class', 'labels');

    // Insert a highlight group as the VERY FIRST child of g so it's behind everything
    // It will be shown via a dedicated fragment (class: plot-highlight)
    highlightGroup = g.insert('g', ':first-child')
      .attr('class', 'plot-highlight-group')
      .attr('opacity', 0)
      .style('pointer-events', 'none');
    // Rectangle box
    highlightRect = highlightGroup.append('rect')
      .attr('id', 'survey-plot-highlight-box')
      .attr('class', 'plot-highlight-box')
      .attr('fill', 'none')
      .attr('stroke', '#999') // light default; user can override via CSS by ID
      .attr('stroke-width', 2);
    // Label text (bottom-left inside corner)
    highlightLabel = highlightGroup.append('text')
      .attr('id', 'survey-plot-highlight-label')
      .attr('class', 'plot-highlight-label')
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'alphabetic')
      .text('low-resolution spectra');
    
    // Generate N gradients, with names like #gradient1, #gradient2,
    // etc., where N is the number of data points
    
    // Create one gradient per data point
    // Get extent of lam values across all data points
    const lamMin = d3.min(data, d => d.lam[0]);
    const lamMax = d3.max(data, d => d.lam[1]);
    const lamExtent = [lamMin, lamMax];
    // Create a logarithmic scale for the lam values
    const lamScale = d3.scaleLog()
    .domain(lamExtent)
    .range([0, 1]);
    data.forEach((_, i) => {
      createGradient(
        `gradient${i + 1}`,
        lamScale(data[i].lam[0]),
        lamScale(data[i].lam[1])
      );
    });
    
    // Initial render
    // Note: Reveal may not be fully initialized yet, so we render unconditionally
    // and will re-sync on 'ready' event
    currentPointIndex = getVisiblePlotFragmentCount();
    updatePlot();
    
    // Listen for window resize (guarded)
    window.addEventListener('resize', () => {
      if (isPlotSlideActive()) updatePlot();
    });
    
    // Use ResizeObserver to watch for container size changes (guarded)
    resizeObserver = new ResizeObserver(() => {
      if (isPlotSlideActive()) updatePlot();
    });
    // Observe immediately to catch initial sizing
    observeIfNeeded();
    
    // Also listen for Reveal.js lifecycle & slide changes
    Reveal.on('ready', () => {
      if (!isPlotSlideActive()) {
        unobserveIfNeeded();
        return;
      }
      currentPointIndex = getVisiblePlotFragmentCount();
      updatePlot();
      observeIfNeeded();
    });
    Reveal.on('resize', () => {
      if (isPlotSlideActive()) updatePlot();
    });
    Reveal.on('slidechanged', (e) => {
      const entering = e.currentSlide && e.currentSlide.id === 'survey-plot-slide';
      const leaving  = e.previousSlide && e.previousSlide.id === 'survey-plot-slide';
      if (leaving) unobserveIfNeeded();
      if (entering) {
        currentPointIndex = getVisiblePlotFragmentCount();
        setTimeout(() => { updatePlot(); observeIfNeeded(); }, 100);
      }
    });
  }
  
  // ============================================================
  // UPDATE PLOT DIMENSIONS AND SCALES
  // ============================================================
  function updatePlot() {
    // Get container dimensions
    const containerRect = container.node().getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    // Calculate margins as a fraction of container size
    config.margin.top = config.minMargin.top + height * config.marginCoeff.top;
    config.margin.right = config.minMargin.right + width * config.marginCoeff.right;
    config.margin.bottom = config.minMargin.bottom + height * config.marginCoeff.bottom;
    config.margin.left = config.minMargin.left + width * config.marginCoeff.left;
    
    // Update transform with calculated margins
    g.attr('transform', `translate(${config.margin.left},${config.margin.top})`);
    
    const plotWidth = width - config.margin.left - config.margin.right;
    const plotHeight = height - config.margin.top - config.margin.bottom;
    
    // Update scales ranges
    xScale.range([0, plotWidth]);
    yScale.range([plotHeight, 0]);
    
    // Update scale domains based on visible points
    updateScaleDomains(false);
    
    // Render all axes (no animation)
    renderAxes(false);
    
    // Update axis labels with simple relative positioning
    g.select('.x-label')
      .attr('x', plotWidth / 2)
      .attr('y', plotHeight + config.margin.bottom * 0.6); // Position in bottom margin
    
    g.select('.y-label')
      .attr('x', -plotHeight / 2)
      .attr('y', -config.margin.left * 0.6); // Position in left margin
    
    // Re-render points and labels
    renderPoints();

    // Update highlight box geometry (kept hidden until its fragment fires)
    updateHighlightBoxGeometry();
  }
  
  // ============================================================
  // UPDATE SCALE DOMAINS
  // ============================================================
  function updateScaleDomains(animate = true) {
    // Get visible data points
    const visibleData = data.slice(0, currentPointIndex);
    
    if (visibleData.length === 0) {
      // Default domain if no points yet
      xScale.domain([1, 1000]);
      yScale.domain([1, 1000]);
      return;
    }
    
    // Calculate domains with padding
    const xValues = visibleData.map(d => d.x);
    const yValues = visibleData.map(d => d.y);
    
    const xMin = d3.min(xValues);
    const xMax = d3.max(xValues);
    const yMin = d3.min(yValues);
    const yMax = d3.max(yValues);
    
    // Add padding in log space (multiplicative)
    const xPadding = Math.max(Math.pow(xMax / xMin, 0.1), 3.5);
    const yPadding = Math.max(Math.pow(yMax / yMin, 0.1), 3.5);
    
    const newXDomain = [xMin / xPadding, xMax * xPadding];
    const newYDomain = [yMin / yPadding, yMax * yPadding];
    
    // Update domains
    xScale.domain(newXDomain);
    yScale.domain(newYDomain);
    
    // Render axes with optional animation
    if (animate) {
      renderAxes(true);
    }
  }
  
  // ============================================================
  // RENDER POINTS AND LABELS
  // ============================================================
  function renderPoints() {
    console.log('Rendering points up to index:', currentPointIndex);
    
    // Get visible data points
    const visibleData = data.slice(0, currentPointIndex);
    
    // Bind data to points
    const points = g.select('.points')
      .selectAll('.point')
      .data(visibleData, d => d.name);
    
    // Exit
    points.exit().remove();
    
    // Enter + Update
    const baseSize = config.pointRadius * 2; // square height; width scales with v
    
    function getRectWidth(d) {
      // Make this width d.lam[1] / d.lam[0] * (width of x-axis) * const
      const plotWidth = xScale.range()[1] || 0;
      return plotWidth * (d.lam[1] / d.lam[0]) * 0.01;
    }
    
    points.enter()
      .append('rect')
      .attr('class', 'point')
      .attr('width', d => getRectWidth(d))
      .attr('height', baseSize)
      .attr('x', d => xScale(d.x) - 0.5*getRectWidth(d))
      .attr('y', d => yScale(d.y) - 0.5*baseSize)
      .attr('fill', d => 'url(#gradient' + (data.indexOf(d) + 1) + ')')
      .attr('opacity', 0)
      .merge(points)
      .transition()
      .duration(config.transitionDuration)
      .attr('width', d => getRectWidth(d))
      .attr('height', baseSize)
      .attr('x', d => xScale(d.x) - 0.5*getRectWidth(d))
      .attr('y', d => yScale(d.y) - 0.5*baseSize)
      .attr('fill', d => 'url(#gradient' + (data.indexOf(d) + 1) + ')')
      .attr('opacity', 1);
    
    // Bind data to labels
    const labels = g.select('.labels')
      .selectAll('.point-label')
      .data(visibleData, d => d.name);
    
    // Exit
    labels.exit().remove();
    
    // Enter + Update
    const labelEnter = labels.enter()
      .append('text')
      .attr('class', 'point-label')
      .attr('opacity', 0)
      .text(d => d.name);
    
    const xWidth = xScale.range()[1] || 0;
    const offset = xWidth * config.labelFracOffset + config.labelOffset;
    
    labelEnter.merge(labels)
      .attr('x', d => {
        const x = xScale(d.x);
        return x;
        // return d.labelPosition.includes('right') ? 
        // x + offset : x - offset;
      })
      .attr('y', d => {
        const y = yScale(d.y);
        return d.labelPosition.includes('top') ? 
        y - 0.7*offset : y + 1.4*offset;
      })
      .attr('text-anchor', 'middle')
      // .attr('text-anchor', d => d.labelPosition.includes('right') ? 'start' : 'end')
      .attr('dominant-baseline', d => d.labelPosition.includes('top') ? 'bottom' : 'top')
      .transition()
      .duration(config.transitionDuration)
      .attr('opacity', 1);

    // Keep highlight geometry in sync when points move/resize
    updateHighlightBoxGeometry();
  }

  // ============================================================
  // HIGHLIGHT BOX (surround all but first two gradients)
  // ============================================================
  function updateHighlightBoxGeometry() {
    if (!highlightRect) return;
    const plotWidth = xScale.range()[1] || 0;
    const plotHeight = yScale.range()[0] || 0;

    // Subset: exclude the first two entries
    const subset = data.slice(2, currentPointIndex);
    if (subset.length === 0) {
      highlightRect
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', 0);
      if (highlightLabel) {
        highlightLabel.attr('x', 0).attr('y', 0);
      }
      return;
    }

    const baseSize = config.pointRadius * 2;
    // const pad = Math.max(6, baseSize * 0.6);

    function getRectWidth(d) {
      const pw = xScale.range()[1] || 0;
      return pw * (d.lam[1] / d.lam[0]) * 0.01;
    }

    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
    subset.forEach(d => {
      const w = getRectWidth(d);
      const h = baseSize;
      const cx = xScale(d.x);
      const cy = yScale(d.y);
      const l = cx - 0.5 * w;
      const r = cx + 0.5 * w;
      const t = cy - 0.5 * h;
      const b = cy + 0.5 * h;
      if (l < left) left = l;
      if (r > right) right = r;
      if (t < top) top = t;
      if (b > bottom) bottom = b;
    });

    // Apply padding and clamp to plot area
    const boxWidth = right - left;
    const boxHeight = bottom - top;
    const padFrac = 0.2; // 20% of box size
    const pad = Math.sqrt(boxWidth * boxHeight) * padFrac;
    left = Math.max(0, left - pad);
    right = Math.min(plotWidth, right + pad);
    top = Math.max(0, top - pad);
    bottom = Math.min(plotHeight, bottom + pad);
    // left = Math.max(0, left - pad);
    // right = Math.min(plotWidth, right + pad);
    // top = Math.max(0, top - pad);
    // bottom = Math.min(plotHeight, bottom + pad);

    const x = left;
    const y = top;
    const w = Math.max(0, right - left);
    const h = Math.max(0, bottom - top);

    highlightRect
      .attr('x', x)
      .attr('y', y)
      .attr('width', w)
      .attr('height', h);
    // Position label at bottom-left inside corner with a small margin
    const labelMargin = Math.max(4, pad * 0.1);
    if (highlightLabel) {
      highlightLabel
        .attr('x', x + labelMargin)
        .attr('y', y + h - labelMargin);
    }
  }
  
  // (Increment/decrement helpers removed in favor of syncing from visible fragments)
  
  // ============================================================
  // REVEAL.JS FRAGMENT INTEGRATION
  // ============================================================
  Reveal.on('fragmentshown', event => {
    // Only respond to fragments inside the plot slide
    if (!event.fragment.closest('#survey-plot-slide')) return;
    if (event.fragment.classList.contains('plot-point')) {
      syncCurrentPointIndex(true);
    }
    // Dedicated fragment to show the highlight box
    if (event.fragment.classList.contains('plot-highlight')) {
      highlightVisible = true;
      if (highlightGroup) {
        highlightGroup
          .transition()
          .duration(config.transitionDuration)
          .attr('opacity', 1);
      }
    }
  });
  
  Reveal.on('fragmenthidden', event => {
    // Only respond to fragments inside the plot slide
    if (!event.fragment.closest('#survey-plot-slide')) return;
    if (event.fragment.classList.contains('plot-point')) {
      syncCurrentPointIndex(true);
    }
    if (event.fragment.classList.contains('plot-highlight')) {
      highlightVisible = false;
      if (highlightGroup) {
        highlightGroup
          .transition()
          .duration(config.transitionDuration)
          .attr('opacity', 0);
      }
    }
  });
  
  // ============================================================
  // INITIALIZE ON LOAD
  // ============================================================
  initializePlot();
})();