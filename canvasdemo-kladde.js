
function run()
{
	var canvas = document.getElementById("DemoCanvas");
	canvas.onmousemove = showCursorCoordinates;
	var ctx = canvas.getContext("2d");
	ctx.font = "16px Arial"
	ctx.fillRect(100, 0, 50, 50);
	ctx.beginPath();
	ctx.moveTo(151, 50);
	ctx.lineTo(151, 100);
	ctx.stroke();
	ctx.closePath();
	ctx.strokeStyle = "#ff0099";
	ctx.beginPath();
	ctx.moveTo(151, 100);
	ctx.lineTo(200, 100);
	ctx.stroke();
	ctx.closePath();
}
