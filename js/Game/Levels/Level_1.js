'use strict';

import Level from "./Level.js";


/**
 * @class Level_1
 *
 * Second level in the game.
 */
export default class Level_1 extends Level {
    /**
     * @param sprites {Sprite[]} array of sprites to be loaded to the map.
     */
    constructor(sprites) {
        super(
            sprites,
            5112,
            747,
            ['level_1.png'],
            {
                fillColor: '#FFFF0077'
            },
            0.32
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
            }
        ]);
    }

    /**
     * @returns {Sprite} a clone of this sprite.
     */
    get clone() {
        return new Level_1(
            this.sprites,
        );
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

