function OutOfNodesError(){}

OutOfNodesError.prototype.toString = function()
{
	return "OutOfNodesError";
}


function AStar(nodes, movable)
{
	this.nodes = nodes;
	this.movable = movable;
}

AStar.prototype.compareNodes = function(a, b)
{
	return a[1] - b[1];
}

AStar.prototype.estimateCost = function(start, goal)
{
	return this.getDistanceBetween(start, goal);
}

AStar.prototype.getDistanceBetween = function(start, goal)
{
	// return direct line length between the nodes
	return Math.sqrt(Math.pow((goal.x - start.x), 2) + Math.pow((goal.y - start.y), 2));
}

AStar.prototype.getNeighbors = function(node)
{
	var col = node.x;
	var row = node.y;
	
	var coords = (row % 2) 
		? 
		[[col, row - 1], [col + 1, row - 1], [col + 1, row], 
		[col + 1, row + 1], [col, row + 1], [col - 1, row]] 
		:
		[[col - 1, row - 1], [col, row - 1], [col + 1, row], 
		[col, row + 1], [col - 1, row + 1], [col - 1, row]];
	var result = [];
	for (var i in coords)
	{

		if (-1 < coords[i][1] && coords[i][1] < this.nodes.length &&
				-1 < coords[i][0] && coords[i][0] < this.nodes[coords[i][1]].length)
		{
			var n = this.nodes[coords[i][1]][coords[i][0]];
			if (n && n.getAttr("visible"))
				result.push(n);
		}
	}
	return result;
}

AStar.prototype.getLowestFScore = function(nodes)
{
	sortedFScore = nodes.items.sort(this.compareNodes);
	return sortedFScore[0][0];
}

AStar.prototype.reconstructPath = function(cameFrom, currentNode)
{
	if (currentNode in cameFrom)
	{
		var p = this.reconstructPath(cameFrom, cameFrom[currentNode]);
		p.push(currentNode);
		return p;
	}
	return [currentNode];
}

AStar.prototype.find = function(start, goal)
{
	var closedSet = [];
	var openSet = [start];
	var cameFrom = {};
	var gScore = {};
	gScore[start] = 0;
	var hScore = {};
	hScore[start] = this.estimateCost(start, goal);
	
	// priority queue
	var fScore = new OrderedDict([[start, gScore[start] + hScore[start]]]);

	var dbgI = 0;
	
	while (openSet.length)
	{
		//if (dbgI > 4)
		//	break;
		
		var x = this.getLowestFScore(fScore);
		fScore.delItem(x);
		
		
		if (x === goal)
		{
			if (goal in cameFrom)
				return this.reconstructPath(cameFrom, cameFrom[goal]);
			return [];
		}
		
		openSet.splice(openSet.indexOf(x), 1);
		if (closedSet.indexOf(x) == -1)	// x not in closedSet
			closedSet.push(x);

		var neighbors = this.getNeighbors(x);
		for (var j = 0; j < neighbors.length; j++)
		{
			var y = neighbors[j];
			if (closedSet.indexOf(y) != -1)		// y in closedSet
				continue;
			var tentativeGScore = gScore[x] + this.getDistanceBetween(x, y);
			tentativeIsBetter = false;
			if (openSet.indexOf(y) == -1)		// y not in openSet
			{
				openSet.push(y)
				tentativeIsBetter = true;
			}
			else if (tentativeGScore < gScore[y])
			{
				tentativeIsBetter = true;
			}

			if (tentativeIsBetter)
			{
				cameFrom[y] = x;
				gScore[y] = tentativeGScore;
				hScore[y] = this.estimateCost(y, goal);
				fScore.setItem(y, gScore[y] + hScore[y]);
			}
		}
		
		//dbgI++;
	
	}
	throw new OutOfNodesError();		// There is no path
}

