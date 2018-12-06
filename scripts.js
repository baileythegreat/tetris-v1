
// Variables
let shapes = [];
let currentShape;
let currentColor;
let occupiedBlocks = [];    // Blocks with dataset of 2 are set
let storedBlocks = [];
let colors = ["white", "orange", "red", "yellow", "blue"];
let state = 1;      // 1 = running, 0 = paused, 2 = game over
let score = 0;
let width = 10;
let height = 21;
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
            if (y === 20) {
                block.dataset.state = 2;
                row.style.display = "none";
            } else if (y === -1 ) {
                row.style.display = "none";
            } else {
                block.dataset.state = 0; // Determines block states (set, moving, etc.)
            }
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
        location[1] = 1;
    } else if (direction === "left") {
        location[0] -= 1;
    } else if (direction === "right") {
        location[0] += 1;
    }

    // Clears current displayed block
    clearBlocks();

    // Creates the current shape
    let selectedShape = {
        shape: currentShape,
        color: currentColor
    }

    let currBlocks = [];
    let firstRow = false;
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
                currBlocks.push(block);
                if (y === 0) {
                    firstRow = true;
                }
                break;
            }
        }
    }
    storedBlocks.push(currBlocks);
    if (storedBlocks.length === 3) {
        storedBlocks.shift();
    }

    let collisionDetected = false;
    counter = 0;
    for (i = 0; i < currBlocks.length; i++) {
        let block = currBlocks[i];
        if (block.dataset.state === "2") {
            collisionDetected = true;
            break;
        } else {
            counter++;
        }
    }
    if (collisionDetected === true && firstRow === true) {
        resetBlocks();
        return;
    } else if (collisionDetected === true) {
        let blocks = storedBlocks[0];
        for (i = 0; i < blocks.length; i++) {
            block = blocks[i];
            block.dataset.state = 2;
            block.style.backgroundColor = selectedShape.color;
        }
        occupiedBlocks.push(blocks);
        resetShape();
    } else if (counter === currBlocks.length) {
        for (i = 0; i < currBlocks.length; i++) {
            block = currBlocks[i];
            block.dataset.state = 1;    // Indicates that block is occupied
            block.style.backgroundColor = selectedShape.color;
        }
        move++;
    }
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

// Resets all occupied blocks in event of gameover
function resetBlocks() {
    alert("Sorry, you lose!");
    for (let i = 0; i < occupiedBlocks.length; i++) {
        for (let k = 0; k < occupiedBlocks[i].length; k++) {
            let block = occupiedBlocks[i][k];
            block.dataset.state = 0;
            block.removeAttribute("style");
        }
    }
    occupiedBlocks = [];
}

function setUpEventListeners() {
    document.addEventListener("keydown", function(event) {
        if (event.which === 37) {
            direction = "left";
        } else if (event.which === 39) {
            direction = "right";
        } else if (event.which === 40) {
            direction = "down";
        } else if (event.which === 38) {
            // inverseShape();      // Need to cycle through shape directions in this case with a new function
        }
    })
}


createShapes();
createBoard();
setUpEventListeners();
getRandomShape(shapes.length);
// setInterval(displayShape, 500);
