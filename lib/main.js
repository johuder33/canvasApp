var color,
 	paleta,
 	slide, 
 	grosor, 
 	cleaner, 
 	mask, 
 	saver, 
 	lastCategory, 
 	currentTool, 
 	lastPoint, 
 	currentPoint, 
 	rgb, 
 	eraserSize, 
 	lastClass, 
 	loader, 
 	lastTool,
	eventos, 
	isMobile, 
	objectsCanvas = {},
	ID = 0, 
	specialCase = false, 
	colorObj,
	stack = new Array(),
	lastTimeTouch,
	lastTimeSaved,
	nCanvas,
	counterError = 0,
	imagenes,
	pdf;

var states = {
	clicked : false,
	isLandscape : true
}

var arrColor = new Array(
	'#550022','#800033','#d40000',
	'#f191ac','#ffd5d5','#6d301e',
	'#aa4400','#ff6600','#ff9955',
	'#fdceb0','#554400','#f9a11c',
	'#ffc50c','#fbe508','#fffac0',
	'#416326','#069543','#55d400',
	'#b2d233','#99ff55','#003380',
	'#006680','#0066ff','#80e5ff',
	'#d5e5ff','#22002b','#660080',
	'#5500d4','#ff2ad4','#ccaaff',
	'#000000','#333333','#808080',
	'#cccccc','#ffffff');

function forcePortraitMode(parameter, cambio){
	/*if(isAndroid){
		launchIntoFullscreen($('.virtualBody')[0]);
	}*/

	loader = $('.boxLoader');
	loader.show();

	cambio = cambio || false;
	angle = Math.abs(window.orientation);
	setTimeout(function(event){
		if(angle == 90 || angle == 180){
			forcePortraitMode(parameter, cambio);
		}else{
			if(activity.currentGender == activity.lastGender && !cambio){
				loader.hide();
				$(window).bind('touchmove', function(event){
					event.preventDefault();
					return false;
				});

				if(!detectDevices()){
					$('html, body').css({'overflow':'hidden'});
				}

			}else if(activity.currentGender != activity.lastGender && activity.lastGender != null && !cambio){
				$('#canvas-slide-container').empty();
				launchAS(parameter, true);
			}else{
				launchAS(parameter, true);
			}
			clearTimeout(forcePortraitMode);
		}
	},1000);
}

function initializeActivitySheets(path){
	jsonImages = $.getJSON(path, function(){
	});

	jsonImages.complete(function(data){
		images = JSON.parse(data.responseText);
		forcePortraitMode(images);
	});

	//Only this line is needed to init dynamically
	//forcePortraitMode(images);
}

function launchIntoFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function launchAS(parameter, cambio){
	$(window).bind('touchmove', function(event){
		return false;
	});

	if(!detectDevices()){
		/*$.fn.fullpage.moveTo('Home');
		$.fn.fullpage.setMouseWheelScrolling(false);*/
	}

	if(cambio){
		setDefaultOptions();
		imagenes = parameter;
    }
        
	nCanvas = getLenght(imagenes.images.drawings);
	pdf = imagenes.pdf;

  	preloader = new Preloader(imagenes.images);
	       
	imagenes = preloader.onLoad();
        
	preloader.onProgress = function(){
            loader.show();
	};

	preloader.onError = function(){
        triggerError(true);
	};

	preloader.onComplete = function(){
		initCanvas(nCanvas);
		(isMobile)? listenerForMobiles() : listenerForDesktop() ;
		
		if(!activity.wasOpened){
			generalListener();
			activity.wasOpened = true;
		}

		clearAllCanvas();
		setAllMask();
		activity.lastGender = activity.currentGender;
		loader.fadeOut(500);
	};
}

function setDefaultOptions(){
	$('.icon').each(function(i,e){
		myclass = $(e).data("class");
		$('.colorBox').empty();
		$(e).removeAttr('style');
		$('.canDisabled').removeAttr('disabled');
		$(e).removeClass();
		$(e).addClass(myclass);
	});
	$('.prev, .next').removeAttr('disabled');
	$('.prev').attr('disabled','disabled');
	ID = 0;
	objectsCanvas = {};
}

