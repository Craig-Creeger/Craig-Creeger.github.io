/** @preserve Pixel Pro Objects
  * Originally written Oct. 2011
  * Written by Craig Creeger, Pixel Pro, Inc.
  */
//Version history: 1.0 Initial build

// Enable the passage of the 'this' object through the JavaScript timers
// https://developer.mozilla.org/en-US/docs/DOM/window.setTimeout
// To use: setInterval.call(myObject, myObject.myFunction, 2000, args); //use the "call" method.
var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;
  
window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
  var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
  return __nativeST__(vCallback instanceof Function ? function () {
    vCallback.apply(oThis, aArgs);
  } : vCallback, nDelay);
};
  
window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
  var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
  return __nativeSI__(vCallback instanceof Function ? function () {
    vCallback.apply(oThis, aArgs);
  } : vCallback, nDelay);
};

(function () { 

if (window.PixelPro===undefined) {
	window.PixelPro = {};
}
//******************************************************************
PixelPro.PxProSlider = function (elem, duration, width, animation, animationDuration, leftOffset) {
	var i;
	this.animation = animation; //can be 'slide', 'cross-fade'
	this.animationDuration = animationDuration;
	this.itemWidth = width;
	this.$pxproItems = []; //array of jQuery objects
	this.curIdx = 0;
	this.leftOffset = leftOffset;
	
	var $items = $(elem).children('.pxproItem');
	//If none of the children as the "active" class, then assign it to the first one
	if ($(elem).find('.pxproItem.active').length < 1) {
		if ($items.length > 0) {
			$items.eq(0).addClass('active');
		}
	}
	
	for (i=0; i<$items.length; i++) {
		if ($items.eq(i).hasClass('active')) {
			$items.eq(i).css({'z-index':2});
		} else {
			if (animation==='cross-fade') {
				$items.eq(i).css({'z-index':1, opacity:0});
			} else { //assume slide
				$items.eq(i).css({left:width + leftOffset +'px', 'z-index':1}); //push all non-active items over to the right.
			}
		}
		this.$pxproItems.push($items.eq(i));
	}
	
	//start the show
	/* The duration + animationDuration on the next line is because of "timing".  Let's say you 
	   intend to have 3 seconds between each animation and each animation phase takes two seconds.
	   That means the image will be static on the page for only 1 second (3-2=1). The crappy deal,
	   however, is the first image will be static for 5 seconds (3+2=5) instead of your intended
	   three seconds. If the duration is, say over 10 seconds or the animation is less than a second,
	   then nobody will even notice. Worry of about this if it ever becomes an issue... */
	var ssInterval = setInterval.call(this, this.animate, duration + animationDuration);
}

PixelPro.PxProSlider.prototype.nextItem = function() {  //slides are sequential (not random)
	if (this.curIdx===this.$pxproItems.length - 1) {
		return this.$pxproItems[0];
	} else {
		return this.$pxproItems[this.curIdx + 1];
	}
}

PixelPro.PxProSlider.prototype.prevItem = function() {
	if (this.curIdx===0) {
		return this.$pxproItems[this.$pxproItems.length - 1];
	} else {
		return this.$pxproItems[this.curIdx - 1];
	}
}

PixelPro.PxProSlider.prototype.setCurrent = function() {
	//This should be called AFTER the animation. In other words, the "current" item
	//is the one sitting statically on the page.
	this.curIdx++;
	if (this.curIdx > (this.$pxproItems.length - 1)) {
		this.curIdx = 0;
	}
}

PixelPro.PxProSlider.prototype.animate = function() {
	/* z-index --- 3=next, 2=active, 1=discards */
	
	if (this.animation==='cross-fade') {
		this.$pxproItems[this.curIdx].css({'z-index':2}).animate({opacity:0},this.animationDuration,'swing');
		this.nextItem().css({opacity:0, 'z-index':3}).animate({opacity:1},this.animationDuration,'swing');
		this.setCurrent();
	} else {
		//assume 'slide'
		//Move the next item to its initial position and put on top
		this.nextItem().css({left:this.itemWidth + this.leftOffset + 'px', 'z-index':3});
		
		//Slide the active item out of the porthole
		this.$pxproItems[this.curIdx].css({'z-index':1}).animate({left:(this.itemWidth * -1) + this.leftOffset},this.animationDuration,'swing');
		
		//If you want a gap between the slide items, then give a setTimeout duration  > 0; otherwise make it zero to keep them tight.
		var gap = setTimeout.call(this, slideNext, 200);
	}
	
	function slideNext() {
		this.nextItem().animate({left:this.leftOffset},this.animationDuration,'swing');
		this.setCurrent();
	}
}
//******************************************************************
})();

/* This is the beginning of the plug-in. Everything above is a class that does the actual work. */
(function($) {
	
$.fn.PxProSlideShow = function(options) {
	//'this' represents a jQuery object that is returned by the jQuery selector the user defined.
	
	var settings = $.extend(
		{duration: 4000,
		width: 160, //width of the individual items (the container can be larger or smaller)
		animation: 'slide',
		animationDuration: 2000,
		leftOffset: 0},
		options);
		
	this.each(function() {
		var ss = new PixelPro.PxProSlider(this, settings.duration, settings.width, settings.animation, settings.animationDuration, settings.leftOffset);
	});
}

}(jQuery));