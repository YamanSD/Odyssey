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
 * @type {{energyOrb: number, none: number, dash: number}}
 */
const SigmaAttackState = {
    none: 0,
    energyOrb: 1,
    dash: 2,
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
        return this.#animations;
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
     * Starts the attacking cycles.
     */
    startCycle() {
        this.x = (this.#bounds[0] + this.#bounds[1]) / 2;
        this.y = this.initY - 200;
        this.currentAnimation = this.animations.idle;
        this.states.set(SigmaAttackState, SigmaAttackState.none);

        this.game.setTimeout(() => {
            this.startOrbAttack();
        }, 100);
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
        this.x = (this.#bounds[0] + this.#bounds[1]) / 2;
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
        this.states.set(SigmaStageState, SigmaAttackState.none);
        this.flip = false;
        this.currentAnimation = this.animations.idle; // TODO change
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
