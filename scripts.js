
// Variables
let shapes = [];
let currentShape;
let currentColor;
let occupiedBlocks = [];    // Blocks with dataset of 2 are set
let colors = ["white", "orange", "red", "yellow", "blue"];
let state = 1;      // 1 = running, 0 = paused, 2 = game over
let score = 0;
let width = 10;
let height = 20;
let move = 0;
let direction = "";     // Set event listeners for "down" "right" "left" key events

// Define shapes
let tetrimino = {
    square: [ [0, 0], [1, 0], [0, -1],  [1, -1] ],
    straight: [ [-1, -1], [0, -1], [1, -1], [2, -1] ],
    tBlock: [ [0, 0], [1, 0], [1, -1], [2, 0] ],
    sBlock: [ [0, 0], [1, 0], [1, -1], [2, -1] ],
    zBlock: [ [0, -1], [1, 0], [1, -1], [2, 0] ],
    jBlock: [ [0, 0], [0, -1], [1, 0], [2, 0] ],
    lBlock: [ [0, 0], [1, 0], [2, 0], [2, -1] ]
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
    // Create rows of game board
    for (let y = -1; y < height; y++ ) {
        let row = document.createElement("div");
        row.className = "row";
        row.dataset.row = y;
        // Create individual blocks within the row
        for (let x = 0; x < width; x++) {
            let block = document.createElement("div");
            block.className = "block";
            block.dataset.x = x;
            block.dataset.y = y;
            block.dataset.index = counter;
            block.dataset.state = 0; // Determines block states (set, moving, etc.)
            row.appendChild(block);
            counter++;
        }
        board.appendChild(row);
    }
}

// Sets a random shape
function getRandomShape(max) { // Pass in shapes.length to get random shape w/in shapes array
    let i = Math.floor(Math.random() * Math.floor(max));
    currentShape = shapes[i];
    currentColor = colors[Math.floor(Math.random() * Math.floor(colors.length))];
}

// Displays current shape on the board
function displayShape() {
    let center = Math.floor(width / 2) - 1;
    let location = [center, move];

    // Tracks offset in cases of key enter events
    if (direction === "down") {
        move += 1;
    } else if (direction === "left") {
        center -= 1;
    } else if (direction === "right") {
        center += 1;
    }

    // Clears current displayed block
    clearBlocks();

    // Creates the current shape
    let selectedShape = {
        shape: currentShape,
        color: currentColor
    }

    // Finds the correct blocks to match current shape and changes its background color
    for (let i = 0; i < selectedShape.shape.length; i++) {
        let x = selectedShape.shape[i][0];
        x += location[0];
        let y = selectedShape.shape[i][1];
        y += location[1];

        let xBlocks = document.querySelectorAll("[data-x = '" + x + "']");
        for (let k = 0; k < xBlocks.length; k++) {
            if (parseInt(xBlocks[k].dataset.y) === y) {
                let block = xBlocks[k];
                block.dataset.state = 1;    // Indicates that block is occupied
                block.style.backgroundColor = selectedShape.color;
                break;
            }
        }
    }
    move++;
}
// Clears current blocks
function clearBlocks() {
    let blocks = document.querySelectorAll(".block");
    let lengthBlocks = blocks.length;

    for (let i = 0; i < lengthBlocks; i++) {
        if (parseInt(blocks[i].dataset.state) === 1) {
            let block = blocks[i];
            block.dataset.state = 0;
            block.removeAttribute("style");
        }
    }
}

function resetShape() {
    move = 0;
    getRandomShape(shapes.length);
}

createShapes();
createBoard();
getRandomShape(shapes.length);
// setInterval(displayShape, 1000);
