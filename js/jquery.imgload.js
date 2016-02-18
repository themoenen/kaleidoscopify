/**
 *	Alternative to jQuery .load that will work even when image is loaded from cache.
 *	(c) 2015 Moenen Erbuer - moenen@shapish.com
 *	Released under the MIT and GPL licenses.
 */

(function($) {
	$.fn.imgLoad = function(func) {
		if (!this.length) {
			return this;
		}
		this.one('load', function(e) {
		  $.proxy(func, this)(e);
		});
		return this.each(function() {
		  if (this.complete) {
		  	$(this).load();
		  }
		});
	};
})(jQuery);