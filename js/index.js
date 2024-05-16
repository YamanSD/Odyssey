'use strict';

// Start loading the resources
const g = loadGame();


// Initiate the game


const baseSpeed = 10;
const altSpeed = 40;
let speed = 40;

let moveVector = [0, 0];

const txt = new Text(
    {
        bottomLeftCoords: [0, 0],
        text: ''
    },
    () => {
        txt.x = x.x;
        txt.y = x.y - 20;
        txt.text = `${Math.floor(x.x / l1.scale)}, ${Math.floor(x.y / l1.scale)}`
    },
    {
        font: "30px Arial",
        fillColor: 'white'
    }
);
const JumpState = {
    idle: 0,
    floating: 1,
};

const ShootingState = {
    idle: 0,
    shoot: 1,
}

const l1 = new Level_3([txt]);

g.insertSprite(l1);
g.showHitBoxes = true;

const x = new Player(
    100 * l1.scale,
    -100 * l1.scale,
    l1.scale,
    (ignored) => {
    if (x.states.get(ShootingState) !== ShootingState.idle) {
        x.states.set(ShootingState, ShootingState.idle);
    }

    if (moveVector[0] < 0) {
        x.flip = true;
    } else if (moveVector[0] > 0) {
        x.flip = false;
    }

    x.rx += moveVector[0];
    x.by += moveVector[1];

    x.moveCurrentAnimation();
}, false);

const hpB = new HealthBar(
    HealthBarType.x,
    x,
    l1.scale
);

Sprite.player = x;
l1.insertSprites(x);


/**
 * @param e {KeyboardEvent}
 */
const keyPressHandler = (e) => {
    switch (e.key) {
        case ' ':
            speed = speed === altSpeed ? baseSpeed : altSpeed;
            break;
        case 's':
            moveVector[1] = speed;
            break;
        case 'w':
            moveVector[1] = -speed;
            break;
        case 'a':
            moveVector[0] = -speed;
            break;
        case 'd':
            moveVector[0] = speed;
            break;
        case 'q':
            x.damage(10);
            break;
        case 'e':
            x.heal(10);
            break;
        case 'h':
            g.showHitBoxes = !g.showHitBoxes;
            break;
        case 'r':
            break;
        case 'Escape':
            g.pause();
            break;
    }
};

// d.currentAnimation = d.animations.shootBeam;

/**
 * @param e {KeyboardEvent}
 */
const keyLiftHandler = (e) => {
    switch (e.key) {
        case 's':
        case 'w':
            moveVector[1] = 0;
            break;
        case 'a':
        case 'd':
            moveVector[0] = 0;
            break;
    }
}

l1.insertSprite(hpB);

g.follow(x);
g.addEventListener('keydown', keyPressHandler);
g.addEventListener('keyup', keyLiftHandler);


l1.load();
g.resume();
