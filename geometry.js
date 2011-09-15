"use strict";


function Hexagon(x, y, radius)
{
	this.x = x;
	this.y = y;
	this.radius = this.r = radius;
}

Hexagon.prototype.containsPoint = function(point)
{
	return 
		this.x + 0.5 * this.r <= point.x && point.x <= this.x + 1.5 * r &&
		this.y <= point.y && point.y <= this.y + 2 * this.r
}

Hexagon.prototype.getBoundingBox = function()
{
	return new Rectangle(this.x, this.y, 2 * this.r, 2 * this.getWidth());
}

Hexagon.prototype.getCenter = function()
{
	var b = this.getBoundingBox();
	return new Point(b.x + b.w / 2, b.y + b.h / 2);
}

Hexagon.prototype.getWidth = function()
{
	return UNITY_HEXWIDTH * this.r;
}

Hexagon.prototype.toString = function()
{
	return "<Hexagon(x=" + this.x + ", y=" + this.y + ", radius=" + this.r + ")>";
}


function Point(x, y)
{
	this.x = x;
	this.y = y;
}

Point.prototype.toString = function()
{
	return "<Point(" + this.x + ", " + this.y + ")>";
}


function Rectangle(x, y, width, height)
{
	this.x = x;
	this.y = y;
	this.width = this.w = width;
	this.height = this.h = height;
}

Rectangle.prototype.containsPoint = function(point)
{
	return (this.x <= point.x && point.x <= this.x + this.w && 
				this.y <= point.y && point.y <= this.y + this.h);
}

Rectangle.prototype.toString = function()
{
	return "<Rectangle(" + [this.x, this.y, this.w, this.h].join(", ") + ")>";
}


function resizeThumbnail(orig_w, orig_h, desired_w, desired_h)
{
	if (orig_w / orig_h > desired_w / desired_h)
	{
		return [desired_w, (orig_h / orig_w) * desired_w]
	}
	else if (orig_w / orig_h < desired_w / desired_h)
	{
		return [(orig_w / orig_h) * desired_h, desired_h]
	}
	return [desired_w, desired_h]
}
