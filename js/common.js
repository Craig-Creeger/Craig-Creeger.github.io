/** @preserve Common (generic) routines - version 1.5 - 2012 October
  * All rights reserved. Pixel Pro, Inc.
  * Written by Craig Creeger
  */

//Ver 1.1 : Changed function Array.compare so that it is no longer an enumerable property. This allows to you use --> for (prop in array) {...}
//Ver 1.2 : Added includeHTML() so you can include inline content on a page.
//Ver 1.3 : Added EventTarget so that custom events are possible. In other words, your custom objects can fire events.
//Ver 1.4 : Renamed EventTarget to CustomEvent and reformatted the code.
//Ver 1.5 : Modifies the window.setTimeout and window.setInterval functions so that the "this" keyword can be used by the target function.

/**
* Function : dump()
* Arguments: The data - array,hash(associative array),object
*    The level - OPTIONAL
* Returns  : The textual representation of the array.
* This function was inspired by the print_r function of PHP.
* This will accept some data as the argument and return a
* text that will be a more readable version of the
* array/hash/object that is given.
*/
function dump(arr,level) {
var dumped_text = "";
if(!level) level = 0;

//The padding given at the beginning of the line.
var level_padding = "";
for(var j=0;j<level+1;j++) level_padding += "    ";

if(typeof(arr) == 'object') { //Array/Hashes/Objects
 for(var item in arr) {
  var value = arr[item];
 
  if(typeof(value) == 'object') { //If it is an array,
   dumped_text += level_padding + "'" + item + "' ...\n";
   dumped_text += dump(value,level+1);
  } else {
   dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
  }
 }
} else { //Stings/Chars/Numbers etc.
 dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
}
return dumped_text;
}

//The following two functions are from "JavaScript Bible", p. 757 - Designed to bind a listener to DOM elements.
//Although, if you are using jQuery then you can use $(elem).bind()
function addEvent(elem, evtType, func) {
	if (elem.addEventListener) {
		elem.addEventListener(evtType, func, false);
	} else if (elem.attachEvent) {
		elem.attachEvent("on" + evtType, func) ;
	} else {
		elem["on" + evtType] = func;
	}
}

function removeEvent(elem, evtType, func) {
	if (elem.removeEventListener) {
		elem.removeEventListener(evtType, func, false);
	} else if (elem.detachEvent) {
		elem.detachEvent("on" + evtType, func);
	} else {
		elem["on" + evtType] = null;
	}
}


function CustomEvent() {
    this._listeners = {}; /* Each property name will be a different event name
		and that property will contain an array of callbacks */
}
CustomEvent.prototype.addListener = function(type, listener) {
	if (typeof this._listeners[type] == "undefined"){
		this._listeners[type] = [];
	}

	this._listeners[type].push(listener);
}
CustomEvent.prototype.fire = function(event) {
	if (typeof event == "string"){
		event = { type: event };
	}
	if (!event.target){
		event.target = this;
	}

	if (!event.type){  //falsy
		throw new Error("Event object missing 'type' property.");
	}

	if (this._listeners[event.type] instanceof Array){
		var listeners = this._listeners[event.type];
		for (var i=0; i < listeners.length; i++){
			listeners[i].call(this, event);
		}
	}
}
CustomEvent.prototype.removeListener = function(type, listener) {
	if (this._listeners[type] instanceof Array){
		var listeners = this._listeners[type];
		for (var i=0; i < listeners.length; i++){
			if (listeners[i] === listener){
				listeners.splice(i, 1);
				break;
			}
		}
	}
}

function isValidObject(objToTest) {
	if ("undefined" === typeof objToTest) {
		//alert(objToTest + ' is undefined so stating that isValidObject is false.');
		return false;
	}
	if (null == objToTest) {
		//alert(objToTest + ' is null so stating that isValidObject is false.');
		return false;
	}
	//alert (objToTest + ' is an object and it is not set to null, so returning a True.');
	return true;
}
function getStyle(elem, cssprop){
	//Cross-browser method for reading the current the value of a CSS property.
	if (elem.currentStyle) { //IE
		return elem.currentStyle[cssprop];
	} else if (document.defaultView && document.defaultView.getComputedStyle) { //standards method
		return document.defaultView.getComputedStyle(elem, "")[cssprop];
	} else { //try and get inline style
		return elem.style[cssprop];
	}
}
function getNumber (sz) {
	//returns the first number found in the input string. Example: getNumber("80px") == 80
	var matchedArray = String(sz).match(/\d+/);
	if (matchedArray) return matchedArray[0];
}
function adjustIframeHeight(elem, minHeight, maxHeight, width) {
	//elem should be an iFrame (a regular frame might work too).
	//Enter the same value for min and max to force a fixed size.
	//To use the content's height omit the last two parameters.
	//Firefox is not giving the frame quite enough height. Add another 20px for FF.
	
	//First we give the element the minimum height, otherwise it will never get smaller than its current height.
	if (!isNumeric(minHeight)) minHeight = 0;
	if (elem) elem.height = minHeight;
	
	if (!isNumeric(maxHeight)) maxHeight = Number.MAX_VALUE;
	var scrollH;
	var newHeight = null;
	if (elem) {
		if (elem.contentDocument && elem.contentDocument.body.scrollHeight) {
			//W3C DOM iframe doc syntax
			scrollH = elem.contentDocument.body.scrollHeight;
		} else if (elem.Document && elem.Document.body.scrollHeight) {
			//IE DOM syntax
			scrollH = elem.Document.body.scrollHeight;
		}
		if (scrollH < minHeight) {
			newHeight = minHeight;
		} else if (scrollH > maxHeight) {
			newHeight = maxHeight;
		} else {
			newHeight = scrollH;
		}
		if (String(navigator.userAgent).search(/Firefox/)>-1) {
			newHeight += 25;
		}
		elem.height = newHeight; //notice that we are setting an attribute (vs. CSS)
		if (isNumeric(width)) {
			elem.width = width; //notice that we are setting an attribute (vs. CSS)
		}
	}
	return newHeight;
}

