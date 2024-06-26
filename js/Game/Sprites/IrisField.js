'use strict'

/**
 * @exports IrisField
 */


/**
 * State for the activity of the field.
 *
 * @type {{dormant: number, active: number}}
 */
const IrisFieldActState = {
    dormant: 0,
    active: 1
};

/**
 * @class IrisField
 *
 * Class representing IrisFields.
 */
class IrisField extends Sprite {
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

        this.states.set(IrisFieldActState, IrisFieldActState.dormant);
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
     * @param value {number} new bottommost y-coordinate.
     */
    set by(value) {
        this.#by = value;
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        if (this.states.get(IrisFieldActState) === IrisFieldActState.active) {
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
        this.states.set(IrisFieldActState, IrisFieldActState.dormant);
        this.level.removeSprite(this);
    }

    /**
     * Moves the current animation.
     */
    moveCurrentAnimation() {
        if (this.states.get(IrisFieldActState) === IrisFieldActState.active) {
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
        this.states.set(IrisFieldActState, IrisFieldActState.active);
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

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['iris_0.png'];
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
        return IrisField.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return IrisField.sounds;
    }
}
