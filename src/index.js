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
  let unit = Math.min(window.innerHeight, window.innerWidth) / 900;

  function draw(ct, a, w, eww, d) {
    let indexMin = 0;
    let indexSecondMin = -1;

    function generateData(isFirstTime, startingLocation) {
      let output = [];

      // The first target in the list is the goal target
      if (isFirstTime) {
        output.push([width/2, height/2]);
      } else {
        let x = 0, y = 0;

        while (x <= w*unit || x >= (width-w*unit) || y <= w*unit || y >= (height-w*unit)) {
          let angle = Math.random() * Math.PI * 2;
          x = startingLocation[0] + Math.cos(angle) * a * unit;
          y = startingLocation[1] + Math.sin(angle) * a * unit;
        }

        output.push([x, y]);
      }

      // Distractors
      output.push([100, 100], [200, 200]);

      return output;
    }

    function distance(x, y) {
      return Math.sqrt((x[0]-y[0]) * (x[0]-y[0]) + (x[1]-y[1]) * (x[1] - y[1]));
    }

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

    } else if (ct == "bubble") {
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
          
          if (min_target_dist < CURSOR_SIZE) {
            circle
              .attr("r", min_target_dist - TARGET_BUBBLE_SIZE)
              .attr("transform", "translate(" + mousePosition[0] + "," + mousePosition[1] + ")")
            ;
          } else {
            circle
              .attr("r", CURSOR_SIZE - TARGET_BUBBLE_SIZE)
              .attr("transform", "translate(" + mousePosition[0] + "," + mousePosition[1] + ")")
            ;  
          }
        } else {
          circle
            .attr("r", CURSOR_SIZE)
            .attr("transform", "translate(" + mousePosition[0] + "," + mousePosition[1] + ")")
          ;
        }

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

    } else if (ct == "object") {

    }
  }

  // Get input settings
  let ct = document.querySelector('input[name="cursor-type"]:checked').value;
  let a = document.querySelector('input[name="amplitude"]:checked').value;
  let w = document.querySelector('input[name="width"]:checked').value;
  let eww = document.querySelector('input[name="eww"]:checked').value;
  let d = document.querySelector('input[name="density"]:checked').value;
  console.log(ct, a, w, eww, d);
  w *= 2;

  draw(ct, a, w, eww, d);
  
  document.getElementById("redrawBtn").onclick = function() {
    // Get input settings
    ct = document.querySelector('input[name="cursor-type"]:checked').value;
    a = document.querySelector('input[name="amplitude"]:checked').value;
    w = document.querySelector('input[name="width"]:checked').value;
    eww = document.querySelector('input[name="eww"]:checked').value;
    d = document.querySelector('input[name="density"]:checked').value;
    console.log(ct, a, w, eww, d);
    //w *= 2;

    // Clear SVGß
    d3.select("svg > g > *").remove();
    d3.select("svg > g").remove();
    d3.select("svg > circle").remove();

    // Redraw SVG
    draw(ct, a, w, eww, d);
  }

});
