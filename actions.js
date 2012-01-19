ACTIONS = {
	RESTING: 0,
	MOVING: 1, 
	ATTACKING: 2, 
	DEFENDING: 3, 
	BUILDING: 4
};


function Action(type)
{
	this.type = type;
	this.completed = 0;
}

function Move(from, to)
{
	this.protoype.constructor.call(this, ACTIONS.MOVING);
	this.from = from;
	this.to = to;
}

Move.prototype = new Action;


function Rest()
{
	this.prototype.constructor.call(this, ACTIONS.RESTING);
}

Rest.prototype = new Action;
