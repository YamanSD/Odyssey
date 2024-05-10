'use strict'

/**
 * @exports VerticalMeteor
 */


/**
 * State object for the movement of the meteor.
 *
 * @type {{move: number, idle: number}}
 */
const MovementState = {
    idle: 0,
    move: 1
};

/**
 * Direction state.
 *
 * @type {{up: number, down: number}}
 */
const DirState = {
    down: 0,
    up: 1
};

/**
 * @class VerticalMeteor
 *
 * Class representing the meteor projectile.
 */
class VerticalMeteor extends Sprite {
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
     * @param toDown {boolean} true to throw the meteor downwards.
     * @param scale {number} scale of VerticalMeteor.
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
        toDown,
        scale,
        hitBoxBrush
    ) {
        super(
            {},
            ['meteor_man_0.gif'],
            [x, y],
            () => {
                switch (this.states.get(MovementState)) {
                    case MovementState.move:
                        this.y += this.#speedVector[1];

                        if (this.level && this.colliding(this.level)) {
                            this.explode();
                        }
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
        this.#speedVector = [0, toDown ? -10 : 10];

        // Set the movement state
        this.states.set(MovementState, MovementState.idle);

        this.states.set(DirState, toDown ? DirState.down : DirState.up);

        this.currentAnimation = this.createAnimation(
            0,
            56,
            toDown ? 10 : 120,
            10,
            1,
            10,
            76,
            109,
            1,
            0,
            4,
        );
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of VerticalMeteor.
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
                y: this.states.get(DirState) === DirState.up ? this.y : this.y + 37,
                width: 77,
                height: 72
            }
        ]);
    }

    /**
     * @returns {number} current width of the animation.
     */
    get width() {
        if (this.currentAnimation === undefined) {
            return 0;
        }

        return this.scale * this.getAnimation(this.currentAnimation).singleWidth;
    }

    /**
     * @returns {number} current height of the animation.
     */
    get height() {
        if (this.currentAnimation === undefined) {
            return 0;
        }

        return this.scale * this.getAnimation(this.currentAnimation).singleHeight;
    }

    /**
     * @returns {Sprite} a clone of this sprite.
     */
    get clone() {
        return undefined;
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
     * Explodes the meteor.
     */
    explode() {
        const exp = new Explosion(
            this.x - 50,
            this.y - 50,
            this.scale,
        );

        exp.start();
        this.game.insertSprite(exp);
        this.game.removeSprite(this);
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
        return VerticalMeteor.type;
    }
}
