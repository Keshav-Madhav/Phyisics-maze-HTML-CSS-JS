///// Variable Declarations /////

// Getting Dom elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const body = document.querySelector("body");
const nextButton = document.getElementById("next");
nextButton.style.display = "none";
const stageDisplay = document.getElementById("stage");

// Set the size of the canvas
const size = Math.min(window.innerWidth, window.innerHeight);
var width = (canvas.width = size);
var height = (canvas.height = size);

// Predefined stages
let stages = [
	[9, 9],
	[9, 9],
	[13, 13],
	[13, 13],
	[13, 17],
	[17, 17],
	[21, 21],
	[25, 25],
	[29, 29],
	[33, 33],
	[37, 37],
	[41, 41],
	[9, 9],
	[9, 9],
	[13, 13],
	[13, 13],
	[13, 17],
	[17, 17],
	[21, 21],
	[25, 25],
];
let stage = 0;

// Initialize the stage variable from local storage, if available
let savedStage = localStorage.getItem("currentStage");
if (savedStage !== null) {
	stage = parseInt(savedStage);
}
// Display the current stage
stageDisplay.innerHTML = stage + 1 + " of " + stages.length;

// Set the size of the maze grid
let rowCount = stages[stage][0];
let colCount = stages[stage][1];
let cellSize = Math.floor(size / (Math.sqrt(2) * rowCount));

let offsetX = (width - colCount * cellSize) / 2;
let offsetY = (height - rowCount * cellSize) / 2;

// Initialize the rotation angle and speed
let angle = 0;
let rotationSpeed = 1;

// Flags to track whether the 'a' or 'd' key is being held down
let rotateLeft = false;
let rotateRight = false;

// ID of the interval for updating the rotation angle
let intervalId;

// initialize gravity
let gravity = 0.4;

let mazeCompletedCheck = false;
let ball1Finished = false;
let ball2Finished = false;
let secondBall = stage >11 ? true : false;

// Colors
const backgroundColor = "rgb(12, 24, 28)"; // YInMn Blue
const pathColor = "rgb(30, 065, 085)"; // Deep Teal
const wallColor = "rgb(16, 31, 36)"; // Light Sky Blue
const endColor1 = "rgb(0, 128, 0)"; // Green
const startColor1 = "rgb(108, 0, 108)"; // Purple
const endColor2 = "rgb(205, 105, 0)"; // Orange
const startColor2 = "rgb(0, 0, 128)"; // Navy
const ballColor1 = "rgb(255, 105, 180)"; // Hot Pink
const ballColor2 = "rgb(255, 165, 0)"; // Yellow

// Set the background color of the body
body.style.backgroundColor = backgroundColor;

// Generate the maze grid
var grid = createGrid();
generateMaze(Math.floor(rowCount / 2), Math.floor(colCount / 2));

///// Event Listeners /////

// Listen for keydown events
window.addEventListener("keydown", function (event) {
	if (event.key === "a" || event.key === "ArrowLeft" || event.key === "A") {
		rotateLeft = true;
	} else if (event.key === "d" || event.key === "ArrowRight" || event.key === "D") {
		rotateRight = true;
	} else if (event.key === "w" || event.key === "ArrowUp") {
		gravity = -Math.abs(gravity);
	} else if (event.key === "s" || event.key === "ArrowDown") {
		gravity = Math.abs(gravity);
	}

	// Check if shift key is pressed
	if (event.shiftKey) {
		rotationSpeed = 0.2;
	}

	// Start the interval when a key is pressed
	if (!intervalId) {
		intervalId = setInterval(function () {
			if (rotateLeft) {
				angle -= rotationSpeed;
			}
			if (rotateRight) {
				angle += rotationSpeed;
			}
		}, 10);
	}
});

// Listen for keyup events
window.addEventListener("keyup", function (event) {
	if (event.key === "a" || event.key === "ArrowLeft" || event.key === "A") {
		rotateLeft = false;
	}
	if (event.key === "d" || event.key === "ArrowRight" || event.key === "D") {
		rotateRight = false;
	}

	// Check if shift key is released
	if (!event.shiftKey) {
		rotationSpeed = 1; // Set rotation speed back to 1 if shift is released
	}

	// Clear the interval when both keys are released
	if (!rotateLeft && !rotateRight) {
		clearInterval(intervalId);
		intervalId = null;
	}
});

