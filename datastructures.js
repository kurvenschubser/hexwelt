"use strict"


// Proxy type to built-in Array type, which doesn't allow for inheritance.
function List(enumerable)
{
	if (enumerable)
		this.arr = new Array(enumerable);
	else
		this.arr = [];
}

List.prototype.concat = function(enumerable)
{
	return this.arr.concat(enumerable);
}

List.prototype.clear = function()
{
	for (var i = 0; i < this.arr.length; i++)
		this.arr.pop()
}

List.prototype.contains = function(obj)
{
	for (var i = 0; i < this.arr.length; i++)
	{
		if (this.arr[i] === obj)
			return true;
	}
	return false;
}

List.prototype.getItem = function(index)
{
	return this.arr[index];
}

List.prototype.__defineGetter__(
	"length", 
	function()
	{
		return this.arr.length;
	}
);

List.prototype.pop = function(value)
{
	this.arr.pop(value);
}

List.prototype.push = function(value)
{
	return this.arr.push(value);
}


function OrderedDict(enumerable)
{
	this.keys = [];
	this.kv = {};
	for (var i in enumerable)
	{
		var pair = enumerable[i];
		this.setItem(pair[0], pair[1]);
	}
}

OrderedDict.prototype.__defineGetter__(
	"values", 
	function()
	{
		return [this.kv[this.keys[k]] for (k in this.keys)];
	}
)

OrderedDict.prototype.getItem = function(key)
{
	if (!(this.kv[key]))
		throw new Error("KeyError: '" + key + "'.");
	return this.kv[key];
}

OrderedDict.prototype.setItem = function(key, value)
{
	if (key in this.kv)
		throw new Error("KeyError: '" + key + "'.");
	this.keys.push(key);
	this.kv[key] = value;
}

OrderedDict.prototype.delItem = function(key)
{
	this.keys.pop(key);
	delete this.kv[key];
}

