const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Make sure the canvas is a square
const size = Math.min(window.innerWidth, window.innerHeight);
var width = canvas.width = size;
var height = canvas.height = size;

const rowCount = 21;
const colCount = 21;
const cellSize = Math.floor(size / (Math.sqrt(2) * rowCount));


let angle = 0;
const rotationSpeed = 0.01;
let rotateLeft = false;
let rotateRight = false;
let intervalId;

var grid = createGrid();

generateMaze(Math.floor(rowCount/2), Math.floor(colCount/2));

window.addEventListener('keydown', function(event) {
  switch (event.key) {
    case 'a':
      rotateLeft = true;
      break;
    case 'd':
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

window.addEventListener('keyup', function(event) {
  switch (event.key) {
    case 'a':
      rotateLeft = false;
      break;
    case 'd':
      rotateRight = false;
      break;
  }
  // Clear the interval when both keys are released
  if (!rotateLeft && !rotateRight) {
    clearInterval(intervalId);
    intervalId = null;
  }
});

function createGrid() {
  var grid = [];
  for (var i = 0; i < rowCount; i++) {
    var row = [];
    for (var j = 0; j < colCount; j++) {
      row.push({
        isWall: true,
        visited: false,
        x: j,
        y: i
      });
    }
    grid.push(row);
  }
  return grid;
}

// Maze generation using DFS
function generateMaze(x, y) {
  let dir = [[0, 1], [0, -1], [-1, 0], [1, 0]];
  dir.sort(() => Math.random() - 0.5);

  for (let i = 0; i < dir.length; i++) {
    const nx = x + dir[i][0]*2;
    const ny = y + dir[i][1]*2;

    if (nx >= 0 && nx < colCount && ny >= 0 && ny < rowCount && grid[ny][nx].isWall) {
      grid[y + dir[i][1]][x + dir[i][0]].isWall = false;
      grid[ny][nx].isWall = false;
      generateMaze(nx, ny);
    }
  }
}


function drawGrid() {
  ctx.translate(width / 2, height / 2);
  ctx.rotate(angle);
  ctx.translate(-width / 2, -height / 2);

  const offsetX = (width - colCount * cellSize) / 2;
  const offsetY = (height - rowCount * cellSize) / 2;

  for (var i = 0; i < rowCount; i++) {
    for (var j = 0; j < colCount; j++) {
      ctx.beginPath();
      ctx.rect(offsetX + j * cellSize, offsetY + i * cellSize, cellSize, cellSize);
      ctx.fillStyle = grid[i][j].isWall ? 'rgb(100,100,100)' : 'white';
      ctx.fill();
      ctx.closePath();
    }
  }
  
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function draw () {
  ctx.clearRect(0, 0, width, height);
  drawGrid();
  requestAnimationFrame(draw);
}

draw();