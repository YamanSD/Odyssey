'use strict';


/**
 * @exports Level_3
 */

/**
 * @class Level_3
 *
 * Third level in the game.
 */
class Level_3 extends Level {
    /**
     * @param sprites {Sprite[]} array of sprites to be loaded to the map.
     */
    constructor(sprites) {
        super(
            sprites,
            6384,
            496,
            {
                fillColor: '#FFFF0077'
            },
            undefined,
            true
        );



        const height = 200;

        this.hitBox = this.convertHitBoxes([

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
