(function($){
	$.fn.fancyDialog = function(options){
		console.log("hola");
		var config = $.extend({
			text : 'This is a default text',
			customStructure : null,
			color : 'pink',
		}, options);
	}
}(jQuery));