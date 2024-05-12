'use strict'

/**
 * @exports IrisBeam
 */


/**
 * State for the beam power.
 *
 * @type {{charging: number, full: number}}
 */
const PowerState = {
    charging: 0,
    full: 1
};


/**
 * @class IrisBeam
 *
 * Class representing the beams of Iris.
 */
class IrisBeam extends Sprite {
    /**
     * Object containing the animations of IrisCrystal.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of IrisBeam.
     * @param vertical {boolean} true for a vertical beam.
     * @param duration {number?} duration of the beam.
     * @param onEnd {function()?} called when the beam ends.
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
        vertical,
        duration = 400,
        onEnd,
        hitBoxBrush
    ) {
        super(
            {},
            ['iris_0.png'],
            [x, y],
            () => {
                if (
                    this.states.get(PowerState) === PowerState.full
                    && this.colliding(this.player)
                ) {
                    this.player.damage(10);
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

        if (vertical) {
            this.rotation = 90;
        }

        this.#animations = {
            charging: this.createAnimation(
                0,
                5,
                1374,
                1,
                4,
                4,
                295,
                44,
                0,
                1,
                4,
                undefined,
                () => {
                    this.states.set(PowerState, PowerState.full);
                    this.currentAnimation = this.animations.idle;
                },
            ),
            idle: this.createAnimation(
                0,
                9,
                1558,
                1,
                4,
                4,
                295,
                44,
                0,
                1,
                4,
                () => {
                    this.game.setTimeout(
                        () => {
                            this.currentAnimation = this.animations.decharge;

                            if (onEnd) {
                                onEnd();
                            }
                        },
                        duration
                    );
                },
                undefined,
                (x, y) => {
                    return [
                        {
                            x,
                            y,
                            width: 295,
                            height: 44,
                            rotation: vertical ? 90 : 0
                        }
                    ];
                }
            ),
            decharge: this.createAnimation(
                0,
                7,
                1800,
                1,
                4,
                4,
                295,
                44,
                0,
                1,
                2,
                () => {
                    this.states.set(PowerState, PowerState.charging);
                },
                () => {
                    // Remove the beam on end
                    this.game.removeSprite(this);
                }
            ),
        };
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of IrisBeam.
     */
    get desc() {
        return super.desc;
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
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);
    }

    /**
     * Start the beam.
     */
    start() {
        this.currentAnimation = this.animations.charging;
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
        return IrisBeam.type;
    }
}
