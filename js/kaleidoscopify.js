/**
 *	Draw to create kaleidoscope.
 *	(c) 2016 Moenen Erbuer - for shapish.com
 *	v1.0
 *	Released under the MIT and GPL licenses.
 */

function Kaleidoscopify() {
	// Default setting values.
	this.defaultSegments = 10
	this.defaultSpeed = 80
	this.defaultLineWidth = 2
	this.defaultUseColor = false

	// Read settings from cookied and adjust UI.
	this.setSettings()

	// For first time actions.
	this.virgin = true

	// Whether kaleido rotation is turned on, and paused (when in bg).
	this.rotate = true
	this.pauseRotation = true

	// Default color.
	this.defaultColor = '#333'

	this.center = ['50%', '45%']

	// Kaleidsocope size: screen size + buffer for corners.
	this.size = Math.max($(window).width(), $(window).height()) * 1.5

	// Kaleidoscpe class.
	this.kaleido

	// Fullscreen on mobile.
	// $(window).click(function() {
	// 	if (screenfull.enabled) {
	// 		screenfull.request();
	// 	}
	// 	return false;
	// });

	// Disable hover states for touch screens.
	this.testTouch()

	this.init()
}

/**
 * Initialisation
 */

// Read settings from cookied and adjust UI.
// If reset is set, we reset all values back to default.
Kaleidoscopify.prototype.setSettings = function (reset) {
	// Number of segments.
	this.segments = reset
		? this.defaultSegments
		: Cookies.get('setting-segments')
		? Cookies.get('setting-segments')
		: this.defaultSegments

	// Rotation speed.
	this.speed = reset
		? this.defaultSpeed
		: Cookies.get('setting-speed')
		? Cookies.get('setting-speed')
		: this.defaultSpeed

	// Line width.
	this.lineWidth = reset
		? this.defaultLineWidth
		: Cookies.get('setting-line-width')
		? Cookies.get('setting-line-width')
		: this.defaultLineWidth

	// Whether to use color.
	this.useColor = reset
		? this.defaultUseColor
		: Cookies.get('setting-use-color')
		? Cookies.get('setting-use-color') === 'true'
		: this.defaultUseColor

	// Set UI.
	$('#settings input.slider-segments').val(this.segments).prev('label').find('.value').html(this.segments)
	$('#settings input.slider-speed').val(this.speed).prev('label').find('.value').html(this.speed)
	$('#settings input.slider-line-width')
		.val(this.lineWidth)
		.prev('label')
		.find('.value')
		.html(this.lineWidth)
	$('#settings .cb-use-color').prop('checked', this.useColor)

	// Functionality.
	this.setRotationSpeed(this.speed)

	// Save cookies when we're resetting + reset segments.
	if (reset) {
		// Cookies
		this.onChangeSetting('slider-segments', this.defaultSegments)
		this.onChangeSetting('slider-speed', this.defaultSpeed)
		this.onChangeSetting('slider-line-width', this.defaultLineWidth)
		this.onChangeSetting('cb-use-color', this.defaultUseColor)
		// No cookies.
		this.onChangeSetting('cb-seams', false)
		this.onChangeSetting('cb-rotate', true)
		this.onChangeSetting('cb-clip', true)
		this.onChangeSetting('cb-original', false)
		// UI.
		$('#settings .cb-seams').prop('checked', false)
		$('#settings .cb-rotate').prop('checked', true)
		$('#settings .cb-clip').prop('checked', true)
		$('#settings .cb-original').prop('checked', false)
	}
}

// Initialize all parts.
Kaleidoscopify.prototype.init = function () {
	// Create master canvas to draw on.
	this.initCanvas()

	// Create kaleidoscope.
	this.createKaleido()

	// Hookup settings ui.
	this.initSettings()

	// Stop rotation when window is in bg (to save your CPU).
	$(window).on('blur', $.proxy(this.setPauseRotation, this, true))
	$(window).on('focus', $.proxy(this.setPauseRotation, this, false))

	// Adjust canvas on resizing.
	$(window).resize($.proxy(this.onResize, this))
}

/**
 * Create Drawing canvas.
 */

// Create master canvas to draw on.
Kaleidoscopify.prototype.initCanvas = function () {
	this.draw = new SmoothDraw({
		id: 'master-canvas',
		width: $(window).width(),
		height: $(window).height() * 1.1,
		strokeStyle: this.useColor ? this.getRandomColor() : this.defaultColor,
		lineWidth: this.lineWidth,
		skip: 3,
		callbackStart: $.proxy(this.onDrawStart, this),
		callbackEnd: $.proxy(this.onDrawEnd, this),
	})

	// Center master canvas.
	$('#master-canvas-wrap canvas').css({
		left: this.center[0],
		top: this.center[1],
		'margin-left': $(window).width() / -2,
		'margin-top': $(window).height() / -2,
	})
}

