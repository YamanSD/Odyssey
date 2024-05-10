'use strict';


/**
 * @exports Level_2
 */

/**
 * @class Level_2
 *
 * Second level in the game.
 */
class Level_2 extends Level {
    /**
     * @param sprites {Sprite[]} array of sprites to be loaded to the map.
     */
    constructor(sprites) {
        super(
            sprites,
            6384,
            496,
            ['level_2.png'],
            {
                fillColor: '#FFFF0077'
            }
        );

        const height = 200;

        this.hitBox = this.convertHitBoxes([
            // Ground
            {
                x: 0,
                y: 160,
                width: 250,
                height: height
            },
            {
                x: 250,
                y: 160,
                width: 80,
                height: height,
                rotation: 30,
            },
            {
                x: 310,
                y: 200,
                width: 235,
                height: height,
            },
            {
                x: 545,
                y: 200,
                width: 610,
                height: height,
                rotation: 26.5
            },
            {
                x: 1085,
                y: 472,
                width: 325,
                height: height,
            },
            {
                x: 1407,
                y: 400,
                width: 65,
                height: height,
            },
            {
                x: 1535,
                y: 435,
                width: 96.5,
                height: height,
            },
            {
                x: 1695,
                y: 415,
                width: 65,
                height: height,
            },
            {
                x: 1760,
                y: 400,
                width: 64,
                height: height,
            },
            {
                x: 1888,
                y: 415,
                width: 64,
                height: height,
            },
            {
                x: 2016,
                y: 385,
                width: 64,
                height: height,
            },
            {
                x: 2144,
                y: 415,
                width: 64,
                height: height,
            },
            {
                x: 2272,
                y: 385,
                width: 64,
                height: height,
            },
            {
                x: 2400,
                y: 370,
                width: 64,
                height: height,
            },
            {
                x: 2528,
                y: 385,
                width: 64,
                height: height,
            },
            {
                x: 2720,
                y: 430,
                width: 288,
                height: height,
            },
            {
                x: 3008,
                y: 465,
                width: 320,
                height: height,
            },
            {
                x: 3328,
                y: 430,
                width: 415,
                height: height,
            },
            {
                x: 3808,
                y: 400,
                width: 128,
                height: height,
            },
            {
                x: 4000,
                y: 370,
                width: 96,
                height: height,
            },
            {
                x: 4096,
                y: 415,
                width: 175,
                height: height,
            },
            {
                x: 4271,
                y: 385,
                width: 65,
                height: height,
            },
            {
                x: 4336,
                y: 415,
                width: 336,
                height: height,
            },
            {
                x: 4736,
                y: 415,
                width: 176,
                height: height,
            },
            {
                x: 4912,
                y: 460,
                width: 160,
                height: height,
            },
            {
                x: 5200,
                y: 470,
                width: 240,
                height: height,
            },
            {
                x: 5420,
                y: 480,
                width: 630,
                height: height,
                rotation: -27
            },
            {
                x: 5981,
                y: 194,
                width: 630,
                height: height
            },
            // Ceiling
            {
                x: 416,
                y: 0,
                width: 300,
                height: 64
            },
            {
                x: 640,
                y: 64,
                width: 100,
                height: 64
            },
            {
                x: 736,
                y: 128,
                width: 140,
                height: 79
            },
            {
                x: 864,
                y: 207,
                width: 140,
                height: 64
            },
            {
                x: 991,
                y: 207,
                width: 130,
                height: 128
            },
            {
                x: 1121,
                y: 193,
                width: 4255,
                height: 64
            },
            {
                x: 5376,
                y: 257,
                width: 128,
                height: 95
            },
            {
                x: 5504,
                y: 193,
                width: 128,
                height: 95
            },
            {
                x: 5632,
                y: 98,
                width: 128,
                height: 95
            },
            {
                x: 5760,
                y: 33,
                width: 128,
                height: 95
            },
            {
                x: 5888,
                y: 0,
                width: 128,
                height: 33
            },
            {
                x: 5888,
                y: -30,
                width: 400,
                height: 30
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
}

