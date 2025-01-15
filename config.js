const fruitTypes = ['eggplant', 'cherry', 'lime', 'banana', 'apple', 'peach', 'coco', 'melon', 'pineapple', 'watermelon'];
let score = 0; // Score global
let GAME_WIDTH = 800;
let GAME_HEIGHT = 600;
let BASE_FRUIT_SIZE = 60;
const COLLISION_THRESHOLD = 5;
const FLOOR_HEIGHT_RATIO = 0.95;
const SIZE_INCREASE_RATIO = 1.3;
const BASE_FRUIT_WEIGHT = 1;
const WEIGHT_INCREASE_RATIO = 1.25;

function updateGameDimensions(width, height) {
    GAME_WIDTH = width;
    GAME_HEIGHT = height;
    BASE_FRUIT_SIZE = Math.min(GAME_WIDTH, GAME_HEIGHT) * 0.07;
}
