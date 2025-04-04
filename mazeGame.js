// Maze Game JavaScript
var game;
var background;
var character;
var walls = []; // Array to hold maze walls
var goal;
var isMoving = false;
var deceleration = 0.1;
var lastMoveAngle = 180; // Default facing down
var lastCycle = "down";
var gameOver = false;

// Wall class to create walls without image files
function Wall(x, y, width, height) {
    this.x = x - width/2; // Convert to top-left corner for easier collision
    this.y = y - height/2;
    this.width = width;
    this.height = height;
    
    // Collision detection with sprite
    this.collidesWith = function(sprite) {
        // Character has a large sprite sheet but actual character is smaller
        // Adjust collision box to be tighter around character
        var padding = 8; // Padding to make collision box smaller than sprite
        var spriteLeft = sprite.x - sprite.width/4 + padding;
        var spriteRight = sprite.x + sprite.width/4 - padding;
        var spriteTop = sprite.y - sprite.height/4 + padding;
        var spriteBottom = sprite.y + sprite.height/4 - padding;
        
        // Check for overlap
        if (spriteRight < this.x || spriteLeft > this.x + this.width ||
            spriteBottom < this.y || spriteTop > this.y + this.height) {
            return false;
        }
        return true;
    };
    
    // Draw the wall
    this.update = function() {
        var ctx = game.context;
        ctx.save();
        ctx.fillStyle = "#8B4513"; // Brown color for walls
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add brick pattern effect
        ctx.strokeStyle = "#5D3A1F";
        ctx.lineWidth = 1;
        
        // Horizontal brick lines
        for(var i = 0; i < this.height; i += 10) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + i);
            ctx.lineTo(this.x + this.width, this.y + i);
            ctx.stroke();
        }
        
        // Vertical brick lines - offset every other row
        for(var i = 0; i < this.width; i += 20) {
            // First set of vertical lines
            ctx.beginPath();
            ctx.moveTo(this.x + i, this.y);
            ctx.lineTo(this.x + i, this.y + this.height);
            ctx.stroke();
            
            // Second set with offset
            if (i + 10 < this.width) {
                ctx.beginPath();
                ctx.moveTo(this.x + i + 10, this.y + 10);
                ctx.lineTo(this.x + i + 10, this.y + this.height);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    };
}

function init() {
    game = new Scene();
    game.setSize(800, 600);
    game.setBG("#87CEEB"); // Sky blue background

    // If you still want to use the background image
    background = new Sprite(game, "background.png", 800, 600);
    background.setSpeed(0, 0);
    background.setPosition(400, 300);
    
    character = new Sprite(game, "rpg_sprite_walk.png", 192, 128);
    character.loadAnimation(192, 128, 24, 32);
    character.generateAnimationCycles();
    character.renameCycles(new Array("down", "up", "left", "right"));
    character.setAnimationSpeed(500);

    //start paused
    character.setPosition(100, 500);
    character.setSpeed(0);
    character.pauseAnimation();
    character.setCurrentCycle("down");

    goal = new Sprite(game, "house.png", 100, 100);
    goal.setSpeed(0);
    goal.setPosition(680, 100);

    // Create the maze
    createMaze();
    
    // Reset game state
    gameOver = false;

    game.start();
} // end init

function createMaze() {
    // Clear existing walls
    walls = [];
    
    // Define wall positions for the maze
    // Format: [x, y, width, height]
    var mazeLayout = [
        // Outer borders
        [400, 10, 800, 20],    // Top
        [400, 590, 800, 20],   // Bottom
        [10, 300, 20, 600],    // Left
        [790, 300, 20, 600],   // Right
        
        // Maze horizontal walls - carefully positioned to create a maze path
        [125, 100, 250, 20],   
        [400, 100, 300, 20],   
        [200, 180, 400, 20],   
        [650, 180, 100, 20],   
        [125, 260, 250, 20],   
        [500, 260, 300, 20],   
        [200, 340, 400, 20],   
        [700, 340, 100, 20],   
        [300, 420, 400, 20],   
        [200, 500, 400, 20],   
        
        // Maze vertical walls - carefully positioned to create a maze path
        [125, 190, 20, 200],   
        [250, 140, 20, 100],   
        [400, 50, 20, 100],   
        [550, 140, 20, 100],   
        [700, 60, 20, 150],   
        [250, 300, 20, 100],   
        [400, 220, 20, 100],   
        [550, 300, 20, 100],   
        [400, 380, 20, 100],   
        [550, 450, 20, 150],   
        [250, 450, 20, 150]
    ];
    
    // Create walls
    for (var i = 0; i < mazeLayout.length; i++) {
        var wallData = mazeLayout[i];
        var wall = new Wall(wallData[0], wallData[1], wallData[2], wallData[3]);
        walls.push(wall);
    }
}

function update() {
    if (gameOver) return;
    
    game.clear();

    handleMovement();
    checkKeys();

    // Background first
    background.update();
    
    // Draw character
    character.update();
    
    // Draw goal (house)
    goal.update();
    
    // Draw all maze walls
    for (var i = 0; i < walls.length; i++) {
        walls[i].update();
    }

    // Check for collisions with any maze wall
    for (var i = 0; i < walls.length; i++) {
        if (walls[i].collidesWith(character)) {
            gameOver = true;
            setTimeout(function() {
                alert("Game Over! You hit a wall.");
                restartGame();
            }, 50);
            return;
        }
    }

    // Check if player reached the goal
    if (character.collidesWith(goal)) {
        gameOver = true;
        setTimeout(function() {
            alert("Congratulations! You reached the house!");
            restartGame();
        }, 50);
        return;
    }
} // end update

function restartGame() {
    // Reset character to starting position
    character.setPosition(100, 500);
    character.setSpeed(0);
    character.pauseAnimation();
    character.setCurrentCycle("down");
    gameOver = false;
}

function handleMovement() {
    // Apply smooth deceleration if not actively moving
    if (!isMoving && character.speed > 0) {
        var newSpeed = character.speed - deceleration;
        if (newSpeed <= 0) {
            character.setSpeed(0);
            character.pauseAnimation();
        } else {
            character.setSpeed(newSpeed);
            character.setMoveAngle(lastMoveAngle);
            character.setCurrentCycle(lastCycle);
        }
    }
}

function checkKeys() {
    isMoving = false;

    if (keysDown[K_LEFT]) {
        isMoving = true;
        character.setSpeed(2);
        character.playAnimation();
        character.setMoveAngle(270);
        character.setCurrentCycle("left");
        lastMoveAngle = 270;
        lastCycle = "left";
    }
    if (keysDown[K_RIGHT]) {
        isMoving = true;
        character.setSpeed(2);
        character.playAnimation();
        character.setMoveAngle(90);
        character.setCurrentCycle("right");
        lastMoveAngle = 90;
        lastCycle = "right";
    }
    if (keysDown[K_UP]) {
        isMoving = true;
        character.setSpeed(2);
        character.playAnimation();
        character.setMoveAngle(0);
        character.setCurrentCycle("up");
        lastMoveAngle = 0;
        lastCycle = "up";
    }
    if (keysDown[K_DOWN]) {
        isMoving = true;
        character.setSpeed(2);
        character.playAnimation();
        character.setMoveAngle(180);
        character.setCurrentCycle("down");
        lastMoveAngle = 180;
        lastCycle = "down";
    }
    // หยุดเดิน
    if (keysDown[K_SPACE]) {
        character.setSpeed(0);
        character.pauseAnimation();
        character.setCurrentCycle("down");
    }
}