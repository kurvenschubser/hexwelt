"use strict";

function Board(tiles)
{
	this.tiles = [];
	this.movables = [];
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
}

Board.prototype.setGroupOnLayer = function(layername, group)
{
	// add groups of whatever on a layer
	this.layers.getItem(layername).setGroup(group);
}

Board.prototype.getSelected = function()
{
	return this.selected;
}

Board.prototype.setSelected = function(tile)
{
	this.selectionEvent.fire({"target": this, "tile": tile});
	this.selected = tile;
	var layer = this.layers.getItem("selection");
	layer.clear();
	layer.push(tile);
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
	tile.x = col;
	tile.y = row;
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


function Movable(name)
{
	this.name = name;
	this.selected = false;
}

Movable.prototype.setTile = function(tile)
{
	if (!(tile instanceof Tile))
		throw new Error("TypeError: need instance of 'Tile', got '" + (typeof tile) + "'.");
	this.tile = tile;
}

Movable.prototype.getTile = function()
{
	if (!(this.tile))
		throw new Error("AttributeError: tile.");
	return this.tile;
}


function Tile(coord, attrs)
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
