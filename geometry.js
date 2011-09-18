"use strict";


var UNITY_HEXWIDTH = Math.sqrt(0.75);


function Hexagon(x, y, radius)
{
	this.x = x;
	this.y = y;
	this.radius = this.r = radius;
}

Hexagon.prototype.containsPoint = function(point)
{
	var width = this.getWidth();
	if (!(this.getBoundingBox().containsPoint(point)))
		return false;
	if ((new Rectangle(this.x, this.y + this.r / 2, width * 2, this.r)).containsPoint(point))
	{
		return true;
	}
	var center = this.getCenter();
	var xdistance = Math.abs((this.x + (point.x > center.x) * width * 2) - point.x);
	var gradient = (this.r / 2) / width;
	var ydistance = Math.abs((this.y + (point.y > center.y) * this.r * 2) - point.y);
	if (ydistance > (this.r / 2) - gradient * xdistance)
		return true;
	return false;
}

Hexagon.prototype.getBoundingBox = function()
{
	return new Rectangle(this.x, this.y, 2 * this.r, 2 * this.getWidth());
}

Hexagon.prototype.getCenter = function()
{
	return new Point(this.x + this.getWidth(), this.y + this.r);
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
