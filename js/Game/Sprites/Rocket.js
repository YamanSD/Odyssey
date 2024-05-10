'use strict'

/**
 * @exports Rocket
 */

/**
 * State for the rocket launch.
 *
 * @type {{none: number, launching: number, launched: number}}
 */
const LaunchState = {
    none: 0,
    launching: 1,
    launched: 2
};

/**
 * @class Rocket
 *
 * Class representing the rocket projectile.
 */
class Rocket extends Sprite {
    /**
     * Object containing the animations of Spiky.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * @type {number} ID of the trail animation.
     * @private
     */
    #trailAnimation;

    /**
     * @type {number} ID of the shock wave animation.
     * @private
     */
    #shockwaveAnimation;

    /**
     * @param level {Level} level containing the rocket.
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param toLeft {boolean} true to throw the rocket to the left.
     * @param scale {number} scale of Rocket.
     * @param hitBoxBrush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?} object hit-box brush properties.
     */
    constructor(
        level,
        x,
        y,
        toLeft,
        scale,
        hitBoxBrush
    ) {
        super(
            {},
            ['gigadeath.gif'],
            [x, y],
            () => {
                // Accelerate to the boundaries of the map
                this.accelerateTo({
                    x: toLeft ? 0 : this.game.width,
                    y: y + 10,
                    speed_0: 1,
                    acceleration: 0.025,
                    max_speed: 16,
                }, () => {
                    this.explode();
                });

                if (this.level && this.colliding(this.player)) {
                    this.explode();
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

        // Flip the sprite to the right
        if (!toLeft) {
            this.flip = true;
        }

        // Add the rocket to the level
        this.level = level;

        // Create the animations
        this.#animations = {
            trailStart: this.createAnimation(
                0,
                59,
                126,
                2,
                1,
                2,
                16,
                15,
                1,
                0,
                4,
                undefined,
                () => {
                    this.#trailAnimation = this.animations.trailLoop;
                }
            ),
            trailLoop: this.createAnimation(
                0,
                96,
                126,
                4,
                1,
                4,
                24,
                17,
                1,
                0,
                3
            ),
            shockWave: this.createAnimation(
                0,
                94,
                185,
                5,
                1,
                5,
                22,
                28,
                1,
                0,
                2,
                undefined,
                () => {
                    this.#shockwaveAnimation = this.animations.shockWaveLoop;
                }
            ),
            shockWaveLoop: this.createAnimation(
                0,
                209,
                185,
                1,
                1,
                1,
                1,
                1,
                0,
                0,
                1
            ),
            launch: this.createAnimation(
                0,
                37,
                155,
                4,
                1,
                4,
                32,
                21,
                1,
                0,
                4,
                () => {
                    this.states.set(LaunchState, LaunchState.launching);
                },
                () => {
                    this.states.set(LaunchState, LaunchState.launched);
                    this.currentAnimation = this.animations.flying;
                }
            ),
            flying: this.createAnimation(
                0,
                184,
                155,
                4,
                1,
                4,
                29,
                21,
                1,
                0,
                4
            ),
        };

        // Launch the rocket
        this.currentAnimation = this.animations.launch;
        this.#shockwaveAnimation = this.animations.shockWave;
        this.#trailAnimation = this.animations.trailStart;
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of Rocket.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {Object<string, number>} animations of the sprite.
     */
    get animations() {
        return this.#animations;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get defaultHitBox() {
        return this.convertHitBoxes([
            {
                x: this.x,
                y: this.y,
                width: 29,
                height: 21
            }
        ]);
    }

    /**
     * @returns {number} current width of the animation.
     */
    get width() {
        if (this.currentAnimation === undefined) {
            return 0;
        }

        return this.scale * this.getAnimation(this.currentAnimation).singleWidth;
    }

    /**
     * @returns {number} current height of the animation.
     */
    get height() {
        if (this.currentAnimation === undefined) {
            return 0;
        }

        return this.scale * this.getAnimation(this.currentAnimation).singleHeight;
    }

    /**
     * @returns {Sprite} a clone of this sprite.
     */
    get clone() {
        return undefined;
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        const trailWidth = this.getAnimation(this.#trailAnimation).singleWidth;

        this.drawAnimation(
            this.#trailAnimation,
            this.flip ? this.x - (trailWidth + 16) : this.rx - trailWidth / 2,
            this.y + this.height / 2 - 16,
            context
        );
        this.drawCurrentAnimation(
            this.x,
            this.y,
            context
        );
        this.drawAnimation(
            this.#shockwaveAnimation,
            this.flip ? this.rx - 22 * this.scale : this.x,
            this.y - 9,
            context
        );
    }

    /**
     * Moves the current animations
     */
    moveCurrentAnimation() {
        this.moveAnimation(this.#trailAnimation);
        this.moveAnimation(this.#shockwaveAnimation);
        super.moveCurrentAnimation();
    }

    /**
     * Explodes the rocket.
     */
    explode() {
        const exp = new Explosion(
            this.x - 50,
            this.y - 50,
            1.5,
        );

        exp.start();
        this.game.insertSprite(exp);
        this.game.removeSprite(this);
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "enemyProjectile";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Rocket.type;
    }
}
