// config.js

const fruitTypes = ['cherry', 'strawberry', 'grape', 'orange', 'apple', 'pear', 'pineapple'];
let score = 0;
let GAME_WIDTH = 800;
let GAME_HEIGHT = 600;
let BASE_FRUIT_SIZE = 40;
const COLLISION_THRESHOLD = 5; // Minimum velocity for fruits to bounce instead of stack
const FLOOR_HEIGHT_RATIO = 0.95; // Set the floor at 95% of the game container height
const SIZE_INCREASE_RATIO = 1.25; // Each fruit level is 25% bigger than the previous
const BASE_FRUIT_WEIGHT = 1; // Base weight for the smallest fruit (cherry)
const WEIGHT_INCREASE_RATIO = 1.25; // Each fruit level is 25% heavier than the previous

function updateGameDimensions(width, height) {
    GAME_WIDTH = width;
    GAME_HEIGHT = height;
    BASE_FRUIT_SIZE = Math.min(GAME_WIDTH, GAME_HEIGHT) * 0.07;
}