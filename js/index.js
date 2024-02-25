import {Game, Text} from './GameEngine';
import {Circle, Rectangle} from "./GameScenario/Sprites";


const g = new Game(
    "mainCanvas",
    false,
    {
        borderColor: "green",
    }
);
const speed = 3;
let dirs = [0, 0];
let left = 0; // Score
let right = 0; // Score

// Example for straight line trajectory
let reverse = false;
const red = new Circle({
    radius: 10,
    centerCoords: [100, 100]
}, (tick) => {
    // Update on every tick. This is the default function
    return {tick};
}, () => {
    if (reverse) {
        if (red.x - red.radius <= 0) {
            right++;
            reverse = false;
            return;
        }

        red.y -= speed;
        red.x -= speed;
    } else {
        if (red.x + red.radius >= g.width) {
            left++;

            reverse = true;
            return;
        }

        red.y += speed;
        red.x += speed;
    }
}, {
    fillColor: "red",
    borderColor: "black",
}, {
    fillColor: "#00990055",
    borderColor: "black",
    borderWidth: 3
});

//
// // Example for player controlled trajectory
const blue = new Circle({
    radius: 30,
    centerCoords: [150, 100]
}, undefined, () => {
    blue.x += dirs[0];
    blue.y += dirs[1];
}, {
    fillColor: "blue",
    borderColor: "black"
});

// Example for circular trajectory
const black = new Circle({
    radius: 9,
    centerCoords: [300, 300]
}, undefined, () => {
    const angle = g.degToRadians((speed * g.currentTick) % 361);
    const path = {x: 300, y: 400, r: 50};

    black.x = path.x + path.r * Math.cos(angle);
    black.y = path.y + path.r * Math.sin(angle);
}, {
    fillColor: "black",
});

const scoreLeft = new Text({
    text: "",
    bottomLeftCoords: [10, 10]
}, undefined, () => {
    scoreLeft.text = `Player 1 Score: ${left}`;

    if (left === 10) {
        g.pause();
        alert("Player 1 wins!");
    }
}, {
    fillColor: "black",
    borderColor: "black",
});

const scoreRight = new Text({
    text: "",
    bottomLeftCoords: g.mapTopRight([-90, 10])
}, undefined, () => {
    scoreRight.text = `Player 2 Score: ${right}`;

    if (right === 10) {
        g.pause();
        alert("Player 2 wins!");
    }
}, {
    fillColor: "black",
    borderColor: "black",
});

const leftPaddle = new Rectangle({
    height: 100,
    width: 10,
    topLeftCoords: [10, g.halfHeight]
}, undefined, undefined, {
    fillColor: "black"
});

const rightPaddle = new Rectangle({
    height: 100,
    width: 10,
    topLeftCoords: g.mapTopRight([-20, g.halfHeight])
}, undefined, undefined, {
    fillColor: "black"
});

const middlePaddle = new Rectangle({
    height: 100,
    width: 10,
    topLeftCoords: g.mapCenter([0, 0])
}, undefined, undefined, {
    fillColor: "black"
});

/**
 * @param e {KeyboardEvent}
 */
const keyPressHandler = (e) => {
    switch (e.key) {
        case 'd':
            dirs[0] = speed;
            break;
        case 's':
            dirs[1] = speed;
            break;
        case 'a':
            dirs[0] = -speed;
            break;
        case 'w':
            dirs[1] = -speed;
            break;
    }
};

/**
 * @param e {KeyboardEvent}
 */
const keyLiftHandler = (e) => {
    switch (e.key) {
        case 'd':
            dirs[0] = 0;
            break;
        case 's':
            dirs[1] = 0;
            break;
        case 'a':
            dirs[0] = 0;
            break;
        case 'w':
            dirs[1] = 0;
            break;
    }
}

g.insertSprite(red); // Overshadows blue on intersection
g.insertSprite(blue);

g.addEventListener('keydown', keyPressHandler);
g.addEventListener('keyup', keyLiftHandler);
g.insertSprite(scoreLeft);
g.insertSprite(scoreRight);
g.insertSprite(leftPaddle);
g.insertSprite(middlePaddle);
g.insertSprite(rightPaddle);
// g.insertSprite(black); // Falls under blue on intersection

// g.showHitBoxes = true;
g.resume();

// g.setTimeout(() => {
//     g.pause();
// }, 100);

