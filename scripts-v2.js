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
        shape: [ [0, 0], [-1, 0], [0, -1], [1, -1] ],
        state: 0
    },
    zBlock: {
        name: "zBlock",
        shape: [ [0, 0], [1, 0], [0, -1], [-1, -1] ],
        state: 0
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

// Initializes the game
createBoard();
tetrimino.createPieces();
getRandomShape();









let displayPiece = {

    movePiece: function(collision, positionAdjust) {
        let blocks = board.scan();
        let shape = currentShape.shape.shape;
        let color = currentShape.color;
        let adj = positionAdjust;       // Accounts for weird behavior with walls and inverting
        if (positionAdjust === undefined) {
            adj = 0;
        }

        // Runs when no blocks are present below current shape
        if (!collision) {
            // Clears blocks
            clear.clearBlocks();
            // Parses through blocks in current shape
            shape.forEach(function(i) {
                let shapeBlock = i;
                let x = shapeBlock[0];
                let y = shapeBlock[1];
                // Add current center and move positioning to each block's coordinates in the shape
                x += (center + adj);
                y += move;

                // Parses through all blocks on the board
                blocks.forEach(function(k) {
                    let block = k;
                    // Checks for block coordinates on the board
                    if (parseInt(block.dataset.x) === x && parseInt(block.dataset.y) === y) {
                        block.dataset.state = 3;
                        block.style.backgroundColor = color;
                    }
                })
            })
        } else if (collision) {     // Runs when existing blocks are detected beneath current shape
            let finalShape = [];
            // Parse through all blocks on board
            blocks.forEach(function(i) {
                let block = i;
                if (block.dataset.state === "3") {
                    finalShape.push(block);
                }
            })
            finalShape.forEach(function(i) {
                let block = i;
                if (block.dataset.y === "-1") {
                    clear.clearBlocks();
                    clear.resetBlocks();
                    return;
                } else {
                    block.dataset.state = 2;
                    block.style.backgroundColor = color;
                    occupiedBlocks.push(block);
                }
            })
            center = Math.floor(width / 2) - 1;
            clear.resetShape();
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
        // let max = [];
        // let adj = 0;
        // let right = false;
        // let left = false;
        // let shape = currentShape.shape.shape;
        // for (let i = 0; i < shape.length; i++) {        // Detect if horizontal adjustments are needed due to inverting
        //         let x = shape[i][0];
        //         if ( (x + center) > 9 ) {
        //             max.push(x);
        //             right = true;
        //         } else if ( (x + center) < 0 ) {
        //             max.push(x)
        //             left = true;
        //         }
        // }
        // if (max.length > 0) {
        //     adj = Math.max(...max);
        // }
        //
        // if (right === true) {
        //     displayPiece.movePiece(collision, -adj);
        // } else if (left === true) {
        //     displayPiece.movePiece(collision, adj);
        // }

        displayPiece.movePiece(collision, undefined);

    }

}













let invertShape = {

    // board.locatePiece()

    // function (0) (parameter: adjustment)
        // Invert the piece

    // function(1) (parameter: adjustment)
        // board.locatePiece() - find current piece
        // Return where piece would be if inverted once

    // function (2) (parameter: location)
        // Determine if any pieces exists at an input location
            // Return true or false
    // function(3) (parameter: location)
        // Determine if the input piece is on the left wall
            // Return true or false
    // function(4) (parameter: location)
        // Determine if the input piece is on the right wall
                // Return true or false
    // function(5) (parameter: location)
        // Determine if the input piece is at the bottom
                // Return true or false

    // function(6)
        // board.locatePiece() - find current piece
        // function(1) - figure out where the piece will be once inverted

        // Run inverted piece through function (2)
            // If function(2) === true
                // Don't invert
            // Else
                // Run current piece through functions (3, 4, & 5)

                    // If function(3) === true  (piece on left wall)
                        // Run inverted piece through function(3)
                            // If the inverted piece is not on the left wall
                                // Call function(0) to invert the piece, but shift it over to the left by one
                                // Display the piece
                            // Else if the inverted piece goes through the wall
                                // Determine how far the piece is "out of bounds" (adj)
                                    // Call function(1) and adjust it to the right by adj
                                        // If function(1) still returns false
                                            // Call function(0) to invert the piece, shift it to the right by adj
                                            // Display the piece
                                        // Else don't invert piece

                    // Else If function(4) === true (piece on right wall)
                        // Run inverted piece through function(3)
                            // If the inverted piece is not on the right wall
                                // Call function(0) to invert the piece, but shift it over to the right by one
                                // Display the piece
                            // Else if the inverted piece goes through the right wall
                                // Determine how far the piece is "out of bounds" (adj)
                                    // Call function(1) and adjust it to the left by adj
                                        // If function(1) still returns false
                                        // Call function(0) to invert the piece, shift it to the left by adj
                                        // Display the piece

                    // If function(5) === true (piece on bottom)









    invert: function() {
        let shape = currentShape.shape.shape;
        let shapeName = currentShape.shape.name;
        let state = currentShape.shape.state;   // For s and z blocks
        let hitLeft = false;
        let hitRight = false;
        let max = 1;

        for (let i = 0; i < shape.length; i++) {
            let x = shape[i][0];
            let y = shape[i][1];

            // Alter shape coordinates to inverse shapes
            if (shapeName === "square") {
                return;
            } else if (shapeName === "straight") {
                shape[i][0] = -y;
                shape[i][1] = -x;
                max = 2;
            } else if (shapeName === "sBlock" || shapeName === "zBlock") {
                if (state === 0) {
                    if (y === 0) {
                        shape[i][0] = y;
                        shape[i][1] = x;
                    } else {
                        shape[i][0] = -y;
                        shape[i][1] = x;
                    }
                } else if (state === 1) {
                    if (x === 0) {
                        shape[i][0] = y;
                        shape[i][1] = x;
                    } else {
                        shape[i][0] = y;
                        shape[i][1] = -x;
                    }
                }
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

        if (shapeName === "sBlock" || shapeName === "zBlock") {
            if ( state === 0 ) {
                currentShape.shape.state = 1;
            } else if ( state === 1 ) {
                currentShape.shape.state = 0;
            }
        }

        if (hitLeft) {
            // center++;       // Adjusts shape position if left wall will be hit
            displayPiece.movePiece(undefined, 1);
            // center--;
        } else if (hitRight) {
            // center -= max;       // Adjusts shape position if right wall will be hit
            displayPiece.movePiece(undefined, -max);
            // center += max;
        } else {
            displayPiece.movePiece(undefined, undefined);
        }
    },

}












let detectCollision = {
    // Input (x, y) coordinates to shift the shape's position and detect if any existing blocks are there
    getShape: function(x, y) {
        let blocks = board.scan();
        let shape = board.locatePiece();
        // Parses through shape and retrieves coordinates for each block
        for (let i = 0; i < shape.length; i++)  {
            let shapeBlock = shape[i];
            let coordX = parseInt(shapeBlock.dataset.x);
            let coordY = parseInt(shapeBlock.dataset.y);
            coordX += x;        // Adds or subtracts horizontal coordinates to check sides
            coordY += y;        // Adds vertical coordinates to check coordinates below

            // Checks each altered block coordinate
            for (let k = 0; k < blocks.length; k++) {
                let block = blocks[k];
                if (parseInt(block.dataset.x) === coordX && parseInt(block.dataset.y) === coordY) {
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

let board = {
    // Returns an array of every block in the board
    scan: function() {
        let blocks = document.querySelectorAll(".block");
        return blocks;
    },
    // Returns an array containing all blocks of active piece
    locatePiece: function() {
        let piece = [];
        let blocks = board.scan();
        let length = blocks.length;

        // Retrieves the current piece
        for (let i = 0; i < length; i++) {
            let block = blocks[i];
            if (block.dataset.state === "3") {
                piece.push(block);
            }
        }
        return piece;
    }
}

let clear = {

    clearBlocks: function() {
        let blocks = board.scan();
        let length = blocks.length;

        blocks.forEach(function(x) {
            let block = x;
            if (block.dataset.state === "3") {
                block.dataset.state = 1;
                block.removeAttribute("style");
            } else if (block.dataset.state === "1") {
                block.dataset.state = 0;
            }
        })
    },

    resetShape: function() {
        move = 0;
        getRandomShape();
    },

    resetBlocks: function() {
        alert("Sorry, you lost!");
        state = 2;
        // Clears all currently occupied blocks
        for (let i = 0; i < occupiedBlocks.length; i++) {
            occupiedBlocks[i].dataset.state = 0;
            occupiedBlocks[i].removeAttribute("style");
        }
        occupiedBlocks = [];
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

function moveDown() {
    displayPiece.moveDown();
}

function runWithDebugger(ourFunction) {
    debugger;
    ourFunction();
}

setUpEventListeners();
// setInterval (moveDown, 200);
