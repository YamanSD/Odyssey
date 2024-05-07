import {Sprite} from "../../GameEngine";


/**
 * @class ShockProjectile
 *
 * Class representing the shock projectile.
 */
export default class ShockProjectile extends Sprite {
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
            ['trap_blast.gif'],
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
     * Explodes the shock.
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
        return ShockProjectile.type;
    }
}