function initCanvas(totalCanvas){
	if(detectDevices()){
		eventos = {
			clickOrTouch : 'touchstart',
			mouseLeaveOrtouchLeave : 'touchleave',
			mouseUpOrTouchEnd : 'touchend',
			mouseMoveOrTouchmove : 'touchmove'
		}
		isMobile = true;
	}else{
		eventos = {
			clickOrTouch : 'click',
			mouseLeaveOrtouchLeave : 'mouseleave',
			mouseUpOrTouchEnd : 'mouseup',
			mouseMoveOrTouchmove : 'mousemove',
			mousedown : 'mousedown'
		}
		isMobile = false;
		states.isLandscape = false;
	}

	$('html, body').css({'overflow':'hidden'});	
	heightCanvas = ( $(window).innerHeight() - ($('.sectionButtons').outerHeight() + $('.tools').outerHeight() + (parseInt($('.wrapperAS').css('border-top-width')) * 2) ));
	var width = ($(window).innerWidth() - (parseInt($('.wrapperAS').css('border-top-width')) * 2));
	width = (width > 768)? 768 : width ;
	$("#wrapCanvas").css({'height': heightCanvas +'px'});
	$('#canvas-slide-container').css({'width' : width ,'height': heightCanvas +'px'});

	createCanvas(totalCanvas, width, heightCanvas);
	createPalette(arrColor);

	// obtenemos el color;
	paleta = $(".colors");
	color = "#D91A5D";
	colorObj = hexToRGB(color);
	// obtenemos el tamaÃ±o
	slide = $("#widthness");
	grosor = 10;

	saver = $("#saveAs");
	currentTool = "mark";
	lastTool = currentTool;

	// obtenemos el borrar
	cleaner = $("#clearAll");
	// crear canvas
}

/* TOOLS */

function hexToRGB(color) {
	var r,g,b;
	color = (color.charAt(0) == "#" )? color.substr(1) : color ;

	r = parseInt(color.substr(0,2),16);
	g = parseInt(color.substr(2,2),16);
	b = parseInt(color.substr(4,5),16);
	
	return {r : r, g : g, b: b, a : 255};
}

function isRightAlpha(alpha){
	if((alpha >= 1) && (alpha <= 254)){
		return false
	}else{
		return true;
	}
}

function floodfill(x,y,fillcolor,ctx, ctxToColor,width,height,tolerance) {

	// We need to verify if lastTime click or touch is less than one second ago 
	// is not we need to return to avoid overcharge this method.
	currentTime = new Date().getTime();
	x = ~~x;
	y = ~~y;
	if(lastTimeTouch != null && (currentTime - lastTimeTouch) < 500){
		return;
	}

	var img = ctx.getImageData(0,0,width,height);
	var imgToColor = ctxToColor.getImageData(0,0,width,height);
	var data = img.data;
	var dataToColor = imgToColor.data;
	var length = data.length;
	var Q = [];
	var i = (x+y*width)*4;
	var e = i, w = i, me, mw, w2 = width*4;
	var targetcolor = [data[i],data[i+1],data[i+2],data[i+3]];
	var targettotal = data[i]+data[i+1]+data[i+2]+data[i+3];

	// if alpha is between 1 and 254 just return
	if(!isRightAlpha(targetcolor[3])) return false;
	// if target color is black, just return and if total color is greather than 255
	if(targettotal >= 255){return false;}
	// if target color is white, just return
	if(targetcolor[0] === 255 && targetcolor[1] === 255 && targetcolor[2] === 255 && targetcolor[3] === 255) return false;

	if(!pixelCompare(i,targetcolor,targettotal,fillcolor,data,length,tolerance)){ return false;}

	Q.push(i);
	while(Q.length) {
		i = Q.pop();
		if(pixelCompareAndSet(i,targetcolor,targettotal,fillcolor,data, dataToColor,length,tolerance)) {
			e = i;
			w = i;
			mw = parseInt(i/w2)*w2; //left bound
			me = mw+w2;	//right bound			

			while(mw<(w-=4) && pixelCompareAndSet(w,targetcolor,targettotal,fillcolor,data, dataToColor, length,tolerance)); //go left until edge hit
			while(me>(e+=4) && pixelCompareAndSet(e,targetcolor,targettotal,fillcolor,data, dataToColor, length,tolerance)); //go right until edge hit
			for(var j=w;j<e;j+=4) {
				if(j-w2>=0 		&& pixelCompare(j-w2,targetcolor,targettotal,fillcolor,data,length,tolerance)) Q.push(j-w2); //queue y-1
				if(j+w2<length	&& pixelCompare(j+w2,targetcolor,targettotal,fillcolor,data,length,tolerance)) Q.push(j+w2); //queue y+1
			} 			
		}
	}

	ctxToColor.putImageData(imgToColor, 0, 0);
}

function pixelCompare(i,targetcolor,targettotal,fillcolor,data,length,tolerance) {	
	if (i<=0||i>=length) return false; //out of bounds
	if (data[i+3]===0)  return true;  //surface is invisible

	if (
		(targetcolor[3] === fillcolor.a) && 
		(targetcolor[0] === fillcolor.r) && 
		(targetcolor[1] === fillcolor.g) && 
		(targetcolor[2] === fillcolor.b)
	) return false; //target is same as fill
	
	if (	
		(targetcolor[3] === data[i+3]) &&
		(targetcolor[0] === data[i]  ) && 
		(targetcolor[1] === data[i+1]) &&
		(targetcolor[2] === data[i+2])
	) return true; //target matches surface 

	if (
		Math.abs(targetcolor[3] - data[i+3])<=(255-tolerance) &&
		Math.abs(targetcolor[0] - data[i])<=tolerance && 
		Math.abs(targetcolor[1] - data[i+1])<=tolerance &&
		Math.abs(targetcolor[2] - data[i+2])<=tolerance
	) return true; //target to surface within tolerance 
	
	return false; //no match
}

