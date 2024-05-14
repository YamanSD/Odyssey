'use strict'

/**
 * @exports MettaurProjectile
 */


/**
 * @class MettaurProjectile
 *
 * Class representing the mettaur projectile.
 */
class MettaurProjectile extends Sprite {
    /**
     * Object containing the animations of Spiky.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param toLeft {boolean} true to throw the projectile to the left.
     * @param scale {number} scale of MettaurProjectile.
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
        toLeft,
        scale,
        hitBoxBrush
    ) {
        super(
            {},
            [x, y],
            () => {
                if (toLeft) {
                    this.x -= 4;
                } else {
                    this.x += 4;
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
        if (toLeft) {
            this.flip = true;
        }

        // Launch the projectile
        this.currentAnimation = this.createAnimation(
            0,
            116,
            231,
            4,
            1,
            4,
            16,
            14,
            1,
            0,
            4
        );
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of MettaurProjectile.
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
                x: this.x + 4,
                y: this.y + 4,
                width: 10,
                height: 8
            }
        ]);
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(
            this.x,
            this.y,
            context
        );
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
        return MettaurProjectile.type;
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
        return MettaurProjectile.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return MettaurProjectile.sounds;
    }
}
