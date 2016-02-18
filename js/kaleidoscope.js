/**
 *	Create Kaleidoscope with either an image or the contents of a div
 *	(c) 2016 Moenen Erbuer - moenen@shapish.com
 *	v1.0
 *	Released under the MIT and GPL licenses.
 *
 *	OPTIONS (all optional)
 *	imgUrl: image to kaleidoscope.
 *	content: html to insert inside each segment.
 *	segments: number of kaleidoscope segments.
 *	size: diameter of kaleidocope.
 */

function Kaleidoscope(options) {
	this.init(options);
}


// Initialize.
Kaleidoscope.prototype.init = function(options) {
	// Get image from (A) URL (B) options or (C) leave empty.
	this.imgUrl = window.location.href.split('?img=')[1] ? window.location.href.split('?img=')[1] : (options.imgUrl ? options.imgUrl : null);
	
	// Html to insert inside each segment.
	this.content = options.content ? options.content : '';
	
	// Number of kaleidoscope segments.
	this.segments = options.segments ? options.segments : 10;
	
	// Diameter of the kaleidoscope.
	this.size = options.size ? options.size : Math.max($(window).width(), $(window).height());
	
	this.position = options.position ? options.position : ['50%', '50%'];
	
	// Offset of background image.
	this.offsetX = 0;
	this.offsetY = 0;
	
	// Image width (loaded later with image).
	this.imgWidth = 0;
	this.imgHeight = 0;
	
	// Scroll value.
	this.prevScroll = 0;
	this.scroll = 0;
	
	// To catch scroll event.
	this.scrollCatcher = false;
	
	this.create();
};


// Re-initialize with new options.
// Instead of falling back to default values, we fall back to previous values when not specified.
Kaleidoscope.prototype.reInit = function(options) {
	// Destroy all DOM elements before recreating.
	this.destroy();
	
	// Get image from (A) URL (B) options or (C) leave empty.
	this.imgUrl = window.location.href.split('?img=')[1] ? window.location.href.split('?img=')[1] : (options.imgUrl ? options.imgUrl : this.imgUrl);
	
	// Html to insert inside each segment.
	this.content = options.content ? options.content : this.content;
	
	// Number of kaleidoscope segments.
	this.segments = options.segments ? options.segments : this.segments;
	
	// Diameter of the kaleidoscope.
	this.size = options.size ? options.size : this.size;
	
	// Offset of background image.
	this.offsetX = 0;
	this.offsetY = 0;
	
	// Image width (loaded later with image).
	this.imgWidth = 0;
	this.imgHeight = 0;
	
	// Scroll value.
	this.prevScroll = 0;
	this.scroll = 0;
	
	// To catch scroll event.
	this.scrollCatcher = false;
	
	this.create();
};


// Generate segments & add optional bg image.
Kaleidoscope.prototype.create = function() {
	// Generate kaleidoscope segments.
	this.generateSegments();
	
	// Load image and continue when done.
	if (this.imgUrl) {
		this.loadImage();
		
		// Catch scroll event.
		this.scrollCatcher = new ScrollCatch({
			'sensitivity': .01
		}, $.proxy(this.catchScroll, this));
	
		// Auto-move
		setInterval($.proxy(function() {
			// Detect if scroll value is "stuck" (happens with scroll wheels).
			var scrollStuck = this.scroll == this.prevScroll;
			// Detect if scroll value is near zero (touch pads fade back to zero).
			var scrollZero = !Math.floor(Math.abs(this.scroll));
			if (scrollStuck || scrollZero) {
				this.offsetX -= 1;
				this.offsetY -= 1.5;
				this.updateKaleidoscope(this.offsetX, this.offsetY);
			}
		}, this), 40);
	
		// Enable new image to be dropped.
		// new DropImg(null, $.proxy(this.loadImage, this));
	}
};


