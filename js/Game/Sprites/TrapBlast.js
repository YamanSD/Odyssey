'use strict'

/**
 * @exports TrapBlast
 */

/**
 * State for the activation of the trap.
 * @type {{notActive: number, active: number}}
 */
const ActiveState = {
    notActive: 0,
    active: 1,
};


/**
 * @class TrapBlast
 *
 * Class representing the grenade man enemy.
 */
class TrapBlast extends Sprite {
    /**
     * Object containing the animations of TrapBlast.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * True if it can fire.
     *
     * @type {boolean}
     * @private
     */
    #canFire;

    /**
     * True if the trap is active or being activated.
     *
     * @type {boolean}
     * @private
     */
    #isActive;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of TrapBlast.
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
            [x, y],
            (tick) => {
                if (this.player) {
                    if (this.states.get(ActiveState) === ActiveState.active) {
                        if (tick % 250 === 0) {
                            this.#canFire = true;
                        }

                        if (this.#canFire && this.euclideanDistance(this.player) <= 600) {
                            this.shoot();
                        }
                    } else if (!this.isActive && this.euclideanDistance(this.player) <= 300) {
                        this.activate();
                    }
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

        // Initially cannot fire
        this.#canFire = false;
        this.#isActive = false;

        // Set the activity state
        this.states.set(ActiveState, ActiveState.notActive);

        // Create the animations
        this.#animations = {
            idle: this.createAnimation(
                0,
                58,
                265,
                1,
                1,
                1,
                41,
                31,
                0,
                0,
                1,
                undefined,
                undefined,
                (x, y) => {
                    return [{
                        x,
                        y,
                        width: 1,
                        height: 1
                    }];
                }
            ),
            comeOutStart: this.createAnimation(
                0,
                6,
                1,
                1,
                9,
                9,
                44,
                31,
                0,
                1,
                4,
                () => {
                    this.#isActive = true;
                },
                () => {
                    this.currentAnimation = this.animations.comeOutPrep;
                }
            ),
            comeOutPrep: this.createAnimation(
                0,
                58,
                9,
                1,
                8,
                8,
                41,
                31,
                0,
                1,
                4,
                undefined,
                () => {
                    this.currentAnimation = this.animations.comeOutEnd;
                }
            ),
            comeOutEnd: this.createAnimation(
                0,
                101,
                9,
                1,
                8,
                8,
                52,
                31,
                0,
                1,
                4,
                undefined,
                () => {
                    this.states.set(ActiveState, ActiveState.active);
                    this.currentAnimation = this.animations.active;
                }
            ),
            active: this.createAnimation(
                0,
                100,
                265,
                1,
                1,
                1,
                52,
                31,
                0,
                0,
                1,
            ),
            shoot: this.createAnimation(
                0,
                167,
                57,
                1,
                3,
                3,
                54,
                31,
                0,
                1,
                4,
                undefined,
                () => {
                    this.fire();
                    this.currentAnimation = this.animations.active;
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
     * @returns {boolean} true if the trap is active.
     */
    get isActive() {
        return this.#isActive;
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of TrapBlast.
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
                x: this.x + 6,
                y: this.y,
                width: 44,
                height: 31
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
     * Activates the trap.
     */
    activate() {
        this.currentAnimation = this.animations.comeOutStart;
    }

    /**
     * Starts firing a shock projectile.
     */
    shoot() {
        this.currentAnimation = this.animations.shoot;
    }

    /**
     * Fires a shock projectile.
     */
    fire() {
        this.level.insertSprite(
            new ShockProjectile(
                this.x,
                this.y,
                2
            )
        );

        this.#canFire = false;
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
        return TrapBlast.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['trap_blast.png'];
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
        return TrapBlast.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return TrapBlast.sounds;
    }
}
