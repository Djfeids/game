// fruit.js

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
        this.timeAboveBoard = 0; // New property to track time above board
        this.updatePosition();
        document.getElementById('game-container').appendChild(this.element);
    }

    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.transform = `rotate(${this.rotation}deg)`;
    }

    isAboveBoard() {
        return this.y < 0;
    }

    applyPhysics(deltaTime) {
        this.vy += this.gravity; // Apply gravity
        this.x += this.vx;
        this.y += this.vy;

        // Check if fruit is above the board
        if (this.isAboveBoard()) {
            this.timeAboveBoard += deltaTime;
        } else {
            this.timeAboveBoard = 0;
        }

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

    isGameOver() {
        return this.timeAboveBoard > 2000; // 2000 milliseconds = 2 seconds
    }
}