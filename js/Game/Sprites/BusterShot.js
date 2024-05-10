'use strict'

/**
 * @exports BusterShot
 */

class BusterShot extends Sprite {
    constructor(x, y, left, power, onUpdate, hitBoxBrush) {
        super(
            {},
            ['Buster.gif'],
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

    get clone() {
        return undefined;
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
}
