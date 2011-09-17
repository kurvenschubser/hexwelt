function ImagePreFetcher(sources)
{
	this.sources = sources;
	this.fetch();
}

ImagePreFetcher.prototype.fetch = function()
{
	var o = {};
	for (var i = 0; i < this.sources.length; i++)
	{
		var img = new Image();
		img.src = this.sources[i];
		var split = this.sources[i].rsplit("/", 1);
		o[split[1]] = img;
	}
	return o;
}

