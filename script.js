///// Variable Declarations /////

// Get the canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set the size of the canvas
const size = Math.min(window.innerWidth, window.innerHeight);
var width = canvas.width = size;
var height = canvas.height = size;

// Set the size of the maze grid
const rowCount = 25;
const colCount = 25;
const cellSize = Math.floor(size / (Math.sqrt(2) * rowCount));

const offsetX = (width - colCount * cellSize) / 2;
const offsetY = (height - rowCount * cellSize) / 2;

// Initialize the rotation angle and speed
let angle = 0;
const rotationSpeed = 1;

// Flags to track whether the 'a' or 'd' key is being held down
let rotateLeft = false;
let rotateRight = false;

// ID of the interval for updating the rotation angle
let intervalId;

// initialize gravity
const gravity = 0.3;

// Generate the maze grid
var grid = createGrid();
generateMaze(Math.floor(rowCount/2), Math.floor(colCount/2));



///// Event Listeners /////


// Listen for keydown events
window.addEventListener('keydown', function(event) {
  switch (event.key) {
    case 'a':
      rotateLeft = true;
      break;
    case 'ArrowLeft':
      rotateLeft = true;
      break;
    case 'd':
      rotateRight = true;
      break;
    case 'ArrowRight':
      rotateRight = true;
      break;
  }
  // Start the interval when a key is pressed
  if (!intervalId) {
    intervalId = setInterval(function() {
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
window.addEventListener('keyup', function(event) {
  switch (event.key) {
    case 'a':
      rotateLeft = false;
      break;
    case 'ArrowLeft':
      rotateLeft = false;
      break;
    case 'd':
      rotateRight = false;
      break;
    case 'ArrowRight':
      rotateRight = false;
      break;
  }
  // Clear the interval when both keys are released
  if (!rotateLeft && !rotateRight) {
    clearInterval(intervalId);
    intervalId = null;
  }
});



///// Classes /////


class Ball {
  constructor(x, y, radius, dx, dy) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = dx;
    this.dy = dy;
    this.friction = 0.99;
    this.elasticity = 0.35;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
  }

  update() {
    this.draw();
  
    this.x += this.dx;
    this.y += this.dy;
  
    this.applyGravity();
  
    this.dx *= this.friction;
    this.dy *= this.friction;

    this.checkBounds();
  }

  applyGravity() {
    if (this.y + this.radius < height || this.dy < 0) {
      // Convert the angle from degrees to radians
      let rad = angle * Math.PI / 180;
      
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
      if(this.x - this.radius < gridLeft)
        this.x = gridLeft + this.radius;
      else
        this.x = gridRight - this.radius;

      this.dx = -this.dx * this.elasticity;
    }
  
    // Check if the ball is hitting the top or bottom boundary of the grid
    if (this.y - this.radius < gridTop || this.y + this.radius > gridBottom) {
      if(this.y - this.radius < gridTop)
        this.y = gridTop + this.radius;
      else
        this.y = gridBottom - this.radius;
      this.dy = -this.dy * this.elasticity;
    }
  }
}

// Create the ball at the center of the 0,0 cell
const ball = new Ball(offsetX + cellSize/2, offsetY + cellSize/2, cellSize/2.5, 0, 0);
grid[0][0].color = 'green';
grid[rowCount-1][colCount-1].color = 'blue';

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
        color: 'rgb(100,100,100)',
        x: j,
        y: i
      });
    }
    grid.push(row);
  }
  return grid;
}

// Function to generate the maze using DFS
function generateMaze(x, y) {
  let dir = [[0, 1], [0, -1], [-1, 0], [1, 0]];
  dir.sort(() => Math.random() - 0.5);

  for (let i = 0; i < dir.length; i++) {
    const nx = x + dir[i][0]*2;
    const ny = y + dir[i][1]*2;

    if (nx >= 0 && nx < colCount && ny >= 0 && ny < rowCount && grid[ny][nx].isWall) {
      grid[y + dir[i][1]][x + dir[i][0]].isWall = false;
      grid[y + dir[i][1]][x + dir[i][0]].color = 'white';
      grid[ny][nx].isWall = false;
      grid[ny][nx].color = 'white';
      generateMaze(nx, ny);
    }
  }
}

// Function to draw the grid
function drawGrid() {
  canvas.style.transform = 'rotate(' + angle + 'deg)';

  const offsetX = (width - colCount * cellSize) / 2;
  const offsetY = (height - rowCount * cellSize) / 2;

  for (var i = 0; i < rowCount; i++) {
    for (var j = 0; j < colCount; j++) {
      ctx.beginPath();
      ctx.rect(offsetX + j * cellSize, offsetY + i * cellSize, cellSize, cellSize);
      ctx.fillStyle = grid[i][j].color;
      ctx.fill();
      ctx.closePath();
    }
  }
}


// Function to draw the frame
function draw () {
  ctx.clearRect(0, 0, width, height);
  drawGrid();
  ball.update();

  for (var i = 0; i < rowCount; i++) {
    for (var j = 0; j < colCount; j++) {
      if (grid[i][j].isWall) {
        checkCollision(ball, grid[i][j]);
      }
    }
  }

  requestAnimationFrame(draw);
}

draw();

function checkCollision(ball, cell) {
  // Calculate the boundaries of the cell
  const cellLeft = offsetX + cell.x * cellSize;
  const cellRight = cellLeft + cellSize;
  const cellTop = offsetY + cell.y * cellSize;
  const cellBottom = cellTop + cellSize;

  // Check if the ball is within the cell's boundaries
  if (ball.x - ball.radius < cellRight && ball.x + ball.radius > cellLeft && 
      ball.y - ball.radius < cellBottom && ball.y + ball.radius > cellTop) {

    // Determine which edge of the cell the ball has collided with
    const distX = Math.abs(ball.x - cellLeft - cellSize/2);
    const distY = Math.abs(ball.y - cellTop - cellSize/2);

    if (distX > distY) {
      // Collision with left or right edge
      if (ball.x < cellLeft + cellSize/2) {
        ball.x = cellLeft - ball.radius;
      } else {
        ball.x = cellRight + ball.radius;
      }
      ball.dx = -ball.dx * ball.elasticity;
    } else {
      // Collision with top or bottom edge
      if (ball.y < cellTop + cellSize/2) {
        ball.y = cellTop - ball.radius;
      } else {
        ball.y = cellBottom + ball.radius;
      }
      ball.dy = -ball.dy * ball.elasticity;
    }
  }
}
