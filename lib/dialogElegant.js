function customConfirm(message, events, callback){
	text = $('#text');

	text.html(message);

	$('.popBox').fadeIn(500);
	
	boxWidth = $('.boxMsg').outerWidth() / 2;
	boxHeight = $('.boxMsg').outerHeight() / 2;

	$('.boxMsg').css({'margin-top':'-'+boxHeight+'px', 'margin-left':'-'+boxWidth+'px'});

	$('.popBox').on(events.clickOrTouch, '.ok', function(){
		$('.popBox').fadeOut(500);
		if(typeof callback == 'function'){
			callback();
		}
	});

	$('.popBox').on(events.clickOrTouch, '.cancel', function(){
		$('.popBox').fadeOut(500);
		return false;
	});
};