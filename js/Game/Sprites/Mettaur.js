'use strict'

/**
 * @exports Mettaur
 */


/**
 * State for the Mettaur attacks.
 *
 * @type {{dormant: number, runningAway: number, wakingUp: number, active: number}}
 */
const MettaurActState = {
    dormant: 0,
    active: 1,
    wakingUp: 2,
    runningAway: 3
};


/**
 * @class Mettaur
 *
 * Class representing the mettaur enemy.
 */
class Mettaur extends Sprite {
    /**
     * Object containing the animations of Mettaur.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * Cool down for the bullets.
     *
     * @type {number}
     * @private
     */
    #coolDown;

    /**
     * Move to x-coordinate of the destination used to walk the Mettaur.
     *
     * @type {number | undefined}
     * @private
     */
    #moveToDestination;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of Mettaur.
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
        scale,
        hitBoxBrush
    ) {
        super(
            {},
            [x, y],
            () => {
                // Mettaur must run
                if (this.#moveToDestination !== undefined) {
                    this.moveTo(
                        this.#moveToDestination,
                        this.y,
                        3,
                        () => {
                            this.#moveToDestination = undefined;
                            this.states.set(MettaurActState, MettaurActState.active);
                        }
                    );
                }

                switch (this.states.get(MettaurActState)) {
                    case MettaurActState.dormant:
                        if (this.manhattanDistance(this.player) < 600) {
                            this.states.set(MettaurActState, MettaurActState.wakingUp);
                            this.currentAnimation = this.animations.wakeUp;
                        }
                        break;
                    case MettaurActState.active:
                        this.flip = this.player.x >= this.x;

                        if (this.manhattanDistance(this.player) < 200) {
                            // Run away
                            this.states.set(MettaurActState, MettaurActState.runningAway);
                        } else if (this.#coolDown <= 0) {
                            this.shoot();

                            // Reset cool down
                            this.#coolDown = 75;
                        }
                        break;
                    case MettaurActState.runningAway:
                        if (this.#moveToDestination === undefined) {
                            this.currentAnimation = this.animations.walk;
                            this.flip = !this.flip;
                            this.#moveToDestination = this.x + (this.flip ? 200 : -200);
                        }
                        break;
                }

                this.#coolDown--;
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
            idleDormant: this.createAnimation(
                0,
                35,
                12,
                1,
                1,
                1,
                27,
                31,
                0,
                0,
                4,
                undefined,
                undefined,
                (x, y) => {
                    return [
                        {
                            x: x + 2,
                            y: y + 15,
                            width: 24,
                            height: 16
                        }
                    ]
                }
            ),
            wakeUp: this.createAnimation(
                0,
                35,
                12,
                5,
                1,
                5,
                27,
                31,
                1,
                0,
                4,
                () => {
                    this.states.set(MettaurActState, MettaurActState.wakingUp);
                },
                () => {
                    this.states.set(MettaurActState, MettaurActState.active);
                    this.currentAnimation = this.animations.idle;
                }
            ),
            idle: this.createAnimation(
                0,
                175,
                12,
                1,
                1,
                1,
                27,
                31,
                0,
                0,
                4
            ),
            walk: this.createAnimation(
                0,
                14,
                52,
                8,
                1,
                8,
                25,
                36,
                1,
                0,
                4,
            ),
            prepareJump: this.createAnimation(
                0,
                25,
                99,
                3,
                1,
                3,
                28,
                34,
                1,
                0,
                4,
                () => {
                    // this.states.set(MettaurActState, MettaurActState.jumping);
                },
                () => {
                    this.currentAnimation = this.animations.inAir;
                }
            ),
            inAir: this.createAnimation(
                0,
                122,
                102,
                1,
                1,
                1,
                29,
                31,
                0,
                0,
                1
            ),
            land: this.createAnimation(
                0,
                155,
                100,
                3,
                1,
                3,
                27,
                33,
                1,
                0,
                4,
                undefined,
                () => {
                    // this.states.set(MettaurActState, MettaurActState.attacking);
                }
            ),
            shootStart: this.createAnimation(
                0,
                14,
                144,
                4,
                1,
                4,
                35,
                32,
                1,
                0,
                4,
                () => {
                    // Pushback effect
                    if (this.flip) {
                        this.x -= 10;
                    } else {
                        this.x += 10;
                    }
                },
                () => {
                    this.level.insertSprite(
                        new MettaurProjectile(
                            this.x,
                            this.y + this.height / 2 + 10,
                            !this.flip,
                            2
                        )
                    );
                    this.currentAnimation = this.animations.shootEnd;
                }
            ),
            shootEnd: this.createAnimation(
                0,
                164,
                139,
                3,
                1,
                3,
                25,
                37,
                1,
                0,
                4,
                undefined,
                () => {
                    this.currentAnimation = this.animations.idle;
                }
            ),
        };

        // Initially can shoot
        this.#coolDown = 0;

        this.states.set(MettaurActState, MettaurActState.dormant);
        this.currentAnimation = this.animations.idleDormant;
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
     * }} description of Mettaur.
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
                x: this.x,
                y: this.y + 8,
                width: 26,
                height: 24
            }
        ]);
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);
    }

    /**
     * Shoots its projectile.
     */
    shoot() {
        if (this.states.get(MettaurActState) === MettaurActState.active) {
            this.currentAnimation = this.animations.shootStart;
        }
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "enemy";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Mettaur.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['mettaur.png'];
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
        return Mettaur.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Mettaur.sounds;
    }
    /**
     * Destroys the sprite
     */
    destroy() {
        const level = this.level;

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
