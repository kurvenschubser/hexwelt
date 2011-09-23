"use strict";


function Dragon(name)
{
	this.name = name;
}

Dragon.prototype = new Movable;

Dragon.prototype.toString = function()
{
	return "<Dragon '" + this.name + "'>";
}