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
 * - Add attack damage.
 * - Place the enemies in levels.
 * - Implement X animations + attacks.
 * - Deploy.
 * - Add sound effects and OST.
 * - Add rest of dialog
 * - Add heal and life items as drops from enemies.
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

const s0 = new Segment(
    {
        p0: [l1.scale * 266, l1.scale * 205],
        p1: [l1.scale * 266, 0]
    },
    () => {
        if (s0.intersects(x.segment)) {
            s0.isDone = true;
            s0.level.insertSprites(
                new TrapBlast(
                    l1.scale * 455,
                    l1.scale * 105,
                    2
                ),
                new TrapBlast(
                    l1.scale * 455,
                    l1.scale * 165,
                    2
                ),
            )
        }
    },
    'green'
);

const s1 = new Segment(
    {
        p0: [l1.scale * 490, 0],
        p1: [l1.scale * 490, l1.scale * 80]
    },
    () => {
        if (s1.intersects(x.segment)) {
            s1.isDone = true;
            s1.level.insertSprites(
                new Bee(
                    l1.scale * 700,
                    l1.scale * 21,
                    2
                ),
                new Bee(
                    l1.scale * 700,
                    l1.scale * 15,
                    2
                ),
                new GrenadeMan(
                    l1.scale * 762,
                    l1.scale * 156,
                    2
                )
            )
        }
    },
    'green'
);

const s2 = new Segment(
    {
        p0: [l1.scale * 880, 0],
        p1: [l1.scale * 880, l1.scale * 120]
    },
    () => {
        if (s2.intersects(x.segment)) {
            s2.isDone = true;
            s2.level.insertSprites(
                new Bee(
                    l1.scale * 1130,
                    l1.scale * 51,
                    2
                ),
                new Bee(
                    l1.scale * 1130,
                    l1.scale * 41,
                    2
                ),
                new Bee(
                    l1.scale * 1100,
                    l1.scale * 46,
                    2
                ),
                new TrapBlast(
                    l1.scale * 945,
                    l1.scale * 150,
                    2,
                    true
                ),
                new GrenadeMan(
                    l1.scale * 1200,
                    l1.scale * 134,
                    2
                ),
                new GrenadeMan(
                    l1.scale * 1300,
                    l1.scale * 134,
                    2
                ),
                new TrapBlast(
                    l1.scale * 1400,
                    l1.scale * 96,
                    2
                ),
                new TrapBlast(
                    l1.scale * 1400,
                    l1.scale * 145,
                    2
                ),
            )
        }
    },
    'green'
);

const s3 = new Segment(
    {
        p0: [l1.scale * 2000, 0],
        p1: [l1.scale * 2000, l1.scale * 240]
    },
    () => {
        if (s3.intersects(x.segment)) {
            s3.isDone = true;
            s3.level.insertSprites(
                new Bee(
                    l1.scale * 2126,
                    l1.scale * 71,
                    2
                ),
                new Bee(
                    l1.scale * 2126,
                    l1.scale * 71,
                    2
                ),
                new TrapBlast(
                    l1.scale * 1994,
                    l1.scale * 162,
                    2,
                    true
                ),
                new GrenadeMan(
                    l1.scale * 2200,
                    l1.scale * 160,
                    2
                ),
                new TrapBlast(
                    l1.scale * 2280,
                    l1.scale * 173,
                    2,
                ),
            )
        }
    },
    'green'
);

const s4 = new Segment(
    {
        p0: [l1.scale * 2550, 0],
        p1: [l1.scale * 2550, l1.scale * 240]
    },
    () => {
        if (s4.intersects(x.segment)) {
            s4.isDone = true;
            s4.level.insertSprites(
                new Bee(
                    l1.scale * 2700,
                    l1.scale * 41,
                    2
                ),
                new Bee(
                    l1.scale * 2700,
                    l1.scale * 31,
                    2
                ),
                new TrapBlast(
                    l1.scale * 2580,
                    l1.scale * 162,
                    2,
                    true
                ),
                new GrenadeMan(
                    l1.scale * 2740,
                    l1.scale * 169,
                    2
                ),
                new TrapBlast(
                    l1.scale * 2955,
                    l1.scale * 169,
                    2,
                ),
                new TrapBlast(
                    l1.scale * 2955,
                    l1.scale * 106,
                    2,
                ),
            )
        }
    },
    'green'
);

const s5 = new Segment(
    {
        p0: [l1.scale * 3580, 0],
        p1: [l1.scale * 3580, l1.scale * 240]
    },
    () => {
        if (s5.intersects(x.segment)) {
            s5.isDone = true;
            l1.createBossArena();
        }
    },
    'green'
);


const segments = [
    s0,
    s1,
    s2,
    s3,
    s4,
    s5
];

g.insertSprite(l1);
g.showHitBoxes = true;

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


l1.insertSprites(...segments);

// g.addDoubleKeyListener((e) => {
//     console.log("DOUBLE CLICK");
// });

// const t = new Teleporter(
//     100 * l1.scale,
//     100 * l1.scale,
//     l1.scale,
//     () => {
//         console.log("STOOD");
//     }
// )
// l1.insertSprite(t);
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
);



// g.insertSprite(d);
g.resume();
