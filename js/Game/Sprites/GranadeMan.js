import {Sprite} from "../../GameEngine";


/**
 * @class GrenadeMan
 *
 * Class representing the grenade man enemy.
 */
export default class GrenadeMan extends Sprite {
    /**
     * Object containing the animations of GrenadeMan.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of GrenadeMan.
     * @param onUpdate {(function(number): boolean)?} called on each update cycle, with the current tick.
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
            ['grenade_man_0.gif'],
            [x, y],
            onUpdate,
            undefined,
            hitBoxBrush
        );

        // Create the animations
        this.#animations = {
            idle: this.createAnimation(
                0,
                14,
                1,
                8,
                1,
                8,
                54,
                55,
                1,
                0,
                15,
            ),
            shootHorizontal: this.createAnimation(
                0,
                16,
                80,
                2,
                1,
                2,
                60,
                47,
                1,
                0,
                15,
            ),
            shootDiagonal: this.createAnimation(
                0,
                163,
                61,
                2,
                1,
                2,
                46,
                67,
                1,
                0,
                15,
            ),
            throwGrenadeStart: this.createAnimation(
                0,
                3,
                201,
                4,
                1,
                4,
                59,
                62,
                1,
                0,
                15,
                undefined,
                () => {
                    this.currentAnimation = this.animations.throwGrenadeEnd;
                }
            ),
            throwGrenadeEnd: this.createAnimation(
                0,
                256,
                218,
                3,
                1,
                3,
                63,
                45,
                1,
                0,
                15,
                () => {
                    // TODO create the grenade instance
                },
                () => {
                    this.currentAnimation = this.animations.idle;
                }
            )
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
     * }} description of GrenadeMan.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get defaultHitBox() {
        return this.convertHitBoxes([

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
        return new GrenadeMan(
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
        this.drawCurrentAnimation(this.x, this.y, context);
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
        return GrenadeMan.type;
    }
}
