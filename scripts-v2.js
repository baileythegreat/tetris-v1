// Variables
let shapes = [];
let currentShape;
let colors = ["white", "orange", "red", "yellow", "blue"];
let occupiedBlocks = [];    // Blocks with dataset of 2 are set
let score = 0;
let level = 0;
let width = 10;
let height = 23;
let center = Math.floor(width / 2);
let move = 0;

// Define pieces
let tetrimino = {
    square: {
        name: "square",
        shape: [ [0, 0], [-1, 0], [0, -1],  [-1, -1] ]
    },
    straight: {
        name: "straight",
        shape: [ [-2, 0], [-1, 0], [0, 0], [1, 0] ]
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

// Create game board
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
            if (y === 22) {
                block.dataset.state = 2;
                row.style.display = "none";
            } else if (y === -1 || y === 0) {
                row.style.display = "none";
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

// Generates a random shape/color combo
function getRandomShape() {
    let i = Math.floor(Math.random() * Math.floor(shapes.length));

    const shape  = {
        shape:  shapes[i].shape,
        name: shapes[i].name,
        state: shapes[i].state,
        color: colors[Math.floor(Math.random() * Math.floor(colors.length))]
    }
    let shapeTemp = JSON.parse(JSON.stringify(shape));      // Deep copy the object to make original immutable
    currentShape = shapeTemp;
}

// Initializes the game
createBoard();
tetrimino.createPieces();
getRandomShape();

// Display the pieces as they move across the board
let display = {

    movePiece: function(collision, adj) {
        let blocks = board.scan();
        let shape = currentShape.shape;
        let color = currentShape.color;
        let adjustment = adj;
        if (adj === undefined) {
            adjustment = 0;
        }
        center += adjustment;
        // Runs when no blocks are present below current shape
        if (!collision) {
            clear.clearBlocks();
            shape.forEach(function(i) {     // Parses through all blocks in current shape
                let shapeBlock = i;
                let x = shapeBlock[0];
                let y = shapeBlock[1];
                x += center;     // Add current horizontal positioning
                y += move;                              // Add current vertical positioning

                blocks.forEach(function(k) {        // Parses through all blocks on the board
                    let block = k;
                    if (parseInt(block.dataset.x) === x && parseInt(block.dataset.y) === y) {
                        block.dataset.state = 3;            // Sets state to 3 (active)
                        block.style.backgroundColor = color;
                    }
                })
            })
        } else if (collision) {     // Runs when existing blocks are detected beneath current shape
            let finalShape = [];
            blocks.forEach(function(i) {
                let block = i;
                if (block.dataset.state === "3") {
                    finalShape.push(block);
                }
            })
            for (let i = 0; i < finalShape.length; i++) {
                let block = finalShape[i];
                if (block.dataset.y === "0" || block.dataset.y === "-1") {
                    clear.clearBlocks();
                    clear.resetBlocks();
                    return;
                } else {
                    block.dataset.state = 2;        // Sets block state to 2 (existing but not active)
                    block.style.backgroundColor = color;
                    occupiedBlocks.push(block);     // Stores blocks in occupied array
                }
            }
            clear.clearRow();
            clear.resetShape();
            board.updateScore();
        }
    },

    // Move all current set blocks down by however many rows were cleared
    shiftDown: function(clearedRow) {
        let floor = clearedRow;
        let rows = document.querySelectorAll(".row");   // Identify all the rows on the board
        let floorY = parseInt(floor.dataset.row);

        for (let i = floorY; i > 0; i--) {       // Loop through the rows starting at the one directly above the one that was cleared
            let row = rows[i];
            let blocks = row.childNodes;

            blocks.forEach(function(b) {        // Loop through each block in the row
                let block = b;

                if (block.dataset.state === "2") {
                    let boardBlocks = board.scan();
                    let x = parseInt(block.dataset.x);
                    let y = parseInt(block.dataset.y);
                    let color = block.style.backgroundColor;

                    block.dataset.state = 0;
                    block.removeAttribute("style");

                    y++;

                    for (let k = 0; k < boardBlocks.length; k++) {
                        let boardBlock = boardBlocks[k];

                        if (parseInt(boardBlock.dataset.x) === x && parseInt(boardBlock.dataset.y) === y) {
                            boardBlock.dataset.state = 2;
                            boardBlock.style.backgroundColor = color;
                            occupiedBlocks.push(boardBlock);
                        }
                    }
                }
            })
        }
    }
}

let manipulate = {

    moveDown: function() {
        // Checks if a collision occurs by moving the current block
        if (detect.detectBottom()) {
            display.movePiece(true);
        } else {
            move++;
            display.movePiece(false);
        }
    },

    moveRight: function() {
        if (!detect.hitRight() && !detect.detectRight()) {          // Detect edge or pieces to the right
            center += 1;    // Shift to the right
        }
        display.movePiece();
    },

    moveLeft: function() {
        if (!detect.hitLeft() && !detect.detectLeft()) {         // Detect edge or pieces to the left
            center -= 1;    // Shift to the left
        }
        display.movePiece();
    }

}

let invert = {

    // Invert the pieces
    invertShape: function() {
        let shape = currentShape.shape;
        let shapeName = currentShape.name;
        let state = currentShape.state;   // For s and z blocks

        for (let i = 0; i <  shape.length; i++) {
            let x = shape[i][0];
            let y = shape[i][1];

            // Alter shape coordinates to inverse shapes
            if (shapeName === "square") {
                return;
            } else if (shapeName === "straight") {
                shape[i][0] = -y;
                shape[i][1] = -x;
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
        }
        if (shapeName === "sBlock" || shapeName === "zBlock") {
            if ( state === 0 ) {
                currentShape.state = 1;
            } else if ( state === 1 ) {
                currentShape.state = 0;
            }
        }
    },

    // function(1) -- Return where piece would be if inverted once
    getInvertLocation: function(adjHor) {
        let shape = currentShape.shape;
        let shapeName = currentShape.name;
        let state = currentShape.state;   // For s and z blocks
        let invertedShape = [];

        for (let i = 0; i < shape.length; i++) {
            let x = shape[i][0];
            let y = shape[i][1];
            let z = x;

            // Alter shape coordinates to inverse shapes
            if (shapeName === "square") {
                return;
            } else if (shapeName === "straight") {
                x = -y;
                y = -z;
                max = 2;
                invertedShape.push([x, y]);
            } else if (shapeName === "sBlock" || shapeName === "zBlock") {
                if (state === 0) {
                    if (y === 0) {
                        x = y;
                        y = z;
                    } else {
                        x = -y;
                        y = z;
                    }
                } else if (state === 1) {
                    if (x === 0) {
                        x = y;
                        y = z;
                    } else {
                        x = y;
                        y = -z;
                    }
                }
                invertedShape.push([x, y]);
            } else {
                if (y === 0) {
                    x = y;
                    y = z;
                } else {
                    x = -y;
                    y = z;
                }
                invertedShape.push([x, y]);
            }
        }

        let blocks = board.scan();
        let invertedBlocks = [];
        let xAdj = adjHor;
        if (adjHor === undefined) {
            xAdj = 0;
        }

        invertedShape.forEach(function(i) {
            let shapeBlock = i;
            let x = shapeBlock[0];
            let y = shapeBlock[1];
            // Add current center and move positioning to each block's coordinates in the shape
            x += (center + xAdj);
            y += move;
            // Parses through all blocks on the board
            blocks.forEach(function(k) {
                let block = k;
                // Checks for block coordinates on the board
                if (parseInt(block.dataset.x) === x && parseInt(block.dataset.y) === y) {
                    invertedBlocks.push(block);
                }
            })
        })

        return invertedBlocks;
    },

    invertPiece: function() {
        let invertLocation = invert.getInvertLocation();   // Gets where the current piece would invert to
        let blockInterference = detect.getShape(0, 0, invertLocation);  // Returns true/false if existing blocks are there
        let invOnLeft = detect.hitLeft(invertLocation);     // Checks if the inverted piece will be on the left wall
        let invOnRight = detect.hitRight(invertLocation);
        let adjustment = 0;

        if (blockInterference) {
            return;
        }
        else if (invertLocation.length < 4) {
            if (invOnLeft) {
                if (currentShape.name === "straight") {
                    adjustment = ( 4 - invertLocation.length);
                } else {
                    adjustment = 1;
                }
            } else if (invOnRight) {
                if (currentShape.name === "straight") {
                    adjustment = -1 * ( 4 - invertLocation.length);
                } else {
                    adjustment = -1;
                }
            }
            invertLocation = invert.getInvertLocation(adjustment, 0);
            if (detect.getShape(0, 0, invertLocation)) {
                return;
            }
        }
        invert.invertShape();
        display.movePiece(undefined, adjustment);
    }
}

let detect = {
    // Input (x, y) coordinates to shift the shape's position and detect if any existing blocks are there
    // Input a shape (test) to check inverted shapes
    getShape: function(x, y, test) {
        let blocks = board.scan();
        let shape = test;
        if (test === undefined) {
            shape = board.getPiece();
        }

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
        return detect.getShape(0, 1, undefined);
    },
    // Checks if a collision will occur to the right of any of the shape's current blocks
    detectLeft: function() {
        return detect.getShape(-1, 0, undefined);
    },
    // Checks if a collision will occur to the left of any of the shape's current blocks
    detectRight: function() {
        return detect.getShape(1, 0, undefined);
    },

    // Detect if any block in the shape is next to left wall
    hitLeft: function(test) {
        let shape = test;
        if (test === undefined) {
            shape = board.getPiece();
        }
        for (let i = 0; i < shape.length; i++) {
            let block = shape[i];
            let x = parseInt(block.dataset.x);
            if (x === 0) {
                return true;
            }
        }
        return false;
    },
    // Detect if any block in the shape is next to right wall
    hitRight: function(test) {
        let shape = test;
        if (test === undefined) {
            shape = board.getPiece();
        }
        for (let i = 0; i < shape.length; i++) {
            let block = shape[i];
            let x = parseInt(block.dataset.x);
            if (x === 9) {
                return true;
            }
        }
        return false;
    }
}

let board = {
    // Returns an array of every block in the board
    scan: function() {
        let blocks = document.querySelectorAll(".block");
        return blocks;
    },
    // Returns an array containing all blocks of active piece
    getPiece: function() {
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
    },

    // Calculates the score
    getScore: function(rowsCleared) {
        switch (rowsCleared) {
            case 0:
                break;
            case 1:
                score += ( 40 * (level + 1));
                break;
            case 2:
                score += ( 100 * (level + 1));
                break;
            case 3:
                score += ( 300 * (level + 1));
                break;
            case 4:
                score += ( 1200 * (level + 1));
                break;
        }
        board.updateScore();
    },

    updateScore: function() {
        let boardScore = document.getElementById("number-score");
        boardScore.innerHTML = score;
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

    clearRow: function() {
        let rows = document.querySelectorAll(".row");   // Identify all the rows on the board
        let scoreCounter = 0;

        rows.forEach(function(i) {
            let row = i;
            let counter = 0;

            if (row.style.display !== "none") {
                let blocks = row.childNodes;

                blocks.forEach(function(x) {         // Loop through every block in a given row
                    let block = x;
                    if (block.dataset.state === "2") {
                        counter++;           // If any blocks are not occupied, don't clear the row
                    }
                })

                if (counter === blocks.length) {            // Removes the state and style of an entire row if every block is occupied
                    blocks.forEach(function(y) {
                        let block = y;
                        block.dataset.state = 0;
                        block.removeAttribute("style");
                    })
                    scoreCounter++;
                    display.shiftDown(row);
                }
            }
        })
        board.getScore(scoreCounter);       // Calculate new score
    },

    resetShape: function() {
        move = 0;
        center = Math.floor(width / 2);     // Resets the positioning and shape
        getRandomShape();
        display.movePiece();
    },

    resetBlocks: function() {
        alert("Sorry, you lost!");
        // Clears all currently occupied blocks
        for (let i = 0; i < occupiedBlocks.length; i++) {
            occupiedBlocks[i].dataset.state = 0;
            occupiedBlocks[i].removeAttribute("style");
        }
        occupiedBlocks = [];
        score = 0;
        level = 0;
        board.updateScore();
    }
}

// Listen for arrow key user inputs
 function setUpEventListeners() {
     document.addEventListener("keydown", function(event) {
         if (event.which === 37) {
             manipulate.moveLeft();
         } else if (event.which === 39) {
             manipulate.moveRight();
         } else if (event.which === 40) {
             manipulate.moveDown();
         } else if (event.which === 38) {
             invert.invertPiece();
         }
     })
 }

function moveDown() {
    manipulate.moveDown();
}

function runWithDebugger(ourFunction) {
    debugger;
    ourFunction();
}

board.updateScore();
setUpEventListeners();
// setInterval (moveDown, 200);
