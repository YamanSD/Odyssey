'use strict';


/**
 * @exports Level_3
 */

/**
 * @class Level_2
 *
 * Third level in the game.
 */
class Level_2 extends Level {
    /**
     * @param sprites {Sprite[]} array of sprites to be loaded to the map.
     */
    constructor(sprites) {
        super(
            sprites,
            320,
            240,
            {
                fillColor: '#FFFF0077'
            },
            3.2,
            true,
            true
        );

        this.currentAnimation = this.createAnimation(
            0,
            0,
            0,
            3,
            1,
            3,
            320,
            240,
            0,
            0,
            3
        );

        this.hitBox = this.convertHitBoxes([
            {
                x: 0,
                y: 230,
                width: 1024,
                height: 220,
                rotation: -15
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

    spawnEnemies() {
        for (let i = 0; i < 2; i++) {
            const b = new Bomb(0, 0, this.scale);

            this.insertSprites(
                b,
                new BomberBat(
                    this.scale * 300 - (20 * Math.random()),
                    this.scale * 120 - (20 * Math.random()),
                    b,
                    this.scale
                )
            )
        }

        this.insertSprites(
            new GigaDeath(
                this.scale * 250,
                this.scale * 120,
                true,
                this.scale
            ),
            new Dejira(
                this.scale * 300 - (60 * Math.random()),
                this.scale * 120 - (20 * Math.random()),
                this.scale
            ),
        );
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['level_2.png'];
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
        return Level_2.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Level_2.sounds;
    }

}