// Listen for deviceorientation events
window.addEventListener("deviceorientation", function (event) {
	angle = event.gamma;
});

// Listen for touchstart events
window.addEventListener("touchstart", function (event) {
	// Check the direction of the swipe
	var touch = event.touches[0];
	startTouchY = touch.clientY;
});

// Listen for touchmove events
window.addEventListener("touchmove", function (event) {
	// Check the direction of the swipe
	var touch = event.touches[0];
	var endTouchY = touch.clientY;

	if (endTouchY < startTouchY) {
		// Swipe was up, gravity is upwards
		gravity = -Math.abs(gravity);
	} else {
		// Swipe was down, gravity is downwards
		gravity = Math.abs(gravity);
	}
});

// Listen for touchend events
nextButton.addEventListener("click", resetMaze);

///// Classes /////

class Ball {
  constructor(x, y, radius, dx, dy, color, number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.weight = 1;
    this.dx = dx;
    this.dy = dy;
    this.friction = 0.99;
    this.elasticity = 0.35;
    this.color = color;
		this.number = number;
  }

	draw() {
    ctx.save(); // Save the current drawing state
    ctx.translate(this.x, this.y); // Translate to the center of the ball
    ctx.rotate(-(angle * Math.PI) / 180); // Rotate based on the current angle

    // Draw the ball
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

		if(secondBall){
			// Draw the number
			ctx.fillStyle = 'white'; // Color of the number
			ctx.font = '16px Arial'; // Font size and family
			ctx.textAlign = 'center'; // Center align the text
			ctx.textBaseline = 'middle'; // Align text vertically at the middle
			ctx.fillText(this.number, 0, 0);
		}

    ctx.restore(); // Restore the previous drawing state
}


	update() {
		this.draw();

		this.x += this.dx;
		this.y += this.dy;

		this.applyGravity();

		this.dx *= this.friction;
		this.dy *= this.friction;

		this.checkBounds();

		checkCollision(this);
	}

	applyGravity() {
		if (this.y + this.radius < height || this.dy < 0) {
			// Convert the angle from degrees to radians
			let rad = (angle * Math.PI) / 180;

			// Calculate the gravity components
			let gx = gravity * Math.sin(rad);
			let gy = gravity * Math.cos(rad);

			// Apply the gravity components to the ball's velocity
			this.dx += gx;
			this.dy += gy;
		}
	}

	checkBounds() {
		// Calculate the boundaries of the grid
		const gridLeft = offsetX;
		const gridRight = offsetX + colCount * cellSize;
		const gridTop = offsetY;
		const gridBottom = offsetY + rowCount * cellSize;

		// Check if the ball is hitting the left or right boundary of the grid
		if (this.x - this.radius < gridLeft || this.x + this.radius > gridRight) {
			if (this.x - this.radius < gridLeft) this.x = gridLeft + this.radius + 0.2;
			else this.x = gridRight - this.radius - 0.2;

			this.dx = -this.dx * this.elasticity;
		}

		// Check if the ball is hitting the top or bottom boundary of the grid
		if (this.y - this.radius < gridTop || this.y + this.radius > gridBottom) {
			if (this.y - this.radius < gridTop) this.y = gridTop + this.radius + 0.2;
			else this.y = gridBottom - this.radius -0.2;
			this.dy = -this.dy * this.elasticity;
		}
	}
}

// Create the ball at the center of the 0,0 cell
let ball1 = new Ball(
	offsetX + cellSize / 2,
	offsetY + cellSize / 2,
	cellSize / 2.5,
	0,
	0,
	ballColor1,
	"1"
);
grid[0][0].color = startColor1;
grid[rowCount - 1][colCount - 1].color = endColor1;
grid[rowCount - 1][colCount - 1].number = "1";


// Create a second ball at the center of the colCount-1, 0 cell
let ball2;
if (secondBall) {
	grid[rowCount - 1][0].color = endColor2;
	grid[0][colCount - 1].color = startColor2;
	grid[rowCount - 1][0].number = "2";
	ball2 = new Ball(
		offsetX + (colCount - 1) * cellSize + cellSize / 2,
		offsetY + cellSize / 2,
		cellSize / 2.5,
		0,
		0,
		ballColor2,
		"2"
	);
}

///// Functions /////