// Fit canvas (on window resize).
Kaleidoscopify.prototype.fitCanvas = function () {
	$('#master-canvas-wrap .draw-canvas-tmp').get(0).width = $(window).width()
	$('#master-canvas-wrap .draw-canvas-tmp').get(0).height = $(window).height() * 1.1
	$('#master-canvas-wrap .draw-canvas').get(0).width = $(window).width()
	$('#master-canvas-wrap .draw-canvas').get(0).height = $(window).height() * 1.1
	$('#master-canvas-wrap canvas').css({
		'margin-left': $(window).width() / -2,
		'margin-top': $(window).height() / -2,
	})
}

// When you start drawing.
Kaleidoscopify.prototype.onDrawStart = function () {
	this.setPauseRotation(true)
	$('#settings, #about-me').addClass('hide')
	if (this.virgin) {
		$('#instructions, #center').addClass('hide')
		this.virgin = false
	}
}

// When you finish drawing.
Kaleidoscopify.prototype.onDrawEnd = function () {
	this.setPauseRotation(false)
	$('#settings, #about-me').removeClass('hide')
	this.canvasToKaleido()
	if (this.useColor) {
		this.draw.setStyles({
			strokeStyle: this.getRandomColor(),
		})
	}
	// Fullscreen on mobile.
	if (screenfull.enabled && ($(window).width() < 450 || $(window).height() < 450)) {
		screenfull.request()
	}
}

/**
 * Create Kaleidoscope.
 */

// Create kaleidoscope.
Kaleidoscopify.prototype.createKaleido = function () {
	this.kaleido = new Kaleidoscope({
		content: $('#kaleido-content').html(),
		segments: this.segments,
		size: this.size,
		position: this.center,
	})

	// Remove content div as we don't need it anymore.
	$('#kaleido-content').remove()

	this.prepKaleido()
}

// Recreate kaleidoscope with different numberf or segments.
// Used when you change the number of segments.
Kaleidoscopify.prototype.reCreateKaleido = function (segments) {
	// Reinitialize kaleidoscope.
	this.segments = segments
	this.kaleido.reInit({
		segments: segments,
	})

	// Copy main canvas content back to kaleidocope canvas.
	setTimeout(
		$.proxy(function () {
			this.canvasToKaleido()
			$('#master-canvas').css({
				visibility: 'visible',
			})
			$('#kaleido').addClass('rotate')
		}, this),
		1
	)

	this.prepKaleido()
}

// After kaleido is created, we initialize the canvases.
Kaleidoscopify.prototype.prepKaleido = function () {
	// Show "searchlight" reference svg.
	var html = this.drawSvg()
	$(html).attr('class', 'search-light').appendTo('#kaleido')

	// Prep canvases inside kaleidoscope.
	$('#kaleido .canvas-wrap')
		.css({
			top: $(window).height() / -2,
			left: $(window).width() / -2,
			width: $(window).width(),
			height: $(window).height(),
		})
		.find('canvas')
		.each(
			$.proxy(function (i, elm) {
				// Set canvas dimensions.
				$(elm).get(0).width = $(window).width()
				$(elm).get(0).height = $(window).height()
			}, this)
		)
}

// Replicate canvas inside kaleidoscope segments.
Kaleidoscopify.prototype.canvasToKaleido = function () {
	var originalCanvas = $('#master-canvas').get(0)
	$('#kaleido canvas').each(function (i, elm) {
		var ctx = $(elm).get(0).getContext('2d')
		ctx.globalCompositeOperation = 'source-over'
		ctx.drawImage(originalCanvas, 0, 0)
	})
}

// Pause rotation without affecting the switch.
// Used to pause rotation when screen is in background, or while you draw.
Kaleidoscopify.prototype.setPauseRotation = function (pause) {
	this.pauseRotation = pause
	if (this.rotate) {
		this.toggleRotation(!pause, true)
	}
}

