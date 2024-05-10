'use strict';


/**
 * @exports Level
 */

/**
 * @class Level
 * @Abstract
 *
 * Class for level creation.
 */
class Level extends Sprite {
    /**
     * List of sprites inside the level.
     *
     * @type {Sprite[]}
     * @private
     */
    #sprites;


    /**
     * Each instance must initialize its hit-box.
     *
     * @param sprites {Sprite[]} sprite array.
     * @param width {number} width of the map.
     * @param height {number} height of the map.
     * @param sheets {string[]} list of sprite sheets. First one must be the background.
     * @param hitBoxBrush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     * }?} object hit-box brush properties.
     * @param scale {number?} scale of the sprite. Default is [2.67].
     */
    constructor(
        sprites,
        width,
        height,
        sheets,
        hitBoxBrush,
        scale,
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
            Game.windowHeight / (height * (scale ?? 0.5))
        );

        // Sprite array
        this.#sprites = sprites;

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
            0
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
     * @returns {Sprite[]} reference to the sprites array.
     */
    get sprites() {
        return this.#sprites;
    }

    /**
     * @returns {*[]} Empty list. Not used by levels.
     */
    get defaultHitBox() {
        return [];
    }

    /**
     * Load the level sprites.
     */
    load() {
        if (this.game) {
            this.game.resize(this.width, this.height);

            this.sprites.forEach(s => {
                s.level = this;
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
