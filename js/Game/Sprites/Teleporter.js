'use strict';


/**
 * @exports Teleporter
 */

/**
 * @class Teleporter
 *
 * Class representing the teleporter.
 */
class Teleporter extends Sprite {
    /**
     * @param x {number}
     * @param y {number}
     * @param scale {number}
     * @param onStand {function()} called when the player stands on the teleporter.
     */
    constructor(
        x,
        y,
        scale,
        onStand
    ) {
        super(
            {},
            [x, y],
            () => {
                if (
                    this.player.by <= this.by
                    && this.player.x >= this.x
                    && this.player.rx <= this.rx
                ) {
                    onStand();
                }

                this.moveCurrentAnimation();
            },
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            scale
        );

        this.currentAnimation = this.createAnimation(
            0,
            8,
            93,
            5,
            5,
            25,
            58,
            18,
            1,
            1,
            3
        );
    }

    /**
     * @returns {{}} of the teleporter.
     */
    get desc() {
        return super.desc;
    }

    /**
     * Draws the text in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        // Draw the loading animation
        this.drawCurrentAnimation(
            this.x,
            this.y,
            context
        );
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "teleporter";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Teleporter.type;
    }

    /**
     * @returns {HitBox[]}
     */
    get defaultHitBox() {
        return [];
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['teleporter.png'];
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
        return Teleporter.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Teleporter.sounds;
    }
}
