'use strict'

/**
 * @exports BomberBat
 */

/**
 * Bomb release state.
 *
 * @type {{held: number, released: number}}
 */
const BombState = {
    held: 0,
    released: 1
};

/**
 * @class BomberBat
 *
 * Class representing the bomber bat enemy.
 */
class BomberBat extends Sprite {
    /**
     * Object containing the animations of BomberBat.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * Bomb sprite.
     *
     * @type {Bomb}
     * @private
     */
    #bomb;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param bomb {Bomb} bat's bomb. Inserted before bat.
     * @param scale {number} scale of BomberBat.
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
        bomb,
        scale,
        hitBoxBrush
    ) {
        super(
            {},
            [x, y],
            () => {
                switch (this.states.get(BombState)) {
                    case BombState.released:
                        this.moveTo(0, 0, 3, () => {
                            this.level.removeSprite(this);
                        });
                        break;
                    case BombState.held:
                        this.moveTo(this.player.x, this.y, 2, () => {
                            this.releaseBomb();
                        });
                        break;
                }

                this.moveCurrentAnimation();
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale,
            20
        );

        // Create the animations
        this.#animations = {
            idle: this.createAnimation(
                0,
                7,
                4,
                4,
                1,
                4,
                52,
                34,
                1,
                0,
                3
            ),
            releaseBomb: this.createAnimation(
                0,
                201,
                45,
                2,
                1,
                2,
                48,
                31,
                1,
                0,
                4,
                undefined,
                () => {
                    this.currentAnimation = this.animations.releaseEnd;
                }
            ),
            releaseEnd: this.createAnimation(
                0,
                33,
                43,
                1,
                1,
                1,
                35,
                43,
                0,
                0,
                4,
                undefined,
                () => {
                    this.currentAnimation = this.animations.moveNoBomb;
                }
            ),
            moveNoBomb: this.createAnimation(
                0,
                70,
                57,
                2,
                2,
                5,
                47,
                33,
                1,
                1,
                4
            )
        };

        // Initialize the bomb state
        this.states.set(BombState, BombState.held);

        this.currentAnimation = this.animations.idle;

        bomb.x = this.x + this.width / 4 - 2;
        bomb.y = this.by - 32;

        // Bomb instance
        this.#bomb = bomb;
    }

    /**
     * @returns {Object<string, number>} animations object.
     */
    get animations() {
        return this.#animations;
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of BomberBat.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {number}
     */
    get x() {
        return super.x;
    }

    /**
     * @returns {number}
     */
    get y() {
        return super.y;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get defaultHitBox() {
        return this.convertHitBoxes([
            {
                x: this.x + 5,
                y: this.y,
                width: 33,
                height: 34
            }
        ]);
    }

    /**
     * @param v
     */
    set x(v) {
       if (this.states.get(BombState) === BombState.held) {
           this.#bomb.x += v - this.x;
       }

       super.x = v;
    }

    /**
     * @param v
     */
    set y(v) {
        if (this.states.get(BombState) === BombState.held) {
            this.#bomb.y += v - this.y;
        }

        super.y = v;
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
     * Releases the bomb.
     */
    releaseBomb() {
        this.#bomb.release();
        this.states.set(BombState, BombState.released);
        this.currentAnimation = this.animations.releaseBomb;
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "enemy";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return BomberBat.type;
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
        return BomberBat.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return BomberBat.sounds;
    }

    /**
     * Destroys the sprite
     */
    destroy() {
        const level = this.level;

        for (let i = 0; i < this.initHp / 10; i++) {
            this.game.setTimeout(() => {
                const e = new Explosion(
                    this.x + (-10 + Math.random() * 20),
                    this.y + (-10 + Math.random() * 20),
                    this.scale
                )

                level.insertSprite(e);

                e.start();
            }, i * 10);
        }

        if (this.states.get(BombState) === BombState.held) {
            this.#bomb.destroy();
        }
        this.level.removeSprite(this);
    }
}
