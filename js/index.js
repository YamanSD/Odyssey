import {Game, Text} from './GameEngine';
import {Circle, Rectangle} from "./GameScenario/Sprites";


const g = new Game(
    "mainCanvas",
    false,
    {
        borderColor: "green"
    }
);
const speed = 6;
let paddleMove = {
    rightY: 0,
    leftY: 0
}; // To handle paddle movements
let ballMove = [speed, speed / 2];
let left = 0; // Score
let right = 0; // Score

/**
 * @param circle {Circle}
 * @param rect {Rectangle}
 * @returns {boolean}
 * @constructor
 */
function RectCircleColliding(circle, rect){
    let distX = Math.abs(circle.x - rect.x - rect.width / 2);
    let distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + circle.radius)) {
        return false;
    }

    if (distY > (rect.height / 2 + circle.radius)) {
        return false;
    }

    if (distX <= (rect.width / 2)) {
        return true;
    }

    if (distY <= (rect.height / 2)) {
        return true;
    }

    let dx= distX - rect.width / 2;
    let dy= distY - rect.height / 2;
    return (dx*dx+dy*dy<=(circle.radius*circle.radius));
}

const red = new Circle({
    radius: 10,
    centerCoords: g.mapCenter([0, 0])
}, (tick) => {
    // Update on every tick. This is the default function
    return {tick};
}, (sprites) => {
    // Check collisions with left-right borders
    if (red.x - red.radius <= 0) {
        right++;
        ballMove[0] *= -1;
    } else if (red.x + red.radius >= g.width) {
        left++;
        ballMove[0] *= -1;
    } else if (red.y - red.radius <= 0 || red.y + red.radius >= g.height) { // Check collisions with top-down borders
        ballMove[1] *= -1;
    }

    // Check collision with paddles
    for (const {sprite} of sprites) {
        if (sprite === leftPaddle) {
            if (RectCircleColliding(red, leftPaddle)) {
                if (paddleMove.leftY < 0) {
                    ballMove[1] = -Math.abs(ballMove[1]);
                } else if (paddleMove.leftY > 0) {
                    ballMove[1] = Math.abs(ballMove[1]);
                } else {
                    ballMove[1] *= -1;
                }
                ballMove[0] *= -1;
            }
        } else if (sprite === rightPaddle) {
            if (RectCircleColliding(red, rightPaddle)) {
                if (paddleMove.rightY < 0) {
                    ballMove[1] = -Math.abs(ballMove[1]);
                } else if (paddleMove.rightY > 0) {
                    ballMove[1] = Math.abs(ballMove[1]);
                } else {
                    ballMove[1] *= -1;
                }
                ballMove[0] *= -1;
            }
        }
    }

    red.x += ballMove[0];
    red.y += ballMove[1];
}, {
    fillColor: "red",
    borderColor: "black",
});

//
// // Example for player controlled trajectory
// const blue = new Circle({
//     radius: 30,
//     centerCoords: [150, 100]
// }, undefined, () => {
//     blue.x += paddleMove[0];
//     blue.y += paddleMove[1];
// }, {
//     fillColor: "blue",
//     borderColor: "black"
// });
//
// // Example for circular trajectory
// const black = new Circle({
//     radius: 9,
//     centerCoords: [300, 300]
// }, undefined, () => {
//     const angle = g.degToRadians((speed * g.currentTick) % 361);
//     const path = {x: 300, y: 400, r: 50};
//
//     black.x = path.x + path.r * Math.cos(angle);
//     black.y = path.y + path.r * Math.sin(angle);
// }, {
//     fillColor: "black",
// });

const scoreLeft = new Text({
    text: "",
    bottomLeftCoords: [10, 10]
}, undefined, () => {
    scoreLeft.text = `Player 1 Score: ${left}`;

    if (left === 10000) {
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

    if (right === 10000) {
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
}, undefined, () => {
    const newY = leftPaddle.y + paddleMove.leftY;

    if (newY + leftPaddle.height <= g.height && newY >= 0) {
        leftPaddle.y = newY;
    }
}, {
    fillColor: "black"
});

const rightPaddle = new Rectangle({
    height: 100,
    width: 10,
    topLeftCoords: g.mapTopRight([-20, g.halfHeight])
}, undefined, () => {
    const newY = rightPaddle.y + paddleMove.rightY;

    if (newY + rightPaddle.height <= g.height && newY >= 0) {
        rightPaddle.y = newY;
    }
}, {
    fillColor: "black"
});

/**
 * @param e {KeyboardEvent}
 */
const keyPressHandler = (e) => {
    switch (e.key) {
        case 's':
            paddleMove.leftY = speed;
            break;
        case 'w':
            paddleMove.leftY = -speed;
            break;
        case 'ArrowDown':
            paddleMove.rightY = speed;
            break;
        case 'ArrowUp':
            paddleMove.rightY = -speed;
            break;
    }
};

/**
 * @param e {KeyboardEvent}
 */
const keyLiftHandler = (e) => {
    switch (e.key) {
        case 's':
            if (paddleMove.leftY === speed) {
                paddleMove.leftY = 0;
            }
            break;
        case 'w':
            if (paddleMove.leftY === -speed) {
                paddleMove.leftY = 0;
            }
            break;
        case 'ArrowDown':
            if (paddleMove.rightY === speed) {
                paddleMove.rightY = 0;
            }
            break;
        case 'ArrowUp':
            if (paddleMove.rightY === -speed) {
                paddleMove.rightY = 0;
            }
            break;
    }
}

g.insertSprite(red); // Overshadows blue on intersection
// g.insertSprite(blue);

g.addEventListener('keydown', keyPressHandler);
g.addEventListener('keyup', keyLiftHandler);
g.insertSprite(scoreLeft);
g.insertSprite(scoreRight);
g.insertSprite(leftPaddle);
g.insertSprite(rightPaddle);
// g.insertSprite(black); // Falls under blue on intersection

// g.showHitBoxes = true;
g.resume();

// g.setTimeout(() => {
//     g.removeSprite(red);
//
//     g.setTimeout(() => {
//         g.insertSprite(red);
//     }, 100);
// }, 100);
