"use strict";

function BoardRenderer(board, x, y, maxWidth, maxHeight, background)
{
	this.board = board;
	this.x = x;
	this.y = y;
	this.maxWidth = maxWidth;
	this.maxHeight = maxHeight;
	this.background = background || "lightpink";

	this.update();
}

BoardRenderer.prototype.render = function(ctx)
{
	var scales = this.getScales();
	var boardArea = this.getBoardArea();

	ctx.save();
	
	// DEBUG
	ctx.strokeStyle = "red";
	ctx.strokeRect(this.x, this.y, this.maxWidth, this.maxHeight);

	ctx.fillStyle = this.background;
	ctx.translate(this.x + boardArea.x, this.y + boardArea.y);
	ctx.fillRect(0, 0, boardArea.width, boardArea.height);
	for (var row in this.board.tiles)
	{
		for (var col in this.board.tiles[row])
		{
			ctx.save();
			ctx.lineWidth =  0.05;
			ctx.scale(scales[0], scales[1]);
			ctx.translate(
				(parseInt(col) + (parseInt(row) % 2) * 0.5) * 2 * UNITY_HEXWIDTH, 
				parseInt(row) * 1.5
			);
			this.board.tiles[row][col].render(ctx)
			ctx.restore();
		}
	}
	ctx.restore();
}

BoardRenderer.prototype.getBoardArea = function()
{
	var dims = resizeThumbnail(
		this.unityWidth, 
		this.unityHeight, 
		this.maxWidth, 
		this.maxHeight
	);
	return new Rectangle(
		(this.maxWidth - dims[0]) / 2, 
		(this.maxHeight - dims[1]) / 2,
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
