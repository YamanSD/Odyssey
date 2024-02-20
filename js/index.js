import Game from './GameEngine/Game.js';
import {Circle, Rectangle} from "./GameScenario/Sprites";


const g = new Game(
    "mainCanvas",
);
const speed = 4;

// Example for straight line trajectory
let reverse = false;
const red = new Circle({
    radius: 10,
    centerCoords: [100, 100]
}, (tick) => {
    // Update on every tick. This is the default function
    return {tick};
}, (rects) => {
    if (reverse) {
        if (red.x - red.radius <= 0) {
            reverse = false;
            return;
        }

        red.y -= speed;
        red.x -= speed;
    } else {
        if (red.x + red.radius >= g.width) {
            reverse = true;
            return;
        }

        red.y += speed;
        red.x += speed;
    }
}, {
    fillColor: "red",
    borderColor: "black",
});

// // Example for player controlled trajectory
// const blue = new Circle({
//     radius: 30,
//     centerCoords: [150, 100]
// }, undefined, undefined, {
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
    topLeftCoords: g.mapTopRight([-20, g.height - 100])
}, undefined, undefined, {
    fillColor: "black"
});

// /**
//  * @param e {KeyboardEvent}
//  */
// const keyPressHandler = (e) => {
//     switch (e.key) {
//         case 'd':
//             blue.x += speed;
//             break;
//         case 's':
//             blue.y += speed;
//             break;
//         case 'a':
//             blue.x -= speed;
//             break;
//         case 'w':
//             blue.y -= speed;
//             break;
//     }
// };
// g.insertSprite(red); // Overshadows blue on intersection
for (const i of [1, 2, 3, 4, 5, 6]) {
    const c = new Circle({
        radius: 10,
        centerCoords: [10 * i, 10 * i]
    }, undefined, undefined, {
        fillColor: "black"
    });

    console.log(c.id);
    // g.setTimeout(() => {
        g.insertSprite(c);
    // }, i * 100);
}

// g.addEventListener('keydown', keyPressHandler);

// g.insertSprite(leftPaddle);
// g.insertSprite(rightPaddle);
// g.insertSprite(blue);
// g.insertSprite(black); // Falls under blue on intersection

g.setTimeout(() => {
    g.pause();
}, 20);

g.resume();