function pixelCompareAndSet(i,targetcolor,targettotal,fillcolor,data, dataToColor,length,tolerance) {
	if(pixelCompare(i,targetcolor,targettotal,fillcolor,data,length,tolerance)) {
		//update main layer values
		data[i] = fillcolor.r;
		data[i+1] = fillcolor.g;
		data[i+2] = fillcolor.b;
		data[i+3] = fillcolor.a;
		//update second layer values and show
		dataToColor[i] = fillcolor.r;
		dataToColor[i+1] = fillcolor.g;
		dataToColor[i+2] = fillcolor.b;
		dataToColor[i+3] = fillcolor.a;
		return true;
	}
	return false;
}

function processTools(currentTool){
	switch(currentTool){
		case "brush":
			var dist = distanceBetween(lastPoint, currentPoint);
			var angle = angleBetween(lastPoint, currentPoint);
			x = lastPoint.x + (Math.sin(angle) * 5);
			y = lastPoint.y + (Math.cos(angle) * 2);
			x2 = currentPoint.x + (Math.sin(angle) * 2);
			y2 = currentPoint.y + (Math.cos(angle) * 5);
			objectsCanvas[ID].ctxColor.save();
			objectsCanvas[ID].ctxColor.strokeStyle = color;
			objectsCanvas[ID].ctxColor.lineJoin = objectsCanvas[ID].ctxColor.lineCap = 'round';
			objectsCanvas[ID].ctxColor.lineWidth = grosor;
			objectsCanvas[ID].ctxColor.shadowColor = color;
			objectsCanvas[ID].ctxColor.shadowOffsetX = 4;
	        objectsCanvas[ID].ctxColor.shadowOffsetY = 8;
	        objectsCanvas[ID].ctxColor.shadowBlur    = Math.floor(Math.random() * 20) - 10;
		    objectsCanvas[ID].ctxColor.beginPath();
		    objectsCanvas[ID].ctxColor.globalAlpha = 0.9;
		    objectsCanvas[ID].ctxColor.moveTo(x, y);
		  	objectsCanvas[ID].ctxColor.lineTo(x2, y2);
		    objectsCanvas[ID].ctxColor.closePath();
		    objectsCanvas[ID].ctxColor.stroke();
			objectsCanvas[ID].ctxColor.restore();
		break;

		case "crayon":
		    // first draw the color and then the pattern.
		    objectsCanvas[ID].ctxColor.strokeStyle = color;
			objectsCanvas[ID].ctxColor.lineJoin = objectsCanvas[ID].ctxColor.lineCap = 'round';
			objectsCanvas[ID].ctxColor.lineWidth = grosor;
		    objectsCanvas[ID].ctxColor.beginPath();
		    objectsCanvas[ID].ctxColor.moveTo(lastPoint.x, lastPoint.y);
		  	objectsCanvas[ID].ctxColor.lineTo(currentPoint.x, currentPoint.y);
		    objectsCanvas[ID].ctxColor.closePath();
		    objectsCanvas[ID].ctxColor.stroke();
		    // Now draw the pattern after draw color.
		    objectsCanvas[ID].ctxColor.globalAlpha = 0.5;
		    pat = objectsCanvas[ID].ctxColor.createPattern(imagenes.crayonTexture,"repeat");
		    objectsCanvas[ID].ctxColor.strokeStyle = pat;
		    objectsCanvas[ID].ctxColor.beginPath();
		    objectsCanvas[ID].ctxColor.moveTo(lastPoint.x, lastPoint.y);
		  	objectsCanvas[ID].ctxColor.lineTo(currentPoint.x, currentPoint.y);
		    objectsCanvas[ID].ctxColor.closePath();
		    objectsCanvas[ID].ctxColor.stroke();
		  	objectsCanvas[ID].ctxColor.globalAlpha = 1;
		break;

		case "mark":
			objectsCanvas[ID].ctxColor.strokeStyle = color;
			objectsCanvas[ID].ctxColor.lineJoin = objectsCanvas[ID].ctx.lineCap = 'round';
			objectsCanvas[ID].ctxColor.lineWidth = grosor;
			objectsCanvas[ID].ctxColor.beginPath();
			objectsCanvas[ID].ctxColor.moveTo(lastPoint.x, lastPoint.y);
		  	objectsCanvas[ID].ctxColor.lineTo(currentPoint.x, currentPoint.y);
			objectsCanvas[ID].ctxColor.closePath();
			objectsCanvas[ID].ctxColor.stroke();
		break;

		case "eraser":
			objectsCanvas[ID].ctxColor.strokeStyle = "#FFFFFF";
			objectsCanvas[ID].ctxColor.lineJoin = objectsCanvas[ID].ctxColor.lineCap = 'round';
			objectsCanvas[ID].ctxColor.lineWidth = eraserSize;
			objectsCanvas[ID].ctxColor.beginPath();
			objectsCanvas[ID].ctxColor.moveTo(lastPoint.x, lastPoint.y);
		  	objectsCanvas[ID].ctxColor.lineTo(currentPoint.x, currentPoint.y);
			objectsCanvas[ID].ctxColor.closePath();
			objectsCanvas[ID].ctxColor.stroke();
		break;

		default:
			
		break;

	}
}