// Function to create the initial grid
function createGrid() {
	var grid = [];
	for (var i = 0; i < rowCount; i++) {
		var row = [];
		for (var j = 0; j < colCount; j++) {
			row.push({
				isWall: true,
				visited: false,
				color: wallColor,
				x: j,
				y: i,
				number: null,
			});
		}
		grid.push(row);
	}
	return grid;
}

// Function to generate the maze using depth-first search
function generateMaze(x, y) {
	let dir = [
		[0, 1],
		[0, -1],
		[-1, 0],
		[1, 0],
	];
	dir.sort(() => Math.random() - 0.5);

	for (let i = 0; i < dir.length; i++) {
		const nx = x + dir[i][0] * 2;
		const ny = y + dir[i][1] * 2;

		if (nx >= 0 && nx < colCount && ny >= 0 && ny < rowCount && grid[ny][nx].isWall) {
			grid[y + dir[i][1]][x + dir[i][0]].isWall = false;
			grid[y + dir[i][1]][x + dir[i][0]].color = pathColor;
			grid[ny][nx].isWall = false;
			grid[ny][nx].color = pathColor;
			generateMaze(nx, ny);
		}
	}
}

// Function to draw the grid
function drawGrid() {
	canvas.style.transform = "rotate(" + angle + "deg)";

	const offsetX = (width - colCount * cellSize) / 2;
	const offsetY = (height - rowCount * cellSize) / 2;

	for (var i = 0; i < rowCount; i++) {
		for (var j = 0; j < colCount; j++) {
			ctx.beginPath();
			ctx.rect(offsetX + j * cellSize, offsetY + i * cellSize, cellSize, cellSize);
			ctx.fillStyle = grid[i][j].color;
			ctx.fill();
			ctx.closePath();

			if (grid[i][j].number && secondBall) {
				ctx.fillStyle = "white"; // Color of the number
				ctx.font = "16px Arial"; // Font size and family
				ctx.textAlign = "center"; // Center align the text
				ctx.textBaseline = "middle"; // Align text vertically at the middle
				ctx.fillText(grid[i][j].number, offsetX + j * cellSize + cellSize / 2, offsetY + i * cellSize + cellSize / 2);
			}
		}
	}
}

// Function to check for collisions between the ball and a cell
function ballCellCollision(ball, cell) {
	// Calculate the boundaries of the cell
	const cellLeft = offsetX + cell.x * cellSize;
	const cellRight = cellLeft + cellSize;
	const cellTop = offsetY + cell.y * cellSize;
	const cellBottom = cellTop + cellSize;

	// Find the closest point to the ball within the cell
	const closestX = Math.max(cellLeft, Math.min(ball.x, cellRight));
	const closestY = Math.max(cellTop, Math.min(ball.y, cellBottom));

	// Calculate the distance between the ball's center and this closest point
	const dx = ball.x - closestX;
	const dy = ball.y - closestY;
	const distance = Math.sqrt(dx * dx + dy * dy);

	// If the distance is less than the ball's radius, there's a collision
	if (distance < ball.radius) {
		// Determine which edge of the cell the ball has collided with
		const distX = Math.abs(ball.x - cellLeft - cellSize / 2);
		const distY = Math.abs(ball.y - cellTop - cellSize / 2);

		if (distX > distY) {
			// Collision with left or right edge
			if (ball.x < cellLeft + cellSize / 2) {
				ball.x = cellLeft - ball.radius;
			} else {
				ball.x = cellRight + ball.radius;
			}
			ball.dx = -ball.dx * ball.elasticity;
		} else {
			// Collision with top or bottom edge
			if (ball.y < cellTop + cellSize / 2) {
				ball.y = cellTop - ball.radius;
			} else {
				ball.y = cellBottom + ball.radius;
			}
			ball.dy = -ball.dy * ball.elasticity;
		}
	}
}

// Function to check for collisions between the ball and the grid
function checkCollision(ball) {
	// Calculate the cell in which the ball is currently located
	var ballCellX = Math.floor((ball.x - offsetX) / cellSize);
	var ballCellY = Math.floor((ball.y - offsetY) / cellSize);

	// Define the range of cells to check for collisions
	var startRow = Math.max(0, ballCellY - 1);
	var endRow = Math.min(rowCount - 1, ballCellY + 1);
	var startCol = Math.max(0, ballCellX - 1);
	var endCol = Math.min(colCount - 1, ballCellX + 1);

	// Check the cells within the defined range for collisions
	for (var i = startRow; i <= endRow; i++) {
		for (var j = startCol; j <= endCol; j++) {
			if (grid[i][j].isWall) {
				ballCellCollision(ball, grid[i][j]);
			}
		}
	}
}

