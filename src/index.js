$(document).ready(function(){
  /*
   * Constants
   */
  let CURSOR_SIZE = 32;
  let CURSOR_COLOR = "#000000";
  let CURSOR_AREA_OPACITY = "0.5";
  let TARGET_SIZE = 50;
  let TARGET_BUBBLE_SIZE = 10;
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

  function draw(ct, a, w, eww, d) {

    if (ct == "point") {
      /*
       * Random targets on the screen
       */
      let data = [[100, 350, 20], [150, 110, 40], [300, 150, 32], [30, 160, 20], [200, 200, 12], [width/2, height/2, 50]];
      let targetGroup = svg.append("g");

      data.forEach(function(target, i) {
        targetGroup.append("circle")
          .attr("id","target" + i)
          .attr("cx", target[0])
          .attr("cy", target[1])
          .attr("r", CURSOR_SIZE - TARGET_BUBBLE_SIZE)
          .style("fill", "none")
          .style("stroke", TARGET_DEFAULT_COLOR)
          .style("stroke-width", TARGET_BUBBLE_SIZE)
        ;
      });

      svg.on('mousemove', function() {
        var mousePosition = d3.mouse(this);
        d3.select(this).style("cursor", "crosshair"); 
        
        // Intersecting and containment distances
        let intDist = new Array(data.length);
        let conDist = new Array(data.length);
        let indexMin = 0;
        let indexSecondMin = -1;

        // Find the closest target
        data.forEach(function(target, i) {
          let distance = Math.sqrt(
            (target[0] - mousePosition[0]) * (target[0] - mousePosition[0]) + 
            (target[1] - mousePosition[1]) * (target[1] - mousePosition[1])
          );

          // Update intersecting and containment distances.
          intDist[i] = Math.abs(distance - target[2]);
          conDist[i] = distance + target[2];

          // Check if the current target's intersecting distance is the minimum
          if (intDist[i] < intDist[indexMin]) {
            indexSecondMin = indexMin;
            indexMin = i;
          }
        });

        // Highlight the closest target
        data.forEach(function(target, i) {
          if (i == indexMin) {
            d3.select("#target" + i)
              .style("stroke", TARGET_DEFAULT_COLOR)
              .style("stroke-width", TARGET_BUBBLE_SIZE)
              .style("stroke-opacity", TARGET_BUBBLE_OPACITY)
              .style("fill", TARGET_HIGHLIGHT_COLOR)
            ;
          } else {
            d3.select("#target" + i)
              .style("fill", "none")
              .style("stroke", TARGET_DEFAULT_COLOR)
              .style("stroke-width", TARGET_BUBBLE_SIZE)
            ;
          }
        });

      });

    } else if (ct == "bubble") {

      console.log("cursor type = bubble");
      /*
       * Random targets on the screen
       */
      let data = [[100, 350, 20], [150, 110, 40], [300, 150, 32], [30, 160, 20], [200, 200, 12], [width/2, height/2, 50]];
      let targetGroup = svg.append("g");

      data.forEach(function(target, i) {
        targetGroup.append("circle")
          .attr("id","target" + i)
          .attr("cx", target[0])
          .attr("cy", target[1])
          .attr("r", CURSOR_SIZE - TARGET_BUBBLE_SIZE)
          .style("fill", "none")
          .style("stroke", TARGET_DEFAULT_COLOR)
          .style("stroke-width", TARGET_BUBBLE_SIZE)
        ;
      });

      /*
       * A bubble that follows the mouse pointer
       */
      let circle = svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", CURSOR_SIZE)
        .attr("fill", CURSOR_COLOR)
        .attr("fill-opacity", CURSOR_AREA_OPACITY)
      ;

      svg.on('mousemove', function() {
        var mousePosition = d3.mouse(this);
        d3.select(this).style("cursor", "crosshair"); 
        
        // Intersecting and containment distances
        let intDist = new Array(data.length);
        let conDist = new Array(data.length);
        let indexMin = 0;
        let indexSecondMin = -1;

        // Find the closest target
        data.forEach(function(target, i) {
          let distance = Math.sqrt(
            (target[0] - mousePosition[0]) * (target[0] - mousePosition[0]) + 
            (target[1] - mousePosition[1]) * (target[1] - mousePosition[1])
          );

          // Update intersecting and containment distances.
          intDist[i] = Math.abs(distance - target[2]);
          conDist[i] = distance + target[2];

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

        // Highlight the closest target
        data.forEach(function(target, i) {
          if (i == indexMin) {
            d3.select("#target" + i)
              .style("stroke", TARGET_DEFAULT_COLOR)
              .style("stroke-width", TARGET_BUBBLE_SIZE)
              .style("stroke-opacity", TARGET_BUBBLE_OPACITY)
              .style("fill", TARGET_HIGHLIGHT_COLOR)
            ;
          } else {
            d3.select("#target" + i)
              .style("fill", "none")
              .style("stroke", TARGET_DEFAULT_COLOR)
              .style("stroke-width", TARGET_BUBBLE_SIZE)
            ;
          }
        });

      });

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
  
  draw(ct, a, w, eww, d);
  
  document.getElementById("redrawBtn").onclick = function() {
    // Get input settings
    ct = document.querySelector('input[name="cursor-type"]:checked').value;
    a = document.querySelector('input[name="amplitude"]:checked').value;
    w = document.querySelector('input[name="width"]:checked').value;
    eww = document.querySelector('input[name="eww"]:checked').value;
    d = document.querySelector('input[name="density"]:checked').value;
    console.log(ct, a, w, eww, d);

    // Clear SVGß
    d3.select("svg > g > *").remove();
    d3.select("svg > g").remove();

    // Redraw SVG
    draw(ct, a, w, eww, d);
  }

});
