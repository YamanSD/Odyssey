'use strict';

import {Game, Sprite, Text} from './GameEngine';
// import {BusterShot, Player} from "./Game/Sprites";
import {Level_1} from "./Game/Levels";
import {SuicideDrone, IrisCrystal, TrapBlast, ShockProjectile, Bee, BusterShot, Explosion, GrenadeMan, X} from "./Game/Sprites";
import Grenade from "./Game/Sprites/Grenade.js";


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


const l1 = new Level_1([txt]);

const x = new X(500, 300, l1.scale, (ignored) => {
    // if (x.states.get(ShootingState) === ShootingState.shoot) {
    //     x.currentAnimation = x.animations.shoot;
    //     const m = new BusterShot(
    //         x.flip ? x.x : x.x + x.width,
    //         x.y + 26,
    //         x.flip,
    //         1,
    //         () => {
    //             m.moveCurrentAnimation();
    //             m.x += (m.flip ? -1 : 1) * 20;
    //         },
    //         {
    //             'fillColor': 'green'
    //         }
    //     );
    //
    //     x.game.insertSprite(
    //         m
    //     );
    //
    //     x.states.set(ShootingState, ShootingState.idle);
    // }
    //
    // const gravity = speed;
    // const floorY = 400;
    //
    // if (moveVector[1] < 0
    //     && (x.currentAnimation !== x.animations.jumpStart
    //         || x.currentAnimation !== x.animations.jumpLoop)) {
    //     x.currentAnimation = x.animations.jumpStart;
    //     x.states.set(JumpState, JumpState.floating);
    // }
    //
    // x.y += moveVector[1] + gravity;
    // const col = x.colliding(l1);
    //
    // if (col) {
    //     if (col.isNorth) {
    //         console.log(col.collided.y);
    //         x.by = col.collided.projectX(x.x);
    //     }
    // }
    //
    // moveVector[1] += gravity;
    //
    // if (moveVector[1] >= 0) {
    //     moveVector[1] = 0;
    // }
    //
    // if (moveVector[0]) {
    //     x.x += moveVector[0];
    //
    //     if (moveVector[0] < 0) {
    //         x.flip = true;
    //     } else if (moveVector[0] > 0) {
    //         x.flip = false;
    //     }
    //
    //     if (x.y + x.height >= floorY && x.currentAnimation !== x.animations.moveLoop) {
    //         x.currentAnimation = x.animations.startMove;
    //     }
    // } else if (x.y + x.height >= floorY) {
    //     if (x.states.get(JumpState) === JumpState.floating) {
    //         x.currentAnimation = x.animations.jumpEnd;
    //     } else if (x.currentAnimation !== x.animations.shoot) {
    //         x.currentAnimation = x.animations.idle;
    //     }
    //
    //     x.states.set(JumpState, JumpState.idle);
    // }

    if (x.states.get(ShootingState) !== ShootingState.idle) {
        x.states.set(ShootingState, ShootingState.idle);

        x.game.insertSprite(new Grenade(x.level, x.x, x.y, false, x.scale));
    }

    x.rx += moveVector[0];
    x.by += moveVector[1];

    x.moveCurrentAnimation();
});

Sprite.player = x;

const b = new SuicideDrone(700, 400, 2);
// const gman = new GrenadeMan(600, 400, l1.scale);
const expl = new Explosion(
    500,
    100,
    2,
    false,
    true,
    (e) => {
        e.start()
    }
);
// b.currentAnimation = b.animations.attack;

const sp = new ShockProjectile(0, 0, 2, 3);
l1.sprites.push(expl, b, sp);



expl.start();

l1.sprites.push(x);
const g = new Game("mainCanvas", undefined, undefined, true);


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
        case 'x':
            b.form();
            // gman.throwGrenade();
            // x.states.set(ShootingState, ShootingState.shoot);
            break;
        case 'e':
            b.attack();
            break;
        case 'h':
            g.showHitBoxes = !g.showHitBoxes;
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
            moveVector[1] = 0;
            break;
        case 'a':
        case 'd':
            moveVector[0] = 0;
            break;
    }
}

g.follow(x);
g.addEventListener('keydown', keyPressHandler);
g.addEventListener('keyup', keyLiftHandler);

g.insertSprite(l1);
// console.log(g.areColliding(x, x));
l1.load();
g.resume();
