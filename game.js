"use strict";

function Board(tiles) {
  this.movables = [];
  this.selection = null;
  this._cursor = null;

  this.tiles = [];
  var tmptiles = tiles || [];
  for (var row in tmptiles) {
    for (var col in tmptiles[row]) {
      this.setTile(tmptiles[row][col], row, col);
    }
  }
  this._updateDimensions();
  this.layers = {
    background: new Layer("background", BackgroundRenderer),
    highlight: new Layer("highlight", HighlightRenderer),
    selection: new Layer("selection", HighlightRenderer),
    pathfinder: new Layer("pathfinder", PathfinderRenderer),
    grid: new Layer("grid", GridRenderer),
  };

  // Events
  this.selectionEvent = new Event("selectionEvent");
  this.cursorChangedEvent = new Event("cursorChanged");
}

Board.prototype.__defineGetter__("cursor", function () {
  return this._cursor;
});

Board.prototype.__defineSetter__("cursor", function (tile) {
  if (this._cursor !== tile) {
    this.cursorChangedEvent.fire({
      target: this,
      oldCursor: this._cursor,
      newCursor: tile,
    });
    this._cursor = tile;
  }
});

Board.prototype.findPathForMovable = function (movable, endNode) {
  return new AStar(this.tiles, movable).find(movable.getTile(), endNode);
};

Board.prototype.setGroupOnLayer = function (layername, group) {
  // add groups of whatever on a layer
  this.layers[layername].setGroup(group);
};

Board.prototype.getMovables = function () {
  return this.movables;
};

Board.prototype.setMovables = function (movables) {
  this.movables = [];
  for (const movable of movables) {
    this.getMovables().push(movable);
    const board = this;
    movable.pathRequestEvent.connect(function (event, info) {
      const aStar = new AStar(board.tiles, movable);
      const waypoints = aStar.find(movable.getTile(), event.endNode);
      movable.waypoints = waypoints; // board.findPathForMovable(movable, event.endNode);
      console.log(aStar, waypoints);
    });
  }
};

Board.prototype.getSelectedMovable = function () {
  for (var i in this.movables) {
    if (this.movables[i].selected) return this.movables[i];
  }
};

Board.prototype.getSelection = function () {
  return this.selection;
};

Board.prototype.setSelection = function (tile) {
  var layer = this.layers.selection;
  layer.clear();
  var old = this.selection;
  this.selection = tile;
  this.selectionEvent.fire({
    target: this,
    newSelection: tile,
    oldSelection: old,
  });

  // A callback connected to *selectionEvent* might have altered
  // *this.selection* when it was called through *selectionEvent*
  // in the line above. So *this.selection* is not neccessarily *tile*.
  if (this.selection) layer.push(this.selection);
  this.updateEvent.fire({ target: this });
};

Board.prototype.setTile = function (tile, row, col) {
  if (!(tile instanceof Tile))
    throw new Error("TypeError: need instance of 'Tile', got " + typeof tile);
  if (this.tiles[row] == undefined) {
    this.tiles[row] = [];
  }
  this.tiles[row][col] = tile;
  tile.x = parseInt(col);
  tile.y = parseInt(row);
  this._updateDimensions();
};

Board.prototype.getTile = function (row, col) {
  return this.tiles[row][col];
};

Board.prototype._updateDimensions = function () {
  this.rows = this.tiles.length;
  this.cols = 0;
  for (var row in this.tiles) {
    if (this.tiles[row].length > this.cols) {
      this.cols = this.tiles[row].length;
    }
  }
};

Board.prototype.fromTileDefinitions = function (tiledefs) {
  for (tiledef in tiledefs) {
    if (!this.tiles[tiledef.row][tiledef.col]) {
      this.setTile(new Tile(tiledef), tiledef.row, tiledef.col);
    } else {
      throw Exception(
        "Duplicate entry at board coordinates (" +
          tiledef.row +
          ", " +
          tiledef.col +
          ")."
      );
    }
  }
  this._updateDimensions();
};

Board.prototype.highlightTiles = function (tiles) {
  this.setGroupOnLayer("highlight", tiles);
};

function Layer(name, rendererClass) {
  this.name = name;
  this.rendererClass = rendererClass;
  this.items = [];
}

Layer.prototype.getRenderer = function () {
  if (!this._renderer) this._renderer = new this.rendererClass(this);
  return this._renderer;
};

Layer.prototype.setGroup = function (group) {
  this.items = [...group];
};

Layer.prototype.clear = function () {
  this.items = [];
};

Layer.prototype.push = function (item) {
  this.items.push(item);
};

Layer.prototype.toString = function () {
  return (
    "<Layer(" + this.items.map((item) => item.toString()).join(", ") + ")>"
  );
};

function Movable(name) {
  this.name = name;
  this.selected = false;

  // Base value for how many tiles per turn this instance can move
  this.speed = 1;

  // Used for moving the instance along a path
  this.waypoints = [];

  // Determines the progress moving along the waypoints
  this.currentWaypoint = null;

  // events
  this.pathRequestEvent = new Event("pathRequestEvent");
}

Movable.prototype.setTile = function (tile) {
  if (!(tile instanceof Tile))
    throw new Error(
      "TypeError: need instance of 'Tile', got '" + typeof tile + "'."
    );
  this.pathRequestEvent.fire({
    target: this,
    startNode: this.tile,
    endNode: tile,
  });
  this.tile = tile;
};

Movable.prototype.getTile = function () {
  if (!this.tile) {
    console.trace();
    throw new Error("AttributeError: tile on " + this);
  }
  return this.tile;
};

Movable.prototype.toString = function () {
  return "<Movable '" + this.name + "'>";
};

function Tile(attrs) {
  this._attrs = attrs;
  this.x = null; // Internal: never set this in user code.
  this.y = null; // Internal: never set this in user code.
}

Tile.prototype.getAttr = function (name) {
  return this._attrs[name];
};

Tile.prototype.setAttr = function (name, value) {
  this._attrs[name] = value;
};

Tile.prototype.toString = function () {
  return "<Tile(" + this.x + ", " + this.y + ")>";
};
