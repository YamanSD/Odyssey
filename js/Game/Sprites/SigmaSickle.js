'use strict'

/**
 * @exports SigmaSickle
 */

/**
 * State for the movement state of the projectile.
 *
 * @type {{horizontal: number, vertical: number, down: number}}
 */
const SigmaSickleState = {
    down: 0,
    horizontal: 1,
    vertical: 2,
};

/**
 * @class SigmaSickle
 *
 * Class representing the sickle projectile.
 */
class SigmaSickle extends Sprite {
    /**
     * Reference to the current angle.
     *
     * @type {{value?: number}}
     * @private
     */
    #angleRef;

    /**
     * @param level {Level} level of the projectile.
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of SigmaSickle.
     * @param toLeft {boolean} if true goes to the left.
     * @param speed {number?} speed of the projectile.
     * @param onCycle {function()?} called when the cycle is done.
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
        scale,
        toLeft,
        onCycle,
        speed = 5,
        hitBoxBrush
    ) {
        super(
            {},
            [x, y],
            () => {
                this.circleAround(
                    this.#angleRef,
                    this.initX + (toLeft ? -200 : 200),
                    this.initY + 200,
                    toLeft ? -Math.abs(speed) : Math.abs(speed),
                    () => {
                        this.game.removeSprite(this);

                        if (onCycle) {
                            onCycle();
                        }
                    }
                )

                this.moveCurrentAnimation();
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale
        );

        // Initialize the level
        this.level = level;

        // Angle reference
        this.#angleRef = {
            value: -70 + (toLeft ? 0 : -50),
        };

        this.states.set(SigmaSickleState, SigmaSickleState.down);
        this.currentAnimation = this.createAnimation(
            0,
            22,
            510,
            4,
            1,
            4,
            90,
            88,
            1,
            0,
            1,
        );
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of SigmaSickle.
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
                x: this.x + 7,
                y: this.y + 7,
                width: 76,
                height: 74
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
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "enemyProjectile";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return SigmaSickle.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['sigma_2.png'];
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
        return SigmaSickle.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return SigmaSickle.sounds;
    }
}
