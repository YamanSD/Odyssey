'use strict';


/**
 * @exports Level
 */

/**
 * @class Level
 * @abstract
 *
 * Class for level creation.
 */
class Level extends Sprite {
    /**
     * Set of sprites inside the level.
     *
     * @type {Set<Sprite>}
     * @private
     */
    #sprites;

    /**
     * Set of enemies inside the level.
     *
     * @type {Set<Sprite>}
     * @public
     */
    enemies;

    /**
     * Each instance must initialize its hit-box.
     *
     * @param sprites {Sprite[]} sprite array.
     * @param width {number} width of the map.
     * @param height {number} height of the map.
     * @param hitBoxBrush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     * }?} object hit-box brush properties.
     * @param scale {number?} scale of the sprite. Default is [2.67].
     * @param noBaseAnimation {boolean?} if true, the constructor does not create a base animation.
     * @param normalScale {boolean?} if true, the value given for the scale is used normally.
     */
    constructor(
        sprites,
        width,
        height,
        hitBoxBrush,
        scale,
        noBaseAnimation,
        normalScale
    ) {
        super(
            {
                height,
                width,
            },
            [0, 0],
            undefined,
            undefined,
            hitBoxBrush,
            undefined,
            false,
            true,
            normalScale ? scale : Game.windowHeight / (height * (scale ?? 0.5))
        );

        // Sprite array
        this.#sprites = new Set(sprites);
        this.enemies = new Set();

        if (!noBaseAnimation) {
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
     * @returns {Set<Sprite>} reference to the sprites array.
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
     * @param sprites {Sprite} to be inserted into the level & game.
     */
    insertSprites(...sprites) {
        sprites.forEach(s => {
            this.insertSprite(s);
        });
    }

    /**
     * @param sprite {Sprite} added to the level and game.
     */
    insertSprite(sprite) {
        if (sprite.type === "enemy" || sprite.type === "boss") {
            this.enemies.add(sprite);
        }

        sprite.level = this;
        this.game.insertSprite(sprite);
        this.sprites.add(sprite);
    }

    /**
     * @param sprite {Sprite} removes the sprite from the level & game.
     */
    removeSprite(sprite) {
        if (sprite.type === "enemy" || sprite.type === "boss") {
            this.enemies.delete(sprite);
        }

        sprite.level = undefined;
        this.game.removeSprite(sprite);
        this.sprites.delete(sprite);
    }

    /**
     * Load the level sprites.
     */
    load() {
        if (this.game) {
            this.game.resize(this.width, this.height);

            this.sprites.forEach(s => {
                this.insertSprite(s);
            });
        }
    }

    /**
     * Could be used.
     */
    spawnEnemies() {

    }

    /**
     * Unloads the level sprites.
     */
    offload() {
        if (this.game) {
            this.sprites.forEach(s => {
                this.removeSprite(s);
            });

            this.game.removeSprite(this);
        }
    }
}
