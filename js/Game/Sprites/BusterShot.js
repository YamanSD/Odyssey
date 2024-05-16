'use strict'

/**
 * @exports BusterShot
 */

class BusterShot extends Sprite {
    /**
     * @param x {number}
     * @param y {number}
     * @param left {boolean}
     * @param power {number}
     * @param enemies {Sprite[]}
     * @param scale {number}
     */
    constructor(x, y, left, power, enemies, scale) {
        super(
            {},
            [x, y],
            () => {
                const speed = 10 + 3 * power;
                this.x += left ? -speed : speed;

                if (
                    this.x > 2 * this.game.cameraRX
                    || this.rx < this.game.cameraX / 2
                ) {
                    this.game.removeSprite(this);
                }

                for (const enemy of enemies) {
                    const col = this.colliding(enemy);

                    if (col) {
                        enemy.damage(power * 5);
                    }
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

        if (power <= 1) {
            this.currentAnimation = this.createAnimation(
                0,
                388,
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

            this.hitBox = this.convertHitBoxes([
                {
                    x,
                    y,
                    width: 15,
                    height: 8
                }
            ]);
        } else if (power < 3) {
            this.currentAnimation = this.createAnimation(
                0,
                390,
                43,
                3,
                1,
                3,
                26,
                18,
                1,
                0,
                3
            );

            this.hitBox = this.convertHitBoxes([
                {
                    x,
                    y,
                    width: 26,
                    height: 18
                }
            ]);
        } else {
            this.currentAnimation = this.createAnimation(
                0,
                310,
                73,
                3,
                1,
                3,
                61,
                30,
                1,
                0,
                3
            );

            this.hitBox = this.convertHitBoxes([
                {
                    x,
                    y,
                    width: 61,
                    height: 30
                }
            ]);
        }

        this.flip = left;
    }

    get defaultHitBox() {
        return [];
    }

    get desc() {
        return undefined;
    }

    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);
    }

    get type() {
        return "projectile";
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['x_3.gif'];
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
