'use strict';

import {Sprite} from "../../GameEngine";


/**
 * @class Level
 * @Abstract
 *
 * Class for level creation.
 */
export default class Level extends Sprite {
    /**
     * List of sprites inside the level.
     *
     * @type {Sprite[]}
     * @protected
     */
    sprites;


    /**
     * @param sprites {Sprite[]} sprite array.
     * @param width {number} width of the map.
     * @param height {number} height of the map.
     * @param sheets {string[]} list of sprite sheets.
     *  @param hitBoxBrush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?} object hit-box brush properties.
     *  @param scale {number?} scale of the sprite. Default is [2.67].
     */
    constructor(
        sprites,
        width,
        height,
        sheets,
        hitBoxBrush,
        scale
    ) {
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
            scale ?? 2.67
        );

        // Sprite array
        this.sprites = sprites;

        this.currentAnimation = this.createAnimation(
            0,
            0,
            0,
            1,
            1,
            1,
            width,
            height,
            0,
            0,
        );
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
        return Math.floor(this.desc.width * this.scale);
    }

    /**
     * @returns {number} height of the sprite.
     */
    get height() {
        return Math.floor(this.desc.height * this.scale);
    }

    /**
     * Load the level sprites.
     */
    load() {
        if (this.game) {
            this.sprites.forEach(s => {
               this.game.insertSprite(s);
            });
        }
    }

    /**
     * Unloads the level sprites.
     */
    offload() {
        if (this.game) {
            this.sprites.forEach(s => {
                this.game.removeSprite(s);
            });

            this.game.removeSprite(this);
        }
    }
}
