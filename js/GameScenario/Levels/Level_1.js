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
            undefined
        );
    }

    /**
     * The returned hit box is used in collision detection.
     *
     * @returns {HitBox[]} a list of hit boxes that represent the default hit-boxes of the sprite.
     */
    get defaultHitBox() {
        return [];
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