function includeHTML(url, destElement) {
	//Have you ever wanted an Include statement as part of HTML, this is it. Whatever is in the file you pass (via the url parameter) is tossed into the destElement. So, most likely the source files are just fragments of an HTML page, not a full compelete working page. This should make the previous adjustIframeHeight function somewhat moot.
	//This function requires jQuery
	var jqxhr = jQuery.ajax({
		url:url, 
		dataType: 'html',
		success:function(data){
			//console.log("all Data:\n"+data);
			destElement.innerHTML = data;
		},
		error:function(){
			alert('Attempted to load page ' + url + ' but it resulted in error during ajax load.');
		}
	});
}

function isNotBlank(objToTest) {
	var hasData = false;
	if (isValidObject(objToTest)) {
		if (objToTest.toString()!=='') {
			hasData = true;
		}
	}
	//alert('isNotBlank is returning ' +  hasData);
	return hasData;
}

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

function hasClass(obj) {
//This function is needed to work around a bug in IE related to element attributes. Better yet, just use jQuery.
	 var result = false;
	 if (obj.getAttributeNode("class") != null) {
		 result = obj.getAttributeNode("class").value;
	 }
	 return result;
}   

function stripe(id) {
	// This function will color every other row of a table.
	// the flag we'll use to keep track of 
	// whether the current row is odd or even
	var even = false;
	// if arguments are provided to specify the colours
	// of the even & odd rows, then use the them;
	// otherwise use the following defaults: example -> stripe('myTable','#dedede', '#ccc');
	var evenColor = arguments[1] ? arguments[1] : "#fff";
	var oddColor = arguments[2] ? arguments[2] : "#eee";
	// obtain a reference to the desired table
	// if no such table exists, abort
	var table = document.getElementById(id);
	if (! table) { return; }
	// by definition, tables can have more than one tbody
	// element, so we'll have to get the list of child
	// <tbody>s 
	var tbodies = table.getElementsByTagName("tbody");
	// and iterate through them...
	for (var h = 0; h < tbodies.length; h++) {
		// find all the <tr> elements... 
		var trs = tbodies[h].getElementsByTagName("tr");
		// ... and iterate through them
		for (var i = 0; i < trs.length; i++) {
			// avoid rows that have a class attribute
			// or backgroundColor style
			if (! hasClass(trs[i]) && ! trs[i].style.backgroundColor) {
				// get all the cells in this row...
				var tds = trs[i].getElementsByTagName("td");
				// and iterate through them...
				for (var j = 0; j < tds.length; j++) {
					var mytd = tds[j];
					// avoid cells that have a class attribute
					// or backgroundColor style
					if (! hasClass(mytd) &&	! mytd.style.backgroundColor) {
						mytd.style.backgroundColor =
						even ? evenColor : oddColor;
					}
				}
			}
			// flip from odd to even, or vice-versa
			even =  ! even;
		}
	}
}

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

/*if(!Array.prototype.compare) {
    Object.defineProperty(Array.prototype, 'compare', {  //defineProperty fails in that fucking miserable browser known as IE8
       value: function(testArr) {
			//Use to inspect the contents of two arrays. e.g. if (myArray.compare(yourArray)) {//true} else {//false}
			if (this.length != testArr.length) return false;
			for (var i = 0; i < testArr.length; i++) {
				if (this[i].compare) { 
					if (!this[i].compare(testArr[i])) return false;
				}
				if (this[i] !== testArr[i]) return false;
			}
			return true;
       },
       enumerable: false
    });
}
Array.prototype.compare = function(testArr) {
}*/

// Use the browser's built-in functionality to quickly and safely escape a string for <body> text.
// Note: this will not work if you are escaping for use within an attribute. In that case, use the function shown below.
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};
 
// UNSAFE with unsafe strings; only use on previously-escaped ones!
function unescapeHtml(escapedStr) {
    var div = document.createElement('div');
    div.innerHTML = escapedStr;
    var child = div.childNodes[0];
    return child ? child.nodeValue : '';
};

/* Use this for escaping HTML Attribute values.
var MAP = { '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'};
 
function escapeHTML (s, forAttribute) {
    return s.replace(forAttribute ? /[&<>'"]/g : /[&<>]/g, function(c) {
        return MAP[c];
    });
}
*/
