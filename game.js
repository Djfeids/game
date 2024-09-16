// game.js

const fruits = [];
let nextFruitType = getRandomFruitType();

function initializeGame() {
    updateGameDimensions(
        document.getElementById('game-container').clientWidth,
        document.getElementById('game-container').clientHeight
    );
    updateNextFruitDisplay(nextFruitType, BASE_FRUIT_SIZE);
    populateLegend(BASE_FRUIT_SIZE);
    window.addEventListener('resize', handleResize);
}

function handleResize() {
    const gameContainer = document.getElementById('game-container');
    updateGameDimensions(gameContainer.clientWidth, gameContainer.clientHeight);
    
    // Update fruit sizes and positions
    fruits.forEach(fruit => {
        fruit.size = BASE_FRUIT_SIZE * Math.pow(1.25, fruitTypes.indexOf(fruit.type));
        fruit.element.style.width = `${fruit.size}px`;
        fruit.element.style.height = `${fruit.size}px`;
        fruit.x = Math.min(fruit.x, GAME_WIDTH - fruit.size);
        fruit.y = Math.min(fruit.y, GAME_HEIGHT * 0.95 - fruit.size);
        fruit.updatePosition();
    });

    updateNextFruitDisplay(nextFruitType, BASE_FRUIT_SIZE);
    populateLegend(BASE_FRUIT_SIZE);
}

function onGameContainerClick(event) {
    const gameContainer = document.getElementById('game-container');
    const rect = gameContainer.getBoundingClientRect();
    const x = event.clientX - rect.left - BASE_FRUIT_SIZE / 2;
    const y = 0; // Start at the top

    const fruit = new Fruit(nextFruitType, x, y);
    fruits.push(fruit);

    nextFruitType = getRandomFruitType();
    updateNextFruitDisplay(nextFruitType, BASE_FRUIT_SIZE);
}

function checkCollisions() {
    for (let i = 0; i < fruits.length; i++) {
        for (let j = i + 1; j < fruits.length; j++) {
            const fruitA = fruits[i];
            const fruitB = fruits[j];

            if (areColliding(fruitA, fruitB)) {
                if (fruitA.type === fruitB.type && fruitA.type !== fruitTypes[fruitTypes.length - 1]) {
                    mergeFruits(fruitA, fruitB);
                    return; // Exit after merging to avoid array issues
                } else {
                    handleCollision(fruitA, fruitB);
                }
            }
        }
    }
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
