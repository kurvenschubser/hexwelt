"use strict";


function Dragon(name)
{
	this.name = name;
}

Dragon.prototype = new Movable;
