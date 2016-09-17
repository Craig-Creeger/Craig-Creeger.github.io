//Wrap all the code in an anonymous function so that we don't pollute the global namespace
(function() {
	
//Local Variables
var canvas, 
	ctx,
	dot;

/**
  * Point Class
  * In addition to the usual X and Y values, there is also a velocity so that we can control
  * how fast the point moves around.
  */
function Point(x, y, velocity) {
	this.x = x;
	this.y = y;
	if (typeof velocity === 'undefined') {
		//Not all points have a velocity.
		this.velocity = 0;
	} else {
		this.velocity = velocity;
	}
}

/**
  * Circle Class
  * Pass in a Point instance and the radius when initializing a circle.
  */
function Circle(centerPoint, radius) {
	this.centerPoint = centerPoint;
	this.radius = radius;
	this.color = '128, 80, 240'; //Default RGB values
}

Circle.prototype.draw = function() {
	//Prior to drawing the object, make any changes necessary. For example, we are animating
	//the circle to move from left to right. Therefore, the X value needs to get bumped up little.
	
	if (this.centerPoint.x > canvas.width - 20) {
		//reverse the direction of the dot
		this.centerPoint.velocity = Math.abs(this.centerPoint.velocity) * -1;
	} else if (this.centerPoint.x < 20) {
		this.centerPoint.velocity = Math.abs(this.centerPoint.velocity);
	}
	this.centerPoint.x = this.centerPoint.x + this.centerPoint.velocity;

	//Time to actually draw the object.
	ctx.beginPath();
	ctx.arc(this.centerPoint.x, this.centerPoint.y, this.radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = 'rgba(' + this.color + ',1.0)';
	ctx.fill();
}

function initializeDrawing() {
	//This function is responsible for setting-up the canvas and creating the objects that
	//will ultimately be drawn on the screen (this doesn't actually draw the first frame.)
	
	//Init the canvas
	canvas = document.getElementById('dot');
	resizeCanvas();
	ctx = canvas.getContext('2d');

	// Create the circle
	dot = new Circle(new Point(20,20,0.5), 20);
	
	//Kick-off the animation.
	animate();
}

function animate() {
	//Animation is the act of clearing (erasing) your canvas...
	ctx.clearRect(0,0,canvas.width, canvas.height);
	
	//and then redrawing all your objects...
	dot.draw();
	
	//over and over again.
	requestAnimationFrame(animate);
}

// Kick-off the process now.
initializeDrawing();
addListeners();

// Event handling
function addListeners() {
	window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
	canvas.width = getViewport().width;
	canvas.height = 40;
	
	//In this case, I'm fixing the height to 20 pixels, but you can full viewport by uncommenting this line.
	//canvas.height = getViewport().height;
}

function getViewport() {
	//Often times you will want the canvas to fill the entire browser window. This will
	//return the pixel dimensions of the viewable area.
	return {
		width: document.body.clientWidth,
		height: document.body.clientHeight
	};
}

//End of variable isolation.
})();