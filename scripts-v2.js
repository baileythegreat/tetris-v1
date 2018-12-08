// Variables
let shapes = [];
let currentShape;
let colors = ["white", "orange", "red", "yellow", "blue"];
let occupiedBlocks = [];    // Blocks with dataset of 2 are set
let state = 1;      // 1 = running, 0 = paused, 2 = game over
let score = 0;
let width = 10;
let height = 22;
let center = Math.floor(width / 2);
let move = 0;

// Define pieces
let tetrimino = {
    square: {
        name: "square",
        shape: [ [0, 0], [1, 0], [0, -1],  [1, -1] ]
    },
    straight: {
        name: "straight",
        shape: [ [0, -2], [0, -1], [0, 0], [0, 1] ]
    },
    tBlock: {
        name: "tBlock",
        shape: [ [0, 0], [1, 0], [-1, 0], [0,-1] ]
    },
    sBlock: {
        name: "sBlock",
        shape: [ [0, 0], [-1, 0], [0, -1], [1, -1] ]
    },
    zBlock: {
        name: "zBlock",
        shape: [ [0, 0], [1, 0], [0, -1], [-1, -1] ]
    },
    jBlock: {
        name: "jBlock",
        shape: [ [0, 0], [-1, 0], [1, 0], [-1, -1] ]
    },
    lBlock: {
        name: "lBlock",
        shape: [ [0, 0], [-1, 0], [1, 0], [1, -1] ]
    },

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

createBoard();
tetrimino.createPieces();
getRandomShape();

let displayPiece = {

    movePiece: function(collision) {
        let blocks = document.querySelectorAll(".block");
        let length = blocks.length;
        let shape = currentShape.shape.shape;
        let color = currentShape.color;

        // Runs when no blocks are present below current shape
        if (!collision) {
            // Clears blocks
            clearBlocks();
            // Parses through blocks in current shape
            // Add current center and move positioning to each block's coordinates in the shape
            for (let i = 0; i < shape.length; i++) {
                let shapeBlock = shape[i];
                let x = shapeBlock[0];
                let y = shapeBlock[1];
                x += center;
                y += move;

                // Parses through all blocks on the board
                for (let k = 0; k < length; k++) {
                    // Checks for block coordinates on the board
                    if (parseInt(blocks[k].dataset.x) === x && parseInt(blocks[k].dataset.y) === y) {
                        let block = blocks[k];
                        block.dataset.state = 3;
                        block.style.backgroundColor = color;
                        break;
                    }
                }
            }
        } else if (collision) {     // Runs when existing blocks are detected beneath current shape
            let finalShape = [];
            // Parse through all blocks on board
            for (let i = 0; i < length; i++) {
                let block = blocks[i];
                if (block.dataset.state === "3") {
                    finalShape.push(block);
                }
            }

            for (let i = 0; i < finalShape.length; i++) {
                let block = finalShape[i];
                if (block.dataset.y === "-1") {
                    clearBlocks();
                    resetBlocks();
                    return;
                } else {
                    block.dataset.state = 2;
                    block.style.backgroundColor = color;
                    occupiedBlocks.push(block);
                }
            }
            center = Math.floor(width / 2) - 1;
            resetShape();
        }
    },

    moveLeft: function() {
        let hitWall = false;
        let shape = currentShape.shape.shape;
        for (let i = 0; i < shape.length; i++) {        // Detect if any block is next to wall
            let x = shape[i][0];
            x += center;
            if (x === 0) {
                hitWall = true;
            }
        }
        if (!hitWall && !detectCollision.detectLeft()) {         // Detect edge or pieces to the left
            center -= 1;
        displayPiece.movePiece();
        }
    },

    moveRight: function() {
        let hitWall = false;
        let shape = currentShape.shape.shape;
        for (let i = 0; i < shape.length; i++) {        // Detect if any block is next to wall
            let x = shape[i][0];
            x += center;
            if (x === 9) {
                hitWall = true;
            }
        }
        if (!hitWall && !detectCollision.detectRight()) {          // Detect edge or pieces to the right
            center += 1;            // Shifts all blocks in piece to the right by one
        }
        displayPiece.movePiece();
    },

    moveDown: function() {
        // Checks if a collision occurs by moving the current block
        let collision = false;
        if (detectCollision.detectBottom()) {
            collision = true;
        } else {
            move++;
        }
        displayPiece.movePiece(collision);
    }

}

let invertShape = {

    invert: function() {
        let shape = currentShape.shape.shape;
        let shapeName = currentShape.shape.name;
        let hitLeft = false;
        let hitRight = false;

        for (let i = 0; i < shape.length; i++) {
            let x = shape[i][0];
            let y = shape[i][1];

            if (shapeName === "square") {
                return;
            } else if (shapeName === "straight") {
                shape[i][0] = -y;
                shape[i][1] = -x;
            } else {
                if (y === 0) {
                    shape[i][0] = y;
                    shape[i][1] = x;
                } else {
                    shape[i][0] = -y;
                    shape[i][1] = x;
                }
            }
            if ((shape[i][0] + center) < 0) {       // Checks if inverting the object will hit left wall
                hitLeft = true;
            } else if ((shape[i][0] + center) > 9) {     // Checks if inverting the object will hit right wall
                hitRight = true;
            }
        }
        if (hitLeft) {
            center++;       // Adjusts shape position if left wall will be hit
        } else if (hitRight) {
            center--;       // Adjusts shape position if right wall will be hit
        }
        displayPiece.movePiece();
    }
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
            if (block.dataset.state === "3") {
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
             displayPiece.moveLeft();
         } else if (event.which === 39) {
             displayPiece.moveRight();
         } else if (event.which === 40) {
             displayPiece.moveDown();
         } else if (event.which === 38) {
             invertShape.invert();
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
    displayPiece.moveDown();
}

function runWithDebugger(ourFunction) {
    debugger;
    ourFunction();
}


setUpEventListeners();
setInterval (moveDown, 200);
