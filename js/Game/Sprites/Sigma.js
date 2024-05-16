'use strict'

/**
 * @exports Sigma
 */


/**
 * State for Sigma's stage.
 *
 * @type {{stage2: number, stage1: number}}
 */
const SigmaStageState = {
    stage1: 0,
    stage2: 1,
};

/**
 * State for Sigma's attacks.
 *
 * @type {{restartCycle: number, longLaser: number, laser: number, land: number, sickle: number, energyOrb: number, none: number, dash: number}}
 */
const SigmaAttackState = {
    none: 0,
    energyOrb: 1,
    dash: 2,
    sickle: 3,
    land: 4,
    laser: 5,
    longLaser: 6,
    restartCycleInit: 7,
    restartCycle: 8
};

/**
 * State of the dash direction of sigma.
 *
 * @type {{left: number, none: number, right: number}}
 */
const SigmaDashDirection = {
    none: 0,
    left: 1,
    right: 2
};

/**
 * @class Sigma
 *
 * Class representing the sigma boss.
 */
class Sigma extends Sprite {
    /**
     * Object containing the animations of Sigma.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * Object containing the animations of Sigma for stage 2.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations2;

    /**
     * Used for counting the number of spawned orb pairs.
     *
     * @type {number}
     * @private
     */
    #orbAttackCounter;

