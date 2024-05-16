'use strict';


/**
 * @exports Level_1
 */

/**
 * @class Level_1
 *
 * Second level in the game.
 */
class Level_1 extends Level {
    /**
     * Array of coordinates for rock placements.
     *
     * @type {{
     *     x: number,
     *     y: number
     * }[]}
     * @private
     */
    #rocks;

    /**
     * Animation used by the rocks.
     *
     * @type {number}
     * @private
     */
    #rockAnimation;

    /**
     * @param sprites {Sprite[]} array of sprites to be loaded to the map.
     */
    constructor(sprites) {
        super(
            sprites,
            5112,
            747,
            {
                fillColor: '#FFFF0077'
            },
            0.32
        );

        this.#rocks = [];
        const height = 200;

        this.#rockAnimation = this.createAnimation(
            1,
            0,
            0,
            1,
            1,
            1,
            96,
            88,
            0,
            0,
            1
        );

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
                y: 88,
                width: 15,
                height,
            },
            {
                x: 495,
                y: 88,
                width: 132,
                height: 10,
                rotation: 13
            },
            {
                x: 620,
                y: 117,
                width: 20,
                height: 100,
            },
            {
                x: 640,
                y: 205,
                width: 192,
                height: 90,
            },
            {
                x: 832,
                y: 165,
                width: 32,
                height: 90,
            },
            {
                x: 864,
                y: 130,
                width: 96,
                height: 90,
            },
            {
                x: 960,
                y: 185,
                width: 464,
                height: 90,
            },
            {
                x: 1424,
                y: 50,
                width: 112,
                height: 180,
            },
            {
                x: 1536,
                y: 205,
                width: 190,
                height: 180,
            },
            {
                x: 1720,
                y: 205,
                width: 150,
                height: 180,
                rotation: -24
            },
            {
                x: 1857,
                y: 144,
                width: 159,
                height: 180
            },
            {
                x: 2016,
                y: 205,
                width: 288,
                height: 180
            },
            {
                x: 2304,
                y: 148,
                width: 96,
                height: 180
            },
            {
                x: 2400,
                y: 200,
                width: 65,
                height: 180
            },
            {
                x: 2465,
                y: 115,
                width: 127,
                height: 180
            },
            {
                x: 2592,
                y: 200,
                width: 64,
                height: 180
            },
            {
                x: 2656,
                y: 225,
                width: 257,
                height: 180
            },
            {
                x: 2913,
                y: 210,
                width: 63,
                height: 180
            },
            {
                x: 2976,
                y: 68,
                width: 128,
                height: 180
            },
            {
                x: 3104,
                y: 210,
                width: 320,
                height: 180
            },
            {
                x: 3424,
                y: 144,
                width: 160,
                height: 180
            },
            {
                x: 3584,
                y: 210,
                width: 1560,
                height: 180
            },
            // Ceiling
            {
                x: 485,
                y: 0,
                width: 155,
                height: 30
            },
            {
                x: 704,
                y: 0,
                width: 95,
                height: 95
            },
            {
                x: 1024,
                y: 0,
                width: 96,
                height: 32
            },
            {
                x: 1184,
                y: 0,
                width: 96,
                height: 32
            },
            {
                x: 2208,
                y: 0,
                width: 96,
                height: 64
            },
            {
                x: 3168,
                y: 0,
                width: 128,
                height: 140
            },
            {
                x: 3424,
                y: 0,
                width: 160,
                height: 64
            },
            // Borders,
            // {
            //     x: 300,
            //     y: -20,
            //     width: 8000,
            //     height: 20,
            // }
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

        for (const rock of this.#rocks) {
            this.drawAnimation(
                this.#rockAnimation,
                rock.x,
                rock.y,
                context
            );
        }
    }

    /**
     * Creates the boss arena
     */
    createBossArena() {
        for (let i = 0; i < 3; i++) {
            this.game.setTimeout(() => {
                for (let x = 3400; x < 3550; x += 20) {
                    const e = new Explosion(
                        x * this.scale,
                        (40 + 80 * Math.random()) * this.scale,
                        3,
                        true
                    );

                    this.insertSprite(
                        e
                    );

                    e.start();
                }
            }, i * 50);
        }

        this.#rocks.push(
            {
                x: 3426 * this.scale,
                y: 62 * this.scale,
            },
            {
                x: 3488 * this.scale,
                y: 62 * this.scale,
            },
            {
                x: 4000 * this.scale,
                y: 110 * this.scale
            },
            {
                x: 4000 * this.scale,
                y: 30 * this.scale
            },
            {
                x: 4000 * this.scale,
                y: -50 * this.scale
            },
        );

        this.hitBox.push(
            ...this.convertHitBoxes(
                [
                    {
                        x: 3426,
                        y: 62,
                        width: 96,
                        height: 88
                    },
                    {
                        x: 3488,
                        y: 62,
                        width: 96,
                        height: 88
                    },
                    {
                        x: 4000,
                        y: 110,
                        width: 96,
                        height: 88
                    },
                    {
                        x: 4000,
                        y: 30,
                        width: 96,
                        height: 88
                    },
                    {
                        x: 4000,
                        y: -50,
                        width: 96,
                        height: 88
                    },
                ]
            )
        );
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['level_1.png', "rock.png"];
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
        return Level_1.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Level_1.sounds;
    }

}

