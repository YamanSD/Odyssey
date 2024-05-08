import {Sprite} from "../../GameEngine";


/**
 * @class MettaurProjectile
 *
 * Class representing the mettaur projectile.
 */
export default class MettaurProjectile extends Sprite {
    /**
     * Object containing the animations of Spiky.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * @param level {Level} level containing the projectile.
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
        level,
        x,
        y,
        toLeft,
        scale,
        hitBoxBrush
    ) {
        super(
            {},
            ['mettaur.png'],
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

        // Add the projectile to the level
        this.level = level;

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
}
