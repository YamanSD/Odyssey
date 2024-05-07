import {Sprite} from "../../GameEngine";


/**
 * State for the activity of the field.
 *
 * @type {{dormant: number, active: number}}
 */
const ActState = {
    dormant: 0,
    active: 1
};

/**
 * @class IrisField
 *
 * Class representing IrisFields.
 */
export default class IrisField extends Sprite {
    /**
     * Object containing the animations of IrisField.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * Bottommost y-coordinate field.
     *
     * @type {number}
     * @private
     */
    #by;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param by {number} bottom y-coordinate.
     * @param scale {number} scale of IrisField.
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
        by,
        scale,
        hitBoxBrush
    ) {
        super(
            {},
            ['iris_0.gif'],
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

        this.#animations = {
            idleAbove: this.createAnimation(
                0,
                353,
                1536,
                2,
                2,
                4,
                90,
                86,
                1,
                1,
                4
            ),
            idleBelow: this.createAnimation(
                0,
                353,
                1536,
                2,
                2,
                4,
                90,
                86,
                1,
                1,
                4
            ),
            connection_0: this.createAnimation(
                0,
                583,
                1501,
                6,
                1,
                6,
                16,
                32,
                1,
                0,
                4
            ),
            connection_1: this.createAnimation(
                0,
                583,
                1501,
                6,
                1,
                6,
                16,
                32,
                1,
                0,
                4
            ),
            connection_2: this.createAnimation(
                0,
                583,
                1501,
                6,
                1,
                6,
                16,
                32,
                1,
                0,
                4
            ),
            connection_3: this.createAnimation(
                0,
                583,
                1501,
                6,
                1,
                6,
                16,
                32,
                1,
                0,
                4
            ),
        };

        this.states.set(ActState, ActState.dormant);
        this.by = by;
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of IrisField.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {number} bottommost y.
     */
    get by() {
        return this.#by;
    }

    /**
     * @returns {Object<string, number>} animations object.
     */
    get animations() {
        return this.#animations;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get defaultHitBox() {
        return this.convertHitBoxes([]);
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
     * @param value {number} new bottommost y-coordinate.
     */
    set by(value) {
        this.#by = value;
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
        if (this.states.get(ActState) === ActState.active) {
            this.drawAnimation(
                this.animations.connection_0,
                this.x + this.width / 2 - 32,
                this.y + this.height - 15,
                context,
                4
            );
            this.drawAnimation(this.animations.idleAbove, this.x, this.y, context);
            this.drawAnimation(this.animations.idleBelow, this.x, this.by, context);
        }
    }

    /**
     * Deactivates the animation.
     */
    deactivate() {
        this.states.set(ActState, ActState.dormant);
        this.game.removeSprite(this);
    }

    /**
     * Moves the current animation.
     */
    moveCurrentAnimation() {
        if (this.states.get(ActState) === ActState.active) {
            for (const id of Object.values(this.animations)) {
                if (id !== this.currentAnimation) {
                    this.moveAnimation(id);
                }
            }
        }

        super.moveCurrentAnimation();
    }

    /**
     * Starts the energy field formation process.
     */
    activate() {
        this.states.set(ActState, ActState.active);
        this.currentAnimation = this.animations.idleAbove;
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "irisField";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return IrisField.type;
    }
}
