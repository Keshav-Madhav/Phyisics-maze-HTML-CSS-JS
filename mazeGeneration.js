function createGrid(rowCount, colCount) {
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

// Start the maze generation with an initial cell
generateMaze(Math.floor(rowCount/2), Math.floor(colCount/2));