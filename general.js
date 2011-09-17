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


function trueDiv(dividend, divisor)
{
	return Math.round((dividend - dividend % divisor) / divisor);
}


String.prototype.rsplit = function(sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit)) : split;
}
