'use strict'

/**
 * @exports Bomb
 */

/**
 * Falling state.
 *
 * @type {{falling: number, idle: number}}
 */
const FallState = {
    idle: 0,
    falling: 1
};

/**
 * @class Bomb
 *
 * Class representing the bomb projectile.
 */
class Bomb extends Sprite {
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
     * @param scale {number} scale of Bomb.
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
        hitBoxBrush
    ) {
        super(
            {},
            [x, y],
            () => {
                switch (this.states.get(FallState)) {
                    case FallState.falling:
                        // Accelerate down
                        this.#speedVector[1] = Math.min(this.#speedVector[1] + 0.5, 18);

                        this.y += this.#speedVector[1];

                        if (this.colliding(this.level) || this.colliding(this.player)) {
                            this.explode();
                        }

                        this.moveCurrentAnimation();
                        break;
                }
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale
        );

        // Initialize the speed vector
        this.#speedVector = [0, 0];

        this.currentAnimation = this.createAnimation(
            0,
            122,
            126,
            3,
            1,
            3,
            18,
            32,
            1,
            0,
            2,
        );
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of Bomb.
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
                x: this.x,
                y: this.y,
                width: 18,
                height: 32
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
     * Releases the bomb
     */
    release() {
        this.states.set(FallState, FallState.falling);
    }

    /**
     * Explodes the bomb.
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
        return Bomb.type;
    }
    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['bomberbat.png'];
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
        return Bomb.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Bomb.sounds;
    }

}
