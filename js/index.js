'use strict';

// Start loading the resources
const g = loadGame();


// Initiate the game


const baseSpeed = 10;
const altSpeed = 40;
let speed = 40;

let moveVector = [0, 0];

/**
 * TODO List
 *
 * - Implement X animations + attacks.
 * - Adjust hit boxes for enemies, player, & levels.
 * - Adjust attack damage.
 * - Place the enemies in levels.
 * - Implement the teleporter for level 3.
 *
 * Tomorrow:
 * - Deploy.
 * - Implement zero (if there is time).
 * - Add sound effects and OST.
 * - Implement options menu
 *
 * Finally remove all unused features and reduce bloat.
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


const l1 = new Level_2([txt]);
g.insertSprite(l1);
g.showHitBoxes = true;

// const gman = new GrenadeMan(600, 400, l1.scale);
// const expl = new Explosion(
//     100 * l1.scale,
//     100 * l1.scale,
//     l1.scale,
//     false,
//     true,
//     (e) => {
//         e.start();
//     }
// );
// l1.insertSprites(expl);

// expl.start();



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

const x = new Player(
    100 * l1.scale,
    -100 * l1.scale,
    l1.scale,
    (ignored) => {
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

        // const r = new Rocket(x.x + 100, x.y + 100, false, 2);
        // x.level.insertSprite(r);
    }

    if (moveVector[0] < 0) {
        x.flip = true;
    } else if (moveVector[0] > 0) {
        x.flip = false;
    }

    // if (moveVector[0]) {
    //     l1.moveCurrentAnimation();
    // }

    x.rx += moveVector[0];
    x.by += moveVector[1];

    x.moveCurrentAnimation();
}
);

const hpB = new HealthBar(
    HealthBarType.x,
    x,
    l1.scale
);

Sprite.player = x;
l1.insertSprite(x);


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
// g.addDoubleKeyListener((e) => {
//     console.log("DOUBLE CLICK");
// });

// console.log(g.areColliding(x, x));
l1.load();

const d = new Dialog(
    "HA HA HA surrender X you idiot!aaaaaaaaaaa",
    DialogType.zero,
    undefined,
    () => {
        d.dialog = "PREPARE TO DIE";
        d.dialogType = DialogType.sigma
    }
)

// g.insertSprite(d);
g.resume();