// Stop/start rotation.
Kaleidoscopify.prototype.toggleRotation = function (on, pause) {
	if (on === true) {
		// Rotation on.
		$('#kaleido').addClass('rotate')
		if (pause !== true) {
			$('#settings .cb-rotate').prop('checked', true)
			this.rotate = true
		}
	} else if (on === false) {
		// Rotation off.
		var rotation = this.getRotation($('#kaleido .segment .canvas-wrap').first())
		rotation += this.getRotation($('#kaleido .segment canvas').first())
		$('#kaleido').removeClass('rotate')
		$('#kaleido .segment canvas').css('transform', 'rotate(' + rotation + 'deg)')
		$('#kaleido .search-light svg').css('transform', 'rotate(' + -rotation + 'deg)')
		if (pause !== true) {
			$('#settings .cb-rotate').prop('checked', false)
			this.rotate = false
		}
	}
}

/**
 * Settings UI.
 */

// Hook up settings ui.
Kaleidoscopify.prototype.initSettings = function () {
	$('#settings .title').click(function (e) {
		e.preventDefault()
		// Note: toggleClass is buggy.
		if ($('#settings').hasClass('open')) {
			$('#settings').removeClass('open')
		} else {
			$('#settings').addClass('open')
		}
	})

	// Segments slider.
	$('#settings input.slider-segments')
		.on('input', function (e) {
			$(e.target).prev('label').find('.value').html($(e.target).val())
		})
		.change(
			$.proxy(function (e) {
				this.onChangeSetting('slider-segments', $(e.target).val())
			}, this)
		)

	// Speed slider.
	$('#settings input.slider-speed')
		.on('input', function (e) {
			$(e.target).prev('label').find('.value').html($(e.target).val())
			// Convert speed value to duration.
			// var speed = $(e.target).val() * $(e.target).val();
			var speed = 101 - $(e.target).val()
			$(e.target).data('speed', speed)
			// console.log(speed / 100);
		})
		.change(
			$.proxy(function (e) {
				this.onChangeSetting('slider-speed', $(e.target).val())
			}, this)
		)

	// Line width slider.
	$('#settings input.slider-line-width')
		.on(
			'input',
			$.proxy(function (e) {
				$(e.target).prev('label').find('.value').html($(e.target).val())
			}, this)
		)
		.change(
			$.proxy(function (e) {
				this.onChangeSetting('slider-line-width', $(e.target).val())
			}, this)
		)

	// Color checkbox.
	$('#settings .cb-use-color').click(
		$.proxy(function (e) {
			this.onChangeSetting('cb-use-color', $(e.target).is(':checked'))
		}, this)
	)

	// Show Seams.
	$('#settings .cb-seams').click(
		$.proxy(function (e) {
			this.onChangeSetting('cb-seams', $(e.target).is(':checked'))
		}, this)
	)

	// Rotate checkbox.
	$('#settings .cb-rotate').click(
		$.proxy(function (e) {
			this.onChangeSetting('cb-rotate', $(e.target).is(':checked'))
		}, this)
	)

	// Clip checkbox.
	$('#settings .cb-clip').click(
		$.proxy(function (e) {
			this.onChangeSetting('cb-clip', $(e.target).is(':checked'))
		}, this)
	)

	// Show original checkbox.
	$('#settings .cb-original').click(
		$.proxy(function (e) {
			this.onChangeSetting('cb-original', $(e.target).is(':checked'))
		}, this)
	)

	// Clear canvas button.
	$('#settings input.btn-clear').click(
		$.proxy(function () {
			$('#kaleido canvas').each(
				$.proxy(function (i, elm) {
					// Clear original canvas.
					$('#master-canvas')
						.get(0)
						.getContext('2d')
						.clearRect(0, 0, $(window).width(), $(window).height())
					// Clear kaleido canvases.
					var ctx = $(elm).get(0).getContext('2d')
					ctx.clearRect(0, 0, $(window).width(), $(window).height())
					// Reset UI.
					$('#settings').removeClass('open')
					$('#center').removeClass('hide')
					this.setPauseRotation(true)
					this.virgin = true
				}, this)
			)
		}, this)
	)

	// Reset values link.
	$('#settings a.reset-values').click(
		$.proxy(function () {
			this.setSettings(true)
			return false
		}, this)
	)
}

