"use strict";

function BoardRenderer(board)
{
	this.board = board;
	this.background = "rgba(0, 0, 0, 0.6)";
	this.update();
}

BoardRenderer.prototype.render = function(ctx)
{
	var scales = this.getScales();
	var boardArea = this.getBoardArea();

	ctx.save();
	
	var b = this.parent.getBoundingBox();

	// DEBUG
	ctx.strokeStyle = "red";
	ctx.strokeRect(b.x, b.y, b.width, b.height);

	ctx.fillStyle = this.background;
	ctx.translate(b.x + boardArea.x, b.y + boardArea.y);
	ctx.fillRect(0, 0, boardArea.width, boardArea.height);
	ctx.scale(scales[0], scales[1]);
	ctx.lineWidth = 0.05;
	for (var i in this.board.layers.values)
	{
		var layer = this.board.layers.values[i];
		layer.getRenderer().render(ctx);
	}
	ctx.restore();
}

BoardRenderer.prototype.getBoardArea = function()
{
	var b = this.parent.getBoundingBox();
	var dims = resizeThumbnail(
		this.unityWidth, 
		this.unityHeight, 
		b.width, 
		b.height
	);
	return new Rectangle(
		(b.width - dims[0]) / 2, 
		(b.height - dims[1]) / 2,
		dims[0],
		dims[1]
	);
}

BoardRenderer.prototype.getScales = function()
{
	var boardArea = this.getBoardArea();
	return [boardArea.width / this.unityWidth, 
					boardArea.height / this.unityHeight];
}

BoardRenderer.prototype.update = function()
{
	this.unityWidth = (this.board.cols * 2 + 1) * UNITY_HEXWIDTH;
	this.unityHeight = this.board.rows * 1.5 + 0.5;
}


function LayerRenderer(layer)
{
	this.layer = layer;
}

LayerRenderer.prototype.makeHexPath = function(ctx)
{
	// sketch out the path (unity radius dimensions).
	ctx.beginPath();
	ctx.moveTo(0, 0.5);
	ctx.lineTo(UNITY_HEXWIDTH, 0);
	ctx.lineTo(2 * UNITY_HEXWIDTH, 0.5);
	ctx.lineTo(2 * UNITY_HEXWIDTH, 1.5);
	ctx.lineTo(UNITY_HEXWIDTH, 2);
	ctx.lineTo(0, 1.5);
	ctx.closePath();
}

LayerRenderer.prototype.drawLayer = function(ctx, tile)
{
	this.makeHexPath(ctx);
	ctx.stroke();
}

LayerRenderer.prototype.render = function(ctx)
{	
	for (var i = 0; i < this.layer.length; i++)
	{
		var tile = this.layer.get(i);	
		ctx.save();
		ctx.translate((tile.x * 2 + (tile.y % 2)) * UNITY_HEXWIDTH, tile.y * 1.5);
		this.drawLayer(ctx, tile);
		ctx.restore();
	}
}


function BackgroundRenderer(layer)
{
	this.layer = layer;
}

BackgroundRenderer.prototype = new LayerRenderer;

BackgroundRenderer.prototype.drawLayer = function(ctx)
{
	this.makeHexPath(ctx);
	ctx.fillStyle = "orange";
	ctx.fill();
}


function GridRenderer(layer)
{
	this.layer = layer;
}

GridRenderer.prototype = new LayerRenderer;

GridRenderer.prototype.drawLayer = function(ctx)
{
	this.makeHexPath(ctx);
	ctx.strokeStyle = "black";
	ctx.stroke();
}


function HighlightRenderer(layer)
{
	this.layer = layer;
}

HighlightRenderer.prototype = new LayerRenderer;

HighlightRenderer.prototype.drawLayer = function(ctx, tile)
{
	this.makeHexPath(ctx);
	ctx.fillStyle = "cyan";
	ctx.fill();
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
