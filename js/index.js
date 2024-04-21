'use strict';

import {Game, Text, Segment} from './GameEngine';
import {Circle, Rectangle} from "./GameScenario/Sprites";
let p = 600;

let camera = undefined;
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
}, undefined, () => {
    blue.x += blueMove[0];
    blue.y += blueMove[1];

    blue.x = Math.max(0, Math.min(blue.x, g.width));
    blue.y = Math.max(0, Math.min(blue.y, g.height));
}, {
    fillColor: "blue",
    borderColor: "black"
});

// Example for circular trajectory
const black = new Circle({
    radius: 40,
    centerCoords: [100, 100]
}, undefined, () => {
    const angle = g.degToRadians((speed * g.currentTick) % 361);
    const path = {x: 300, y: 400, r: 50};

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
        case 's':
            blueMove[1] = speed;
            break;
        case 'w':
            blueMove[1] = -speed;
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
        case 'w':
            blueMove[1] = 0;
            break;
        case 'a':
        case 'd':
            blueMove[0] = 0;
            break;
    }
}


const q = 50;
const s2 = new Segment(
    {
        p0: [200, 200],
        p1: [200, 1000],
    },
    undefined,
    undefined,
    "#00FF00"
);
const s3 = new Segment(
    {
        p0: [200, 200],
        p1: [1000, 200],
    },
    undefined,
    undefined,
    "#00FF00"
);
const s = new Segment(
    {
        p0: [p, q],
        p1: [p, p],
    },
    undefined,
    undefined,
    "#FF0000"
);
const s1 = new Segment(
    {
        p0: [q, p],
        p1: [p, p],
    },
    undefined,
    undefined,
    "#FF0000"
);


g.insertSprite(s);
g.insertSprite(s1);
g.insertSprite(s2);
g.insertSprite(s3);
g.follow(blue);
// g.perceivedDimensions = {
//     width: p,
//     height: p,
//     x: q,
//     y: q
// }
g.insertSprite(black); // Falls under blue on intersection
g.insertSprite(blue);
g.addEventListener('keydown', keyPressHandler);
g.addEventListener('keyup', keyLiftHandler);



// g.insertSprite(blue);

g.resume();

// let isBlue = true;
// g.setInterval(() => {
//     g.follow(isBlue ? black : blue);
//     isBlue = !isBlue;
// }, 1000);

// g.setTimeout(() => {
//     g.pause();
// }, 60);
