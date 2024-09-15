// game.js

const fruitTypes = ['cherry', 'strawberry', 'grape', 'orange', 'apple', 'pear', 'pineapple'];
const fruits = [];

let GAME_WIDTH = 800;
let GAME_HEIGHT = 600;
let FRUIT_SIZE = 50;
const COLLISION_THRESHOLD = 5; // Minimum velocity for fruits to bounce instead of stack

let nextFruitType = getRandomFruitType();

function getRandomFruitType() {
    return fruitTypes[Math.floor(Math.random() * 3)]; // Start with only the first 3 fruit types
}

function updateNextFruitDisplay() {
    const nextFruitElement = document.getElementById('next-fruit');
    nextFruitElement.className = `fruit ${nextFruitType}`;
}

function populateLegend() {
    const legendItems = document.getElementById('legend-items');
    fruitTypes.forEach(fruitType => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        
        const fruitIcon = document.createElement('div');
        fruitIcon.className = `legend-fruit ${fruitType}`;
        
        const fruitName = document.createElement('span');
        fruitName.textContent = fruitType.charAt(0).toUpperCase() + fruitType.slice(1);
        
        item.appendChild(fruitIcon);
        item.appendChild(fruitName);
        legendItems.appendChild(item);
    });
}

class Fruit {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4; // Random horizontal velocity
        this.vy = 0; // Vertical velocity
        this.gravity = 0.5; // Gravity acceleration
        this.rotation = 0; // Initial rotation
        this.element = document.createElement('div');
        this.element.className = `fruit ${type}`;
        this.updatePosition();
        document.getElementById('game-container').appendChild(this.element);
    }

    updatePosition() {
        this.element.style.left = `${(this.x / GAME_WIDTH) * 100}%`;
        this.element.style.top = `${(this.y / GAME_HEIGHT) * 100}%`;
        this.element.style.transform = `rotate(${this.rotation}deg)`;
    }

    applyPhysics() {
        this.vy += this.gravity; // Apply gravity
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off the floor
        if (this.y + FRUIT_SIZE > GAME_HEIGHT) {
            this.y = GAME_HEIGHT - FRUIT_SIZE;
            this.vy *= -0.7; // Reverse and reduce speed
        }

        // Bounce off the walls
        if (this.x <= 0 || this.x + FRUIT_SIZE >= GAME_WIDTH) {
            this.vx *= -1;
            this.x = Math.max(0, Math.min(this.x, GAME_WIDTH - FRUIT_SIZE));
        }

        // Apply friction
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Rotate the fruit
        this.rotation += this.vx;

        this.updatePosition();
    }
}

function initializeGame() {
    updateGameDimensions();
    updateNextFruitDisplay();
    populateLegend();
    window.addEventListener('resize', updateGameDimensions);
}

function updateGameDimensions() {
    const gameContainer = document.getElementById('game-container');
    GAME_WIDTH = gameContainer.clientWidth;
    GAME_HEIGHT = gameContainer.clientHeight;
    FRUIT_SIZE = Math.min(GAME_WIDTH, GAME_HEIGHT) * 0.075; // Adjust fruit size based on game dimensions
    
    // Update fruit sizes
    const fruitElements = document.querySelectorAll('.fruit');
    fruitElements.forEach(fruit => {
        fruit.style.width = `${FRUIT_SIZE}px`;
        fruit.style.height = `${FRUIT_SIZE}px`;
    });
}

function onGameContainerClick(event) {
    const gameContainer = document.getElementById('game-container');
    const rect = gameContainer.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * GAME_WIDTH;
    const y = 0; // Start at the top

    const fruit = new Fruit(nextFruitType, x, y);
    fruits.push(fruit);

    nextFruitType = getRandomFruitType();
    updateNextFruitDisplay();
}

function checkCollisions() {
    for (let i = 0; i < fruits.length; i++) {
        for (let j = i + 1; j < fruits.length; j++) {
            const fruitA = fruits[i];
            const fruitB = fruits[j];

            if (areColliding(fruitA, fruitB)) {
                if (fruitA.type === fruitB.type) {
                    mergeFruits(fruitA, fruitB);
                    return; // Exit after merging to avoid array issues
                } else {
                    handleCollision(fruitA, fruitB);
                }
            }
        }
    }
}

function areColliding(fruitA, fruitB) {
    const dx = fruitA.x - fruitB.x;
    const dy = fruitA.y - fruitB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < FRUIT_SIZE;
}

function handleCollision(fruitA, fruitB) {
    const dx = fruitB.x - fruitA.x;
    const dy = fruitB.y - fruitA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const overlap = FRUIT_SIZE - distance;

    // Calculate relative velocity
    const relativeVelocityX = fruitB.vx - fruitA.vx;
    const relativeVelocityY = fruitB.vy - fruitA.vy;
    const speed = Math.sqrt(relativeVelocityX * relativeVelocityX + relativeVelocityY * relativeVelocityY);

    if (speed > COLLISION_THRESHOLD) {
        // Bounce off each other
        const nx = dx / distance;
        const ny = dy / distance;

        const p = 2 * (fruitA.vx * nx + fruitA.vy * ny - fruitB.vx * nx - fruitB.vy * ny) / 2; // Assuming equal mass

        fruitA.vx = fruitA.vx - p * nx;
        fruitA.vy = fruitA.vy - p * ny;
        fruitB.vx = fruitB.vx + p * nx;
        fruitB.vy = fruitB.vy + p * ny;
    } else {
        // Stack on top of each other
        const moveX = (overlap / 2) * (dx / distance);
        const moveY = (overlap / 2) * (dy / distance);

        fruitA.x -= moveX;
        fruitA.y -= moveY;
        fruitB.x += moveX;
        fruitB.y += moveY;

        // Adjust velocities
        fruitA.vx = (fruitA.vx + fruitB.vx) / 2;
        fruitA.vy = (fruitA.vy + fruitB.vy) / 2;
        fruitB.vx = fruitA.vx;
        fruitB.vy = fruitA.vy;
    }
}

function mergeFruits(fruitA, fruitB) {
    // Remove fruits from the game
    fruitA.element.remove();
    fruitB.element.remove();
    fruits.splice(fruits.indexOf(fruitA), 1);
    fruits.splice(fruits.indexOf(fruitB), 1);

    // Create a new fruit of the next type
    const newType = getNextFruitType(fruitA.type);
    const newX = (fruitA.x + fruitB.x) / 2;
    const newY = (fruitA.y + fruitB.y) / 2;
    const newFruit = new Fruit(newType, newX, newY);
    fruits.push(newFruit);
}

function getNextFruitType(type) {
    const currentIndex = fruitTypes.indexOf(type);
    return fruitTypes[Math.min(currentIndex + 1, fruitTypes.length - 1)];
}

function gameLoop() {
    fruits.forEach(fruit => fruit.applyPhysics());
    checkCollisions();
    requestAnimationFrame(gameLoop);
}

// Initialize the game
initializeGame();

// Event listener for user clicks
const gameContainer = document.getElementById('game-container');
gameContainer.addEventListener('click', onGameContainerClick);

// Start the game loop
gameLoop();
