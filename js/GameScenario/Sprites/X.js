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
     * ID of the walking animation of X.
     *
     * @type {number}
     * @private
     */
    #moveFromIdleAnimation;

    /**
     * ID of the walking animation of X.
     *
     * @type {number}
     * @private
     */
    #keepMovingAnimation;

    /**
     * ID of an animation of X.
     *
     * @type {number}
     * @private
     */
    #jumpAnimation;

    /**
     * ID of an animation of X.
     *
     * @type {number}
     * @private
     */
    #landAnimation;

    /**
     * ID of an animation of X.
     *
     * @type {number}
     * @private
     */
    #spawnAnimationP1;

    /**
     * ID of an animation of X.
     *
     * @type {number}
     * @private
     */
    #spawnAnimationP2;


    /**
     * Scale of the images and hit boxes.
     *
     * @type {number}
     * @private
     */
    #scale;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of X.
     * @param onUpdate {(function(Set<HitBox>, number): boolean)?} called on each update cycle, with the current tick.
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

        this.#scale = scale;

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

        this.#moveFromIdleAnimation = this.createAnimation(
            0,
            68,
            428,
            8,
            1,
            8,
            48,
            48,
            1,
            0,
        );

        this.#keepMovingAnimation = this.createAnimation(
            0,
            68,
            477,
            8,
            1,
            8,
            48,
            48,
            1,
            0,
            4
        );

        this.#jumpAnimation = this.createAnimation(
            0,
            90,
            228,
            8,
            1,
            8,
            34,
            57,
            1,
            0,
            5
        );

        this.#landAnimation = this.createAnimation(
            0,
            376,
            234,
            3,
            1,
            3,
            32,
            51,
            1,
            0,
            5
        );

        this.#spawnAnimationP1 = this.createAnimation(
            0,
            31,
            26,
            2,
            1,
            2,
            20,
            92,
            1,
            0,
            5
        );

        this.currentAnimation = this.#spawnAnimationP1;
    }

    /**
     * @returns {number} the scale of the hero.
     */
    get scale() {
        return this.#scale;
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
        ]).map(h => {
            return h.scale(this.scale, this.x, this.y);
        });
    }

    /**
     * @returns {Sprite} a clone of this sprite.
     */
    get clone() {
        return new X(
            this.x,
            this.y,
            this.scale,
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
        this.drawCurrentAnimation(this.x, this.y, context, 2);
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
