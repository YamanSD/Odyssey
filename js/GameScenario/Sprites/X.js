import {Sprite} from "../../GameEngine";


/**
 * @class X
 *
 * Class representing the playable character X.
 */
export default class X extends Sprite {
    /**
     * ID of the breathing animation of X.
     *
     * @type {number}
     * @private
     */
    #breathingAnimation;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param onUpdate {(function(Set<HitBox>, number): boolean)?} called on each update cycle, with the current tick.
     *  @param hitBoxBrush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?} object hit-box brush properties.
     */
    constructor(
        x,
        y,
        onUpdate,
        hitBoxBrush
    ) {
        super(
            {},
            ['x.gif'],
            [x, y],
            onUpdate,
            undefined,
            hitBoxBrush
        );

        this.#breathingAnimation = this.createAnimation(
            0,
            189,
            174,
            5,
            1,
            5,
            35,
            46,
            1,
            0
        );

        this.currentAnimation = this.#breathingAnimation;
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of X.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get hitBox() {
        return this.convertHitBoxes([
            {
                x: this.x + 16,
                y: this.y,
                width: 14,
                height: 11
            },
            {
                x: this.x + 12,
                y: this.y + 11,
                width: 23,
                height: 35
            },
            {
                x: this.x + 8,
                y: this.y + 16,
                width: 4,
                height: 13
            },
            {
                x: this.x,
                y: this.y + 29,
                width: 12,
                height: 17
            },
        ]);
    }

    /**
     * @returns {Sprite} a clone of this sprite.
     */
    get clone() {
        return new X(
            this.x,
            this.y,
            this.onUpdate,
            this.hitBoxBrush
        );
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @Abstract
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);
    }

    moveBreathingAnimation() {
        this.moveAnimation(this.#breathingAnimation);
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "hero";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return X.type;
    }
}
