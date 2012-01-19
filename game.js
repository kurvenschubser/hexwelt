"use strict";


function Action(type, start, end)
{
	this.type = type;
	this.start = start;
	this.end = end;
	this.completed = 0.0;
}

Action.prototype.__defineGetter__(
	"length",
	function()
	{
		return this.end - this.start;
	}
);


function Board(tiles)
{
	this.movables = [];
	this.selection = null;
	this._cursor = null;

	this.tiles = [];
	var tmptiles = tiles || [];
	for (var row in (tmptiles))
	{
		for (var col in tmptiles[row])
		{
			this.setTile(tmptiles[row][col], row, col);
		}
	}
	this._updateDimensions();
	this.layers = new OrderedDict([
		["background", new Layer("background", BackgroundRenderer)],
		["highlight", new Layer("highlight", HighlightRenderer)],
		["selection", new Layer("selection", HighlightRenderer)],
		["pathfinder", new Layer("pathfinder", HighlightRenderer)],
		["grid", new Layer("grid", GridRenderer)]
	]);
	
	// Events
	this.selectionEvent = new Event("selectionEvent");
	this.cursorChangedEvent = new Event("cursorChanged");
}

Board.prototype.__defineGetter__(
	"cursor", 
	function()
	{
		return this._cursor;
	}
);

Board.prototype.__defineSetter__(
	"cursor",
	function(tile)
	{
		if (this._cursor !== tile)
		{
			this.cursorChangedEvent.fire(
				{"target": this, "oldCursor": this._cursor, "newCursor": tile}
			);
			this._cursor = tile;
		}
	}
);

Board.prototype.findPathForMovable = function(movable, endNode)
{
	return (new AStar(this.tiles, movable)).find(movable.getTile(), endNode);
}

Board.prototype.setGroupOnLayer = function(layername, group)
{
	// add groups of whatever on a layer
	this.layers.getItem(layername).setGroup(group);
}

Board.prototype.getMovables = function()
{
	return this.movables;
}

Board.prototype.setMovables = function(movables)
{
	this.movables = [];
	for (var i in movables)
	{
		var m = movables[i];
		this.getMovables().push(m);
		m.pathRequestEvent.connect(
			(function(board)
			{
				return function(event, info)
				{
					m.waypoints = board.findPathForMovable(m, event.endNode);
				}
			})(this)
		)
		m.updateEvent.connect(
			(function(board)
			{
				return function(event, info)
				{
					board.updateEvent.fire({"target": board});
				}
			})(this)
		)
	}
}

Board.prototype.getSelectedMovable = function()
{
	for (var i in this.movables)
	{
		if (this.movables[i].selected)
			return this.movables[i];
	}
}

Board.prototype.getSelection = function()
{
	return this.selection;
}

Board.prototype.setSelection = function(tile)
{
	var layer = this.layers.getItem("selection");
	layer.clear();
	var old = this.selection;
	this.selection = tile;
	this.selectionEvent.fire({"target": this, "newSelection": tile, "oldSelection": old});

	// A callback connected to *selectionEvent* might have altered 
	// *this.selection* when it was called through *selectionEvent* 
	// in the line above. So *this.selection* is not neccessarily *tile*.
	if (this.selection)
		layer.push(this.selection);
	this.updateEvent.fire({"target": this});
}

Board.prototype.setTile = function(tile, row, col)
{
	if (!(tile instanceof Tile))
		throw new Error("TypeError: need instance of 'Tile', got " + typeof tile);
	if (this.tiles[row] == undefined)
	{
		this.tiles[row] = [];
	}
	this.tiles[row][col] = tile;	
	tile.x = parseInt(col);
	tile.y = parseInt(row);
	this._updateDimensions();
}

Board.prototype.getTile = function(row, col)
{
	return this.tiles[row][col];
}

Board.prototype._updateDimensions = function()
{
	this.rows = this.tiles.length;
	this.cols = 0;
	for (var row in this.tiles)
	{
		if (this.tiles[row].length > this.cols)
		{
			this.cols = this.tiles[row].length;
		}
	}
}

Board.prototype.fromTileDefinitions = function(tiledefs)
{
	for (tiledef in tiledefs)
	{
		if (!this.tiles[tiledef.row][tiledef.col])
		{
			this.setTile(new Tile(tiledef), tiledef.row, tiledef.col);
		}
		else
		{
			throw Exception("Duplicate entry at board coordinates (" + tiledef.row + ", " + tiledef.col + ").");
		}
	}
	this._updateDimensions();
}

