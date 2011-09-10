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
