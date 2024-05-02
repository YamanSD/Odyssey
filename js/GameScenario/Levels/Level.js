'use strict';

import {Sprite} from "../../GameEngine";


/**
 * @class Level
 *
 * Class for level creation.
 */
export default class Level extends Sprite {
    /**
     * @param width {number} width of the map.
     * @param height {number} height of the map.
     * @param sheets {string[]} list of sprite sheets.
     *  @param hitBoxBrush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?} object hit-box brush properties.
     *  @param scale {number?} scale of the sprite.
     */
    constructor(height, width, sheets, hitBoxBrush, scale) {
        super(
            {
                height,
                width,
            },
            sheets,
            [0, 0],
            undefined,
            undefined,
            hitBoxBrush,
            undefined,
            false,
            true,
            scale
        );
    }

    /**
     * @returns {Sprite} a clone of this sprite.
     */
    get clone() {
        return undefined;
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
     * A child class must implement it to provide type hints.
     *
     * @returns {{
     *     width: number,
     *     height: number
     * }} the sprite description.
     */
    get desc() {
        return super.desc;
    }

    /**
     * Draws the sprite in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {}

    /**
     * @returns {number} height of the sprite.
     */
    get height() {
        return this.desc.height;
    }

    /**
     * @returns {string} string representing the type of the sprite.
     */
    static get type() {
        return "level";
    }

    /**
     * @returns {string} string representing the type of the sprite.
     */
    get type() {
        return Level.type;
    }

    /**
     * @returns {number} width of the sprite.
     */
    get width() {
        return this.desc.width;
    }
}
