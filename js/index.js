import Game from './GameEngine/Game.js';
import {Circle} from "./GameEngine/BaseSprites";

const g = new Game("mainCanvas");
const speed = 4;

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
        if (red.x <= 0) {
            reverse = false;
            return;
        }

        red.x -= speed;
    } else {
        if (red.x >= g.width) {
            reverse = true;
            return;
        }

        red.x += speed;
    }
}, {
    fillColor: "red",
    borderColor: "black",
});

// Example for player controlled trajectory
const blue = new Circle({
    radius: 30,
    centerCoords: [150, 100]
}, undefined, undefined, {
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

/**
 * @param e {KeyboardEvent}
 */
const keyPressHandler = (e) => {
    switch (e.key) {
        case 'd':
            blue.x += speed;
            break;
        case 's':
            blue.y += speed;
            break;
        case 'a':
            blue.x -= speed;
            break;
        case 'w':
            blue.y -= speed;
            break;
    }
};

g.addEventListener('keydown', keyPressHandler);

g.insertSprite(red); // Overshadows blue on intersection
g.insertSprite(blue);
g.insertSprite(black); // Falls under blue on intersection

g.resume();
