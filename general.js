
function ChunksIterator(nodes, step, firstEnd)
{
	this.nodes = nodes;
	this.step = step;
	this.firstEnd = firstEnd || step;
	this.count = 0;
}

ChunksIterator.prototype.hasNext = function()
{
	return this.count < this.nodes.length;
}

ChunksIterator.prototype.getNext = function()
{
	if (this.count < this.firstEnd)
		return this.nodes.slice(0, this.firstEnd)
	var steps = trueDiv(this.nodes.length - this.firstEnd, this.step);
	if (steps * this.step < this.nodes.length - this.firstEnd && 
		this.nodes.length - this.firstEnd < (steps + 1) * this.step)
	{
		this.count += this.step;
		return this.nodes.slice(this.count - this.step, this.count);
	}
	else
	{
		this.count += this.nodes.length - (this.firstEnd + steps * this.step);
		return this.nodes.slice(this.firstEnd + steps * this.step, this.count);
	}
}


function getElementOffset(node)
{
	var x = 0;
	var y = 0;
	while (node)
	{
		x += node.offsetLeft - node.scrollLeft;
		y += node.offsetTop - node.scrollTop;
		node = node.offsetParent;
	}
	return [x, y];
}


function flattenArray(enumerable)
{
	var result = new Array;
	for (var i in enumerable)
	{
		var elem = enumerable[i];
		if (elem instanceof Array)
			result = result.concat(flattenArray(elem));
		else
			result.push(elem);
	}
	return result;
}


function intCompare(a, b)
{
	return parseInt(a) - parseInt(b); 
}


function NotImplementedError(){};


function printObject(obj)
{
	var res = [];
	for (var i in obj)
	{
		var repr = obj[i];
		if (obj[i].toString)
			repr = obj[i].toString();
		res.push(i + ": " + repr);
	}
	return "{" + res.join(", ") + "}";
}


function trueDiv(dividend, divisor)
{
	//return Math.round((dividend - dividend % divisor) / divisor);
	return Math.floor(dividend / divisor);
}


String.prototype.rsplit = function(sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit)) : split;
}

