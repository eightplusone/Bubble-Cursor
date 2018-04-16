$(document).ready(function(){
  /*
   * Constants
   */
  let CURSOR_COLOR = "#000000";
  let CURSOR_AREA_OPACITY = "0.5";
  let TARGET_BUBBLE_SIZE = 3;
  let TARGET_HIGHLIGHT_COLOR = "#ff0000";
  let TARGET_DEFAULT_COLOR = "#dddddd";
  let TARGET_BUBBLE_OPACITY = "1";
  
  let NUM_TRIALS = 9;
  let MAX_TRIALS = 2*3*3*3*9-1;
  
  /* 
   * Responsive svg 
   */
  let width = window.innerWidth * 10/12,
      height = window.innerHeight;
  let svg = d3.select("body").select("div.main").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox","0 0 " + Math.min(width,height) + " " + Math.min(width,height))
    .attr("preserveAspectRatio","xMinYMin")
  ;

  // Measure unit of the experiment
  let unit = Math.min(window.innerHeight, window.innerWidth) / 1200;

  // Experiment settings
  ct_options = ["bubble", "point"];
  a_options = [256.0, 512.0, 768.0, 256.0, 512.0, 768.0, 256.0, 512.0, 768.0];
  w_options = [8.0, 16.0, 32.0];
  eww_options = [1.33, 2.0, 3.0];
  d_options = [0.0, 0.5, 1.0];

  // Shuffle the settings
  let optionQueue = [];
  
  for (let w in w_options) {
    for (let eww in eww_options) {
      for (let d in d_options) {
        shuffle(a_options);
        for (let i = 0; i < NUM_TRIALS; i++) {
          optionQueue.push([
            a_options[i],
            w_options[parseInt(w)],
            eww_options[parseInt(eww)],
            d_options[parseInt(d)] 
          ]);
        }

      }
    }
  }

  shuffle(ct_options);
  experimentQueue = [];

  for (let ct in ct_options) {
    shuffle(optionQueue);

    optionQueue.forEach(function(opt) {
      experimentQueue.push([ct_options[ct], opt[0], opt[1], opt[2], opt[3]]);
    });
  }

  console.log(experimentQueue.length);
  
  // Necessary variables for logging
  let uid = getUniqueId();
  let trialCounter = 0;
  let timer;

  let progressInfo = function(trialCounter){
    return "Blocks completed: " + Math.floor((trialCounter+1)/NUM_TRIALS) + "/" + ((MAX_TRIALS+1)/NUM_TRIALS)
  };
  let finishMsg = "Congratulations, you have completed the study! You can now close your web browser.";
  let info = d3.select("#info")
    .style("font-size", 16)
    .text(progressInfo(trialCounter));

  draw(experimentQueue[0]);

  /*
   * Main function that draws the entire canvas
   */
  function draw(settings) {
    let ct = settings[0];
    let a = settings[1];
    let w = settings[2];
    let eww = settings[3];
    let d = settings[4];
    let indexMin = 0;
    let indexSecondMin = -1;

    let countdownTimer = 5;
    info.text(progressInfo(trialCounter) + ". Next block will be ready in " + countdownTimer + " seconds.");

    let interval = d3.interval(function() {
      countdownTimer--;
      info.text(progressInfo(trialCounter) + ". Next block will be ready in " + countdownTimer + " seconds.");

      if (countdownTimer == 0) {
        interval.stop();
        info.text(progressInfo(trialCounter));
      }
    }, 1000);

    setTimeout(function() {

      //
      // Experiments are divided by cursor types
      //
      if (ct == "point") {
        let data = [];
        data = generateData(true, [0, 0]);

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

          if (indexMin == 0 && distance(mousePosition, data[0]) < eww*w*unit) {
            timer = (new Date()).getTime();
            console.log(uid, width, height, timer, trialCounter, mousePosition[0], mousePosition[1], ct, a, w, eww, d, "successful");
            sendNetworkLog(uid, width, height, timer, trialCounter, mousePosition[0], mousePosition[1], ct, a, w, eww, d, "successful");


            trialCounter++;
            if (trialCounter < MAX_TRIALS) {
              info.text(progressInfo(trialCounter));
            } else {
              info.text(finishMsg);
              targetGroup.remove();
              return;
            }
            targetGroup.remove();

            if (trialCounter % NUM_TRIALS == 0) {  
              draw(experimentQueue[trialCounter]);

            } else {
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

          } 

          if (indexMin != 0) {
            timer = (new Date()).getTime();
            console.log(uid, width, height, timer, trialCounter, mousePosition[0], mousePosition[1], ct, a, w, eww, d, "failed");
            sendNetworkLog(uid, width, height, timer, trialCounter, mousePosition[0], mousePosition[1], ct, a, w, eww, d, "failed");
          }


        });  // end mouseclick

      } 

      if (ct == "bubble") {
        let data = [];
        data = generateData(true, [0, 0]);

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
            if (intDist[i] <= intDist[indexMin]) {
              indexSecondMin = indexMin;
              indexMin = i;
            }
          });

          // Resize and move the bubble surrounded the cursor
          let newRadius = Math.min(
            Math.abs(distance(mousePosition, data[indexMin]) - TARGET_BUBBLE_SIZE),
            Math.abs(distance(mousePosition, data[indexSecondMin]) - TARGET_BUBBLE_SIZE)
          );

          circle
            .attr("r", newRadius)
            .attr("transform", "translate(" + mousePosition[0] + "," + mousePosition[1] + ")")

          // Highlight the closest target when the cursor is in range
          data.forEach(function(target, i) {
            if (i == indexMin) {
              d3.select("#target" + i)
                .attr("r", function() { if (i == 0) return w*unit; return (w*unit - TARGET_BUBBLE_SIZE) })
                .style("fill", TARGET_HIGHLIGHT_COLOR)
                .style("stroke", TARGET_DEFAULT_COLOR)
                .style("stroke-width", TARGET_BUBBLE_SIZE*2)
              ;
            } else {
              d3.select("#target" + i)
                .style("fill", function() { if (i == 0) return "green"; return "none"; })
                .style("stroke", TARGET_DEFAULT_COLOR)
                .style("stroke-width", function() { if (i == 0) return 0; return TARGET_BUBBLE_SIZE; })
              ;
            }
          });

        });  // end mousemove

        svg.on('click', function() {
          let mousePosition = d3.mouse(this);

          if (indexMin == 0) {
            timer = (new Date()).getTime();
            console.log(uid, width, height, timer, trialCounter, mousePosition[0], mousePosition[1], ct, a, w, eww, d, "successful");
            sendNetworkLog(uid, width, height, timer, trialCounter, mousePosition[0], mousePosition[1], ct, a, w, eww, d, "successful");

            trialCounter++;
            if (trialCounter < MAX_TRIALS) {
              info.text(progressInfo(trialCounter));
            } else {
              info.text(finishMsg);
              targetGroup.remove();
              circle.remove();
              return;
            }

            targetGroup.remove();

            if (trialCounter % NUM_TRIALS == 0) {
              circle.remove();
              draw(experimentQueue[trialCounter]);
            } else {
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
          } 

          if (indexMin != 0) {
            timer = (new Date()).getTime();
            console.log(uid, width, height, timer, trialCounter, mousePosition[0], mousePosition[1], ct, a, w, eww, d, "failed");
            sendNetworkLog(uid, width, height, timer, trialCounter, mousePosition[0], mousePosition[1], ct, a, w, eww, d, "failed");
          }


        });  // end mouseclick
      }
    }, countdownTimer*1000);
    

    // Calculate distance between two points
    function distance(x, y) {
      return Math.sqrt((x[0]-y[0]) * (x[0]-y[0]) + (x[1]-y[1]) * (x[1] - y[1]));
    }

    // Check if a new circle overlaps with any existing one
    function isOverlap(data, center) {
      for (var d in data) {
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
        while (nextTarget[0] <= eww*w*unit*2 || 
                nextTarget[0] >= (width-eww*w*unit*2) || 
                nextTarget[1] <= eww*w*unit*2 || 
                nextTarget[1] >= (height-eww*w*unit*2)
        ) {
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
          let dist = Math.random()*a*unit;  

          let coordX = startingLocation[0] + Math.cos(angleRef + angle)*dist;
          let coordY = startingLocation[1] + Math.sin(angleRef + angle)*dist;
          
          if (!isOverlap(output, [coordX, coordY]) && 
          distance(output[0], [coordX, coordY]) > 4*w*unit) {
            output.push([coordX, coordY]);
            counter++;
          }
        }
      } else if (d == 0.5) {
        let counter = 0;
        while (counter <= Math.floor(a/(2*w))) {
          let angle = (Math.random()-0.5) * Math.PI/9;  // An angle from -10 to 10 degrees

          // A random distance to the old goal target
          let dist = Math.random()*a*unit;  

          let coordX = startingLocation[0] + Math.cos(angleRef + angle)*dist;
          let coordY = startingLocation[1] + Math.sin(angleRef + angle)*dist;

          if (!isOverlap(output, [coordX, coordY]) && 
          distance(output[0], [coordX, coordY]) > 4*w*unit) {
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
        let dist = Math.random()*width;

        let coordX = Math.cos(angle)*dist;
        let coordY = Math.sin(angle)*dist;

        if (!isOverlap(output, [coordX, coordY]) && 
          distance(output[0], [coordX, coordY]) > 4*w*unit) {
          output.push([coordX, coordY]);
          counter++;
        }
      }

      return output;
    }
  }

  // Fisher-Yates Shuffle
  // Link: https://bost.ocks.org/mike/shuffle/
  function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      let index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      let temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }

    return array;
  }

  function clearSVG() {
    d3.select("svg > g > *").remove();
    d3.select("svg > g").remove();
    d3.select("svg > circle").remove();
  }

  // Genrates or remembers a somewhat-unique ID with distilled user-agent info.
  function getUniqueId() {
    if (!('uid' in localStorage)) {
      var browser = findFirstString(navigator.userAgent, [
        'Seamonkey', 'Firefox', 'Chromium', 'Chrome', 'Safari', 'OPR', 'Opera',
        'Edge', 'MSIE', 'Blink', 'Webkit', 'Gecko', 'Trident', 'Mozilla']);
      var os = findFirstString(navigator.userAgent, [
        'Android', 'iOS', 'Symbian', 'Blackberry', 'Windows Phone', 'Windows',
        'OS X', 'Linux', 'iOS', 'CrOS']).replace(/ /g, '_');
      var unique = ('' + Math.random()).substr(2);
      localStorage['uid'] = os + '-' + browser + '-' + unique;
    }
    return localStorage['uid'];
  }


  // Network Log submission function
  // submits to the google form at this URL:
  // docs.google.com/forms/d/e/1FAIpQLSeqS9eNrT6W1giZlPEGcEzO2eNLp9aXHMghTXANpusp9KQkNg/viewform?usp=sf_link
  function sendNetworkLog(
      uid,
      width,
      height,
      time,
      trialcounter,
      mousepositionx,
      mousepositiony,
      ct,
      a,
      w,
      eww,
      d,
      status) {
    var formid = "e/1FAIpQLSeqS9eNrT6W1giZlPEGcEzO2eNLp9aXHMghTXANpusp9KQkNg";
    var data = {
      "entry.1512590159": uid,
      "entry.1608070031": width,
      "entry.827305074": height,
      "entry.2051778001": time,
      "entry.1859251116": trialcounter,
      "entry.1988747368": mousepositionx,
      "entry.1965061888": mousepositiony,
      "entry.1901798376": ct,
      "entry.1183927165": a,
      "entry.1796510155": w,
      "entry.859151156": eww,
      "entry.681889932": d,
      "entry.442755981": status
    };
    var params = [];
    for (key in data) {
      params.push(key + "=" + encodeURIComponent(data[key]));
    }
    // Submit the form using an image to avoid CORS warnings.
    (new Image).src = "https://docs.google.com/forms/d/" + formid +
       "/formResponse?" + params.join("&");
  }

});
