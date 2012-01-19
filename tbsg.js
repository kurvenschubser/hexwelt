"use strict";


function Dragon(name, resources)
{
	this.name = name;
	this.resources = resources;
}

Dragon.prototype = new Movable;

Dragon.prototype.toString = function()
{
	return "<Dragon '" + this.name + "'>";
}


function Maenneken(name, resources)
{
	this.name = name;
	this.resources = resources;
}

Maenneken.prototype = new Movable;

Maenneken.prototype.toString = function()
{
	return "<Maenneken '" + this.name + "'>";
}