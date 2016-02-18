/**
 *	Draw smooth lines on a canvas.
 *	(c) 2016 Moenen Erbuer - moenen@shapish.com
 *	Released under the MIT and GPL licenses.
 *	------------------
 *	Based on script: http://codetheory.in/html5-canvas-drawing-lines-with-smooth-edges/
 */

function SmoothDraw(options) {
	/* READ OPTIONS */
	options = options ? options : {};
	// Parent to attach canvas to.
	this.parent = options.parent ? options.parent : 'body';
	// ID of the canvas. Wrapper will be same + '-wrap'.
	this.id = options.id ? options.id : null;
	// Drawing frames we skip for smoother curve.
	this.skip = options.skip ? options.skip : 5;
	// Canvas props.
	this.width = options.width ? options.width : $(window).width();
	this.height = options.height ? options.height : $(window).height();
	// Calback after you end a line.
	this.callbackStart = options.callbackStart ? options.callbackStart : $.noop;
	this.callbackEnd = options.callbackEnd ? options.callbackEnd : $.noop;
	
	this.init();
	
	// Set stroke styles (strokeStyle + lineWidth)
	this.setStyles(options);
}


// Initialize.
SmoothDraw.prototype.init = function() {
	// Counts the drawing frames.
	this.i = 0;
	
	// Current mouse position.
	this.mouse = {x: 0, y: 0};

	// Pencil Points
	this.ppts = [];
	
	// Create DOM elements.
	this.createCanvases();
	// Mouse handlers.
	$(this.tmpCanvas).on('mousedown.draw', $.proxy(this.mouseDownHandler, this));
	$(this.tmpCanvas).on('touchstart.draw', $.proxy(this.mouseDownHandler, this));
	$(this.tmpCanvas).on('mouseup.draw', $.proxy(this.mouseUpHandler, this));
	$(this.tmpCanvas).on('touchend.draw', $.proxy(this.mouseUpHandler, this));
};


// Create DOM elements.
SmoothDraw.prototype.createCanvases = function() {
	// Create HTML wrapper.
	this.$canvasWrap = $('<div>').addClass('draw-canvas-wrap').css({
		'width': this.width,
		'height': this.height,
		'position': 'absolute',
		'top': 0,
		'left': 0
	}).appendTo(this.parent);
	if (this.id) {
		this.$canvasWrap.attr('id', this.id + '-wrap');
	}
	
	// Create canvas.
	var $canvas = $('<canvas>').addClass('draw-canvas').css({
		'position': 'absolute',
		'top': 0,
		'left': 0
	}).appendTo(this.$canvasWrap);
	if (this.id) {
		$canvas.attr('id', this.id);
	}
	this.ctx = $canvas.get(0).getContext('2d');
	$canvas.get(0).width = this.width;
	$canvas.get(0).height = this.height;
	
	// Create tmp canvas.
	this.tmpCanvas = $('<canvas>').addClass('draw-canvas-tmp').css({
		'position': 'absolute',
		'top': 0,
		'left': 0
	}).appendTo(this.$canvasWrap).get(0);
	this.tmpCtx = this.tmpCanvas.getContext('2d');
	this.tmpCanvas.width = this.width;
	this.tmpCanvas.height = this.height;
	this.$canvasWrap.append(this.tmpCanvas);
};


// Set styles.
SmoothDraw.prototype.setStyles = function(options) {
	this.tmpCtx.lineWidth = options.lineWidth ? options.lineWidth : (this.tmpCtx.lineWidth ? this.tmpCtx.lineWidth : 5);
	this.tmpCtx.strokeStyle = options.strokeStyle ? options.strokeStyle : (this.tmpCtx.strokeStyle ? this.tmpCtx.strokeStyle : '#333');
	this.tmpCtx.lineJoin = 'round';
	this.tmpCtx.lineCap = 'round';
};


// Mouse down.
SmoothDraw.prototype.mouseDownHandler = function(e) {
	e.preventDefault();
	
	this.onPaint(e);
	$(this.tmpCanvas).on('mousemove.draw', $.proxy(this.onPaint, this));
	$(this.tmpCanvas).on('touchmove.draw', $.proxy(this.onPaint, this));
	
	// Callback function.
	this.callbackStart();
};


// Mouse up.
SmoothDraw.prototype.mouseUpHandler = function(e) {
	e.preventDefault();
	
	$(this.tmpCanvas).off('mousemove.draw');
	$(this.tmpCanvas).off('touchmove.draw');

	// Writing down to real canvas now
	this.ctx.drawImage(this.tmpCanvas, 0, 0);

	// Clearing tmp canvas
	this.tmpCtx.clearRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);

	// Emptying up Pencil Points
	this.ppts = [];
	
	// Callback function.
	this.callbackEnd();
}


// Paint event (called on every frame).
SmoothDraw.prototype.onPaint = function(e) {
		e.preventDefault();
		
		// Skip points per our settings.
		this.i++;
		if (Math.round(this.i / this.skip) != this.i / this.skip) {
			return;
		}
		
		// Update mouse position.
		this.saveMouse(e);
		
		// Save all the points in an array.
		this.ppts.push({x: this.mouse.x, y: this.mouse.y});
		
		// First 2 points.
		if (this.ppts.length < 3) {
			var b = this.ppts[0];
			this.tmpCtx.beginPath();
			this.tmpCtx.arc(b.x, b.y, this.tmpCtx.lineWidth / 2, 0, Math.PI * 2, !0);
			this.tmpCtx.fill();
			this.tmpCtx.closePath();
			return;
		}

		// Tmp canvas is always cleared up before drawing.
		this.tmpCtx.clearRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);
		
		// Draw line ine between points.
		this.tmpCtx.beginPath();
		this.tmpCtx.moveTo(this.ppts[0].x, this.ppts[0].y);
		for (var i = 1; i < this.ppts.length - 2; i++) {
			var c = (this.ppts[i].x + this.ppts[i + 1].x) / 2;
			var d = (this.ppts[i].y + this.ppts[i + 1].y) / 2;
			this.tmpCtx.quadraticCurveTo(this.ppts[i].x, this.ppts[i].y, c, d);
		}

		// Last 2 points.
		this.tmpCtx.quadraticCurveTo(
			this.ppts[i].x,
			this.ppts[i].y,
			this.ppts[i + 1].x,
			this.ppts[i + 1].y
		);
		this.tmpCtx.stroke();
}


SmoothDraw.prototype.saveMouse = function(e) {
	var x = typeof(e.pageX) == 'undefined' ? e.originalEvent.touches[0].pageX : e.pageX;
	var y = typeof(e.pageY) == 'undefined' ? e.originalEvent.touches[0].pageY : e.pageY;
	this.mouse.x = x - $(this.tmpCanvas).offset().left;
	this.mouse.y = y - $(this.tmpCanvas).offset().top;
};