Board.prototype.highlightTiles = function(tiles)
{
	this.setGroupOnLayer("highlight", tiles);
}


function Layer(name, rendererClass)
{
	Layer.prototype.constructor.call(this);
	this.name = name;
	this.rendererClass = rendererClass;
}

Layer.prototype = new List();

Layer.prototype.getRenderer = function()
{
	if (!(this._renderer))
		this._renderer = new this.rendererClass(this);
	return this._renderer;
}

Layer.prototype.setGroup = function(group)
{
	this.clear();
	for (var i in group)
	{
		this.push(group[i]);
	}
}

Layer.prototype.toString = function()
{
	return "<Layer(" + List.prototype.toString.call(this) + ")>";
}


function Movable(name, resources)
{
	this.name = name;
	this.resources = resources;
	
	this.selected = false;

	// Base value for how many tiles per turn this instance can move
	this.speed = 1;

	// Used for moving the instance along a path
	this.waypoints = [];

	// Determines the progress moving along the waypoints
	this.currentWaypoint = null;
	
	this.movementPoints = this.speed;
	
	this.state = this.STATE.resting;
	
	this.actions = [];

	// events
	this.pathRequestEvent = new Event("pathRequestEvent");
	this.updateEvent = new Event("updateEvent");
	this.actionFinishedEvent = new Event(
		"actionFinishedEvent",
		[	
			function(event, info)
			{
				info.caller.actions.splice(info.caller.actions.indexOf(event.action), 1);
			}
		]
	);
}

Movable.prototype.STATE = {
	resting: 0,
	moving: 1, 
	attacking: 2, 
	defending: 3, 
	building: 4
};

Movable.prototype.move = function(tile)
{
	var curTile = this.getTile()
	if (curTile != tile)
		if (!(this.waypoints.length) || this.waypoints[this.waypoints.length - 1] !== tile)
			this.pathRequestEvent.fire({"target": this, 
							"startNode": curTile, "endNode": tile});

		console.assert (this.waypoints.length);

		this.currentWaypoint = curTile;
		this.setTile(tile);
		this.state = this.STATE.moving;
		
		var minFirstEnd = Math.min(this.movementPoints + 1, this.waypoints.length);
		var action = new Action(this.state, 0, minFirstEnd);
		this.actions.push(action);
		if (minFirstEnd < this.waypoints.length)
		{
			// slice the path
			for (var i = minFirstEnd;
					i < this.waypoints.length; 
					i+=this.speed)
			{
				var minLastEnd = Math.min(i + this.speed + 1, this.waypoints.length);
				var action = new Action(this.state, i, minLastEnd);
				this.actions.push(action)
				console.debug(this.actions[this.actions.length - 1]);
				
			}
		}

		if (this.actions.length < 2)		// trigger current action, if it is the only one.
		{
			var interval = 40;
			setInterval(
				(
					function(m, interval)
					{
						return function()
						{
							var action = m.actions[0];
							if (action.completed < 1.0)
							{
								action.completed += interval / (action.length * 1000);
								m.updateEvent.fire({"target": m});
							}
							else
							{
								m.actionFinishedEvent.fire({"target": m, "action": action});
							}
						}
					}
				)(this, interval),
				interval
			)
		}
}

Movable.prototype.setTile = function(tile)
{
	if (!(tile instanceof Tile))
		throw new Error("TypeError: need instance of 'Tile', got '" + (typeof tile) + "'.");
	// this.pathRequestEvent.fire({"target": this, "startNode": this.tile, "endNode": tile});
	this.tile = tile;
}

Movable.prototype.getTile = function()
{
	if (!(this.tile))
	{
		console.trace();
		throw new Error("AttributeError: tile on " + this);
	}
	return this.tile;
}

Movable.prototype.__defineGetter__(
	"resource",
	function()
	{
		if (!(this.state in this.resources))
			throw new KeyError("State '" + this.state + "' not in resources for " + this);
		return this.resources[this.state];
	}
);

Movable.prototype.toString = function()
{
	return "<Movable '" + this.name + "'>";
}


function Tile(attrs)
{
	this._attrs = attrs;
	this.x = null;		// Internal: never set this in user code.
	this.y = null;		// Internal: never set this in user code.
}

Tile.prototype.getAttr = function(name)
{
	return this._attrs[name];
}

Tile.prototype.setAttr = function(name, value)
{
	this._attrs[name] = value;
}

Tile.prototype.toString = function()
{
	return "<Tile(" + this.x + ", " + this.y + ")>";
}
