class Fruit {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = 0;
        this.gravity = 0.5;
        this.rotation = 0;
        this.size = BASE_FRUIT_SIZE * Math.pow(SIZE_INCREASE_RATIO, fruitTypes.indexOf(type));
        this.weight = BASE_FRUIT_WEIGHT * Math.pow(WEIGHT_INCREASE_RATIO, fruitTypes.indexOf(type));
        this.element = document.createElement('div');
        this.element.className = `fruit ${type}`;
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.timeAboveBoard = 0;
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
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        if (this.isAboveBoard()) {
            this.timeAboveBoard += deltaTime;
        } else {
            this.timeAboveBoard = 0;
        }

        if (this.y + this.size > GAME_HEIGHT * FLOOR_HEIGHT_RATIO) {
            this.y = GAME_HEIGHT * FLOOR_HEIGHT_RATIO - this.size;
            this.vy *= -0.7 / this.weight;
        }

        if (this.x <= 0 || this.x + this.size >= GAME_WIDTH) {
            this.vx *= -1 / this.weight;
            this.x = Math.max(0, Math.min(this.x, GAME_WIDTH - this.size));
        }

        this.vx *= 0.99 / this.weight;
        this.rotation += this.vx / this.weight;
        this.updatePosition();
    }

    isGameOver() {
        return this.timeAboveBoard > 2000; // Game over if fruit stays above for 2 seconds
    }
}