/* TOOLS */

/* DRAW, PAINTERS */

function ScaleImage(srcwidth, srcheight, targetwidth, targetheight, fLetterBox) {

    var result = { width: 0, height: 0, fScaleToTargetWidth: true };

    if ((srcwidth <= 0) || (srcheight <= 0) || (targetwidth <= 0) || (targetheight <= 0)) {
        return result;
    }

    // scale to the target width
    var scaleX1 = targetwidth;
    var scaleY1 = (srcheight * targetwidth) / srcwidth;

    // scale to the target height
    var scaleX2 = (srcwidth * targetheight) / srcheight;
    var scaleY2 = targetheight;

    // now figure out which one we should use
    var fScaleOnWidth = (scaleX2 > targetwidth);
    if (fScaleOnWidth) {
        fScaleOnWidth = fLetterBox;
    }
    else {
       fScaleOnWidth = !fLetterBox;
    }

    if (fScaleOnWidth) {
        result.width = Math.floor(scaleX1);
        result.height = Math.floor(scaleY1);
        result.fScaleToTargetWidth = true;
    }
    else {
        result.width = Math.floor(scaleX2);
        result.height = Math.floor(scaleY2);
        result.fScaleToTargetWidth = false;
    }
    result.targetleft = Math.floor((targetwidth - result.width) / 2);
    result.targettop = Math.floor((targetheight - result.height) / 2);

    return result;
}

function setAllMask(){
    var size = ScaleImage(imagenes["drawing0"].width, imagenes["drawing0"].height, objectsCanvas[ID].canvas[0].width, objectsCanvas[ID].canvas[0].height, true);

	for(element in objectsCanvas){
		objectsCanvas[element].ctx.drawImage(imagenes["drawing"+element], size.targetleft, size.targettop, size.width, size.height);
		objectsCanvas[element].ctxPrint.drawImage(imagenes["drawing"+element], 0, 0, 768, 1024);
		buildBoundaries(objectsCanvas[element]);
	}
}

function buildBoundaries(elementCanvas){
	elementCanvas.ctx.save();
	elementCanvas.ctx.strokeStyle = "#000";
	elementCanvas.ctx.beginPath();
		// Left boundary
		elementCanvas.ctx.moveTo(0, 0);
		elementCanvas.ctx.lineTo(0, elementCanvas.canvas.height());
		// right boundary
		elementCanvas.ctx.moveTo(elementCanvas.canvas.width(), 0);
		elementCanvas.ctx.lineTo(elementCanvas.canvas.width(), elementCanvas.canvas.height());
	elementCanvas.ctx.closePath();
	elementCanvas.ctx.stroke();
	elementCanvas.ctx.restore();
}

function refreshCtx(){
	objectsCanvas[ID].ctxColor.clearRect(0, 0, objectsCanvas[ID].canvas.width(), objectsCanvas[ID].canvas.height());

	dataToColorear = objectsCanvas[ID].ctxColor.getImageData(0, 0, objectsCanvas[ID].canvasColor[0].width, objectsCanvas[ID].canvasColor[0].height);
}

function redraw(){
	processTools(currentTool);
}

function clearAllCanvas(){
	for(var j in objectsCanvas){
		objectsCanvas[j].ctx.clearRect(0, 0, objectsCanvas[j].canvas.width(), objectsCanvas[j].canvas.height());
		objectsCanvas[j].ctxColor.clearRect(0, 0, objectsCanvas[j].canvasColor.width(), objectsCanvas[j].canvasColor.height());
	}
}

function clearThis(){
	objectsCanvas[ID].ctxColor.clearRect(0, 0, objectsCanvas[ID].canvasColor.width(), objectsCanvas[ID].canvasColor.height());
}

/* DRAW, PAINTERS */

/* GET OPTIONS , SLIDERS , MENUS */

function isAndroid() { 
	if( navigator.userAgent.match(/Android/i)){
		return true;
	}
	else {
		return false;
	}
}

function detectDevices() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
 	if(navigator.userAgent.match(/iPad/i)){
 		specialCase = true;
 	}
    return true;
  }
 else {
    return false;
  }
}