// Remove kaleidoscope completely.
Kaleidoscope.prototype.destroy = function() {
	$('#svg-segment').remove();
	if (this.scrollCatcher) {
		this.scrollCatcher.disable();
	}
	$('#kaleido-wrap').remove();
};


// Generate kaleidoscope segments.
Kaleidoscope.prototype.generateSegments = function() {
	// Create SVG HTML.
	var svgHtml = this.drawSvg();
		
	// Append HTML.
	$('body').append(svgHtml);
	
	// Create kaleidoscope HTML.
	var kaleidoHtml = ([
		'<div id="kaleido-wrap">',
			'<div id="kaleido">',
				'<div class="mirror-segment">',
					'<div class="segment">',
						this.content,
					'</div>',
				'</div>',
			'</div>',
		'</div>'
	]).join('\n');
	
	// Append HTML.
	$('body').append(kaleidoHtml);
	
	// Mirror first segment.
	var $mirrorSegment = $('#kaleido .mirror-segment');
	$('#kaleido .segment').css({
		'width': this.size / 2,
		'height': this.size / 2
	}).clone().appendTo($mirrorSegment).css({
		'transform': 'scale(1, -1)'
	});
	
	// Repeat mirrored segments full circle.
	for (var i=1; i<this.segments; i++) {
		$mirrorSegment.clone().insertAfter($mirrorSegment).css({
			'transform': 'rotate(' + (360 / this.segments * i) + 'deg)'
		});
	}
	
	// Show lines.
	var $linesWrap = $('<div>').addClass('seams').css({
		'position': 'absolute',
		'left': this.position[0],
		'top': this.position[1]
	}).appendTo('#kaleido-wrap');
	for (var i=0; i<this.segments * 2; i++) {
		$('<div>').css({
			'width': this.size / 2,
			'height': 0,
			'border-bottom': ((i/2 == Math.round(i/2)) ? 'dashed' : 'solid') + ' 1px #000',
			'opacity': (i/2 == Math.round(i/2)) ? .1 : .2,
			'position': 'absolute',
			'left': 0,
			'top': -1,
			'transform-origin': '0 center',
			'transform': 'rotate(' + (360 / this.segments / 2) * (i + 1) + 'deg)'
		}).appendTo($linesWrap);
	}
};


// Load image and continue when done.
Kaleidoscope.prototype.loadImage = function() {
	$('<img>').attr('src', this.imgUrl).css({
		'visibility': 'hidden'
	}).appendTo('body').imgLoad($.proxy(function(e) {
		this.imgWidth = $(e.target).width();
		this.imgHeight = $(e.target).height();
		$(e.target).remove();
		$('#kaleido .segment').css({
			'background': 'url(' + this.imgUrl + ') ' + this.offsetX + 'px ' + this.offsetY + 'px repeat'
		});
	}, this));
};


// Catch scroll event and adjust 
Kaleidoscope.prototype.catchScroll = function(value) {
	this.prevScroll = this.scroll;
	this.scroll = value;
	this.offsetX = (this.offsetX + value) % this.imgWidth;
	// this.offsetY = (this.offsetY + value) % this.imgHeight;
	this.updateKaleidoscope(this.offsetX, this.offsetY);
};


Kaleidoscope.prototype.updateKaleidoscope = function(x, y) {
	$('#kaleido .segment').css({
		'background-position': -x + 'px ' + -y + 'px'
	});
};


Kaleidoscope.prototype.drawSvg = function() {
	var dist = this.size / 2;
	var angle = 360 / this.segments / 2;
	var x = dist * Math.cos(angle * Math.PI / 180);
	var y = dist * Math.sin(angle * Math.PI / 180);
	
	var svgHtml = ([
		'<svg width="0" height="0" id="svg-segment">',
			'<defs>',
				'<clipPath id="clip-path">',
					'<polygon points="0,0 ' + dist + ',0 ' + x + ',' + y + '" />',
		    '</clipPath>',
			'</defs>',
		'</svg>'
	]).join('\n');
	
	return svgHtml;
};