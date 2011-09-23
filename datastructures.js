"use strict"


function KeyError(key)
{
	this.msg = "KeyError: " + key + ".";
}

KeyError.prototype.toString = function()
{
	return this.msg;
}


// Proxy type to built-in Array type, which doesn't allow for inheritance.
function List(enumerable)
{
	if (!(this instanceof List))
		throw new Error("TypeError: constructor called without 'new' keyword.");

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

List.prototype.extend = function(enumerable)
{
	for (var i in enumerable)
	{
		this.push(enumerable[i]);
	}
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

List.prototype.pop = function(index)
{
	if (index)
	{
		var tmp = this.arr[index];
		this.arr.splice(index, 1);
		return tmp;
	}
	return this.arr.pop();
}

List.prototype.push = function(value)
{
	return this.arr.push(value);
}

List.prototype.toString = function()
{
	return "[" + this.arr.join(", ") + "]";
}


function OrderedDict(enumerable)
{
	if (!(this instanceof OrderedDict))
		throw new Error("TypeError: constructor called without 'new' keyword.");

	this.keys = [];
	this.kv = {};
	for (var i in enumerable)
	{
		var pair = enumerable[i];
	this.setItem(pair[0], pair[1]);
	}
}

OrderedDict.prototype._getKey = function(key)
{
	if ((typeof key) === (typeof 1))
		return this.keys[key];
	return key;
}

OrderedDict.prototype.getItem = function(key)
{
	key = this._getKey(key);
	if (!(key in this.kv))
		throw new KeyError(key);
	return this.kv[key];
}

OrderedDict.prototype.setItem = function(key, value)
{
	key = this._getKey(key);
	if (key in this.kv)
		this.delItem(key)
	this.keys.push(key);
	this.kv[key] = value;
}

OrderedDict.prototype.delItem = function(key)
{
	key = this._getKey(key);
	if (!(key in this.kv))
		throw new KeyError(key);
	this.keys.splice(this.keys.indexOf(key), 1);
	delete this.kv[key];
}

OrderedDict.prototype.popItem = function(key)
{
	value = this.getItem(key);
	this.delItem(key)
	return value;
}

OrderedDict.prototype.__defineGetter__(
	"values", 
	function()
	{
		return [this.kv[this.keys[k]] for (k in this.keys)];
	}
)

OrderedDict.prototype.__defineGetter__(
	"items",
	function()
	{
		var result = [];
		for (var i in this.keys)
			result.push([this.keys[i], this.kv[this.keys[i]].toString()]);
		return result;
	}
);

OrderedDict.prototype.toString = function()
{
	return "<OrderedDict([" + this.items + "])>";
}