/**
 *	Catch scroll event and return scroll value.
 *	(c) 2016, Moenen Erbuer / moenen@shapish.com
 *	Released under the MIT and GPL licenses.
 *	------------------
 *	Based on script: http://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
 */

// $catcher parameter is optional.
function ScrollCatch(options, func) {
	// Element that will catch scroll.
	this.$catcher = options.$catcher ? options.$catcher : $('body');
	
	// Function that we feed the scroll value to.
	this.returnFunc = func ? func : $noop;
	
	// Scroll sensitivity multiplier.
	this.sensitivity = options.sensitivity ? options.sensitivity : 2;
	
	// Because we can't removeEventListener with a proxy function (fails in FF).
	this.replaceScrollWheelProxied = $.proxy(this.replaceScrollWheel, this);
	
	this.enable();
}


// Catch scroll event.
ScrollCatch.prototype.enable = function() {
	if (window.addEventListener) {
		window.addEventListener('DOMMouseScroll', this.replaceScrollWheelProxied, false);
	}
	window.onmousewheel = document.onmousewheel = $.proxy(this.replaceScrollWheel, this);
	document.onkeydown = $.proxy(this.scrollKeydown, this);
};


// Stop catching scroll event.
ScrollCatch.prototype.disable = function() {
	if (window.removeEventListener) {
		window.removeEventListener('DOMMouseScroll', this.replaceScrollWheelProxied, false);
	}
	window.onmousewheel = document.onmousewheel = document.onkeydown = null;  
};


// Replace scroll event with shade adjustment.
ScrollCatch.prototype.replaceScrollWheel = function(e) {
	// Detect scrollforce for any browser / firefox.
	var scrollForce = (e.wheelDelta || e.detail * -80) * this.sensitivity;
	this.returnFunc(scrollForce);
	this.scrollPreventDefault(e);
};


// Block up/down keys from scrolling
ScrollCatch.prototype.scrollKeydown = function(e) {
	// left: 37, up: 38, right: 39, down: 40, spacebar: 32
	// pageup: 33, pagedown: 34, end: 35, home: 36
	var scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];

	for (var i = scrollKeys.length; i--;) {
		if (e.keyCode === scrollKeys[i]) {
			this.scrollPreventDefault(e);
			return;
		}
	}
};


// Prevent scrolling.
ScrollCatch.prototype.scrollPreventDefault = function(e) {
	e = e || window.event;
	if (e.preventDefault) {
		e.preventDefault();
		e.returnValue = false;
	}
};