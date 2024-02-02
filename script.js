const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Make sure the canvas is a square
const size = Math.min(window.innerWidth, window.innerHeight);
var width = canvas.width = size;
var height = canvas.height = size;

const rowCount = 40;
const colCount = 40;
const cellSize = Math.floor(size / rowCount);

width = canvas.width = cellSize * colCount;
height = canvas.height = cellSize * rowCount;

function draw (){
  requestAnimationFrame(draw);
}

draw();