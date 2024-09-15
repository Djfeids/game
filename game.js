// game.js

const fruitTypes = ['cherry', 'strawberry', 'grape', 'orange', 'apple', 'pear', 'pineapple'];
const fruits = [];

let GAME_WIDTH = 800;
let GAME_HEIGHT = 600;
let BASE_FRUIT_SIZE = 40;
const COLLISION_THRESHOLD = 5; // Minimum velocity for fruits to bounce instead of stack
const FLOOR_HEIGHT_RATIO = 0.95; // Set the floor at 95% of the game container height
const SIZE_INCREASE_RATIO = 1.25; // Each fruit level is 25% bigger than the previous

let nextFruitType = getRandomFruitType();

function getRandomFruitType() {
    return fruitTypes[Math.floor(Math.random() * 3)]; // Start with only the first 3 fruit types
}

function updateNextFruitDisplay() {
    const nextFruitElement = document.getElementById('next-fruit');
    nextFruitElement.className = `fruit ${nextFruitType}`;
    nextFruitElement.style.width = `${BASE_FRUIT_SIZE}px`;
    nextFruitElement.style.height = `${BASE_FRUIT_SIZE}px`;
}

function populateLegend() {
    const legendItems = document.getElementById('legend-items');
    fruitTypes.forEach((fruitType, index) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        
        const fruitIcon = document.createElement('div');
        fruitIcon.className = `legend-fruit ${fruitType}`;
        fruitIcon.style.width = `${BASE_FRUIT_SIZE * 0.5}px`;
        fruitIcon.style.height = `${BASE_FRUIT_SIZE * 0.5}px`;
        
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
        this.size = BASE_FRUIT_SIZE * Math.pow(SIZE_INCREASE_RATIO, fruitTypes.indexOf(type));
        this.element = document.createElement('div');
        this.element.className = `fruit ${type}`;
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.updatePosition();
        document.getElementById('game-container').appendChild(this.element);
    }

    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.transform = `rotate(${this.rotation}deg)`;
    }

    applyPhysics() {
        this.vy += this.gravity; // Apply gravity
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off the floor
        if (this.y + this.size > GAME_HEIGHT * FLOOR_HEIGHT_RATIO) {
            this.y = GAME_HEIGHT * FLOOR_HEIGHT_RATIO - this.size;
            this.vy *= -0.7; // Reverse and reduce speed
        }

        // Bounce off the walls
        if (this.x <= 0 || this.x + this.size >= GAME_WIDTH) {
            this.vx *= -1;
            this.x = Math.max(0, Math.min(this.x, GAME_WIDTH - this.size));
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
    BASE_FRUIT_SIZE = Math.min(GAME_WIDTH, GAME_HEIGHT) * 0.07;
    
    // Update fruit sizes and positions
    fruits.forEach(fruit => {
        fruit.size = BASE_FRUIT_SIZE * Math.pow(SIZE_INCREASE_RATIO, fruitTypes.indexOf(fruit.type));
        fruit.element.style.width = `${fruit.size}px`;
        fruit.element.style.height = `${fruit.size}px`;
        fruit.x = Math.min(fruit.x, GAME_WIDTH - fruit.size);
        fruit.y = Math.min(fruit.y, GAME_HEIGHT * FLOOR_HEIGHT_RATIO - fruit.size);
        fruit.updatePosition();
    });

    updateNextFruitDisplay();
}

function onGameContainerClick(event) {
    const gameContainer = document.getElementById('game-container');
    const rect = gameContainer.getBoundingClientRect();
    const x = event.clientX - rect.left - BASE_FRUIT_SIZE / 2;
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
    const dx = (fruitA.x + fruitA.size / 2) - (fruitB.x + fruitB.size / 2);
    const dy = (fruitA.y + fruitA.size / 2) - (fruitB.y + fruitB.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (fruitA.size + fruitB.size) / 2;
}

function handleCollision(fruitA, fruitB) {
    const dx = (fruitB.x + fruitB.size / 2) - (fruitA.x + fruitA.size / 2);
    const dy = (fruitB.y + fruitB.size / 2) - (fruitA.y + fruitA.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (fruitA.size + fruitB.size) / 2;
    const overlap = minDistance - distance;

    // Calculate relative velocity
    const relativeVelocityX = fruitB.vx - fruitA.vx;
    const relativeVelocityY = fruitB.vy - fruitA.vy;
    const speed = Math.sqrt(relativeVelocityX * relativeVelocityX + relativeVelocityY * relativeVelocityY);

    if (speed > COLLISION_THRESHOLD) {
        // Bounce off each other
        const nx = dx / distance;
        const ny = dy / distance;

        const p = 2 * (fruitA.vx * nx + fruitA.vy * ny - fruitB.vx * nx - fruitB.vy * ny) / (fruitA.size + fruitB.size);

        fruitA.vx = fruitA.vx - p * fruitB.size * nx;
        fruitA.vy = fruitA.vy - p * fruitB.size * ny;
        fruitB.vx = fruitB.vx + p * fruitA.size * nx;
        fruitB.vy = fruitB.vy + p * fruitA.size * ny;
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
