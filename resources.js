
function Resource(ownerTypeName, name, typeName, uris, duration)
{
	this.ownerTypeName = ownerTypeName;
	this.name = name,
	this.typeName = typeName,
	this.uris = uris;
	this.duration = duration;		// millisecs
	this._frames = null;				// internal, do not set in usercode
}

Resource.prototype.toString = function()
{
	return "<Resource(" + this.ownerTypeName + ", " + 
					this.name + ", " + this.typeName + ")>";
}

Resource.prototype.getCurrentFrame = function(ms)
{	
	return this._frames[Math.min(trueDiv(ms % this.duration, this.frameDuration), 
													this._frames.length - 1)];
}

Resource.prototype.getFrames = function()
{
	return this._frames;
}

Resource.prototype.setFrames = function(frames)
{
	this._frames = frames;
	this.frameDuration = trueDiv(this.duration, this._frames.length)
}

function ResourceLoader()
{
	this.cache = {};
	this.finishedLoadingEvent = new Event("finishedLoadingEvent");
	this._unfinished = 0;		// internal, do not set in usercode
}

ResourceLoader.prototype.typeMap = {"img": ImageProcessor};

ResourceLoader.prototype.load = function(resource)
{
	if (!(resource in this.cache))
	{
		var processor = this.getProcessorForResourceType(resource.typeName);
		var processed = processor.process(resource);	
		this.cache[resource] = processed;
		resource.setFrames(processed);
	}
	return resource;
}

ResourceLoader.prototype.getProcessorForResourceType = function(typeName)
{
	return new this.typeMap[typeName](this);
}


function ImageProcessor(principal)
{
	this.principal = principal;
}

ImageProcessor.prototype.process = function(resource)
{
	var imgs = [];
	for (var i = 0; i < resource.uris.length; i++)
	{
		var img = new Image();

		img.onload = (function(self)
			{
				return function() 
				{
					self._unfinished--;
					if (self._unfinished < 1)
						self.finishedLoadingEvent.fire({"target": self, "resource": resource});
				}
			})(this.principal)
		this.principal._unfinished++;
		imgs.push(img);
	}

	for (var i = 0; i < resource.uris.length; i++)
		imgs[i].src = resource.uris[i];
	return imgs;
}
