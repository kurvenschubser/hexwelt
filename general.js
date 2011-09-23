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
	return Math.round((dividend - dividend % divisor) / divisor);
}


String.prototype.rsplit = function(sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit)) : split;
}

