//Global Variables
var canvas, 
	ctx,
	bees,
	animateHeader = true,
	debug = false;

/**
  * Bee Class - start
  * Each circle (bee) will be an instance of this class. 
  */
function Bee(cw, ch) {
	this.attrs = {}; //Basic size and position attributes of each bee
	this.init(cw, ch);
}
Bee.prototype.init = function(canvasWidth, canvasHeight) {
	this.maxRadius = canvasHeight * 0.01; //The starting size is variable depending on the height of the canvas.
	this.attrs.radius = Math.random() * this.maxRadius;
	if (debug) {
		this.attrs.x = canvasWidth / 2; // start in middle
		this.attrs.y = canvasHeight;    //and bottom of screen
	} else {
		this.attrs.x = Math.random() * canvasWidth;
		this.attrs.y = canvasHeight + (Math.random() * canvasHeight * .2);
	}
	this.attrs.alpha = 0.2 + Math.random() * 0.5;
	if (debug) console.log(this.attrs);
}
Bee.prototype.draw = function() {
	//Make a yellow circle on the Canvas
	ctx.beginPath();
	ctx.arc(this.attrs.x, this.attrs.y, this.attrs.radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = 'rgba(255,175,95,'+ this.attrs.alpha+')';
	ctx.fill();
}

function getViewport() {
	return {
		width: document.body.clientWidth,
		height: document.body.clientHeight
	};
}
function initHeader() {
	var population = 1;
	
	canvas = document.getElementsByTagName('canvas')[0];
	resizeCanvas();
	ctx = canvas.getContext('2d');

	// Create particles; then number generated is dependent upon the INITIAL width of the canvas.
	bees = [];
	if (!debug) population = canvas.width*0.1;
	for(var x = 0; x < population; x++) {
		var c = new Bee(canvas.width, canvas.height);
		bees.push(c);
		tweenLeg(c);
	}
	animate(); //Kick-off the animation.
}

function tweenLeg(bee) {
	//Generate the "to" values.
	if (bee.attrs.radius < 1) {
		//The bee has shrunk down to less than a pixel in size. Reincarnate the bee - generate a new size and position.
		bee.init(canvas.width, canvas.height);
	}	
	var radius = bee.attrs.radius - (Math.random() * bee.maxRadius * .1);
	if (radius <= 0) {
		radius = 0.1;
	}
	if (debug) {
		console.log('before start of this leg, the current radius is ' + bee.attrs.radius + ' and it will go to ' + radius);
	}
	var x = bee.attrs.x + (Math.random()*200 - 100);
	var y = bee.attrs.y - (Math.random()*140 - 20);
	var seconds = Math.random()*3.4 + 0.4;

	TweenLite.to(bee.attrs, seconds, {
		x: x,
		y: y,
		radius: radius,
		ease:Quad.easeInOut,
		onComplete: function() {
			if (animateHeader) tweenLeg(bee);
		}
	});
}

function animate() {
	if(animateHeader) {
		ctx.clearRect(0,0,canvas.width, canvas.height);
		for(var i in bees) {
			bees[i].draw();
		}
		msg('animating...');
		requestAnimationFrame(animate);
	} else {
		msg('not animating');
	}
}

// Kick-off the process now.
initHeader();
addListeners();

// Event handling
function addListeners() {
	window.addEventListener('scroll', scrollCheck);
	window.addEventListener('resize', resize);
}

function scrollCheck() {
	if(window.pageYOffset > canvas.height) {
		animateHeader = false;
	} else {
		if (!animateHeader) {
			//Kick-off the tweenLeg and animate loops if they are not running.
			for(var i in bees) {
				tweenLeg(bees[i]);
			}
			animateHeader = true;
			animate();
		}
	}
}

function resizeCanvas() {
	canvas.width = getViewport().width;
	canvas.height = getViewport().height;
}

function msg(what) {
	//This is just a debugging "helper" function. It will print the contents of "what" on any element with the class "msg".
	var nodeList = document.querySelectorAll('.msg');
	for (var i = 0; i < nodeList.length; i++) {
		nodeList[i].innerHTML = what;
	}
}