/**
 *	Detect CSS transition end, browser agnostic: http://goo.gl/ItkiW
 *	(c) Moenen Erbuer 2015 - moenen@shapish.com
 *	Released under the MIT and GPL licenses.
 */

(function($) {
	$.fn.transitionEnd = function(func) {
		if (!this.length) {
			return this;
		}
		
		var tEndName = transitionEndEventName();
		
		if (func) {
			// Bind transitionEnd.
			return this.one(tEndName, $.proxy(executeCallback, this));
		} else {
			// Unbind transitionEnd.
			return this.off(tEndName);
		}
		
		function executeCallback(e) {
			// Because events bubble up, we need to check the event target.
			// Without this, any transition of children will trigger callback.
			if (e.target == e.currentTarget) {
				$.proxy(func, this)(e);
			} else {
				// If a transitionend from child triggers this, we need to re-bind the callback.
				this.one(tEndName, $.proxy(executeCallback, this));
			}
			e.stopPropagation();
			// Debug
			// console.log(e.target)
			// console.log(e.currentTarget)
			// console.log(e.originalEvent.propertyName, true);
		}
		
		// Get the right transitionend
		function transitionEndEventName () {
			var i, undefined, el = document.createElement('div'),
			transitions = {
				'transition':'transitionend',
				'OTransition':'otransitionend',
				'MozTransition':'transitionend',
				'WebkitTransition':'webkitTransitionEnd'
			};
			for (i in transitions) {
				if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
					return transitions[i];
				}
			}
		}
		
		return this;
	};
})(jQuery);