function getLenght(object){
	var counter = 0;
	for(var img in object){
		counter++;
	}

	return counter;
}

function lunchConfirm(){
	refreshCtx();
	getEmptyStack();
}

function checkMenus(element){
	element = element || null;

	if(currentTool == "bucket"){
		if(!$('.canDisabled').attr('disabled')){
			$('.canDisabled').attr('disabled','disabled');
		}
	}else{
		if($('.canDisabled').attr('disabled')){
			$('.canDisabled').removeAttr('disabled');
		}
	}

	if(element){
		$(element).parentsUntil('.row').find('.tool').each(function(i, e){
			$(e).removeClass('slide');
		});
		$(element).first().find('.tool').addClass('slide');
	}else{
		$('.tool').removeClass('slide');
	}
}

function getSlide(index){
	removeListener();
	$('.sliderCanvas').removeClass('current');
	$('.sliderCanvas').eq(index).addClass('current');
}

function getOption(self){
	return $(self).parentsUntil('.list-option').find('.icon');
}

function setClassOption(option, selected){
	if(selected.indexOf("#") >= 0){
		option.removeClass();
		option.removeAttr("style");
		option.addClass('icon');
		option.addClass('sprites');
		option.addClass('selected-color');
		option.css('background-color',selected);
		if(currentTool == 'eraser'){
			currentTool = lastTool;
		}
	}else{
		option.removeClass();
		$('.icon').removeClass('selected-tool');
		option.addClass('selected-tool');
		option.addClass('icon');
		option.addClass('sprites');
		option.addClass(selected);
	}
}

