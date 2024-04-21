import {Game, Text} from './GameEngine';
import {Circle, Rectangle} from "./GameScenario/Sprites";

let camera = undefined;
const g = new Game(
    "mainCanvas",
    2000,
    2000,
);
const speed = 10;
let blueMove = [0, 0];


// Example for player controlled trajectory
const blue = new Circle({
    radius: 30,
    centerCoords: [150, 100]
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


g.follow(blue);
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
