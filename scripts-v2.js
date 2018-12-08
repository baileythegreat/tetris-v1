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
let adjustment = 0;
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

// Generates a random shape/color combo
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

// Display the pieces as they move across the board
let displayPiece = {

    movePiece: function(collision) {
        let blocks = board.scan();
        let shape = currentShape.shape.shape;
        let color = currentShape.color;

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
                x += (center + adjustment);
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

    // displayInverted: function(invBlock, adj) {
    //     let shape = invBlock;
    //     let color = currentShape.color;
    //
    //     clear.clearBlocks();
    //
    //     shape.forEach(function(piece) {
    //         let block = piece;
    //         if (adj !== 0) {
    //             let blocks = board.scan();
    //             let x = parseInt(block.dataset.x) + adj;
    //             let y = parseInt(block.dataset.y);
    //             for (let i = 0; i < blocks.length; i++) {
    //                 if (parseInt(blocks[i].dataset.x) === x && parseInt(blocks[i].dataset.y) === y) {
    //                     blocks[i].dataset.state = 3;
    //                     blocks[i].style.backgroundColor = color;
    //                 }
    //             }
    //         } else {
    //             block.dataset.state = 3;
    //             block.style.backgroundColor = color;
    //         }
    //     })

    // },

    moveLeft: function() {
        let hitWall = displayPiece.hitLeft();

        if (!hitWall && !detectCollision.detectLeft()) {         // Detect edge or pieces to the left
            center -= 1;
        }
        // if (!displayPiece.hitRight() && adjustment < 0) {
        //     adjustment = 0;
        // }
        displayPiece.movePiece();
    },

    moveRight: function() {
        let hitWall = displayPiece.hitRight();

        if (!hitWall && !detectCollision.detectRight()) {          // Detect edge or pieces to the right
            center += 1;            // Shifts all blocks in piece to the right by one
        }
        // if (!displayPiece.hitLeft() && adjustment > 0) {
        //     adjustment = 0;
        // }
        displayPiece.movePiece();
    },

    hitLeft: function() {
        let shape = currentShape.shape.shape;
        for (let i = 0; i < shape.length; i++) {        // Detect if any block is next to wall
            let x = shape[i][0];
            x += center;
            if (x === 0) {
                return true;
            }
        }
        return false;
    },

    hitRight: function() {
        let shape = currentShape.shape.shape;
        for (let i = 0; i < shape.length; i++) {        // Detect if any block is next to wall
            let x = shape[i][0];
            x += center;
            if (x === 9) {
                return true;
            }
        }
        return false;
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

let invert = {

    // function(0) -- Invert the pieces
    invertShape: function() {
        let shape = currentShape.shape.shape;
        let shapeName = currentShape.shape.name;
        let state = currentShape.shape.state;   // For s and z blocks

        for (let i = 0; i < shape.length; i++) {
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
                currentShape.shape.state = 1;
            } else if ( state === 1 ) {
                currentShape.shape.state = 0;
            }
        }
    },

    // function(1) -- Return where piece would be if inverted once
    getInvertLocation: function(adjHor, adjVer) {
        let shape = currentShape.shape.shape;
        let shapeName = currentShape.shape.name;
        let state = currentShape.shape.state;   // For s and z blocks
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
        let yAdj = adjVer;
        if (adjHor === undefined) {
            xAdj = 0;
        }
        if (adjVer === undefined) {
            yAdj = 0;
        }

        invertedShape.forEach(function(i) {
            let shapeBlock = i;
            let x = shapeBlock[0];
            let y = shapeBlock[1];
            // Add current center and move positioning to each block's coordinates in the shape
            x += (center + xAdj);
            y += (move +yAdj);
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

    // function (2) -- Determine if any pieces exists at an input location
    detectExisting: function(location) {
        check = location;
        blocks = board.scan();

        for (let i = 0; i < check.length; i++) {
            invertedBlock = check[i];
            let x = parseInt(invertedBlock.dataset.x);
            let y = parseInt(invertedBlock.dataset.y);

            for ( let k = 0; k < blocks.length; k++) {
                let block = blocks[k];
                if ( parseInt(block.dataset.x) === x && parseInt(block.dataset.y) === y) {
                    if (block.dataset.state === "2") {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    // function(3) -- If inverting would cause an error with the wall, returns which wall and how much to adjust by
    checkWall: function(location) {
        let results = {
            wall: "",
            adjustment: 0
        }
        let piece = location;
        if (piece.length < 4) {
            for (let i = 0; i < piece.length; i++) {
                let block = piece[i];
                let x = parseInt(block.dataset.x);
                let y = parseInt(block.dataset.y);

                if (x === 0) {
                    results.wall = "left";
                } else if (x === 9) {
                    results.wall = "right";
                }
            }
            if (currentShape.shape.name === "straight" && results.wall == "right") {
                results.adjustment = 2;
            } else {
                results.adjustment = 1;
            }
        }

        return results;
    },

    invertPiece: function() {
        let invertLocation = invert.getInvertLocation();   // Gets where the current piece would invert to
        let blockInterference = invert.detectExisting(invertLocation);  // Returns true/false if existing blocks are there
        let wallResults = invert.checkWall(invertLocation);     // Returns any needed wall adjustments
        adjustment = 0;

        if (blockInterference) {
            return;
        }
        if (wallResults.wall === "left") {
            adjustment = wallResults.adjustment;
        } else if (wallResults.wall === "right") {
            adjustment = wallResults.adjustment * -1;
        }

        invert.invertShape();
        displayPiece.movePiece(undefined);
    }
}

let detectCollision = {
    // Input (x, y) coordinates to shift the shape's position and detect if any existing blocks are there
    getShape: function(x, y) {
        let blocks = board.scan();
        let shape = board.getPiece();
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
             invert.invertPiece();
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
