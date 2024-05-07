import {Sprite} from "../../GameEngine";
import MettaurProjectile from "./MettaurProjectile.js";


/**
 * @class Mettaur
 *
 * Class representing the mettaur enemy.
 */
export default class Mettaur extends Sprite {
    /**
     * Object containing the animations of Mettaur.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

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
            ['mettaur.gif'],
            [x, y],
            () => {

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
            //TODO
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
                x: this.x + 5,
                y: this.y,
                width: 45,
                height: 55
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
        this.drawCurrentAnimation(this.x, this.y, context);
    }

    throwGrenade() {
        this.currentAnimation = this.animations.throwGrenadeStart;
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
}
