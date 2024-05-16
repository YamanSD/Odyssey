'use strict';


/**
 * @exports Level_3
 */

/**
 * @class Level_3
 *
 * Second level in the game.
 */
class Level_3 extends Level {
    /**
     * Constructs the level.
     */
    constructor() {
        super(
            [
                new Sigma(
                    300,
                    150,
                    [100, 350],
                    3.4
                )
            ],
            400,
            240,
            {
                fillColor: '#FFFF0077'
            },
            3.4,
            false,
            true
        );

        const height = 200;

        this.hitBox = this.convertHitBoxes([
            // Ground
            {
                x: 0,
                y: 210,
                width: 480,
                height,
            },
            {
                x: -20,
                y: 0,
                width: 20,
                height,
            },
            {
                x: 400 * this.scale,
                y: 0,
                width: 20,
                height
            }
        ]);
    }

    /**
     * Draws the sprite in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(
            0,
            0,
            context
        );
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['level_3.png'];
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
        return Level_3.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Level_3.sounds;
    }

}

