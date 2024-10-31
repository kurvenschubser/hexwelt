function OutOfNodesError(message) {
  this.name = "OutOfNodesError";
  this.message = message || "Default Message";
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, OutOfNodesError);
  } else {
    this.stack = new Error().stack;
  }
}

// Inherit from Error
OutOfNodesError.prototype = Object.create(Error.prototype);
OutOfNodesError.prototype.constructor = OutOfNodesError;

OutOfNodesError.prototype.toString = function () {
  return `${this.name}: ${this.message}`;
};

function AStar(nodes, movable) {
  this.nodes = nodes;
  this.movable = movable;
}

AStar.prototype.compareNodes = function (a, b) {
  return a[1] - b[1];
};

AStar.prototype.estimateCost = function (start, goal) {
  return this.getDistanceBetween(start, goal);
};

AStar.prototype.getDistanceBetween = function (start, goal) {
  // return direct line length between the nodes

  var startHex = new Hexagon(
    (start.x + (start.y % 2) * 0.5) * UNITY_HEXWIDTH * 2,
    start.y * 2 * UNITY_HEXWIDTH,
    1
  );
  var endHex = new Hexagon(
    (goal.x + (goal.y % 2) * 0.5) * UNITY_HEXWIDTH * 2,
    goal.y * 2 * UNITY_HEXWIDTH,
    1
  );
  var sc = startHex.getCenter();
  var ec = endHex.getCenter();

  console.log(
    "distance",
    start,
    startHex,
    goal,
    endHex,
    Math.sqrt(Math.pow(ec.x - sc.x, 2) + Math.pow(ec.y - sc.y, 2))
  );

  return Math.sqrt(Math.pow(ec.x - sc.x, 2) + Math.pow(ec.y - sc.y, 2));
};

AStar.prototype.getNeighbors = function (node) {
  const result = [];

  const col = node.x;
  const row = node.y;

  const coords =
    row % 2
      ? [
          [col, row - 1],
          [col + 1, row - 1],
          [col + 1, row],
          [col + 1, row + 1],
          [col, row + 1],
          [col - 1, row],
        ]
      : [
          [col - 1, row - 1],
          [col, row - 1],
          [col + 1, row],
          [col, row + 1],
          [col - 1, row + 1],
          [col - 1, row],
        ];

  for (const coord of coords) {
    if (
      -1 < coord[1] &&
      coord[1] < this.nodes.length &&
      -1 < coord[0] &&
      coord[0] < this.nodes[coord[1]].length
    ) {
      const n = this.nodes[coord[1]][coord[0]];
      if (n && n.getAttr("visible")) {
        result.push(n);
      }
    }
  }

  return result;
};

AStar.prototype.getLowestFScoreNode = function (nodes) {
  const sortedFScore = Object.entries(nodes).sort(this.compareNodes);
  const nodeKey = sortedFScore[0][0];
  return this.nodes.flat().find((n) => n.toString() === nodeKey);
};

AStar.prototype.reconstructPath = function (cameFrom, currentNode) {
  const totalPath = [currentNode];
  while (
    currentNode in cameFrom &&
    !totalPath.includes(cameFrom[currentNode])
  ) {
    currentNode = cameFrom[currentNode];
    totalPath.push(currentNode);
  }
  return totalPath.reverse();
};

AStar.prototype.find = function (start, goal) {
  console.log(
    "distance find",
    start,
    goal,
    this.estimateCost(start, goal),
    new Hexagon(
      (start.x + (start.y % 2) * 0.5) * UNITY_HEXWIDTH * 2,
      start.y * 2,
      1
    ),
    new Hexagon(
      (start.x + (start.y % 2) * 0.5) * UNITY_HEXWIDTH * 2,
      start.y * 2,
      1
    ).getCenter(),
    new Hexagon(
      (goal.x + (goal.y % 2) * 0.5) * UNITY_HEXWIDTH * 2,
      goal.y * 2,
      1
    ),
    new Hexagon(
      (goal.x + (goal.y % 2) * 0.5) * UNITY_HEXWIDTH * 2,
      goal.y * 2,
      1
    ).getCenter()
  );
  const openSet = [start];

  const cameFrom = {};

  const gScore = { [start]: 0 };
  const fScore = { [start]: this.estimateCost(start, goal) };

  let dbgI = 0;

  const coordinatesAreEqual = (a, b) => a.x === b.x && a.y === b.y;

  while (openSet.length) {
    //if (dbgI > 4)
    //	break;

    const current = this.getLowestFScoreNode(fScore);

    if (coordinatesAreEqual(current, goal)) {
      console.log("Found path", cameFrom, current, goal, gScore, fScore);
      return this.reconstructPath(cameFrom, current);
    }

    openSet.splice(
      openSet.findIndex((n) => coordinatesAreEqual(n, current)),
      1
    );
    delete fScore[current];

    const neighbors = this.getNeighbors(current);

    // TODO: remove
    console.log(
      `neigbors distance to goal ${goal}`,
      "\n" +
        neighbors
          .map((n) => `${n.toString()}: ${this.getDistanceBetween(goal, n)}`)
          .join("\n")
    );

    for (const neighbor of neighbors) {
      const tentativeGScore =
        gScore[current] + this.getDistanceBetween(current, neighbor);
      if (tentativeGScore < (gScore[neighbor] || Infinity)) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = tentativeGScore + this.estimateCost(neighbor, goal);
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }

    //dbgI++;
  }
  throw new OutOfNodesError(); // There is no path
};
