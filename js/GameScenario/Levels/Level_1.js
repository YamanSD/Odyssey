'use strict';

import Level from "./Level.js";


/**
 * @class Level_1
 *
 * First level in the game.
 */
export default class Level_1 extends Level {
    /**
     * @param sprites {Sprite[]} array of sprites to be loaded to the map.
     */
    constructor(sprites) {
        super(
            sprites,
            6384,
            496,
            ['level1.png'],
            {
                fillColor: '#FFFF0077'
            }
        );
    }

    /**
     * The returned hit box is used in collision detection.
     *
     * @returns {HitBox[]} a list of hit boxes that represent the default hit-boxes of the sprite.
     */
    get defaultHitBox() {
        const height = 200;

        return this.convertHitBoxes([
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
            context,
            this.scale
        );
    }
}

