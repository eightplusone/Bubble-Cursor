$(document).ready(function(){
  /*
   * Constants
   */
  let CURSOR_SIZE = 32;
  let CURSOR_COLOR = "#000000";
  let CURSOR_AREA_OPACITY = "0.5";
  let TARGET_SIZE = 50;
  let TARGET_BUBBLE_SIZE = 5;
  let TARGET_HIGHLIGHT_COLOR = "#ff0000";
  let TARGET_DEFAULT_COLOR = "#dddddd";
  let TARGET_BUBBLE_OPACITY = "1";
  
  /* 
   * Responsive svg 
   */
  let width = window.innerWidth * 8/12,
      height = window.innerHeight;
  let svg = d3.select("body").select("div.main").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox","0 0 " + Math.min(width,height) + " " + Math.min(width,height))
    .attr("preserveAspectRatio","xMinYMin")
  ;

  // Measure unit of the experiment
  let unit = Math.min(window.innerHeight, window.innerWidth) / 900;

  /*
   * Main function that draws the entire canvas
   */
  function draw(ct, a, w, eww, d) {
    let indexMin = 0;
    let indexSecondMin = -1;

    // Calculate distance between two points
    function distance(x, y) {
      return Math.sqrt((x[0]-y[0]) * (x[0]-y[0]) + (x[1]-y[1]) * (x[1] - y[1]));
    }

    // Check if a new circle overlaps with any existing one
    function isOverlap(data, center) {
      for (let d in data) {
        if (distance(d, center) <= 2*w*unit) return true;
      }
      return false;
    }

    function generateData(isFirstTime, startingLocation) {
      let output = [];
      let nextTarget = [0, 0];

      // 
      // The first target in the list is the next goal target
      //
      if (isFirstTime) {
        nextTarget[0] = width/2;
        nextTarget[1] = height/2;
      } else {
        while (nextTarget[0] <= w*unit || nextTarget[0] >= (width-w*unit) || nextTarget[1] <= w*unit || nextTarget[1] >= (height-w*unit)) {
          let angle = Math.random()*Math.PI*2;
          nextTarget[0] = startingLocation[0] + Math.cos(angle)*a*unit;
          nextTarget[1] = startingLocation[1] + Math.sin(angle)*a*unit;
        }
      }
      output.push(nextTarget);

      //
      // EW/W ratio controllers
      //
      // Calculate the straight line that connects the old and the new goal targets
      let slope = (nextTarget[1] - startingLocation[1]) / (nextTarget[0] - startingLocation[0]);
      let intercept = nextTarget[1] - slope * nextTarget[0];
      
      // Front (from next target toward old target)
      let frontX = nextTarget[0] + 2*eww*w/Math.sqrt(1+slope*slope);
      output.push([frontX, frontX * slope + intercept]);
      
      // Back (away from old target)
      let backX = nextTarget[0] - 2*eww*w/Math.sqrt(1+slope*slope);
      output.push([backX, backX * slope + intercept]);

      // Sides
      let perpendicular_intercept = nextTarget[1] + (1/slope)*nextTarget[0];
      let topX = nextTarget[0] + 2*eww*w*Math.abs(slope)/Math.sqrt(1+slope*slope);
      output.push([topX, -topX/slope + perpendicular_intercept]);
      let botX = nextTarget[0] - 2*eww*w*Math.abs(slope)/Math.sqrt(1+slope*slope);
      output.push([botX, -botX/slope + perpendicular_intercept]);

      //
      // Immediate target density controllers
      //
      let angleRef = Math.atan2(nextTarget[1]-startingLocation[1], nextTarget[0]-startingLocation[0]);  // Angle between the previous target and the new target
      if (d == 1) {
        let counter = 0;
        while (counter <= Math.floor(a/w)) {
          let angle = (Math.random()-0.5) * Math.PI/9;  // An angle from -10 to 10 degrees

          // A random distance to the old goal target
          let distance = Math.random()*a*unit;  

          let coordX = startingLocation[0] + Math.cos(angleRef + angle)*distance;
          let coordY = startingLocation[1] + Math.sin(angleRef + angle)*distance;
          
          if (!isOverlap(output, [coordX, coordY])) {
            output.push([coordX, coordY]);
            counter++;
          }
        }
      } else if (d == 0.5) {
        let counter = 0;
        while (counter <= Math.floor(a/(2*w))) {
          let angle = (Math.random()-0.5) * Math.PI/9;  // An angle from -10 to 10 degrees

          // A random distance to the old goal target
          let distance = Math.random()*a*unit;  

          let coordX = startingLocation[0] + Math.cos(angleRef + angle)*distance;
          let coordY = startingLocation[1] + Math.sin(angleRef + angle)*distance;

          if (!isOverlap(output, [coordX, coordY])) {
            output.push([coordX, coordY]);
            counter++;
          }
        }
      }

      //
      // Random distractors
      //
      let counter = 0;
      while (counter <= Math.floor(2*a/w)) { 
        let angle = Math.random()*Math.PI*2;
        let distance = Math.random()*width;

        let coordX = Math.cos(angle)*distance;
        let coordY = Math.sin(angle)*distance;

        if (!isOverlap(output, [coordX, coordY])) {
          output.push([coordX, coordY]);
          counter++;
        }
      }

      return output;
    }


    //
    // Experiments are divided by cursor types
    //
    if (ct == "point") {
      let data = generateData(true, [0, 0]);
      let currentTarget = data[0];
      let targetGroup = svg.append("g");

      // Intersecting and containment distances
      let intDist = new Array(data.length);
      let conDist = new Array(data.length);
      indexMin = 0;
      indexSecondMin = -1;
      
      data.forEach(function(target, i) {
        targetGroup.append("circle")
          .attr("id","target" + i)
          .attr("cx", target[0])
          .attr("cy", target[1])
          .attr("r", function() { if (i == 0) return w*unit; return (w*unit - TARGET_BUBBLE_SIZE); })
          .style("fill", function() { if (i == 0) return "green"; return "none"; })
          .style("stroke", TARGET_DEFAULT_COLOR)
          .style("stroke-width", function() { if (i == 0) return 0; return TARGET_BUBBLE_SIZE; })
      });

      svg.on('mousemove', function() {
        let mousePosition = d3.mouse(this);
        d3.select(this).style("cursor", "crosshair");

        // Find the closest target
        data.forEach(function(target, i) {
          let dist = distance(target, mousePosition);

          // Update intersecting and containment distances.
          intDist[i] = Math.abs(dist - w*unit);
          conDist[i] = dist + w*unit;

          // Check if the current target's intersecting distance is the minimum
          if (intDist[i] < intDist[indexMin]) {
            indexSecondMin = indexMin;
            indexMin = i;
          }
        });

        // Highlight the closest target when the cursor is in range
        data.forEach(function(target, i) {
          if (i == indexMin && distance(mousePosition, currentTarget) < eww*w*unit) {
            d3.select("#target" + i)
              .attr("r", function() { if (i == 0) return w*unit; return (w*unit - TARGET_BUBBLE_SIZE) })
              .style("fill", TARGET_HIGHLIGHT_COLOR)
            ;
          } else {
            d3.select("#target" + i)
              .style("fill", function() { if (i == 0) return "green"; return "none"; })
              .style("stroke", "TARGET_DEFAULT_COLOR")
              .style("stroke-width", function() { if (i == 0) return 0; return TARGET_BUBBLE_SIZE; })
            ;
          }
        });

      });  // end mousemove

      svg.on('click', function() {
        let mousePosition = d3.mouse(this);

        if (distance(mousePosition, currentTarget) < w*unit) {
          // Remove old data points and generate new ones
          targetGroup.remove();
          targetGroup = svg.append("g");
          data = generateData(false, [currentTarget[0], currentTarget[1]]);
          currentTarget = data[0];

          // Intersecting and containment distances
          let intDist = new Array(data.length);
          let conDist = new Array(data.length);
          indexMin = 0;
          indexSecondMin = -1;

          // Draw new data points
          data.forEach(function(target, i) {
            targetGroup.append("circle")
              .attr("id","target" + i)
              .attr("cx", target[0])
              .attr("cy", target[1])
              .attr("r", function() { if (i == 0) return w*unit; return (w*unit - TARGET_BUBBLE_SIZE); })
              .style("fill", function() { if (i == 0) return "green"; return "none"; })
              .style("stroke", TARGET_DEFAULT_COLOR)
              .style("stroke-width", function() { if (i == 0) return 0; return TARGET_BUBBLE_SIZE; })
            ;
          });
        }
      });  // end mouseclick

    } 

    if (ct == "bubble") {
      let data = generateData(true, [0, 0]);
      let currentTarget = data[0];
      let targetGroup = svg.append("g");

      // Intersecting and containment distances
      let intDist = new Array(data.length);
      let conDist = new Array(data.length);
      indexMin = 0;
      indexSecondMin = -1;
      
      data.forEach(function(target, i) {
        targetGroup.append("circle")
          .attr("id","target" + i)
          .attr("cx", target[0])
          .attr("cy", target[1])
          .attr("r", function() { if (i == 0) return w*unit; return (w*unit - TARGET_BUBBLE_SIZE); })
          .style("fill", function() { if (i == 0) return "green"; return "none"; })
          .style("stroke", TARGET_DEFAULT_COLOR)
          .style("stroke-width", function() { if (i == 0) return 0; return TARGET_BUBBLE_SIZE; })
      });

      /*
       * A bubble that follows the mouse pointer
       */
      let circle = svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", w*unit)
        .attr("fill", CURSOR_COLOR)
        .attr("fill-opacity", CURSOR_AREA_OPACITY)
      ;

      svg.on('mousemove', function() {
        let mousePosition = d3.mouse(this);
        d3.select(this).style("cursor", "crosshair");

        // Find the closest target
        data.forEach(function(target, i) {
          let dist = distance(target, mousePosition);

          // Update intersecting and containment distances.
          intDist[i] = Math.abs(dist - w*unit);
          conDist[i] = dist + w*unit;

          // Check if the current target's intersecting distance is the minimum
          if (intDist[i] < intDist[indexMin]) {
            indexSecondMin = indexMin;
            indexMin = i;
          }
        });

        // Resize and move the bubble surrounded the cursor
        if (indexSecondMin != -1) {
          // Do not resize if the gap between two targets is bigger than the cursor's default size
          let min_target_dist = Math.min(conDist[indexMin], intDist[indexSecondMin]);
          
          if (min_target_dist < w*unit) {
            circle
              .attr("r", Math.abs(min_target_dist - TARGET_BUBBLE_SIZE))
              .attr("transform", "translate(" + mousePosition[0] + "," + mousePosition[1] + ")")
            ;
          } else {
            circle
              .attr("r", w*unit)
              .attr("transform", "translate(" + mousePosition[0] + "," + mousePosition[1] + ")")
            ;  
          }
        } else {
          circle
            .attr("r", w*unit)
            .attr("transform", "translate(" + mousePosition[0] + "," + mousePosition[1] + ")")
          ;
        }

        // Highlight the closest target when the cursor is in range
        data.forEach(function(target, i) {
          if (i == indexMin && distance(mousePosition, target) < eww*w*unit) {
            d3.select("#target" + i)
              .attr("r", function() { if (i == 0) return w*unit; return (w*unit - TARGET_BUBBLE_SIZE) })
              .style("fill", TARGET_HIGHLIGHT_COLOR)
            ;
          } else {
            d3.select("#target" + i)
              .style("fill", function() { if (i == 0) return "green"; return "none"; })
              .style("stroke", "TARGET_DEFAULT_COLOR")
              .style("stroke-width", function() { if (i == 0) return 0; return TARGET_BUBBLE_SIZE; })
            ;
          }
        });

      });  // end mousemove

      svg.on('click', function() {
        let mousePosition = d3.mouse(this);

        if (distance(mousePosition, currentTarget) < eww*w*unit) {
          // Remove old data points and generate new ones
          targetGroup.remove();
          targetGroup = svg.append("g");
          data = generateData(false, [currentTarget[0], currentTarget[1]]);
          currentTarget = data[0];

          // Intersecting and containment distances
          let intDist = new Array(data.length);
          let conDist = new Array(data.length);
          indexMin = 0;
          indexSecondMin = -1;

          // Draw new data points
          data.forEach(function(target, i) {
            targetGroup.append("circle")
              .attr("id","target" + i)
              .attr("cx", target[0])
              .attr("cy", target[1])
              .attr("r", function() { if (i == 0) return w*unit; return (w*unit - TARGET_BUBBLE_SIZE); })
              .style("fill", function() { if (i == 0) return "green"; return "none"; })
              .style("stroke", TARGET_DEFAULT_COLOR)
              .style("stroke-width", function() { if (i == 0) return 0; return TARGET_BUBBLE_SIZE; })
            ;
          });
        }
      });  // end mouseclick

    } 

    if (ct == "object") {

    }
  }

  //
  // Get input settings
  //
  let ct = document.querySelector('input[name="cursor-type"]:checked').value;
  let a = document.querySelector('input[name="amplitude"]:checked').value;
  let w = document.querySelector('input[name="width"]:checked').value;
  let eww = document.querySelector('input[name="eww"]:checked').value;
  let d = document.querySelector('input[name="density"]:checked').value;

  // Redraw
  draw(ct, a, w, eww, d);
  
  // When user clicks "Redraw"
  document.getElementById("redrawBtn").onclick = function() {
    // Get input settings
    ct = document.querySelector('input[name="cursor-type"]:checked').value;
    a = document.querySelector('input[name="amplitude"]:checked').value;
    w = document.querySelector('input[name="width"]:checked').value;
    eww = document.querySelector('input[name="eww"]:checked').value;
    d = document.querySelector('input[name="density"]:checked').value;

    // Clear SVGß
    d3.select("svg > g > *").remove();
    d3.select("svg > g").remove();
    d3.select("svg > circle").remove();

    // Redraw SVG
    draw(ct, a, w, eww, d);
  }

});
