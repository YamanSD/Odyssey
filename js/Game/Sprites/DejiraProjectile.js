'use strict'

/**
 * @exports DejiraProjectile
 */


/**
 * @class DejiraProjectile
 *
 * Class representing the dejira projectile.
 */
class DejiraProjectile extends Sprite {
    /**
     * Counter for the number of moves the projectile can make.
     *
     * @type {number}
     * @private
     */
    #moves;

    /**
     * Final speed vector.
     *
     * @type {[number, number]}
     * @private
     */
    #speedVector;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of DejiraProjectile.
     * @param speed {number?} speed of the projectile.
     * @param hitBoxBrush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?} object hit-box brush properties.
     */
    constructor(
        x,
        y,
        scale,
        speed = 3,
        hitBoxBrush
    ) {
        super(
            {},
            ['dejira.png'],
            [x, y],
            () => {
                if (this.#moves > 0) {
                    this.#speedVector = this.moveTo(this.player.x, this.player.y, speed);
                } else {
                    this.x += this.#speedVector[0];
                    this.y += this.#speedVector[1];
                }

                if (this.colliding(this.player)) {
                    this.player.damage(2);
                }

                this.#moves--;
                this.moveCurrentAnimation();
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale
        );

        // 5 adjustments
        this.#moves = 5;

        this.currentAnimation = this.createAnimation(
            0,
            5,
            43,
            4,
            1,
            4,
            10,
            14,
            1,
            0,
            3,
        );
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of DejiraProjectile.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get defaultHitBox() {
        return this.convertHitBoxes([
            {
                x: this.x + 2,
                y: this.y + 5,
                width: 6,
                height:5
            }
        ]);
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "enemyProjectile";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return DejiraProjectile.type;
    }
}
