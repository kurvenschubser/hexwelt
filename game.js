"use strict";

var UNITY_HEXWIDTH = Math.sqrt(0.75);

function Board(tiles)
{
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
		["grid", new Layer("grid", GridRenderer)]
	]);
}

Board.prototype.addTilesToLayer = function(layername, tiles)
{
	// add tiles to layers
	var layer = this.layers.getItem(layername);
	for (var row in tiles)
	{
		for (var col in tiles[row])
		{
			layer.push(tiles[row][col]);
		}
	}
}

Board.prototype.setTile = function(tile, row, col)
{
	if (!(tile instanceof Tile))
		throw new Exception("TypeError: need instance of 'Tile', got " + typeof tile);

	console.log("game.js::Board.prototype.setTile 1> tile instanceof Tile = " + (tile instanceof Tile));
	
	if (this.tiles[row] == undefined)
	{
		this.tiles[row] = [];
	}
	this.tiles[row][col] = tile;

	console.log("game.js::Board.prototype.setTile 2> tile instanceof Tile = " + (tile instanceof Tile));
	console.log("game.js::Board.prototype.setTile> this.tiles[row][col] instanceof Tile = " + (this.tiles[row][col] instanceof Tile));
	
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

Board.prototype.highlightTiles = function(coords)
{
	for (c in coords)
		this.layers.getItem("highlight").add(c);
}


function Layer(name, rendererClass)
{
	List.prototype.constructor.call(this);
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

