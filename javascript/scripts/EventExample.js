/** @preserve EventExample
  * Originally written 9 May 2012
  * All rights reserved. Pixel Pro, Inc.
  * Written by Craig Creeger
  */
//Version history:
//1.0 Initial build

//Assumpions: common.js has been linked to the page

(function() { 
if (typeof EventExample=='undefined') {
window.EventExample = {};
}
//******************************************************************
	/* The Model (from MVC) object should be loosely coupled to the rest of the application.
	   It is responsible for the domain object or data structures. Create methods to maintain
	   this object and fire events when something significant happens/changes.                 */
EventExample.Model = function(initial) {
	CustomEvent.call(this);    //execute the super class constructor
	this.curTime = initial;
}
EventExample.Model.prototype = new CustomEvent();                 //Set the super class for this Object (JavaScript inheritance using the prototype chain)
EventExample.Model.prototype.constructor = EventExample.Model;    //Specify this object's constructor, otherwise it would use EventExample's constructor

EventExample.Model.prototype.updateTime = function() {
	this.curTime = new Date().toTimeString();
	this.fire({type:"newTime",curTime:this.curTime});
}
//******************************************************************
	/* The View (from MVC) object should be loosely coupled to the rest of the application.
	   It is only responsible for drawing pixels on a computer screen and recognizing when
	   the user has interacted with the user interface.                                      */
	   
EventExample.View = function(displayElem, updateBtn) {
	CustomEvent.call(this);                      //execute the super class constructor
	this.lcd = displayElem;
	updateBtn.view = this;                       //Create a "view" property on the <button> element so we can get a pointer to this View instance.
	updateBtn.onclick = function() {
		this.view.fire("updateRequested");       //use the new "view" property.
	}
}
EventExample.View.prototype = new CustomEvent();                 //JavaScript inheritance via prototype chaining
EventExample.View.prototype.constructor = EventExample.View;

EventExample.View.prototype.content = function(newTime) {
	this.lcd.innerHTML = newTime;
}
//******************************************************************
})();