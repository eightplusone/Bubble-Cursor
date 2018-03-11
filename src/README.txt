CS 422
Hai Tran
RS1

* Paper: "The Bubble Cursor: Enhancing Target Acquisition by Dynamic Resizing of the Cursor's Activation Area." CHI 2005.

* This assignment was done without any collaborator.

* Youtube screencast: N/A.

* Web interface: http://hai-t.me/cs422/bubble_cursor/

* Experiment parameters:
    - Cursor Type (CT): Point, Bubble, and Object (not yet implemented).
    - Amplitude (A): 256, 512, and 768 units. Each unit is set to 1/900 of the smaller of the width and height of the visible window of the interface.
    - Width (W) of each target: 8, 16, and 32 units. 
    - Effective width to width ratio (EWW): 1.33, 2, and 3.
    - Distracter Density (D): 0, 0.5, and 1.
  
  Each parameter comes with three options which can be selected using radio buttons.

* Task sequence: Follow the sequence described in Experiment 2 of the paper.
	- The cursor types are tested separately.
	- Each cursor type is tested with 81 configurations of A, W, EW/W, and D. 
	  Each configuration runs with 10 trials.
	  In each trial, user uses mouse to select the highlighted target (a green circle) on the screen.
	- In the first trial of a configuration, the highlighted target is at the center of the test screen.
	  After that, the target and distracters will be generated randomly on the screen.
	  However, distance between the newly generated target and the target of the latest trial is set at the value of the A.
	- Density-controlled distracters are put randomly within the slice of 20 degrees looking from the latest target to the newly generated target. The number of distracters are no more than A/W.
	  Extra distracters are put randomly on the screen.
	  All distracters have donut shape and are colored in grey. 
	- Four extra distracters are put around the new target to form a square (each distracter occupies a corner, the new target is at the center of the square). The side of the square is approximately 2*W*EWW.
	- For bubble cursor: the closest object within the range of EWW*W of the cursor is marked when the user moves the mouse. The bubble surrounded the cursor 


* Data collected for each trial run: N/A.

* Demographic data: N/A.