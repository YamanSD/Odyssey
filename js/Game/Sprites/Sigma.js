'use strict'

/**
 * @exports Sigma
 */


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
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
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
        scale,
        hitBoxBrush
    ) {
        super(
            {},
            ['sigma_man_0.gif'],
            [x, y],
            () => {

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

        };

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
        return "boss";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Sigma.type;
    }
}
