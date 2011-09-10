"use strict";

var UNITY_HEXWIDTH = Math.sqrt(0.75);

function Board(tiles)
{
	this.tiles = tiles || [[]];
	this._updateDimensions();
}

Board.prototype.setTile = function(tile, row, col)
{
	this.tiles[row][col] = tile;
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
		this.layers["highlight"].add(c);
}


function Layer(name)
{
	this.name = name;
}

Layer.prototype = new Array;

Layer.prototype.contains = function(coord)
{
	for (var i = 0; i < this.length; i++)
		if (this[i] == coord)
			return true;
	return false;
}


function Tile(attrs)
{
	this._attrs = attrs;
}

Tile.prototype.getAttr = function(name)
{
	return this._attrs[name];
}

Tile.prototype.setAttr = function(name, value)
{
	this._attrs[name] = value;
}

Tile.prototype.render = function(ctx)
{
	// sketch out the path (unity radius dimensions).
	ctx.moveTo(0, 0.5);
	ctx.lineTo(UNITY_HEXWIDTH, 0);
	ctx.lineTo(2 * UNITY_HEXWIDTH, 0.5);
	ctx.lineTo(2 * UNITY_HEXWIDTH, 1.5);
	ctx.lineTo(UNITY_HEXWIDTH, 2);
	ctx.lineTo(0, 1.5);
	ctx.closePath();
	
	if (this._attrs["highlighted"])
	{
		if (this._attrs["highlight-background"])
			ctx.fillStyle = this._attrs["highlight-background"];
	}
	else	
	{
		if (this._attrs["background"])
			ctx.fillStyle = this._attrs["background"];
	}
	ctx.fill();
	
	if (this._attrs["layers"] && this._attrs["layers"].length)
	{
		for (var layer in this._attrs["layers"])
		{
			ctx.drawImage(layer, 0, 0, 2 * UNITY_HEXWIDTH, 2);
		}
	}
	
	if (this._attrs["highlighted"])
	{
		if (this._attrs["highlight-border"])
			ctx.strokeStyle = this._attrs["highlight-border"];
	}
	else	
	{
		if (this._attrs["border"])
			ctx.strokeStyle = this._attrs["border"];
	}
	ctx.stroke()
}
