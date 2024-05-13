'use strict'

/**
 * @exports GrenadeMan
 */


/**
 * @class GrenadeMan
 *
 * Class representing the grenade man enemy.
 */
class GrenadeMan extends Sprite {
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
            () => {
                if (this.player && this) // TODO finish AI

                this.moveCurrentAnimation();
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
            idle: this.createAnimation(
                0,
                69,
                1,
                7,
                1,
                7,
                54,
                55,
                1,
                0,
                16,
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
                12,
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
                8,
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
                8,
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
                8,
                () => {
                    this.game.insertSprite(
                        new Grenade(
                            this.level,
                            this.x,
                            this.y,
                            !this.flip,
                            this.scale
                        )
                    );
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
            {
                x: this.x + 5,
                y: this.y,
                width: 45,
                height: 55
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
        return GrenadeMan.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['grenade_man_0.png'];
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
        return GrenadeMan.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return GrenadeMan.sounds;
    }
}
