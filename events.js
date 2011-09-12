// Event system javascript


function Event(name, callbacks, prepFunc, exitFunc)
{
	this.name = name;
	this.callbacks = callbacks;
	this.prepFunc = prepFunc;
	this.exitFunc = exitFunc;
}

Event.prototype.getCallable = function()
{
	if (!(this.callable))
	{
		var eventSystem = this;
		this.callable = function(event)
		{
			eventSystem.fire(event)
		}
	}
	return this.callable;
}

Event.prototype.connect = function(callback)
{
	this.callbacks.push(callback);
}

Event.prototype.fire = function(event)
{
	var info = {"caller": (event.target || event.srcElement)};
	if (this.prepFunc)
		this.prepFunc(event, info);
	for (var i in this.callbacks)
	{
		// keep going until a callback returns true 
		// (meaning no further event handling is needed)
		if (this.callbacks[i](event, info))
			break;
	}
	if (this.exitFunc)
		this.exitFunc(event, info);
}
