function Preloader(images){
	self = this;
	this.imagesCollect = {};
	this.imagesLoaded = 0;
	this.counterImg = 0;
	this.totalImages = this.getImagesLength(images);
}

Preloader.prototype.getImagesLength = function(images){
	for(var n in images){
		if(typeof images[n] == 'object'){
			this.getImagesLength(images[n]);
		}else{
			this.imagesCollect[n] = images[n];
			this.counterImg++;
		}
	}
	return this.counterImg;
}

Preloader.prototype.onProgress = function(){
	var progress = Math.floor((this.imagesLoaded / this.totalImages) * 100);
	//console.log("progress : "+progress);
}

Preloader.prototype.onError = function(event){
	
}

Preloader.prototype.onComplete = function(){
	
}

Preloader.prototype.onLoad = function(){
	var imagesDone = {};
	for(var i in this.imagesCollect){
		imagesDone[i] = new Image();

		imagesDone[i].onerror = function(event){
			self.onError(event);
		}

		imagesDone[i].onload = function(){
			self.imagesLoaded++;
			if(self.imagesLoaded >= self.totalImages){
				self.onProgress();
				self.onComplete();
			}else{
				self.onProgress();
			}
		}
		imagesDone[i].src = this.imagesCollect[i];
	}
       
	return imagesDone;
}