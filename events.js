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


function getNormalizedDisplayCoordinates(event, info)
{
	var rect = new Rectangle(0, 0, info["caller"].width, info["caller"].height);
	var p = new Point(event.pageX - CANVAS_OFFSET[0], event.pageY - CANVAS_OFFSET[1]);
	if (rect.containsPoint(p))
		info["coords"] = p;
}


// Wrapper to construct callback for event 'onmouseover'
function getTileFromDisplayCoordinates(renderer)
{
	var board = renderer.board;
	var window = renderer.parent;
	return function(event, info)
	{
		var p = info["coords"];
		if (p)
		{
			var boundingBox = window.getBoundingBox()
			var boardArea = renderer.getBoardArea();
			var pp = new Point(p.x - boundingBox.x, p.y - boundingBox.y);	
			if (boardArea.containsPoint(pp))
			{
				pp.x -= boardArea.x;
				pp.y -= boardArea.y;
				var boardCoords = mapd2b(renderer, pp.x, pp.y);
				if (boardCoords)
					info["currentTile"] = board.tiles[boardCoords[1]][boardCoords[0]];
			}
		}
	}
}