"use strict";

function BoardRenderer(board, backgroundImage) {
  this.board = board;
  this.backgroundImage = backgroundImage;
  this.update();
}

BoardRenderer.prototype.drawBackground = function (ctx) {
  const b = this.parent.getBoundingBox();
  const boardArea = this.getBoardArea();

  // DEBUG
  ctx.strokeStyle = "red";
  ctx.strokeRect(b.x, b.y, b.width, b.height);

  ctx.translate(b.x + boardArea.x, b.y + boardArea.y);
  ctx.drawImage(this.backgroundImage, 0, 0, boardArea.width, boardArea.height);

  // ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  // ctx.fillRect(0, 0, boardArea.width, boardArea.height);
};

BoardRenderer.prototype.render = function (ctx) {
  const scales = this.getScales();

  ctx.save();

  this.drawBackground(ctx);

  ctx.scale(scales[0], scales[1]);
  ctx.lineWidth = 0.05;
  for (const layer of Object.values(this.board.layers)) {
    layer.getRenderer().render(ctx);
  }

  ctx.restore();
};

BoardRenderer.prototype.getBoardArea = function () {
  const b = this.parent.getBoundingBox();
  const dims = resizeThumbnail(
    this.unityWidth,
    this.unityHeight,
    b.width,
    b.height
  );
  return new Rectangle(
    (b.width - dims[0]) / 2,
    (b.height - dims[1]) / 2,
    dims[0],
    dims[1]
  );
};

BoardRenderer.prototype.getScales = function () {
  var boardArea = this.getBoardArea();
  return [
    boardArea.width / this.unityWidth,
    boardArea.height / this.unityHeight,
  ];
};

BoardRenderer.prototype.update = function () {
  this.unityWidth = (this.board.cols * 2 + 1) * UNITY_HEXWIDTH;
  this.unityHeight = this.board.rows * 1.5 + 0.5;
};

function LayerRenderer(layer) {
  this.layer = layer;
}

LayerRenderer.prototype.makeHexPath = function (ctx) {
  // sketch out the path (unity radius dimensions).
  ctx.beginPath();
  ctx.moveTo(0, 0.5);
  ctx.lineTo(UNITY_HEXWIDTH, 0);
  ctx.lineTo(2 * UNITY_HEXWIDTH, 0.5);
  ctx.lineTo(2 * UNITY_HEXWIDTH, 1.5);
  ctx.lineTo(UNITY_HEXWIDTH, 2);
  ctx.lineTo(0, 1.5);
  ctx.closePath();
};

LayerRenderer.prototype.drawCoordinates = function (ctx, tile) {
  ctx.font = ".5px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(tile.x + "," + tile.y, 0.2, 1);
};

LayerRenderer.prototype.drawLayer = function (ctx, tile) {
  this.makeHexPath(ctx);
  ctx.stroke();
};

LayerRenderer.prototype.moveContextToTile = function (ctx, tile) {
  ctx.translate((tile.x * 2 + (tile.y % 2)) * UNITY_HEXWIDTH, tile.y * 1.5);
};

LayerRenderer.prototype.render = function (ctx) {
  for (const tile of this.layer.items) {
    ctx.save();
    this.moveContextToTile(ctx, tile);
    this.drawLayer(ctx, tile);
    ctx.restore();
  }
};

function BackgroundRenderer(layer) {
  this.layer = layer;
}

BackgroundRenderer.prototype = new LayerRenderer();

BackgroundRenderer.prototype.drawLayer = function (ctx, tile) {
  this.makeHexPath(ctx);
  ctx.fillStyle = "orange";
  ctx.fill();
  this.drawCoordinates(ctx, tile);
};

function GridRenderer(layer) {
  this.layer = layer;
}

GridRenderer.prototype = new LayerRenderer();

GridRenderer.prototype.drawLayer = function (ctx, tile) {
  this.makeHexPath(ctx);
  ctx.strokeStyle = "black";
  ctx.stroke();
};

function HighlightRenderer(layer) {
  this.layer = layer;
}

HighlightRenderer.prototype = new LayerRenderer();

HighlightRenderer.prototype.drawLayer = function (ctx, tile) {
  this.makeHexPath(ctx);
  ctx.fillStyle = "cyan";
  ctx.fill();
};

function PathfinderRenderer(layer) {
  this.layer = layer;
}

PathfinderRenderer.prototype = new LayerRenderer();

PathfinderRenderer.prototype.drawLayer = function (ctx, tile) {
  console.log(this.layer, tile);
  this.makeHexPath(ctx);
  ctx.fillStyle = "cyan";
  ctx.fill();
  this.drawCoordinates(ctx, tile);
  this.drawPathIndex(ctx, this.layer.items.indexOf(tile));
  // this.drawHexDebug(ctx, tile);
};

PathfinderRenderer.prototype.drawHexDebug = function (ctx, start) {
  const startHex = new Hexagon(
    (start.x + (start.y % 2) * 0.5) * UNITY_HEXWIDTH,
    start.y,
    1
  );
  const sc = startHex.getCenter();
  ctx.fillStyle = "red";
  ctx.fillText(`d: ${sc.x.toFixed(2)},${sc.y.toFixed(2)}`, 0.3, 0.8); //
};

PathfinderRenderer.prototype.drawPathIndex = function (ctx, index) {
  ctx.font = ".5px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(`i: ${index}`, 0.3, 1.6);
};

function MovableRenderer(layer) {
  this.layer = layer;
}

MovableRenderer.prototype = new LayerRenderer();

MovableRenderer.prototype.drawLayer = function (ctx, movable) {
  throw new NotImplementedError();
};

MovableRenderer.prototype.render = function (ctx) {
  for (const movable of this.layer.items) {
    this.moveContextToTile(ctx, movable.getTile());
    this.drawLayer(ctx, movable);
  }
};

function DragonRenderer(layer) {
  this.layer = layer;
}

DragonRenderer.prototype = new MovableRenderer();

DragonRenderer.prototype.drawLayer = function (ctx, movable) {
  const img = IMAGES["dragon.png"];
  const dims = resizeThumbnail(img.width, img.height, 2 * UNITY_HEXWIDTH, 2);
  ctx.drawImage(img, 0, 0, dims[0], dims[1]);
};
