

function Window(child)
{
	this.child = child;
	child.parent = this;
	// transparent background and border by default
	this.background = "rgba(0, 0, 0, 0.3)";
	this.border = "rgba(0, 0, 0, 0.3)";
}

Window.prototype.getBoundingBox = function()
{
	return this.boundingBox;
}

Window.prototype.setBoundingBox = function(x, y, width, height)
{
	this.boundingBox = new Rectangle(x, y, width, height);
}

Window.prototype.setChild = function(child)
{
	this.child = child;
}

Window.prototype.getChild = function()
{
	return this.child;
}

Window.prototype.render = function(ctx)
{
	var b = this.getBoundingBox();
	ctx.save();
	ctx.fillStyle = this.background;
	ctx.fillRect(b.x, b.y, b.width, b.height);
	ctx.strokeStyle = this.border;
	ctx.strokeRect(b.x, b.y, b.width, b.height);
	this.child.render(ctx);
	ctx.restore();
}