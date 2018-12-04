
// Variables
let shapes = [];
let currentShape;
let occupiedBlocks = [];
let colors = ["white", "orange", "red", "yellow", "blue"];
let state = 1;  // 1 = running, 0 = paused, 2 = game over
let score = 0;
let width = 10;
let height = 20;
let move = 0;
let direction = "";
// Define shapes
let tetrimino = {
    square: [ [0, 0], [1, 0], [0, 1],  [1, 1] ],
    straight: [ [0, 0], [1, 0], [2, 0], [3, 0] ],
    tBlock: [ [0, 0], [1, 0], [1, 1], [2, 0] ],
    sBlock: [ [0, 0], [1, 0], [1, 1], [2, 1] ],
    zBlock: [ [0, 1], [1, 0], [1, 1], [0, 2] ],
    jBlock: [ [0, 0], [0, 1], [1, 0], [2, 0] ],
    lBlock: [ [0, 0], [1, 0], [2, 0], [2, 1] ]
}

//  Add shapes to shapes array
function createShapes() {
        shapes.push(tetrimino.square),
        shapes.push(tetrimino.straight);
        shapes.push(tetrimino.tBlock);
        shapes.push(tetrimino.sBlock);
        shapes.push(tetrimino.zBlock);
        shapes.push(tetrimino.jBlock);
        shapes.push(tetrimino.lBlock);
}

// Create board
let board = document.getElementById("game-board");
function createBoard() {
    let counter = 0;
    for (let y = 0; y < height; y++ ) {
        let row = document.createElement("div");
        row.className = "tet-row row";
        row.dataset.row = y;

        for (let x = 0; x < width; x++) {
            let col = document.createElement("div");
            col.className = "tet-col col";
            col.dataset.x = x;
            col.dataset.y = y;
            col.dataset.index = counter;
            col.dataset.state = 0;
            row.appendChild(col);
            counter++;
        }

        board.appendChild(row);
    }
}

// Sets a random shape
function getRandomShape(max) { // Pass in shapes.length to get random shape w/in shapes array
    let i = Math.floor(Math.random() * Math.floor(max));
    console.log(i);
    currentShape = shapes[i];
}

createShapes();
createBoard();