Kaleidoscopify.prototype.onChangeSetting = function (setting, value) {
	if (setting == 'slider-segments') {
		// Segments slider.
		this.reCreateKaleido(value)
		// Save cookie.
		Cookies.set('setting-segments', value, {
			expires: 2,
		})
	} else if (setting == 'slider-speed') {
		// Speed slider.
		this.setRotationSpeed(value)
		// Save cookie.
		Cookies.set('setting-speed', value, {
			expires: 2,
		})
	} else if (setting == 'slider-line-width') {
		// Line width slider.
		// if (this.draw) {
		this.draw.setStyles({
			lineWidth: value,
		})
		// }
		// Save cookie.
		Cookies.set('setting-line-width', value, {
			expires: 2,
		})
	} else if (setting == 'cb-use-color') {
		// Color checkbox.
		if (value) {
			this.useColor = true
			this.draw.setStyles({
				strokeStyle: this.getRandomColor(),
			})
		} else {
			this.useColor = false
			this.draw.setStyles({
				strokeStyle: this.defaultColor,
			})
		}
		// Set cookie.
		Cookies.set('setting-use-color', this.useColor, {
			expires: 2,
		})
	} else if (setting == 'cb-seams') {
		// Show Segments.
		if (value) {
			$('#kaleido-wrap').addClass('show-seams')
		} else {
			$('#kaleido-wrap').removeClass('show-seams')
		}
		// No cookie for show segments. They should always be off.
	} else if (setting == 'cb-rotate') {
		// Rotate checkbox.
		if (value) {
			this.toggleRotation(true)
		} else {
			this.toggleRotation(false)
		}
		// No cookie for rotation. It should always be on.
	} else if (setting == 'cb-clip') {
		// Clip checkbox.
		if (value) {
			$('#kaleido').removeClass('dont-clip')
		} else {
			$('#kaleido').addClass('dont-clip')
		}
		// No cookie for clipping. It should always be on.
	} else {
		// Show original checkbox.
		if (value) {
			$('body').addClass('show-original')
		} else {
			$('body').removeClass('show-original')
		}
		// No cookie for clipping. It should always be on.
	}
}

/**
 * Various functions.
 */

// Extract CSS rotation from element.
Kaleidoscopify.prototype.getRotation = function ($elm) {
	var tr = $elm.css('transform')

	// If there's no transformation applied, stop here.
	if (tr.indexOf(',') == -1) {
		return 0
	}

	// Extract matrix values.
	var values = tr.split('(')[1],
		values = values.split(')')[0],
		values = values.split(',')
	var a = values[0]
	var b = values[1]
	var c = values[2]
	var d = values[3]

	// Calulate scale.
	var scale = Math.sqrt(a * a + b * b)

	// Calculate angle.
	// arc sin, convert from radians to degrees, round
	var sin = b / scale
	var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI))

	return angle
}

// Set rotation speed.
Kaleidoscopify.prototype.setRotationSpeed = function (speed) {
	// Convert speed value to duration.
	speed = 101 - speed
	$('#rotation-speed').remove()
	var html = [
		'<style type="text/css" id="rotation-speed">',
		'#kaleido.rotate .segment .canvas-wrap {',
		'animation: rotate ' + speed + 's infinite linear;',
		'}',
		'#kaleido.rotate .search-light {',
		'animation: rotate ' + speed + 's infinite linear reverse;',
		'}',
		'</style>',
	]

	$(html.join('')).appendTo('head')
}

// Create random color.
Kaleidoscopify.prototype.getRandomColor = function () {
	this.Rmin = 80
	this.Rmax = 255
	this.Gmin = 0
	this.Gmax = 255
	this.Bmin = 0
	this.Bmax = 175
	var R = Math.round(parseInt(this.Rmin) + Math.random() * (this.Rmax - this.Rmin))
	var G = Math.round(parseInt(this.Gmin) + Math.random() * (this.Gmax - this.Gmin))
	var B = Math.round(parseInt(this.Bmin) + Math.random() * (this.Bmax - this.Bmin))

	var rgb = 'rgb(' + R + ',' + G + ',' + B + ')'
	return rgb
}

// Draw reference "searchlight" svg to show where the kaleidoscope currently is.
// Mirrored from kaleidoscope.js.
Kaleidoscopify.prototype.drawSvg = function () {
	var dist = this.size // Double of what we need, just in case one resizes the screen.
	var angle = 360 / this.segments / 2
	var x = dist * Math.cos((angle * Math.PI) / 180)
	var y = dist * Math.sin((angle * Math.PI) / 180)

	var svgHtml = [
		'<div>',
		'<svg width="' + dist + '" height="' + y + '">',
		'<polygon points="0,0 ' + dist + ',0 ' + x + ',' + y + '" fill="rgba(0,0,0,.05)" />',
		'</svg>',
		'</div>',
	].join('\n')

	return svgHtml
}

// Add touch class to body on touch screens to disable all hovers.
Kaleidoscopify.prototype.testTouch = function () {
	$(window).on('touchstart.test', function () {
		$(window).off('touchstart.test')
		$('body').addClass('touch')
	})
}
