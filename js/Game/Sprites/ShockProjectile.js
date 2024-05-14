'use strict'

/**
 * @exports ShockProjectile
 */

/**
 * @class ShockProjectile
 *
 * Class representing the shock projectile.
 */
class ShockProjectile extends Sprite {
    /**
     * Speed vector.
     *
     * @type {[number, number]}
     * @private
     */
    #speedVector;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of ShockProjectile.
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
            [x, y],
            () => {
                this.x += this.#speedVector[0];
                this.y += this.#speedVector[1];
                this.moveCurrentAnimation();
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale
        );

        // Initialize the speed vector
        this.#speedVector = this.moveTo(this.player.x, this.player.y, speed);

        this.currentAnimation = this.createAnimation(
            0,
            187,
            154,
            1,
            4,
            4,
            20,
            25,
            0,
            1,
            3,
        );
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of ShockProjectile.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get defaultHitBox() {
        const anim = this.getAnimation(this.currentAnimation);

        return this.convertHitBoxes([
            {
                x: this.x,
                y: this.y,
                width: anim.singleWidth,
                height: anim.singleHeight
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
     * Explodes the shock.
     */
    explode() {
        const exp = new Explosion(
            this.x - 50,
            this.y - 50,
            this.scale,
        );

        exp.start();
        this.level.insertSprite(exp);
        this.level.removeSprite(this);
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
        return ShockProjectile.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['trap_blast.png'];
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
        return ShockProjectile.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return ShockProjectile.sounds;
    }
}