    /**
     * Used for bounding the movement of sigma.
     *
     * @type {[number, number]}
     * @private
     */
    #bounds;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param bounds {[number, number]} bounds for the movement.
     * @param scale {number} scale of Sigma.
     * @param hitBoxBrush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?} object hit-box brush properties.
     */
    constructor(
        x,
        y,
        bounds,
        scale,
        hitBoxBrush
    ) {
        let addedDialog = false;

        super(
            {},
            [x, y],
            (tick) => {
                if (!addedDialog) {
                    let sentence = 0;
                    addedDialog = true;

                    const d = new Dialog(
                        "SIGMA!",
                        DialogType.x,
                        undefined,
                        () => {
                            if (sentence === 0) {
                                d.dialogType = DialogType.sigma;
                                d.dialog = "HE HE HE";
                                sentence++;
                            } else if (sentence === 1) {
                                d.dialogType = DialogType.x;
                                d.dialog = "You will pay for what you have \n done to Iris";
                                sentence++;
                            } else if (sentence === 2) {
                                d.dialogType = DialogType.sigma;
                                d.dialog = "This is your end X. \n Prepare to DIE!";
                                sentence++;
                            } else {
                                const hpB = new HealthBar(
                                    HealthBarType.sigma,
                                    this,
                                    this.level.scale
                                );

                                this.level.insertSprite(hpB);

                                this.changeStage();
                                d.endDialog();
                            }
                        }
                    );

                    this.level.insertSprite(
                        d
                    );
                }

                switch (this.states.get(SigmaStageState)) {
                    case SigmaStageState.stage1:
                        switch (this.states.get(SigmaAttackState)) {
                            case SigmaAttackState.dash:
                                switch (this.states.get(SigmaDashDirection)) {
                                    case SigmaDashDirection.left:
                                        this.moveTo(
                                            this.#bounds[1],
                                            this.y,
                                            16,
                                            () => {
                                                this.startCycle();
                                            }
                                        );
                                        break;
                                    case SigmaDashDirection.right:
                                        this.moveTo(
                                            this.#bounds[0],
                                            this.y,
                                            12,
                                            () => {
                                                this.dashAttack();
                                            }
                                        );
                                        break;
                                }
                                break;
                            case SigmaAttackState.energyOrb:
                                if (tick % 40 === 0) {
                                    this.spawnOrbs();
                                }

                                if (this.#orbAttackCounter % 4 === 0) {
                                    this.#orbAttackCounter++; // To insure only three pairs
                                    this.dashAttack();
                                }
                                break;
                        }
                        break;
                    case SigmaStageState.stage2:
                        switch (this.states.get(SigmaAttackState)) {
                            case SigmaAttackState.sickle:
                                this.moveTo(
                                    (this.flip ? -this.width : 0) + this.middleBound,
                                    this.initY - 300,
                                    14,
                                    () => {
                                        this.throwSickle();

                                        // Wait for the sickle
                                        this.states.set(SigmaAttackState, SigmaAttackState.none);
                                    }
                                )
                                break;
                            case SigmaAttackState.land:
                                this.moveTo(
                                    this.x,
                                    this.initY,
                                    25,
                                    () => {
                                        this.flip = this.player.x >= this.x;
                                        this.spawnOrbs(12);
                                        this.currentAnimation = this.animations.land;
                                        this.states.set(SigmaAttackState, SigmaAttackState.none);

                                        this.game.setTimeout(() => {
                                            // Start the laser attack
                                            if (this.x === this.#bounds[0] || this.x === this.#bounds[1]) {
                                                this.longLaser();
                                            } else {
                                                this.laser();
                                            }
                                        }, 40);
                                    }
                                );
                                break;
                            case SigmaAttackState.laser:
                                // No use for the state. Might be useful later.
                                this.states.set(SigmaAttackState, SigmaAttackState.none);
                                break;
                            case SigmaAttackState.restartCycle:
                                this.moveTo(
                                    this.#bounds[this.player.x >= this.x ? 0 : 1],
                                    this.initY - 400,
                                    20,
                                    () => {
                                        this.states.set(SigmaAttackState, SigmaAttackState.land);
                                    }
                                );
                                break;
                        }
                        break;
                }

                this.moveCurrentAnimation();
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale,
            1000
        );

        // Create the animations
        this.#animations = {
            idle: this.createAnimation(
                0,
                20,
                4,
                5,
                1,
                5,
                80,
                106,
                1,
                0,
                4
            ),
            discharging: this.createAnimation(
                0,
                127,
                118,
                3,
                1,
                3,
                85,
                106,
                1,
                0,
                4,
                undefined,
                undefined,
                (x, y) => {
                    return [
                        {
                            x,
                            y,
                            width: 80,
                            height: 100
                        }
                    ];
                }
            ),
            prepareDash: this.createAnimation(
                0,
                8,
                229,
                4,
                1,
                4,
                88,
                142,
                1,
                0,
                16,
                undefined,
                () => {
                    this.currentAnimation = this.animations.dash;
                    this.states.set(SigmaAttackState, SigmaAttackState.dash);
                },
                (x, y) => {
                    return [
                        {
                            x: x + 30,
                            y: y + 50,
                            width: 50,
                            height: 70,
                        }
                    ];
                }
            ),
            dash: this.createAnimation(
                0,
                20,
                381,
                3,
                1,
                3,
                119,
                141,
                1,
                0,
                3,
                undefined,
                undefined,
                (x, y) => {
                    return [
                        {
                            x: x + 50,
                            y,
                            width: 70,
                            height: 130,
                        }
                    ];
                }
            ),
            energyOrb: this.currentAnimation = this.createAnimation(
                3,
                48,
                139,
                3,
                1,
                3,
                57,
                54,
                1,
                0,
                3,
            )
        };
        this.#animations2 = {
            idle: this.createAnimation(
                2,
                118,
                395,
                1,
                1,
                1,
                68,
                98,
                0,
                0,
                1
            ),
            prepareLaser: this.createAnimation(
                2,
                480,
                276,
                2,
                1,
                2,
                54,
                97,
                1,
                0,
                16,
                undefined,
                () => {
                    this.spawnLasers();
                    this.currentAnimation = this.animations.laser;
                }
            ),
            laser: this.createAnimation(
                2,
                605,
                285,
                2,
                1,
                2,
                94,
                88,
                1,
                0,
                3
            ),
            prepareJump: this.createAnimation(
                2,
                2,
                300,
                3,
                1,
                3,
                95,
                74,
                1,
                0,
                3,
                undefined,
                () => {
                    if (this.states.get(SigmaAttackState) === SigmaAttackState.restartCycleInit) {
                        this.flip = this.player.x < this.x;
                        this.states.set(SigmaAttackState, SigmaAttackState.restartCycle);
                        this.currentAnimation = this.animations.jump;
                    }
                }
            ),
            jump: this.createAnimation(
                2,
                310,
                280,
                1,
                1,
                1,
                70,
                92,
                0,
                0,
                1,
            ),
            prepareSickle_0: this.createAnimation(
                2,
                84,
                31,
                2,
                1,
                2,
                84,
                98,
                1,
                0,
                4,
                undefined,
                () => {
                    this.states.set(SigmaAttackState, SigmaAttackState.sickle);
                    this.currentAnimation = this.animations.prepareSickle_1;
                }
            ),
            prepareSickle_1: this.createAnimation(
                2,
                270,
                7,
                1,
                1,
                1,
                69,
                120,
                0,
                0,
                4
            ),
            prepareSickle_2: this.createAnimation(
                2,
                352,
                35,
                2,
                1,
                2,
                135,
                92,
                1,
                0,
                4,
                undefined,
                () => {
                    // Recenter character
                    this.x -= 30 * this.scale * (this.flip ? -1 : 1);
                    this.y -= 20 * this.scale;

                    this.currentAnimation = this.animations.prepareSickle_3;
                }
            ),
            prepareSickle_3: this.createAnimation(
                2,
                26,
                146,
                2,
                1,
                2,
                146,
                118,
                1,
                0,
                3,
                undefined,
                () => {
                    // Recenter character
                    this.x += 20 * this.scale * (this.flip ? 2 : 1);
                    this.y += 21 * this.scale;

                    this.level.insertSprite(
                        new SigmaSickle(
                            this.flip ? this.x + 50 : this.x,
                            this.y,
                            2,
                            !this.flip,
                            () => {
                                this.currentAnimation = this.animations.getSickle;
                            }
                        )
                    );
                    this.currentAnimation = this.animations.waitForSickle;
                }
            ),
            waitForSickle: this.createAnimation(
                2,
                351,
                155,
                1,
                1,
                1,
                70,
                96,
                0,
                0,
                1
            ),
            getSickle: this.createAnimation(
                2,
                644,
                106,
                2,
                1,
                2,
                70,
                119,
                1,
                0,
                4,
                undefined,
                () => {
                    this.states.set(SigmaAttackState, SigmaAttackState.land);
                }
            ),
            land: this.createAnimation(
                2,
                795,
                128,
                2,
                1,
                2,
                87,
                98,
                1,
                0,
                4,
                undefined,
                () => {
                    this.currentAnimation = this.animations.idle;
                }
            )
        };

        this.#bounds = bounds;
        this.#orbAttackCounter = 1;

        // Initialize the states
        this.states.set(SigmaDashDirection, SigmaDashDirection.none);
        this.states.set(SigmaStageState, SigmaStageState.stage1);
        this.states.set(SigmaAttackState, SigmaAttackState.none);

        this.currentAnimation = this.animations.idle;
    }

    /**
     * @returns {Object<string, number>} animations object.
     */
    get animations() {
        return this.states.get(SigmaStageState) === SigmaStageState.stage1 ? this.#animations : this.#animations2;
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of Sigma.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get defaultHitBox() {
        return this.convertHitBoxes(this.states.get(SigmaStageState) === SigmaStageState.stage1 ? [
            {
                x: this.x - 17,
                y: this.y + (this.flip ? 0 : 20),
                width: 45,
                height: 110,
                rotation: this.flip ? 30 : -30
            }
        ] : [
            {
                x: this.x,
                y: this.y,
                width: 70,
                height: 90,
            }
        ]);
    }

    /**
     * x-coordinate for the orbs.
     */
    get orbX() {
        return this.x + this.width / 2 - 25 * this.scale;
    }

    /**
     * y-coordinate for the orbs.
     */
    get orbY() {
        return this.y + this.height / 2;
    }

    /**
     * @returns {number} the middle of the two bounds.
     */
    get middleBound() {
        return (this.#bounds[0] + this.#bounds[1]) / 2;
    }

    /**
     * Starts the attacking cycle.
     */
    startCycle() {
        this.x = this.middleBound;
        this.y = this.initY - 200;
        this.currentAnimation = this.animations.idle;
        this.states.set(SigmaAttackState, SigmaAttackState.none);

        this.game.setTimeout(() => {
            this.startOrbAttack();
        }, 100);
    }

    /**
     * Starts the attacking cycle for stage 2.
     */
    startCycle2() {
        this.currentAnimation = this.animations.prepareJump;
        this.states.set(SigmaAttackState, SigmaAttackState.restartCycleInit);
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);

        if (this.states.get(SigmaAttackState) === SigmaAttackState.energyOrb) {
            this.drawAnimation(
                this.animations.energyOrb,
                this.orbX,
                this.orbY,
                context
            );
        }
    }

    /**
     * Starts the orb attack.
     */
    startOrbAttack() {
        this.x = this.middleBound;
        this.y = this.initY - 200;
        this.currentAnimation = this.animations.discharging;
        this.states.set(SigmaAttackState, SigmaAttackState.energyOrb);
    }

    /**
     * Starts the dash attack.
     */
    dashAttack() {
        this.states.set(SigmaAttackState, SigmaAttackState.none);
        const fromLeft = this.states.get(SigmaDashDirection) === SigmaDashDirection.right;
        this.flip = fromLeft;
        this.x = this.#bounds[fromLeft ? 0 : 1];
        this.y = this.initY - 300;
        this.currentAnimation = this.animations.prepareDash;
        this.states.set(SigmaDashDirection, fromLeft ? SigmaDashDirection.left : SigmaDashDirection.right);
    }

    /**
     * Moves the current animation.
     */
    moveCurrentAnimation() {
        if (this.states.get(SigmaAttackState) === SigmaAttackState.energyOrb) {
            this.moveAnimation(this.animations.energyOrb);
        }

        super.moveCurrentAnimation();
    }

    /**
     * Performs the Orbs Attack.
     *
     * @param speed {number?} speed of the orbs.
     */
    spawnOrbs(speed) {
        this.#orbAttackCounter++;
        const x = this.orbX + 40, y = this.orbY + 20;

        this.level.insertSprites(
            new SigmaShockProjectile(
                x,
                y,
                2,
                true,
                speed,
            ),
            new SigmaShockProjectile(
                x,
                y,
                2,
                false,
                speed,
            ),
        )
    }

    /**
     * Enters staeg 2 of the fight.
     */
    changeStage() {
        this.states.set(SigmaStageState, SigmaStageState.stage2);
        this.states.set(SigmaAttackState, SigmaAttackState.none);
        this.flip = false;

        for (let i = 1; i <= 6; i++) {
            this.game.setTimeout(() => {
                const e = new Explosion(
                    this.x + (Math.random() - 0.5) * 100,
                    this.y + (Math.random() - 0.6) * 100,
                    Math.max(5, Math.random() * 6),
                );

                this.level.insertSprite(e);

                e.start()
            }, 10 * i);
        }

        this.game.setTimeout(() => {
            // This state is for the stage 2 animations (Different from the previous idle)
            this.currentAnimation = this.animations.idle;

            this.game.setTimeout(() => {
                this.startCycle2();
            }, 40);
        }, 60);
    }

    /**
     * Starts the sickle swipe attack.
     */
    sickleSwipe() {
        this.currentAnimation = this.animations.prepareSickle_0;
    }

    /**
     * Spawns the lasers from Sigma's eyes.
     * When the lasers finish, a cycle starts.
     */
    spawnLasers() {
        const long = this.states.get(SigmaAttackState) === SigmaAttackState.longLaser;

        // Necessary state change
        if (long) {
            this.states.set(SigmaAttackState, SigmaAttackState.none);
        }

        const x = this.flip ? this.x + 115 : this.rx - 29,
            y = this.y + 37,
            bottom = this.by - 60,
            close = (long ? 10 : 0) + 60,
            far = (long ? 10 : 0) + 70,
            slow = long ? 2.5 : 2,
            fast = long ? 3 : 2.5,
            duration = 120;

        const l0 = new SigmaLaser(
            x,
            this.flip ? y : y + 2,
            bottom,
            this.flip ? far : close,
            this.flip,
            undefined,
            this.flip ? fast : slow
        );

        // Head laser
        const hl = new SigmaLaser(
            x + (this.flip ? 2 : 7),
            y - (this.flip ? 12 : 10),
            bottom,
            85,
            this.flip,
            undefined,
            1,
            undefined,
            true
        );

        const l1 = new SigmaLaser(
            x + 10,
            this.flip ? y : y + 3,
            bottom,
            this.flip ? close : far,
            this.flip,
            () => {
                // L1 is automatically removed by duration
                this.level.removeSprite(l0);

                if (long) {
                    this.level.removeSprite(hl);
                }

                this.flip = this.player.x > this.x;
                this.currentAnimation = this.animations.idle;

                // Start the cycle iff not long
                if (!long) {
                    this.startCycle2();
                } else {
                    this.sickleSwipe();
                }
            },
            this.flip ? slow : fast,
            duration
        );

        // Insert the sprite into the game
        this.level.insertSprites(l0, l1);

        if (long) {
            // Insert the head laser
            this.level.insertSprite(hl);
        }
    }

    /**
     * Starts the laser attack.
     */
    laser() {
        this.flip = this.player.x <= this.x;
        this.states.set(SigmaAttackState, SigmaAttackState.laser);
        this.currentAnimation = this.animations.prepareLaser;
    }

    /**
     * Starts the long laser attack.
     */
    longLaser() {
        this.flip = this.player.x <= this.x;
        this.states.set(SigmaAttackState, SigmaAttackState.longLaser);
        this.currentAnimation = this.animations.prepareLaser;
    }

    /**
     * Throws the sickle.
     */
    throwSickle() {
        this.currentAnimation = this.animations.prepareSickle_2;
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "boss";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Sigma.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['sigma_0.png', 'sigma_1.png', 'sigma_2.png', 'sigma_3.png'];
    }

    /**
     * @returns {string[]} sound files.
     */
    static get sounds() {
        return [];
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    get sheets() {
        return Sigma.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Sigma.sounds;
    }
    /**
     * Destroys the sprite
     */
    destroy() {
        const level = this.level;

        if (this.states.get(SigmaStageState) === SigmaStageState.stage1) {
            this.startCycle2();
        } else {
            this.player.progressLevel();

            for (let i = 0; i < this.initHp / 10; i++) {
                this.game.setTimeout(() => {
                    const e = new Explosion(
                        this.x + (-10 + Math.random() * 20),
                        this.y + (-10 + Math.random() * 20),
                        this.scale
                    )

                    level.insertSprite(e);

                    e.start();
                }, i * 10);
            }

            this.level.removeSprite(this);
        }
    }

}
