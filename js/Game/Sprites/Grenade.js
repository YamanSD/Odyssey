import {Sprite} from "../../GameEngine";
import Explosion from "./Explosion.js";


/**
 * @class Grenade
 *
 * Class representing the grenade projectile.
 */
export default class Grenade extends Sprite {
    /**
     * Speed vector.
     *
     * @type {[number, number]}
     * @private
     */
    #speedVector;

    /**
     * @param level {Level} level containing the grenade.
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param toLeft {boolean} true to throw the grenade to the left.
     * @param scale {number} scale of Grenade.
     * @param hitBoxBrush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?} object hit-box brush properties.
     */
    constructor(
        level,
        x,
        y,
        toLeft,
        scale,
        hitBoxBrush
    ) {
        super(
            {},
            ['grenade_man_0.gif'],
            [x, y],
            () => {
                // Decelerate
                this.#speedVector[0] -= toLeft ? -0.05 : 0.05;
                this.#speedVector[1] += 1;

                this.x += this.#speedVector[0];
                this.y += this.#speedVector[1];

                if (this.level && this.colliding(this.level)) {
                    this.explode();
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
        this.#speedVector = [toLeft ? -10 : 10, -15];

        // Add the grenade to the level
        this.level = level;

        this.currentAnimation = this.createAnimation(
            0,
            470,
            230,
            1,
            1,
            1,
            12,
            10,
            0,
            0,
            1,
        );
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of Grenade.
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
     * Explodes the grenade.
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
        return Grenade.type;
    }
}
