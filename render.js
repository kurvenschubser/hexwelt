"use strict";

function BoardRenderer(board, backgroundImage)
{
	this.board = board;
	this.backgroundImage = backgroundImage;
	this.update();
}

BoardRenderer.prototype.drawBackground = function(ctx)
{
	var b = this.parent.getBoundingBox();
	var boardArea = this.getBoardArea();

	// DEBUG
	ctx.strokeStyle = "red";
	ctx.strokeRect(b.x, b.y, b.width, b.height);

	ctx.translate(b.x + boardArea.x, b.y + boardArea.y);
	ctx.drawImage(this.backgroundImage, 0, 0, boardArea.width, boardArea.height);
	
	// ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
	// ctx.fillRect(0, 0, boardArea.width, boardArea.height);
}

BoardRenderer.prototype.render = function(ctx)
{
	var scales = this.getScales();

	ctx.save();
	
	this.drawBackground(ctx);
	
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

LayerRenderer.prototype.moveContextToTile = function(ctx, tile)
{
	ctx.translate((tile.x * 2 + (tile.y % 2)) * UNITY_HEXWIDTH, tile.y * 1.5);
}

LayerRenderer.prototype.render = function(ctx)
{	
	for (var i = 0; i < this.layer.length; i++)
	{
		var tile = this.layer.getItem(i);	
		ctx.save();
		this.moveContextToTile(ctx, tile);
		this.drawLayer(ctx, tile);
		ctx.restore();
	}
}


function BackgroundRenderer(layer)
{
	this.layer = layer;
}

BackgroundRenderer.prototype = new LayerRenderer;

BackgroundRenderer.prototype.drawLayer = function(ctx, tile)
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

GridRenderer.prototype.drawLayer = function(ctx, tile)
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


function MovableRenderer(layer)
{
	this.layer = layer;
}

MovableRenderer.prototype = new LayerRenderer();

MovableRenderer.prototype.drawLayer = function(ctx, movable)
{
	throw new NotImplementedError;
}

MovableRenderer.prototype.render = function(ctx)
{
	for (var i = 0; i < this.layer.length; i++)
	{
		var movable = this.layer.getItem(i);
		this.moveContextToTile(ctx, movable.getTile());
		this.drawLayer(ctx, movable);
	}
}

function DragonRenderer(layer)
{
	this.layer = layer;
}

DragonRenderer.prototype = new MovableRenderer();

DragonRenderer.prototype.drawLayer = function(ctx, movable)
{
	var img = IMAGES["dragon.png"];	
	var dims = resizeThumbnail(img.width, img.height, 2 * UNITY_HEXWIDTH, 2);
	ctx.drawImage(img, 0, 0, dims[0], dims[1]);
}
