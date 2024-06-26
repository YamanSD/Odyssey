'use strict'

/**
 * @exports Bee
 */

/**
 * @class Bee
 *
 * Class representing the bee enemy.
 */
class Bee extends Sprite {
    /**
     * Object containing the animations of Bee.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * Object containing wing animations of Bee.
     *
     * @type {Object<string, number>}
     * @private
     */
    #wingAnimations;

    /**
     * Current wing animation.
     *
     * @type {number | undefined}
     * @private
     */
    #currentWingAnimation;

    /**
     * Vector containing the accelerations.
     *
     * @type {[number, number]}
     * @private
     */
    #accelerationVector;

    /**
     * Vector containing the speeds.
     *
     * @type {[number, number]}
     * @private
     */
    #speedVector;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of Bee.
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
                this.#speedVector[0] = Math.min(this.#accelerationVector[0] + this.#speedVector[0], 5);
                this.#speedVector[1] += this.#accelerationVector[1];
                this.x += this.#speedVector[0];
                this.y += this.#speedVector[1];

                if (this.currentAnimation === this.animations.idle) {
                    this.attack();
                }

                if (this.y > this.player.y) {
                    this.#speedVector[1] = this.#accelerationVector[1] = 0;
                }

                if (this.x < 0) {
                    this.level.removeSprite(this);
                    return;
                }

                this.moveCurrentAnimation();
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale,
            10
        );

        // Movement vectors
        this.#speedVector = [0, 0];
        this.#accelerationVector = [0, 0];

        // Create the animations
        this.#animations = {
            idle: this.createAnimation(
                0,
                6,
                3,
                4,
                1,
                4,
                23,
                33,
                1,
                0,
                4,
            ),
            prepareAttack: this.createAnimation(
                0,
                107,
                3,
                4,
                1,
                4,
                27,
                32,
                1,
                0,
                4,
                () => {
                    this.#accelerationVector[1] = 0.125;
                },
                () => {
                    this.currentAnimation = this.animations.attack;
                }
            ),
            attack: this.createAnimation(
                0,
                52,
                65,
                1,
                1,
                1,
                38,
                25,
                0,
                0,
                10,
                () => {
                    this.#currentWingAnimation = this.#wingAnimations.attack;
                    this.#accelerationVector[0] = -1;
                },
                undefined,
                (x, y) => {
                    return [{
                        x,
                        y,
                        width: 38,
                        height: 25
                    }];
                }
            ),
        };

        this.#wingAnimations = {
            normal: this.createAnimation(
                0,
                83,
                42,
                4,
                1,
                4,
                23,
                15,
                1,
                0,
                2,
            ),
            attack: this.createAnimation(
                0,
                102,
                65,
                5,
                1,
                5,
                8,
                19,
                1,
                0,
                2,
            ),
        };

        this.#currentWingAnimation = this.#wingAnimations.normal;
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
     * }} description of Bee.
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
                y: this.y,
                width: 23,
                height: 33
            }
        ]);
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        if (this.#currentWingAnimation === this.#wingAnimations.normal) {
            // Wings behind bee
            this.drawAnimation(this.#currentWingAnimation, this.x + 16, this.y + 1, context);
            this.drawCurrentAnimation(this.x, this.y, context);
        } else { // Attack
            // Wings in-front bee
            this.drawCurrentAnimation(this.x, this.y, context);
            this.drawAnimation(this.#currentWingAnimation, this.x + 20, this.y - 10, context);
        }


    }

    /**
     * Moves the current bee and wing animation.
     */
    moveCurrentAnimation() {
        super.moveCurrentAnimation();
        this.moveAnimation(this.#currentWingAnimation);
    }

    /**
     * Starts the attacking sequence of Bee.
     */
    attack() {
        this.currentAnimation = this.animations.prepareAttack;
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
        return Bee.type;
    }
    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['bee.png'];
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
        return Bee.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Bee.sounds;
    }

}
