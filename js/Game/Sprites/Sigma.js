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
 * @type {{land: number, sickle: number, energyOrb: number, none: number, dash: number}}
 */
const SigmaAttackState = {
    none: 0,
    energyOrb: 1,
    dash: 2,
    sickle: 3,
    land: 4,
    laser: 5,
};

/**
 * State of the dash direction of sigma.
 *
 * @type {{left: number, none: number, right: number}}
 */
const SigmaDashDirection = {
    none: 0,
    left: 1,
    right: 2,
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
        super(
            {},
            ['sigma_0.gif', 'sigma_1.png', 'sigma_2.png', 'sigma_3.png'],
            [x, y],
            (tick) => {
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
                                    this.middleBound,
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
                                        this.spawnOrbs();
                                        this.currentAnimation = this.animations.land;
                                        this.states.set(SigmaAttackState, SigmaAttackState.none);

                                        this.game.setTimeout(() => {
                                            // Start the laser attack
                                            this.laser();
                                        }, 40);
                                    }
                                );
                                break;
                            case SigmaAttackState.laser:
                                // TODO
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
            scale
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
                3
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
                    this.currentAnimation = this.animations.jump;
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
                1
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
                    this.x -= 30 * this.scale;
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
                    this.x += 20 * this.scale;
                    this.y += 21 * this.scale;

                    this.game.insertSprite(
                        new SigmaSickle(
                            this.level,
                            this.x,
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
        return this.convertHitBoxes([
            {
                x: this.x + 5,
                y: this.y,
                width: 45,
                height: 55
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
        // TODO
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
     */
    spawnOrbs() {
        this.#orbAttackCounter++;
        const x = this.orbX + 40, y = this.orbY + 20;

        this.game.insertSprites(
            new SigmaShockProjectile(
                this.level,
                x,
                y,
                2,
                true
            ),
            new SigmaShockProjectile(
                this.level,
                x,
                y,
                2,
                false
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

        // This state is for the stage 2 animations (Different from the previous idle)
        this.currentAnimation = this.animations.idle;

        // TODO change
    }

    /**
     * Starts the sickle swipe attack.
     */
    sickleSwipe() {
        this.currentAnimation = this.animations.prepareSickle_0;
    }

    /**
     * Starts the laser attack.
     */
    laser() {
        this.flip = this.player.x <= this.x;
        this.currentAnimation = this.animations.prepareLaser;
        this.states.set(SigmaAttackState, SigmaAttackState.laser);
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
}
