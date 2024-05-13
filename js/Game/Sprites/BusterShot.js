'use strict'

/**
 * @exports BusterShot
 */

class BusterShot extends Sprite {
    constructor(x, y, left, power, onUpdate, hitBoxBrush) {
        super(
            {},
            [x, y],
            onUpdate,
            undefined,
            hitBoxBrush
        );

        this.currentAnimation = this.createAnimation(
            0,
            389,
            15,
            5,
            1,
            5,
            15,
            8,
            1,
            0,
            3
        );

        this.flip = left;
    }

    get defaultHitBox() {
        return this.convertHitBoxes([
            {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            }
        ]);
    }

    get desc() {
        return undefined;
    }

    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context, 2);
    }

    get height() {
        return this.getAnimation(this.currentAnimation).singleHeight;
    }

    get type() {
        return "projectile";
    }

    get width() {
        return this.getAnimation(this.currentAnimation).singleWidth;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['x_0.png']; // Might be broken, not finished
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
        return BusterShot.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return BusterShot.sounds;
    }
}
