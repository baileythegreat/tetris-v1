// Variables
let shapes = [];
let currentShape;
let colors = ["white", "orange", "red", "yellow", "blue"];
let occupiedBlocks = [];    // Blocks with dataset of 2 are set
let state = 1;      // 1 = running, 0 = paused, 2 = game over
let score = 0;
let width = 10;
let height = 22;
let center = Math.floor(width / 2) - 1;
let move = 0;
let direction = "";     // Set event listeners for "down" "right" "left" key events


// Define pieces
let tetrimino = {
    square: [ [0, 0], [1, 0], [0, -1],  [1, -1] ],
    straight: [ [0, -3], [0, -2], [0, -1], [0, 0] ],
    tBlock: [ [0, 0], [1, 0], [1, -1], [2, 0] ],
    sBlock: [ [0, 0], [1, 0], [1, -1], [2, -1] ],
    zBlock: [ [0, -1], [1, 0], [1, -1], [2, 0] ],
    jBlock: [ [0, 0], [0, -1], [1, 0], [2, 0] ],
    lBlock: [ [0, 0], [1, 0], [2, 0], [2, -1] ],

    createPieces: function() {
        shapes.push(tetrimino.square);
        shapes.push(tetrimino.straight);
        shapes.push(tetrimino.tBlock);
        shapes.push(tetrimino.sBlock);
        shapes.push(tetrimino.zBlock);
        shapes.push(tetrimino.jBlock);
        shapes.push(tetrimino.lBlock);
    }
}

// Create board
function createBoard() {
    let board = document.getElementById("game-board");
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
            if (y === 21) {
                block.dataset.state = 2;
                row.style.display = "none";
            } else if (y === -1 ) {
                // row.style.display = "none";
            } else {
                block.dataset.state = 0; // Determines block states (set, moving, etc.)
            }
            block.innerHTML = x + ":" + y;
            row.appendChild(block);
            counter++;
        }
        board.appendChild(row);
    }
}

// Generates a random shape
function getRandomShape() {
    let i = Math.floor(Math.random() * Math.floor(shapes.length));
    let shape  = {
        shape:  shapes[i],
        color: colors[Math.floor(Math.random() * Math.floor(colors.length))]
    }
    currentShape = shape;
}

function displayPiece() {
    // Clears blocks
    clearBlocks();

    let blocks = document.querySelectorAll(".block");
    let length = blocks.length;
    let piece = {
        shape: currentShape.shape,
        color: currentShape.color
    }
    let shape = piece.shape;

    let directionShift = false;
    if (direction === "down") {
        // location[1] += 1;
    } else if (direction === "left") {
        directionShift = true;
        if (center !== 0 && !detectCollision.detectLeft()) {         // Detect edge or pieces to the left
            center -= 1;
        }
    } else if (direction === "right") {
        directionShift = true;
        let hitWall = false;
        for (let i = 0; i < shape.length; i++) {        // Detect if block is next to wall
            let x = shape[i][0];
            x += center;
            if (x === 9) {
                hitWall = true;
            }
        }
        if (hitWall === false && !detectCollision.detectRight()) {          // Detect edge or pieces to the right
            center += 1;
        }
    }

    // Checks if a collision occurs by moving the current block
    let collision = false;
    if (detectCollision.detectBottom()) {
        collision = true;
    }

    // Parses through blocks in current shape
    // Add current center and move positioning to each block's coordinates in the shape
    for (let i = 0; i < shape.length; i++) {
        let shapeBlock = shape[i];
        let x = shapeBlock[0];
        let y = shapeBlock[1];
        x += center;
        if (!collision) {
            y += move;
        } else if (collision && directionShift) {
            y += move;
        } else {
            y += (move - 1);
        }
        // Parses through all blocks on the board
        for (let k = 0; k < length; k++) {
            // Checks for block coordinates on the board
            if (parseInt(blocks[k].dataset.x) === x && parseInt(blocks[k].dataset.y) === y) {
                let block = blocks[k];
                if (collision) {
                    if (y === 0) {
                        resetBlocks();
                        return;
                    } else {
                        block.dataset.state = 2;
                        occupiedBlocks.push(block);
                    }
                } else {
                    block.dataset.state = 3;
                }
                block.style.backgroundColor = piece.color;
            }
        }
    }
    if (collision) {
        resetShape();
        center = Math.floor(width / 2) - 1;
    }
    direction = "";
}

let detectCollision = {
    // Input (x, y) coordinates to shift the shape's position and detect if any existing blocks are there
    getShape: function(x, y) {
        let shape = [];
        let blocks = document.querySelectorAll(".block");
        let length = blocks.length;
        // Retrieves the current shape
        for (let k = 0; k < length; k++) {
            let block = blocks[k];
            if (block.dataset.state === "1") {
                shape.push(block);
            }
        }
        // Parses through shape and retrieves coordinates for each block
        for (let i = 0; i < shape.length; i++)  {
            let shapeBlock = shape[i];
            let coordX = parseInt(shapeBlock.dataset.x);
            let coordY = parseInt(shapeBlock.dataset.y);
            coordX += x;        // Adds or subtracts horizontal coordinates to check sides
            coordY += y;        // Adds vertical coordinates to check coordinates below

            // Checks each altered block coordinate
            for (let k = 0; k < length; k++) {
                if (parseInt(blocks[k].dataset.x) === coordX && parseInt(blocks[k].dataset.y) === coordY) {
                    let block = blocks[k];
                    if (block.dataset.state === "2") {
                        return true;
                    }
                }
            }
        }
        return false
    },
    // Checks if a collision will occur on the level beneath the current shape
    detectBottom: function() {
        return detectCollision.getShape(0, 1);
    },
    // Checks if a collision will occur to the right of any of the shape's current blocks
    detectLeft: function() {
        return detectCollision.getShape(-1, 0);
    },
    // Checks if a collision will occur to the left of any of the shape's current blocks
    detectRight: function() {
        return detectCollision.getShape(1, 0);
    }
}

// Listen for arrow key user inputs
 function setUpEventListeners() {
     document.addEventListener("keydown", function(event) {
         if (event.which === 37) {
             direction = "left";
             displayPiece();
         } else if (event.which === 39) {
             direction = "right";
             displayPiece();
         } else if (event.which === 40) {
             direction = "down";
             displayPiece();
         } else if (event.which === 38) {
             // inverseShape();      // Need to cycle through shape directions in this case with a new function
         }
     })
 }

function clearBlocks() {
    let blocks = document.querySelectorAll(".block");
    let length = blocks.length;

    for (i = 0; i < length; i++) {
        let block = blocks[i];
        if (block.dataset.state === "3") {
            block.dataset.state = 1;
            block.removeAttribute("style");
        } else if (block.dataset.state === "1") {
            block.dataset.state = 0;
        }
    }
}

function resetShape() {
    move = 0;
    getRandomShape();
}

function resetBlocks() {
    alert("Sorry, you lost!");
    // Clears all currently occupied blocks
    for (let i = 0; i < occupiedBlocks.length; i ++) {
        occupiedBlocks[i].dataset.state = 0;
        occupiedBlocks[i].removeAttribute("style");
    }
    occupiedBlocks = [];
}

function moveDown() {
    move++;
    displayPiece();
}

function runWithDebugger(ourFunction) {
    debugger;
    ourFunction();
}

createBoard();
tetrimino.createPieces();
getRandomShape();
setUpEventListeners();
// setInterval (moveDown, 200);
