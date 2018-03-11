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
  
  Options of each parameter can be selected using radio buttons.

* Task sequence: Follow the sequence described in Experiment 2 of the paper.
	- The cursor types are tested separately.
	- Each cursor type is tested with 81 configurations of A, W, EW/W, and D. 
	  The configurations' order will not be the same for each participant.
	- Each configuration runs with 10 trials.
	  In each trial, the user uses a mouse to select a highlighted target (a green circle) on the screen.
	- In the first trial of a configuration, the highlighted target is at the center of the test screen.
	  When user clicks on the target (of any trial), the target and distracters will be re-generated randomly.
	  Note: distance between the newly generated target and the target of the latest trial is set at the value of the A.

* Data collected for each trial run: N/A.

* Demographic data: N/A.