// Function to check if the ball has reached the end of the maze
function mazeCompleted() {
	if(secondBall){
		if(!ball1Finished && ball1.x > offsetX + (colCount - 1) * cellSize - ball1.radius && ball1.y > offsetY + (rowCount - 1) * cellSize - ball1.radius){
			ball1Finished = true;
		}
		if(!ball2Finished && ball2.x > offsetX + (colCount - 1) * cellSize - ball2.radius && ball2.y > offsetY + (rowCount - 1) * cellSize - ball2.radius){
			ball2Finished = true;
		}

		if(ball1Finished && ball2Finished && !mazeCompletedCheck){
			startAnimation();

			// Increment the stage or loop back to the first stage if at the end
			stage = (stage + 1) % stages.length;
			localStorage.setItem("currentStage", stage);

			// Display the next button
			nextButton.style.display = "block";

			mazeCompletedCheck = true;
		}
	} else if (
		!mazeCompletedCheck &&
		ball1.x > offsetX + (colCount - 1) * cellSize - ball1.radius &&
		ball1.y > offsetY + (rowCount - 1) * cellSize - ball1.radius
	) {
		startAnimation();

		// Increment the stage or loop back to the first stage if at the end
		stage = (stage + 1) % stages.length;
		localStorage.setItem("currentStage", stage);

		// Display the next button
		nextButton.style.display = "block";

		mazeCompletedCheck = true;
	}

	if (mazeCompletedCheck) {
		ctx.save();
		ctx.translate(width / 2, height / 2);
		ctx.rotate((-angle * Math.PI) / 180);
		ctx.font = "40px Arial";
		ctx.fillStyle = "white";
		ctx.fillText("Maze Completed!", -150, 0);
		ctx.restore();
	}
}

function resetMaze() {
	// Reset variables
	rotateLeft = false;
	rotateRight = false;
	angle = 0;
	gravity = Math.abs(gravity);
	mazeCompletedCheck = false;
	ball1Finished = false;
	ball2Finished = false;

	// Clear the interval if it's running
	if (intervalId) {
		clearInterval(intervalId);
		intervalId = null;
	}

	// Set the size of the maze grid based on the current stage
	rowCount = stages[stage][0];
	colCount = stages[stage][1];
	cellSize = Math.floor(size / (Math.sqrt(2) * rowCount));

	// Display the current stage
	stageDisplay.innerHTML = stage + 1 + " of " + (stages.length + 1);

	// Recalculate offsetX and offsetY
	offsetX = (width - colCount * cellSize) / 2;
	offsetY = (height - rowCount * cellSize) / 2;

	// Create a new grid
	grid = createGrid();

	// Generate a new maze
	generateMaze(Math.floor(rowCount / 2), Math.floor(colCount / 2));

  // Create a new ball at the center of the 0,0 cell
  ball1 = new Ball(offsetX + cellSize/2, offsetY + cellSize/2, cellSize/2.5, 0, 0, ballColor1);

  // Set start and end colors
  grid[0][0].color = startColor1;
  grid[rowCount - 1][colCount - 1].color = endColor1;

  stage > 11 ? (secondBall = true) : (secondBall = false);
		if (secondBall) {
			grid[rowCount - 1][0].color = endColor2;
			grid[0][colCount - 1].color = startColor2;
			grid[rowCount - 1][0].number = "2";
			ball2 = new Ball(
				offsetX + (colCount - 1) * cellSize + cellSize / 2,
				offsetY + cellSize / 2,
				cellSize / 2.5,
				0,
				0,
				ballColor2,
				"2"
			);
		}

	// Hide the next button
	nextButton.style.display = "none";
}

// Function to draw the grid and the ball
function draw() {
	ctx.clearRect(0, 0, width, height);

	drawGrid();

	ball1.update();

  if (secondBall) {
    ball2.update();

    var dx = ball1.x - ball2.x;
    var dy = ball1.y - ball2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if(distance < ball1.radius + ball2.radius) {
        ballCollide(ball1, ball2);
    }
  }

	mazeCompleted();

	requestAnimationFrame(draw);
}

draw();
