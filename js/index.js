'use strict';

import {Game, Text, Segment} from './GameEngine';
import {Circle, Rectangle, X} from "./GameScenario/Sprites";

const g = new Game(
    "mainCanvas",
    2000,
    2000,
    true
);
const speed = 10;
let blueMove = [0, 0];


// Example for player controlled trajectory
const blue = new Circle({
    radius: 30,
    centerCoords: [30, 30]
}, () => {
    // blue.x += blueMove[0];
    // blue.y += blueMove[1];
    //
    // blue.x = Math.max(0, Math.min(blue.x, g.width));
    // blue.y = Math.max(0, Math.min(blue.y, g.height));
}, {
    fillColor: "blue",
    borderColor: "black"
});

const x = new X(200, 200, 2, (ignored, tick) => {
    x.moveCurrentAnimation();
    const gravity = 1.5;

    x.y = Math.min(x.y + blueMove[1] + gravity, 200);
    blueMove[1] += gravity;

    if (blueMove[1] >= 0) {
        blueMove[1] = 0;
    }

    if (blueMove[0]) {
        x.x += blueMove[0];

        if (blueMove[0] < 0) {
            x.flip = true;
        } else if (blueMove[0] > 0) {
            x.flip = false;
        }

        if (x.currentAnimation === x.animations.idle) {
            x.currentAnimation = x.animations.startMove;
        }
    } else {
        x.currentAnimation = x.animations.idle;
    }
});

// Example for circular trajectory
const black = new Circle({
    radius: 40,
    centerCoords: [1600, 400]
}, () => {
    const angle = g.degToRadians((speed * g.currentTick) % 361);
    const path = {x: 1600, y: 400, r: 50};

    black.x = path.x + path.r * Math.cos(angle);
    black.y = path.y + path.r * Math.sin(angle);
}, {
    fillColor: "black",
});

/**
 * @param e {KeyboardEvent}
 */
const keyPressHandler = (e) => {
    switch (e.key) {
        // case 's':
        //     blueMove[1] = speed;
        //     break;
        // case 'w':
        //     blueMove[1] = -speed;
        //     break;
        case ' ':
            blueMove[1] = -2 * speed;
            break;
        case 'a':
            blueMove[0] = -speed;
            break;
        case 'd':
            blueMove[0] = speed;
            break;
    }
};

/**
 * @param e {KeyboardEvent}
 */
const keyLiftHandler = (e) => {
    switch (e.key) {
        case 's':
            break;
        case 'w':
            // blueMove[1] = 0;
            break;
        case 'a':
        case 'd':
            blueMove[0] = 0;
            break;
    }
}

g.follow(x);
g.insertSprite(black); // Falls under blue on intersection
g.insertSprite(x);
g.insertSprite(blue);
g.addEventListener('keydown', keyPressHandler);
g.addEventListener('keyup', keyLiftHandler);



// g.insertSprite(blue);
g.perceivedDimensions = {
};

g.resume();

// let isBlue = true;
// g.setInterval(() => {
//     g.follow(isBlue ? black : blue);
//     isBlue = !isBlue;
// }, 1000);

// g.setTimeout(() => {
//     g.pause();
// }, 60);
