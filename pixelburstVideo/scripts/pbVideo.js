/** @preserve Pixelburst Video ver. 3.0
  * All rights reserved. Pixel Pro, Inc.
  * Written by Craig Creeger
  */
//Version history:
//1.0 Initial build June 2012
//2.0 Can now dynamically resize (scale) the video and use the built-in (HTML5) controls or a standard Flash skin.
//3.0 Added the CustomEvent super-class to this library; no longer necessary to include common.js

//Assumpions: jQuery has been defined as a global variable. Modernizr video check is available, swfobject is available

(function() { 
if (typeof Pixelburst==='undefined') {
	window.Pixelburst = {};
}

/* CustomEvent is the super-class for a few things in here. */
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

//******************************************************************
//*   View Object
//******************************************************************
Pixelburst.Skin = function(skin,elem) {
	CustomEvent.call(this);       // call the super class constructor
	
	this.playToggle = "paused";  //This is the default state of the video.
	this.muteToggle = "mute";   //Start by showing the mute button.
	
	var inject = "";
	for (var i=0; i<skin.buttons.length; i++) {
		inject += '<button class="transportBtn" id="' + skin.buttons[i].purpose + '">' + (skin.buttons[i].text.enabled?skin.buttons[i].text.value:'') + '</button>';
	}
	elem.innerHTML = inject;
	
	for (var i=0; i<skin.buttons.length; i++) {
		curBtn = skin.buttons[i].purpose;
		this[curBtn] = document.getElementById(curBtn);
		this[curBtn].viewObj = this;
		switch (curBtn) {
			case "play":
				this[curBtn].onclick = function() {
					//console.log("Play btn clicked.");
					this.viewObj.fire("requestPlay");
					this.viewObj.togglePlay("playing");
				};
				break;
			case "pause":
				this[curBtn].onclick = function() {
					//console.log("Plause btn clicked.");
					this.viewObj.fire("requestPause");
					this.viewObj.togglePlay("paused");
				};
				break;
			case "rewind":
				this[curBtn].onclick = function() {
					this.viewObj.fire("requestRewind");
				};
				break;
			case "mute":
				this[curBtn].onclick = function() {
					this.viewObj.fire("requestMute");
					this.viewObj.toggleMute();
				};
				break;
			case "audible":
				this[curBtn].onclick = function() {
					this.viewObj.fire("requestAudible");
					this.viewObj.toggleMute();
				};
				break;
		}
	}
	//show default Play and Mute buttons
	this.toggleMute(this.muteToggle);
	this.togglePlay(this.playToggle)
}
Pixelburst.Skin.prototype = new CustomEvent();
Pixelburst.Skin.prototype.constructor = Pixelburst.Skin;

// *********** METHODS ************
Pixelburst.Skin.prototype.togglePlay = function(which) {
	//leave "which" blank to toggle the current state; otherwise you can explicity set it.
	//If you are going to explicity set it, pass in "playing" if the video is currently Playing, or "paused" if not playing
	if (which!="undefined") {
		this.playToggle = which;
	}
	if (this.playToggle==="playing") {
		playToggle = "paused";
		$("#pause").css("display","inline-block");
		$("#play").css("display","none");
	} else {
		this.playToggle = "playing";
		$("#pause").css("display","none");
		$("#play").css("display","inline-block");
	}
}

Pixelburst.Skin.prototype.toggleMute = function(which) {
	//leave "which" blank to toggle the current state; otherwise you can explicity set it.
	if (String(which).toLowerCase()==="mute") {
		muteToggle = "audible";
	} else if (String(which).toLowerCase()==="audible") {
		muteToggle = "mute";
	}
	if (muteToggle==="mute") {
		muteToggle = "audible";
		$("#audible").css("display","inline-block");
		$("#mute").css("display","none");
	} else {
		muteToggle = "mute";
		$("#audible").css("display","none");
		$("#mute").css("display","inline-block");
	}
}
//******************************************************************
//*   Model Object for HTML5 Video
//******************************************************************
Pixelburst.Html5Video = function(elem, videoURL, autoplay, loop, stdControls, resizeable) { 
	/* elem is a reference to a DOM element
	   videoURL must be an array of path/filenames
	   autoplay must resolve to a boolean, pass in true or "autoplay" | false or leave blank
	*/
	CustomEvent.call(this);
	var inject = '';
	var resizeClass = '';
	if (resizeable) {
		var resizeClass = ' class="resizeable"';
	}
	inject += '<div id="videoWrapper"' + resizeClass + '>';
	inject += '<video' + resizeClass + ' id="myVideo" ';
	if (autoplay) {
		inject += 'autoplay ';
	}
	if (stdControls) {
		inject += 'controls ';
	}
	if (loop) {
		inject += 'loop ';
	}
	inject += '>\n';
	for (var i=0; i<videoURL.length; i++) {
		inject += '  <source src="' + videoURL[i].name + '" type="' + videoURL[i].type + '">\n';
	}
	inject += '</video>';
	inject += '</div>'; //videoWrapper
	$(elem).replaceWith(inject);
	this.video = document.getElementsByTagName("video")[0];
	
	this.video.vidObj = this;
	this.video.addEventListener("playing",function() {
		//"this" refers to the <video> element, which is why vidObj was placed on it.
		this.vidObj.fire("playing");
	}, false);
	this.video.addEventListener("ended",function() {
		this.vidObj.fire("ended");
	}, false);
	this.video.addEventListener("error",function() {
		this.vidObj.fire("error");
	}, false);
}
Pixelburst.Html5Video.prototype = new CustomEvent();
Pixelburst.Html5Video.prototype.constructor = Pixelburst.Html5Video;
	
// *********** PROPERTIES ************
Pixelburst.Html5Video.prototype.pxMuted = function(bolMuted) {
	if (bolMuted=="undefined") {
		return this.video.muted;
	} else if (bolMuted) {
		this.video.muted = true;
	} else {
		this.video.muted = false;
	}
}
Pixelburst.Html5Video.prototype.pxVolume = function(volPercent) {
	if (volPercent=="undefined") {
		return this.video.volume;
	} else if (volPercent>=0 && volPercent<=1) {
		this.video.volume = volPercent;
	}
}
Pixelburst.Html5Video.prototype.pxIsPlaying = function() {
	if (this.video.paused) {
		return false;
	} else {
		return true;
	}
}
Pixelburst.Html5Video.prototype.pxCurrentPosition = function() {
	//expressed in seconds
	return this.video.currentTime;
}
// *********** METHODS ************
Pixelburst.Html5Video.prototype.pxPlay = function(){
	this.video.play();
}
Pixelburst.Html5Video.prototype.pxPause = function(){
	this.video.pause();
}
Pixelburst.Html5Video.prototype.pxRewind = function(){
	//Must start at beginning and then play
	this.video.currentTime = 0;
	this.video.play();
}
//******************************************************************
//*   Model Object for Flash Video
//******************************************************************
Pixelburst.FlashVideo = function(elem, resizeable) { 
	/* elem is a reference to a DOM element	*/
	CustomEvent.call(this);
	this.video = elem;
	
	var resizeClass = '';
	if (resizeable) {
		var resizeClass = ' class="resizeable"';
	}
	//Wrap the Flash player for dynamically resizing it via CSS
	$(this.video).wrap('<div id="videoWrapper"' + resizeClass + ' />');
}
Pixelburst.FlashVideo.prototype = new CustomEvent();
Pixelburst.FlashVideo.prototype.constructor = Pixelburst.FlashVideo;
	
// *********** PROPERTIES ************
Pixelburst.FlashVideo.prototype.pxMuted = function(bolMuted) {
	if (bolMuted=="undefined") {
		return this.video.flashMuted();
	} else if (bolMuted) {
		this.video.flashMuted(true);
	} else {
		this.video.flashMuted(false);
	}
}
Pixelburst.FlashVideo.prototype.pxVolume = function(volPercent) {
	if (volPercent=="undefined") {
		return this.video.flashVolume();
	} else if (volPercent>=0 && volPercent<=1) {
		this.video.flashVolume(volPercent);
	}
}
Pixelburst.FlashVideo.prototype.pxIsPlaying = function() {
	return this.video.flashIsPlaying();
}
Pixelburst.FlashVideo.prototype.pxCurrentPosition = function() {
	//expressed in seconds
	return this.video.flashPlayheadTime();
}
// *********** METHODS ************
Pixelburst.FlashVideo.prototype.pxPlay = function(){
	this.video.flashPlay();
}
Pixelburst.FlashVideo.prototype.pxPause = function(){
	this.video.flashPause();
}
Pixelburst.FlashVideo.prototype.pxRewind = function(){
	//Must start at beginning and then play
	this.video.flashRewind();
	this.video.flashPlay();
}
// *********** EVENTS - Flash will call these functions when the event happens in Flash ************
Pixelburst.FlashVideo.prototype.playing = function() {
	this.fire("playing");
}
Pixelburst.FlashVideo.prototype.ended = function() {
	this.fire("ended");
}
Pixelburst.FlashVideo.prototype.error = function() {
	this.fire("error");
}
//******************************************************************
})();

/*ERROR CODE FOR HTML5 VIDEO
	this.video.onerror = function(e) {
		switch (e.target.error.code) {
			case e.target.error.MEDIA_ERR_ABORTED:
				alert('You aborted the video playback.');
				break;
			case e.target.error.MEDIA_ERR_NETWORK:
				alert('A network error caused the video download to fail part-way.');
				break;
			case e.target.error.MEDIA_ERR_DECODE:
				alert('The video playback was aborted due to a corruption problem or because the video used features your browser did not support.');
				break;
			case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
				alert('The video could not be loaded, either because the server or network failed or because the format is not supported.');
				break;
			default:
				alert('An unknown error occurred.');
				break;
		}
	}
*/