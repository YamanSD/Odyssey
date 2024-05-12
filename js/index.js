'use strict';


const baseSpeed = 10;
const altSpeed = 40;
let speed = 40;

let moveVector = [0, 0];

/**
 * TODO List
 *
 * - Implement player & boss health bar.
 * - Implement last level.
 * - Fix first level falling rocks.
 * - Adjust hit boxes for enemies, player, & levels.
 * - Adjust attack damage.
 * - Update enemy logic.
 * - Implement X animations + attacks.
 * - Add sound effects and OST.
 * - Implement dialog.
 * - Place the enemies in levels.
 * - Implement main menu and pause menu.
 * - Implement zero (if there is time).
 */


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


// const s1 = new SigmaSickle(
//     l1,
//     500,
//     300,
//     2,
//     false,
// );

// const s2 = new SigmaShockProjectile(
//     l1,
//     500,
//     300,
//     2,
//     false,
// );

const x = new Player(500, 300, l1.scale, (ignored) => {
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

    // x.currentAnimation = x.animations.idle;

    if (x.states.get(ShootingState) !== ShootingState.idle) {
        x.states.set(ShootingState, ShootingState.idle);

        const r = new Rocket(l1, x.x + 100, x.y + 100, false, 2);
        x.game.insertSprite(r);
    }

    if (moveVector[0] < 0) {
        x.flip = true;
    } else if (moveVector[0] > 0) {
        x.flip = false;
    }

    x.rx += moveVector[0];
    x.by += moveVector[1];

    x.moveCurrentAnimation();
});

Sprite.player = x;

const bomb = new Bomb(l1, 0, 0, 2);
const field = new IrisField(0, 0, 0, l1.scale);
const d = new Sigma(700, 400, [0, 1000], l1.scale);
const b = new Dejira(1000, 500, l1.scale);
// const l = new SigmaLaser(700, 500, 700, 60, true, undefined, undefined);
const b2 = new IrisBeam(700, 400, l1.scale, true);
const gig = new BomberBat(600, 100, bomb, l1.scale);

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
l1.sprites.push(field, expl, b2, d, sp, bomb, gig);



expl.start();

l1.sprites.push(x);
const g = new Game("mainCanvas", undefined, undefined, false);


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
            d.longLaser();
            // d.spawnDrones();
            // d.laserGrid();
            // b.start();
            // b2.start();
            // gman.throwGrenade();
            // x.states.set(ShootingState, ShootingState.shoot);
            break;
        case 'e':
            // d.laserGrid();
            // gig.releaseBomb()xxx;
            d.laser();
            // d.form();
            break;
        case 'q':
            d.changeStage();
            break;
        case 'h':
            g.showHitBoxes = !g.showHitBoxes;
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

g.follow(x);
g.addEventListener('keydown', keyPressHandler);
g.addEventListener('keyup', keyLiftHandler);

g.insertSprite(l1);
// console.log(g.areColliding(x, x));
l1.load();
g.resume();
