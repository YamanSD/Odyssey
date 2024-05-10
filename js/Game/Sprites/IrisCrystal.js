'use strict'

/**
 * @exports IrisCrystal
 */

/**
 * State for the crystal.
 * @type {{forming: number, formed: number, deformed: number, attacking: number}}
 */
const CrystalState = {
    deformed: 0,
    forming: 1,
    formed: 2,
    attacking: 3,
};

/**
 * @class IrisCrystal
 *
 * Class representing IrisCrystals.
 */
class IrisCrystal extends Sprite {
    /**
     * Object containing the animations of IrisCrystal.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * Mote-To instructions, called with onUpdate.
     *
     * @type {[number, number, number, function()?]}
     * @private
     */
    #moveToInstructions;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of IrisCrystal.
     * @param beam {IrisBeam?} beam being fired.
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
        beam,
        hitBoxBrush
    ) {
        super(
            {},
            ['iris_0.gif'],
            [x, y],
            () => {
                if (this.#moveToInstructions) {
                    super.moveTo(...this.#moveToInstructions);

                    if (beam) {
                        beam.x = this.x + this.width + 17;
                        beam.y = this.y - beam.width;
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

        this.#animations = {
            deformed: this.createAnimation(
                0,
                113,
                1336,
                5,
                1,
                5,
                20,
                25,
                1,
                0,
                5
            ),
            formingStart: this.createAnimation(
                0,
                218,
                1338,
                6,
                1,
                6,
                25,
                27,
                1,
                0,
                4,
                () => {
                    this.states.set(CrystalState, CrystalState.forming);
                },
                () => {
                    // Adjust for centering
                    this.x -= 6;
                    this.y -= 4;

                    this.currentAnimation = this.animations.formingMid;
                }
            ),
            formingMid: this.createAnimation(
                0,
                379,
                1336,
                1,
                1,
                1,
                31,
                31,
                0,
                0,
                4,
                undefined,
                () => {
                    // Adjust for centering
                    this.x -= 24;
                    this.y -= 24;

                    this.currentAnimation = this.animations.formingEnd;
                }
            ),
            formingEnd: this.createAnimation(
                0,
                415,
                1328,
                2,
                1,
                2,
                47,
                47,
                1,
                0,
                4,
                undefined,
                () => {
                    // Adjust for centering
                    this.x += 22;
                    this.y += 16;

                    this.states.set(CrystalState, CrystalState.formed);
                    this.currentAnimation = this.animations.idle;
                }
            ),
            glow: this.createAnimation(
                0,
                513,
                1332,
                4,
                1,
                4,
                39,
                39,
                1,
                0,
                4,
            ),
            idle: this.createAnimation(
                0,
                356,
                1457,
                10,
                1,
                10,
                31,
                31,
                1,
                0,
                4,
                () => {
                    this.states.set(CrystalState, CrystalState.formed);
                }
            ),
            attacking: this.createAnimation(
                0,
                718,
                1806,
                7,
                1,
                7,
                31,
                32,
                1,
                0,
                4,
                () => {
                    this.states.set(CrystalState, CrystalState.attacking);
                }
            ),
        };

        this.states.set(CrystalState, CrystalState.deformed);
        this.currentAnimation = this.animations.deformed;
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of IrisCrystal.
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
     * @returns {boolean} true if the crystal is glowing.
     */
    get glows() {
        const st = this.states.get(CrystalState);

        return st === CrystalState.formed || st === CrystalState.attacking;
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
        if (this.glows) {
            this.drawAnimation(this.animations.glow, this.x - 10, this.y - 10, context);
        }

        this.drawCurrentAnimation(this.x, this.y, context);
    }

    /**
     * Moves the current animation.
     */
    moveCurrentAnimation() {
        if (this.glows) {
            this.moveAnimation(this.animations.glow);
        }

        super.moveCurrentAnimation();
    }

    /**
     * Applies linear interpolation to move this sprite to the destination.
     *
     * @param x {number} destination x-coordinate.
     * @param y {number} destination y-coordinate.
     * @param speed {number} speed of movement.
     * @param onArrival {function()?} callback function. Triggered when the sprite reaches the destination.
     * @returns {[number, number]} the speed vector used.
     */
    moveTo(x, y, speed, onArrival) {
        this.#moveToInstructions = [x, y, speed, () => {
            this.#moveToInstructions = undefined;

            if (onArrival) {
                onArrival();
            }
        }];
    }

    /**
     * Starts the crystal formation process
     */
    form() {
        this.currentAnimation = this.animations.formingStart;
    }

    /**
     * Starts the attack.
     */
    attack() {
        this.currentAnimation = this.animations.attacking;
    }

    /**
     * Stops the attack.
     */
    passive() {
        this.currentAnimation = this.animations.idle;
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "irisCrystal";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return IrisCrystal.type;
    }
}
