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
            [],
            5112,
            747,
            {
                fillColor: '#FFFF0077'
            },
            0.34
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
                x: 480,
                y: 0,
                width: 15,
                height: 250,
            },
            {
                x: -20,
                y: 0,
                width: 20,
                height,
            },
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

    load() {
        this.sprites.add(
            new Sigma(
                700,
                310,
                [200, 700],
                this.scale
            )
        );
        super.load();
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['level_1.png'];
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

