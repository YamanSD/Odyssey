'use strict'

/**
 * @exports Player
 */


/**
 * @class Player
 *
 * Class representing the playable character Player.
 */
class Player extends Sprite {
    /**
     * Object containing the animations of Player.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of Player.
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
            ['x_0.png', 'x_1.png'],
            [x, y],
            onUpdate,
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale
        );

        // TODO Add rest of animations and update buster
        // TODO add zero (not vital)

        // Create the animations
        this.#animations = {
            idle: this.createAnimation(
                0,
                6,
                170,
                5,
                1,
                5,
                35,
                49,
                1,
                0,
                15,
            ),
            startMove: this.createAnimation(
                0,
                463,
                252,
                2,
                1,
                2,
                33,
                48,
                1,
                0,
                3,
                undefined,
                () => {
                    this.currentAnimation = this.animations.moveLoop
                }
            ),
            moveLoop: this.createAnimation(
                0,
                676,
                61,
                4,
                4,
                14,
                54,
                52,
                1,
                1,
                3
            ),
            idleLowHp: this.createAnimation(
                0,
                12,
                547,
                6,
                1,
                6,
                33,
                48,
                1,
                0,
                30
            ),
            dashStart: this.createAnimation(
                0,
                71,
                310,
                3,
                1,
                3,
                53,
                45,
                1,
                0,
                2
            ),
            dashLoop: this.createAnimation(
                0,
                252,
                310,
                1,
                1,
                1,
                53,
                45,
                0,
                0,
                2
            ),
            dashEnd: this.createAnimation(
                0,
                374,
                310,
                4,
                1,
                4,
                41,
                47,
                1,
                0,
                2
            ),
            jumpStart: this.createAnimation(
                0,
                64,
                244,
                7,
                1,
                7,
                34,
                60,
                1,
                0,
                4,
                () => {
                    this.currentAnimation = this.animations.jumpLoop;
                }
            ),
            jumpLoop: this.createAnimation(
                0,
                309,
                244,
                1,
                1,
                1,
                34,
                60,
                0,
                0,
                15
            ),
            jumpEnd: this.createAnimation(
                0,
                344,
                244,
                3,
                1,
                3,
                34,
                54,
                1,
                0,
                4,
                undefined,
                () => {
                    this.currentAnimation = this.animations.idle;
                }
            ),
            shoot: this.createAnimation(
                0,
                2,
                431,
                8,
                1,
                8,
                51,
                47,
                1,
                0,
                4,
                undefined,
                () => {
                    this.currentAnimation = this.animations.idle;
                }
            ),
            superShoot: this.createAnimation(
                0,
                359,
                763,
                8,
                1,
                8,
                56,
                77,
                1,
                0,
                4
            ),
            damagedStart: this.createAnimation(
                0,
                55,
                487,
                3,
                1,
                3,
                51,
                55,
                1,
                0,
                2
            ),
            damagedEnd: this.createAnimation(
                0,
                211,
                487,
                2,
                1,
                2,
                51,
                55,
                1,
                0,
                5
            ),
            crouchStart: this.createAnimation(
                0,
                8,
                600,
                1,
                1,
                1,
                42,
                42,
                0,
                0,
                5
            ),
            crouchLoop: this.createAnimation(
                0,
                62,
                600,
                1,
                1,
                1,
                42,
                42,
                0,
                0,
                5
            ),
            crouchShoot: this.createAnimation(
                0,
                80,
                925,
                2,
                1,
                2,
                69,
                79,
                1,
                0,
                5
            ),
            crouchSuperShoot: this.createAnimation(
                0,
                220,
                925,
                10,
                1,
                10,
                69,
                79,
                1,
                0,
                5
            ),
            flyIdle: this.createAnimation(
                0,
                12,
                649,
                3,
                1,
                3,
                33,
                64,
                1,
                0,
                5
            ),
            flyForward: this.createAnimation(
                0,
                5,
                717,
                6,
                1,
                6,
                41,
                56,
                1,
                0,
                5
            ),
            flyBackward: this.createAnimation(
                0,
                7,
                779,
                5,
                1,
                5,
                33,
                61,
                1,
                0,
                5
            ),
            novaJump: this.createAnimation(
                0,
                13,
                1173,
                4,
                1,
                4,
                38,
                56,
                1,
                0,
                5
            ),
            novaStart: this.createAnimation(
                0,
                188,
                1164,
                4,
                1,
                4,
                123,
                64,
                1,
                0,
                2
            ),
            novaLoop: this.createAnimation(
                0,
                684,
                1164,
                1,
                1,
                1,
                123,
                64,
                0,
                0,
                2
            ),
            spawnBeam: this.createAnimation(
                0,
                54,
                25,
                2,
                1,
                2,
                22,
                77,
                1,
                0,
                2
            ),
            spawnExplosion: this.createAnimation(
                0,
                146,
                35,
                8,
                2,
                15,
                64,
                64,
                1,
                1,
                5
            ),
            victoryDance: this.createAnimation(
                0,
                4,
                1098,
                4,
                1,
                4,
                38,
                54,
                1,
                0,
                5
            ),
            leave: this.createAnimation(
                0,
                328,
                1063,
                6,
                1,
                6,
                58,
                88,
                1,
                0,
                5
            ),
        };

        this.currentAnimation = this.#animations.idle;
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
     * }} description of Player.
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
                x: this.x,
                y: this.y + 32,
                width: 12,
                height: 17
            },
            {
                x: this.x + 16,
                y: this.y + 3,
                width: 14,
                height: 11
            },
            {
                x: this.x + 12,
                y: this.y + 14,
                width: 23,
                height: 35
            },
            {
                x: this.x + 8,
                y: this.y + 19,
                width: 4,
                height: 13
            },
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

    damage(value) {
        console.log(`DAMAGED BY: ${value}`);
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
        return Player.type;
    }
}
