//Wrap all the code in an anonymous function (so that we don't pollute the global namespace)
(function() {

//if (typeof BonesDemo == "undefined") window.BonesDemo = {};
	
//Object Variables (public)
var canvas;
var ctx;
var bone = new Array(); //an array of line segments

var ribbon = {
	debugMode: false,
	minLength: 200,
	maxLength: 700,
	//Note: the angles are backwards from a normal cartisian grid because (0,0) is the top left, not bottom left.
	minAngle: -1.5708,       //expressed in radians (used for INITIAL placement of new bones, line goes up)
	maxAngle: 1.5708,        //    "     "    "     (used for INITIAL placement of new bones, line goes down)
	newBoneShift: 1.6,       //Changes the odds how likely new bones will point in the opposite direction as the previous bone. Higher number means more likely to be different.
	boneWidth: 100,
	bottomBleed: 0,          //How far outside canvas points are allowed outside bottom edge.
	velocity: 0.5,           //How fast the ribbon moves across the screen.
	angleVelocity: 0.001,    //How fast the angles change
	color: '212,85%,39%',    //Default HSL values
	minSwingAngle: 1,      //For now, this can not be less than zero.
	maxSwingAngle: 2.8,      //This is used to make sure two bones do not form a large obtuse angle.
	shiftSpeed: 2,           //Multiplier for how fast the whole ribbon will move up or down.
	lookback: 2,             //Number of prior bones that should have their move positions recalculated. This will help control the overall shape of the ribbon.
};
//Compute the edges based on width of ribbon.
ribbon.topEdge = ribbon.boneWidth / 2;
ribbon.leftEdge = (ribbon.boneWidth / 2) * -1;
ribbon.rightEdge = 0; //This is recalculated by resizeCanvas() in a similar manner to ribbon.leftEdge.
//compute the color for the backside of the ribbon
var hsl = ribbon.color.replace(/%/g,'').split(','); //Strip the percent signs out and then explode HSL to an array.
ribbon.backColor = hsl[0] + ',' + Math.max(0, Number(hsl[1]) - 20) + '%' + ',' + Math.min(100, Number(hsl[2]) + 30) + '%';

/**
  * Point Class
  * In addition to the usual X and Y values, there is also a velocity so that we can control
  * how fast the point moves around.
  */
function Point(x, y, velocity) {
	this.x = x;
	this.y = y;
	if (typeof velocity === 'undefined') {
		//Not all points need a velocity.
		this.velocity = 0;
	} else {
		this.velocity = velocity;
	}
}
/**
  * Angle Class
  * In addition to the angle values, there is also a velocity so that we can control
  * how fast the rotation spins.
  */
function Angle(radians, velocity) {
	this.radians = radians;
	if (typeof velocity === 'undefined') {
		//Not all angles need a velocity.
		this.velocity = 0;
	} else {
		this.velocity = velocity;
	}
}
Angle.prototype.goUp = function() {
	this.velocity = Math.abs(this.velocity) * -1;
}
Angle.prototype.goDown = function() {
	this.velocity = Math.abs(this.velocity);
}
/**
  * Bone Class
  * Side note: There are a few ways in which one can define a line such as two points on a cartesian grid,
  * a vector (starting point, distance, and angle), or polar coordinate (angle and radius). I will be 
  * storing the starting point, angle (in radians), and radius (length of line segment). After the ending
  * point has been calculated, that is also stored.
  */
function Bone(previousBone) {
	var computedAngle;
	var minShiftAngle;
	var maxShiftAngle
	var escapeLoop;
	
	if (previousBone instanceof Bone) {
		this.startPoint = previousBone.endPoint;
		this.topSide = !(previousBone.topSide);
	} else {
		//Starting point is midway down left side since this is the first bone.
		this.startPoint = new Point(ribbon.leftEdge, canvas.height / 2, ribbon.velocity)
		this.topSide = true;
	}

	/* Because the canvas grid is inverse from a cartesian grid (positive Y values go down, not up),
	   positive radians are clockwise, or make line go down. Negative radians make a line go up.
	   
	  When creating bones, we need to ensure that it doesn't create a very obtuse angle because the 
	  folded ribbon effect will be ruined. Angles should be somewhere between say, 150° and 15°.
	  
	  It is possible to get stuck in an endless loop here, so just go ahead an make a bone that is off the canvas if
	  there were 30 failures.
	*/
	escapeLoop = 0;
	do { //Loop until random values for the angle and radius yield a valid bone.
		//Note: the angle is the actual angle to be drawn on the cartesian grid; not the angle relative to the previous bone.
		if (previousBone && previousBone.angle.radians > 0) {
			//Prefer to acquire a new bone that points up since the previous bone is pointing down.
			minShiftAngle = ribbon.minAngle;
			maxShiftAngle = ribbon.maxAngle - ribbon.newBoneShift;
		} else {
			//Prefer to acquire a new bone that points down since the previous bone is pointing up.
			minShiftAngle = ribbon.minAngle + ribbon.newBoneShift;
			maxShiftAngle = ribbon.maxAngle;
		}
		this.angle = new Angle(getRandomArbitrary(minShiftAngle, maxShiftAngle), ribbon.angleVelocity * positiveOrNegative()) ;
		this.radius = getRandomInt(ribbon.minLength, ribbon.maxLength);
		//Set the start of this next bone to the ending of the previous bone.
		this.getEndPoint();
		computedAngle = this.leftAngle(previousBone); //compute actual angle between this and the previous bone
		escapeLoop++;
	} while (!(this.positionIs() === 'inside' && this.withinSwingAngle(computedAngle)) && escapeLoop < 30);
	this.moveCount = 1;
	this.current = {
		angle: this.angle,
		startPoint: this.startPoint
	};
}
Bone.shift = 0;
Bone.prototype.getEndPoint = function() {
	this.endPoint = new Point(
		this.radius * Math.cos(this.angle.radians) + this.startPoint.x, 
		this.radius * Math.sin(this.angle.radians) + this.startPoint.y,
		ribbon.velocity
	);
}
Bone.prototype.leftAngle = function(previousBone) {
	//Computes the resulting angle between two bones--this (current) bone and the previous bone.
	//Remember an angle is between 0 and 360 degrees, or 0 and 2π.
	//This will fail for the first bone (because there is no previous bone) in which case this will
	//return an arbitrary valid angle.
	if (previousBone instanceof Bone) {
		//If result is < Pi, then angle legs go downward (like a roof). If result is > Pi, then angle
		//legs go upward (like a V). I think.
		return previousBone.angle.radians + (Math.PI - this.angle.radians);
	} else {
		return ribbon.minSwingAngle + 0.01; //force a valid angle
	}
}
Bone.prototype.withinSwingAngle = function(angleToTest) {
	var att = angleToTest;
	var reflectedMax = 2 * Math.PI - ribbon.minSwingAngle; //Yep, this seems backwards, but that is because we are now working with a reflected version of the circle.
	var reflectedMin = 2 * Math.PI - ribbon.maxSwingAngle;
	
	if (att > ribbon.minSwingAngle && att < ribbon.maxSwingAngle ||
		att > reflectedMin && att < reflectedMax) {
		return true;
	} else {
		return false;
	}
}
Bone.prototype.positionIs = function() {
	//returns High, Low, or Inside; indicating where the endPoint of the bone is located.
	if (this.endPoint.y < ribbon.topEdge) {
		return 'high';
	}
	if (this.endPoint.y > canvas.height + ribbon.bottomBleed) {
		return 'low';
	}
	return 'inside';
}
Bone.prototype.draw = function() {
	//Save the current position for each bone so that during the next Movement phase we will always know the original position
	this.current.angle = this.angle;
	this.current.startPoint = this.startPoint;
	this.moveCount = 0;

	ctx.lineCap = 'round';
	ctx.lineWidth = ribbon.boneWidth;
	if (this.topSide) {
		ctx.strokeStyle = 'hsl(' + ribbon.color + ')';
	} else {
		ctx.strokeStyle = 'hsl(' + ribbon.backColor + ')';
	}
	if (ribbon.debugMode) {
		//change colors. Red means positive (downward) rotation, Blue is negataive (upward) rotation
		if (this.angle.velocity > 0) {
			ctx.strokeStyle = 'hsl(0, 95%, 40%)';
		}
		if (this === bone[0]) {
			ctx.strokeStyle = 'hsl(113, 95%, 40%)';
		}
	}
	ctx.beginPath();
	ctx.moveTo(this.startPoint.x, this.startPoint.y);
	ctx.lineTo(this.endPoint.x, this.endPoint.y);
	//ctx.closePath();
	ctx.stroke();
}
Bone.prototype.move = function(previousBone, directionRequest) {
	//We will attempt to move a bone into a new position only two times.
	//Returns 'up', 'down', or 0.
	if (this.moveCount > 2) {
		return 0;
	} else {
		this.moveCount++;
		this.angle = this.current.angle;
		this.startPoint = this.current.startPoint;
	}
	
	//directionRequest is the way the bone should rotate, if at all possible. Pass in 'up','down', or leave blank.
	if (typeof directionRequest === 'undefined') {
		directionRequest = false;
	}
	
	//Right now the only movement in ribbon is rotation of each of the bones. Perhaps down the road we
	//could also lengthen or shorten the individual bones too.
	
	//The right-to-left movement of the ribbon is done by moving the first bone; all others get dragged along.
	if (this === bone[0]) {
		//This is the first bone.
		/* The Bone.shift variable is used in two different ways. As the bones are repositioned Bone.shift is incremented
		   for each bone that is high, and decremented for each bone that is low. The following code will then take the
		   majority vote into consideration when deciding to shift up or down. */
		if (Bone.shift > 0) {
			Bone.shift = ribbon.velocity * ribbon.shiftSpeed;
		}
		if (Bone.shift < 0) {
			Bone.shift = ribbon.velocity * ribbon.shiftSpeed * -1;
		}
		this.startPoint.x -= this.startPoint.velocity; //Slide ribbon slowly to the left.
		this.startPoint.y += Bone.shift;
		previousBone = false;
		Bone.shift = 0;
	} else {
		//Set all bones, except the first one, to have their start point be equal to previous bone’s end point.
		this.startPoint = previousBone.endPoint;
	}
	
	/*  ROTATION RULES
		The direction of rotation will be determined by these items with the most powerful appearing first:
		1. Swing limits - A bone absolutely must not rotate beyond the limits specified by ribbon.minSwingAngle and ribbon.maxSwingAngle.
		2. Canvas limits - A bone should try to rotate it’s endPoint back into the canvas.
		3. Direction request - If a request has been passed into this function, then use it.
		4. Inertia - Keep rotating a bone in the same direction as it has been going.
	*/
	
	//First rotate by Inertia or Direction Request.
	if (directionRequest) {
		if (directionRequest === 'up') {
			this.angle.goUp();
		}
		if (directionRequest === 'down') {
			this.angle.goDown();
		}
	}
	if (previousBone) {
		//If the current bone, and the previous bone are moving in the same direction, then the current bone appears stationary
		//relative to the previous bone. Therefore, double the speed. If three bones happen to be going in the same direction,
		//then it is preferable to keep the third one from swinging so fast. That is why we are only looking backwards one bone.
		if ((previousBone.angle.velocity > 0 && this.angle.velocity > 0) ||
		(previousBone.angle.velocity < 0 && this.angle.velocity < 0)) {
			this.angle.radians += this.angle.velocity * 2;
		} else {
			this.angle.radians += this.angle.velocity;
		}
	} else {
		this.angle.radians += this.angle.velocity;
	}
	this.getEndPoint();
	
	//Check canvas limits
	bonePosition = this.positionIs();
	if (bonePosition === 'inside') {
		directionRequest = 0;
	} else {
		if (bonePosition === 'high') {
			directionRequest = 'down';
			Bone.shift++;
		}
		if (bonePosition === 'low') {
			directionRequest = 'up';
			Bone.shift--;
		}
	}
	
	//Check swing (relative angle between two bones) limits
	var relativeAngle = this.leftAngle(previousBone);
	if (!(this.withinSwingAngle(relativeAngle))) {
		//Determine if the velocity should go positive or negative.
		var reflectedMaxSwing = 2 * Math.PI - ribbon.minSwingAngle;
		if (relativeAngle < Math.PI && relativeAngle > ribbon.maxSwingAngle || relativeAngle > reflectedMaxSwing) {
			//too obtuse
			this.angle.goDown();
		} else {
			//too acute
			this.angle.goUp();
		}
	}

	return directionRequest;
}

function initializeDrawing() {
	//This function is responsible for setting-up the canvas and creating the objects that
	//will ultimately be drawn on the screen (this doesn't actually draw the first frame.)
	var angle;
	var newBone;
	
	//Init the canvas
	canvas = document.getElementById('bones');
	resizeCanvas();
	ctx = canvas.getContext('2d');

	//Only need to add the first bone. The animation loop will generate additional bones as needed.
	bone.push(new Bone());
	
	//Kick-off the animation.
	animate();
}

function animate() {
	/* This is the function where you will want to destroy and create drawing objects. It is also
	   where you animate (changing x,y coordinates) your objects. I will be computing the 
	   skeleton (linkage of bones to make a zig zag line across the screen) here. The actual drawing
	   will be handled by bone.draw();
	   
	   There are two main phases during the animation loop; Movement and Drawing.
	   
	   ************     BEGIN MOVEMENT PHASE     ***************
	*/
	var moveStatus;
	var previousBone = false;
	var i = -1;
	var requestor = -1;
	var directionRequest = false;
	do { //Loop until complete ribbon has been formed.
		i++;
		if (bone.length < i+1) {
			//Create new bone because there aren't any more left in the stack.
			bone.push(new Bone(bone[i-1]));
		}
		if (i === 0) {
			previousBone = false;
		} else {
			previousBone = bone[i-1];
		}
		if (i > requestor) {
			//We have moved past the bone that requested a specific direction so stop asking.
			directionRequest = false;
		}
		moveStatus = bone[i].move(previousBone, directionRequest);
		if (moveStatus != 0) {
			//moveStatus will be 0 when normal move within canvas; or exceeded move count. Otherwise
			//it will be a requested direction change for previous bones.
			directionRequest = moveStatus;      //Such as 'up' or 'down'
			requestor = i;                      //The bone index that is making the request
			i = Math.max(i - ribbon.lookback - 1, -1); //reprocess some prior bones
		}
	} while (i < 0 || bone[i].endPoint.x <= ribbon.rightEdge);
	
	//If there are additional (unused) bones, destroy them.
	if (bone.length > i+1) {
		bone.splice(i+1, 999); //Remove 999 elements starting at i + 1.
	}
	//If first bone is totally off the canvas, destroy it.
	if (bone[0].startPoint.x < ribbon.leftEdge && bone[0].endPoint.x < ribbon.leftEdge) {
		bone.shift();
	}
	
	//*************     BEGIN DRAWING PHASE     ****************
	//Animation is the act of clearing (erasing) your canvas...
	ctx.clearRect(0,0,canvas.width, canvas.height);
	
	//and then redrawing all your objects...
	for (var i=0; i<bone.length; i++) {
		bone[i].draw();
	}
	
	//over and over again.
	requestAnimationFrame(animate);
}

function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
/*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

// Kick-off the process now.
initializeDrawing();
addListeners();

// Event handling
function addListeners() {
	window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
	canvas.width = getViewport().width;
	//canvas.height = getViewport().width * 2 / 3;
	ribbon.rightEdge = canvas.width - ribbon.leftEdge;
	//In this case, I'm making the canvas square, but you can size to the full viewport by uncommenting this line.
	canvas.height = getViewport().height;
}

function getViewport() {
	//Often times you will want the canvas to fill the entire browser window. This will
	//return the pixel dimensions of the viewable area.
	var w = window.innerWidth
	|| document.documentElement.clientWidth
	|| document.body.clientWidth;
	
	var h = window.innerHeight
	|| document.documentElement.clientHeight
	|| document.body.clientHeight;
	
	return {
		width: w,
		height: h
	};
}

function getRandomInt(min, max) {
	// Returns a random integer between min (included) and max (excluded)
	// Using Math.round() will give you a non-uniform distribution!
	return Math.floor(Math.random() * (max - min)) + min;
}
function getRandomArbitrary(min, max) {
	// Returns a random number between min (inclusive) and max (exclusive)
	return Math.random() * (max - min) + min;
}
function positiveOrNegative() {
	if (getRandomInt(0,2)) {
		return 1;
	} else {
		return -1;
	}
}
//This section is responsible for watching the contents of the textboxes that tweak parameters of the line.
//I will be using jQuery to do this.
$('#minLength').on('change', function() {
	if (isNumeric(this.value)) {
		ribbon.minLength = Number(this.value);
		bone.splice(1, 999); //Remove 999 elements starting at i + 1.
	}
});
$('#maxLength').on('change', function() {
	if (isNumeric(this.value)) {
		ribbon.maxLength = Number(this.value);
		bone.splice(1, 999); //Remove 999 elements starting at i + 1.
	}
});
$('#minAngle').on('change', function() {
	if (isNumeric(this.value)) {
		ribbon.minAngle = Number(this.value);
		bone.splice(1, 999); //Remove 999 elements starting at i + 1.
	}
});
$('#maxAngle').on('change', function() {
	if (isNumeric(this.value)) {
		ribbon.maxAngle = Number(this.value);
		bone.splice(1, 999); //Remove 999 elements starting at i + 1.
	}
});
$('#minSwing').on('change', function() {
	if (isNumeric(this.value)) {
		ribbon.minSwingAngle = Number(this.value);
		bone.splice(1, 999); //Remove 999 elements starting at i + 1.
	}
});
$('#maxSwing').on('change', function() {
	if (isNumeric(this.value)) {
		ribbon.maxSwingAngle = Number(this.value);
		bone.splice(1, 999); //Remove 999 elements starting at i + 1.
	}
});
$('#boneWidth').on('change', function() {
	if (isNumeric(this.value)) {
		ribbon.boneWidth = Number(this.value);
		bone.splice(1, 999); //Remove 999 elements starting at i + 1.
	}
});
$('#velocity').on('change', function() {
	if (isNumeric(this.value)) {
		ribbon.velocity = Number(this.value);
		bone.splice(1, 999); //Remove 999 elements starting at i + 1.
	}
});
$('#spinSpeed').on('change', function() {
	if (isNumeric(this.value)) {
		ribbon.angleVelocity = Number(this.value);
		bone.splice(1, 999); //Remove 999 elements starting at i + 1.
	}
});
$('#btnRedraw').on('click', function() {
	cancelAnimationFrame(animate);
	//Wait just a touch to make sure animation is done, then start it over.
	window.setTimeout(function() {
		bone = new Array();
		initializeDrawing();
	}, 65);
});

//When the page first loads, set the default values in the form fields to the defaults defined by the Bone class.
$('#minLength').val(ribbon.minLength);
$('#maxLength').val(ribbon.maxLength);
$('#minAngle').val(ribbon.minAngle);
$('#maxAngle').val(ribbon.maxAngle);
$('#minSwing').val(ribbon.minSwingAngle);
$('#maxSwing').val(ribbon.maxSwingAngle);
$('#boneWidth').val(ribbon.boneWidth);
$('#velocity').val(ribbon.velocity);
$('#spinSpeed').val(ribbon.angleVelocity);

function isNumeric(x, strict) {
	if (strict) {
		//Check a NUMBER, not a string. Pass anything to variable strict to use it.
		return ( (typeof x === typeof 1) && (null !== x) && isFinite(x) );
	} else {
		/* Here is an alternate way of checking to see if a string can be evaluated as a number:
			return !isNaN(parseFloat(x)) && isFinite(x);
		*/
		//If you want to allow a number (in string format) to be considered a number then use this one by omitting the second parameter.
		//parseFloat WILL consider '7+' or '7%' or '7=' to be a number. I don't want those to be considered numbers so first thing is to check that only numeric digits, a period, a negative sign, and an 'e' to be valid characters.
		if (String(x).search(/[^0-9e.-]+/)>-1) {
			//found an illegal character
			return false;
		} else {
			return !isNaN(parseFloat(x));
		}
	}
}

//End of variable isolation.
})();