function distanceBetween(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

function angleBetween(point1, point2) {
  return Math.atan2( point2.x - point1.x, point2.y - point1.y );
}

/* GET OPTIONS , SLIDERS , MENUS */

/* BUILDERS */

function createCanvas(total, width, height){
	// We empty the container
	for(var i = 0; i < total; i++){
		// We create ID Canvas;
		id = i;

		// then we create the sliderCanvas that contains canvas objects
		sliderCanvas = $('<div>');
		sliderCanvas.addClass('sliderCanvas');
		sliderCanvas.css({'width':width, 'height': height})
		if(i == 0){
			sliderCanvas.addClass('current');
		}
		// Now we create the canvas, one for draw and other to color
		canvas = $('<canvas>');
		canvasColor = $('<canvas>');
		canvasPrint = $('<canvas>');
		// we assign attrs to canvas objects
		canvas.attr('class',id);
		canvas.attr('width', width);
		canvas.attr('height', height);
		canvas.css('z-index','2');

		canvasColor.attr('class',id+"color");
		canvasColor.attr('width', width);
		canvasColor.attr('height', height);
		canvasColor.css('z-index','1');

		// canvas only for print mode

		canvasPrint.attr('class',id+"print");
		canvasPrint.attr('width', 768);
		canvasPrint.attr('height', 1024);
		canvasPrint.css('display','none');

		// we get the context of canvas
		canvas[0].getContext('2d');

		// We assign canvas on container
		sliderCanvas.append(canvas);
		sliderCanvas.append(canvasColor);
		sliderCanvas.append(canvasPrint);
		$('#canvas-slide-container').append(sliderCanvas);

		objectsCanvas[id] = {
			'canvas' : canvas,
			'canvasColor' : canvasColor,
			'canvasPrint' : canvasPrint,
			'ctx' : canvas[0].getContext('2d'),
			'ctxColor' : canvasColor[0].getContext('2d'),
			'ctxPrint' : canvasPrint[0].getContext('2d'),
			'pdf' : pdf[id]
		}

		// we create the stack of each element canvas

		stack[i] = new Array();
	}
	return objectsCanvas;
}

function buildPager(elements){
	var ul = $("#list-page");
	var counter = 0;
	for(id in elements){
		var li = $('<li>');
		var span = $('<span>');
		li.addClass('bullet');
		li.attr('data-id',id);
		li.attr('data-slide',counter);
		span.text(counter);
		if(counter == 0) li.addClass('selected');
		li.append(span);
		ul.append(li);
		counter++;
	}
}

function createPalette(colors){
	box = $('.boxColors');
	wrap = $('.colorBox');
	
	circleDimentions = (isMobile && !specialCase)? 25 : 50;
	
	if(isMobile){
		wrap.css('width',((circleDimentions) * 5) + (10 + 40));
	}else{
		wrap.css('width',((circleDimentions) * 5) + (10 + 40));
	}

	for(var i = 0, m = 0, l = 97; i < colors.length; i++){
		circle = $('<div>');
		circle.addClass('color');
		rgb = colors[i];
		if(m == 5 || i == 0){
			m = 0;
			id = String.fromCharCode(l++)+i;
			row = $('<div>');
			row.attr('id',id);
			row.addClass('clearfix');
			row.css('display','inline-block');
			row.append(circle);
		}else{
			row.append(circle);
		}

		if(m == 4){
			circle.css({'width':circleDimentions, 'height':circleDimentions, 'background' : rgb, 'margin-right':'0px'});
		}else{
			circle.css({'width':circleDimentions, 'height':circleDimentions, 'background' : rgb, 'margin-right':'10px'});
		}

		circle.attr('data-color',rgb);		

		wrap.append(row);
		m++;
	}
}

/* BUILDERS */

/* STACKS FOR UNDONE */

function setStack(limit){
	limit = limit || 20;
	var c = $('<canvas>');
	var ctx = c[0].getContext('2d');
	c[0].width = objectsCanvas[ID].canvasColor[0].width;
	c[0].height = objectsCanvas[ID].canvasColor[0].height;
	ctx.drawImage(objectsCanvas[ID].canvasColor[0], 0, 0);
	stack[ID].push(c[0]);

	if(stack[ID].length > limit){
		stack[ID].splice(0,1);
	}
}

function getLastAction(){
	if(stack[ID].length <= 0){
		return;
	}

	clearThis();
	objectsCanvas[ID].ctxColor.drawImage(stack[ID][stack[ID].length - 1], 0, 0);
	stack[ID].pop();

	dataToColorear = objectsCanvas[ID].ctxColor.getImageData(0, 0, objectsCanvas[ID].canvasColor[0].width, objectsCanvas[ID].canvasColor[0].height);
}

function getEmptyStack(){
	var limit = stack[ID].length;
	if(limit > 0){
		stack[ID].splice(0, limit);
	}else{
		return;
	}
}

/* STACKS FOR UNDONE */

/* LISTENERS */

function listenerForDesktop(){
	objectsCanvas[ID].canvas.bind(eventos.mousedown,function(event){
		checkMenus();

		if(event.pageX || event.pageY){
			coorLeft = event.pageX;
			coorTop = event.pageY;
		}else{
			coorLeft = event.clientX;
			coorTop = event.clientY;
		}

		lastPoint = { x: (coorLeft - $(this).offset().left) , y: (coorTop - $(this).offset().top) };
		setStack();

		if(currentTool == 'bucket'){
			ctx = objectsCanvas[ID].ctx;
			ctxColor = objectsCanvas[ID].ctxColor;
			width = objectsCanvas[ID].canvas.width();
			height = objectsCanvas[ID].canvas.height();

			floodfill(lastPoint.x, lastPoint.y, colorObj , ctx, ctxColor, width, height, 180);
		}else{
			states.clicked = true;
		}

	});

	objectsCanvas[ID].canvas.bind(eventos.mouseUpOrTouchEnd,function(event){

		if(event.pageX || event.pageY){
			coorLeft = event.pageX;
			coorTop = event.pageY;
		}else{
			coorLeft = event.clientX;
			coorTop = event.clientY;
		}

		states.clicked = false;
		lastTimeTouch = event.timeStamp;

		lastPoint = { x: (coorLeft - $(this).offset().left) , y: (coorTop - $(this).offset().top) };
		if(currentTool == "eraser"){
			dataToColorear = objectsCanvas[ID].ctxColor.getImageData(0, 0, objectsCanvas[ID].canvasColor.width(), objectsCanvas[ID].canvasColor.height());
		}
	});

	objectsCanvas[ID].canvas.bind(eventos.mouseLeaveOrtouchLeave,function(event){

		if(event.pageX || event.pageY){
			coorLeft = event.pageX;
			coorTop = event.pageY;
		}else{
			coorLeft = event.clientX;
			coorTop = event.clientY;
		}

		states.clicked = false;
		lastPoint = { x: (coorLeft - $(this).offset().left) , y: (coorTop - $(this).offset().top) };
	});

	objectsCanvas[ID].canvas.bind(eventos.mouseMoveOrTouchmove, function(event){

		if(event.pageX || event.pageY){
			coorLeft = event.pageX;
			coorTop = event.pageY;
		}else{
			coorLeft = event.clientX;
			coorTop = event.clientY;
		}

		if(states.clicked){

			currentPoint = { x: (coorLeft - $(this).offset().left) , y: (coorTop - $(this).offset().top) };

		  	redraw();

		  	lastPoint = { x: (coorLeft - $(this).offset().left) , y: (coorTop - $(this).offset().top) };
		}
	});

	$("body").on(eventos.clickOrTouch,".rounded",function(){
	  checkMenus();
	});
}

function removeListener(){
	objectsCanvas[ID].canvas.unbind(eventos.clickOrTouch);
	objectsCanvas[ID].canvas.unbind(eventos.mouseUpOrTouchEnd);
	objectsCanvas[ID].canvas.unbind(eventos.mouseLeaveOrtouchLeave);
	objectsCanvas[ID].canvas.unbind(eventos.mouseMoveOrTouchmove);
};

function listenerForMobiles(){
	objectsCanvas[ID].canvas.bind(eventos.clickOrTouch,function(event){
		event.preventDefault();
		event = event.originalEvent;
		checkMenus();
		lastPoint = { x: (event.touches[0].pageX - objectsCanvas[ID].canvas.offset().left) , y: (event.touches[0].pageY - objectsCanvas[ID].canvas.offset().top) };
		setStack();

		if(currentTool == 'bucket'){
			ctx = objectsCanvas[ID].ctx;
			ctxColor = objectsCanvas[ID].ctxColor;
			width = objectsCanvas[ID].canvas.width();
			height = objectsCanvas[ID].canvas.height();
			floodfill(lastPoint.x, lastPoint.y, colorObj , ctx, ctxColor, width, height, 200);
		}else{
			states.clicked = true;
		}

	});

	objectsCanvas[ID].canvas.bind(eventos.mouseUpOrTouchEnd,function(event){
		event.preventDefault();
		event = event.originalEvent;
		lastTimeTouch = event.timeStamp;
		states.clicked = false;

		/*lastPoint = { x: (event.touches[0].pageX - objectsCanvas[ID].canvas.offset().left) , y: (event.touches[0].pageY - objectsCanvas[ID].canvas.offset().top) };*/

		if(currentTool == "eraser"){
			dataToColorear = objectsCanvas[ID].ctxColor.getImageData(0, 0, objectsCanvas[ID].canvasColor[0].width, objectsCanvas[ID].canvasColor[0].height);
		}
	});
	
	objectsCanvas[ID].canvas.bind(eventos.mouseLeaveOrtouchLeave,function(event){
		event.preventDefault();
		event = event.originalEvent;
		states.clicked = false;
		lastPoint = { x: (event.targetTouches[0].pageX - objectsCanvas[ID].canvas.offset().left) , y: (event.targetTouches[0].pageY - objectsCanvas[ID].canvas.offset().top) };
	});

	objectsCanvas[ID].canvas.bind(eventos.mouseMoveOrTouchmove, function(event){
		event.preventDefault();
		event = event.originalEvent;
		if(states.clicked){
			currentPoint = { x: (event.targetTouches[0].pageX - objectsCanvas[ID].canvas.offset().left) , y: (event.targetTouches[0].pageY - objectsCanvas[ID].canvas.offset().top) };

		  	redraw();

		  	lastPoint = { x: (event.targetTouches[0].pageX - objectsCanvas[ID].canvas.offset().left) , y: (event.targetTouches[0].pageY - objectsCanvas[ID].canvas.offset().top) };
		}
	});
}



function generalListener(){
	$("body").on(eventos.clickOrTouch,".rounded",function(){
	  checkMenus();
	});

	$(".list-option").on(eventos.clickOrTouch,"span.rounded, div.color",function(e){
		data = $(this).data();
		if(data.color){
			color = data.color;
	  		data.class = color;
	  		colorObj = hexToRGB(color);
		}else if(data.pencil){
			currentTool = data.pencil;
			lastTool = currentTool;
		}else if(data.size){
			currentTool = 'eraser';
			eraserSize = data.size;
		}else if(data.linewidth){
			grosor = data.linewidth;
		}
	  	setClassOption(getOption(this), data.class);
	});

	$(".list-option").on(eventos.clickOrTouch,"div.color",function(e){
	  	$(this).parentsUntil('.row').find('.tool').removeClass('slide');
	});

	$(".list-option").on(eventos.clickOrTouch,".undone",function(e){
		getLastAction();
	});

	$('.new').on(eventos.clickOrTouch, function(){
		new customConfirm('Are you sure you want to <b>start over</b> ?', eventos, lunchConfirm);
	});

	$('.as-item').on(eventos.clickOrTouch,function(){
		if($(this).parent().parent().attr('disabled')) return;
		checkMenus(this);
	});

	cleaner.on(eventos.clickOrTouch, function(){
	  clearAll();
	});

	$('.closed').on(eventos.clickOrTouch, function(event){
		event.preventDefault();
		$('.virtualBody').removeClass().addClass('virtualBody');
		$('body, html').css('overflow','visible');
		activity.lastPosition = $('#Create-section').offset().top;
		$(window).scrollTop(activity.lastPosition);
		$(window).unbind('touchmove');

		if(!detectDevices()){
			$.fn.fullpage.setMouseWheelScrolling(true);
		}
		//$.fn.fullpage.moveTo(currentSection);
		//$('.menu-top').attr('id','menu');
	});

	saver.on(eventos.clickOrTouch, function(event){
	  	newCanvas = $("<canvas>");
	  	$('body').append(newCanvas);
	  	newCanvas.attr('width', objectsCanvas[ID].canvas.width());
	  	newCanvas.attr('height', objectsCanvas[ID].canvas.height());
	  	newCanvas.css({'z-index':'100'});
	  	ctxTemp = newCanvas[0].getContext("2d");
	  	
	  	ctxTemp.save();
	  	ctxTemp.fillStyle = "white";
	  	ctxTemp.fillRect(0, 0, objectsCanvas[ID].canvas.width(), objectsCanvas[ID].canvas.height());
	  	ctxTemp.strokeStyle = "black";
	  	ctxTemp.strokeRect(0, 0, objectsCanvas[ID].canvas.width(), objectsCanvas[ID].canvas.height());
	  	ctxTemp.restore();

	  	ctxTemp.clearRect(0, 0, newCanvas.width, newCanvas.height);
	  	ctxTemp.drawImage(objectsCanvas[ID].canvasColor[0], 0,0);
	  	ctxTemp.drawImage(objectsCanvas[ID].canvas[0], 0,0);

	  	var dataPDF = newCanvas[0].toDataURL('image/jpeg', 1).slice('data:image/jpeg;base64,'.length);
		// Convert the data to binary form
		dataPDF = atob(dataPDF);


		var padding = 10;
		var doc = new jsPDF();
		var pageWidth = Math.floor(doc.internal.pageSize.width) - (padding * 2);
		var pageHeight = Math.floor(doc.internal.pageSize.height) - (padding * 2) - 80;
		var name = new Date();
		//var texto = 'Title of page';
		name = name.getDate() +"_"+ (name.getMonth() + 1) +"_"+ name.getFullYear() + "_happyMeal_"+name.getTime();

		//doc.setTextColor(250,0,0);
		//doc.text(centerText, 10, texto);
		doc.addImage(dataPDF, 'JPEG', padding, padding * 2, pageWidth, pageHeight);
		newCanvas.remove();
		doc.save(name+'.pdf');
	});

	$('#print').on(eventos.clickOrTouch, function(){
		BrowserDetect.init();
		
		//base = $('base').attr('href');
		base = "/happymeal/US_109_HKMJ-DEV/";

		var domain = location.protocol + "//" + location.host+base + objectsCanvas[ID].pdf;

		if(BrowserDetect.browser != 'Explorer' && BrowserDetect.browser != 'Firefox'){
			console.log("different");
			var ifr = $('<iframe/>', {
	            id:'printAS'+Date.now(),
	            src: domain,
	            style:'display:none',
	            load:function(){
	                var PDF = document.getElementById($(this).attr('id'));
				    PDF.focus();
				    PDF.contentWindow.print();
	            }
	        });

	        $('#framesPrint').html(ifr);
		}else{
			var link = $('<a/>', {
	            id:'printAS'+Date.now(),
	            href: domain,
	            target : '_blank',
	            style:'display:none',
	        });

	        link.text('pdf');
	        $('#framesPrint').html(link);

	        link[0].click();
		}

	});

	$('.pagers').on(eventos.clickOrTouch, function(){
		if($(this).attr('disabled')) return;
		limit = getLenght(objectsCanvas) - 1;
		dir = $(this).data('dir');

		switch(dir){
			case 'prev':
				ID--;
			break;

			case 'next':
				ID++;
			break;
		}

		if(ID == 0){
			$('.list-pagination span').removeAttr('disabled');
			$('.prev').attr('disabled', 'disabled');
		}else if(ID == limit){
			$('.list-pagination span').removeAttr('disabled');
			$('.next').attr('disabled', 'disabled');
		}else{
			$('.list-pagination span').removeAttr('disabled');
		}

		getSlide(ID);

		(isMobile || specialCase)? listenerForMobiles() : listenerForDesktop() ;
	});
}

function triggerError(sendMsg, msg){
	counterError++;
	sendMsg = sendMsg || false;
	msg = msg || 'Error : Something is wrong, please try again.';

	activity.currentGender = null;
	activity.lastGender = null;

	if(sendMsg){
		if(counterError <= 1){
			//alert(msg);
			$('.closed').trigger('click');
		}
	}
}

var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "Other";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
    },
    searchString: function (data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) !== -1) {
                return data[i].identity;
            }
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index === -1) {
            return;
        }

        var rv = dataString.indexOf("rv:");
        if (this.versionSearchString === "Trident" && rv !== -1) {
            return parseFloat(dataString.substring(rv + 3));
        } else {
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        }
    },

    dataBrowser: [
        {string: navigator.userAgent, subString: "Chrome", identity: "Chrome"},
        {string: navigator.userAgent, subString: "MSIE", identity: "Explorer"},
        {string: navigator.userAgent, subString: "Trident", identity: "Explorer"},
        {string: navigator.userAgent, subString: "Firefox", identity: "Firefox"},
        {string: navigator.userAgent, subString: "Safari", identity: "Safari"},
        {string: navigator.userAgent, subString: "Opera", identity: "Opera"}
    ]
};