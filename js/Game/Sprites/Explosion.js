import {Sprite} from "../../GameEngine";


/**
 * @class Explosion
 *
 * Class representing explosions.
 */
export default class Explosion extends Sprite {
    /**
     * Object containing the animations of Explosion.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * If true, the player is damaged by the explosion.
     *
     * @type {boolean}
     * @private
     */
    #damaging;

    /**
     * If true, the animation has no fire.
     *
     * @type {boolean}
     * @private
     */
    #noFire;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of Explosion.
     * @param noFire {boolean?} true for the explosion to be with no fire animation. Default false.
     * @param damaging {boolean?} If true, the player is damaged by the explosion. Default is false.
     * @param onEnd {(function(Explosion))?} Called when the explosion finishes.
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
        noFire,
        damaging,
        onEnd,
        hitBoxBrush
    ) {
        super(
            {},
            ['explosion.gif'],
            [x, y],
            () => {
                if (
                    this.damaging
                    && this.player
                    && this.euclideanDistance(this.player) <= (this.player.width + this.width) / 2) {
                    this.player.damage(10);
                }

                this.moveCurrentAnimation();
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale
        );

        this.#damaging = damaging ?? false;
        this.#noFire = noFire ?? false;

        this.#animations = {
            start: this.createAnimation(
                0,
                22,
                6,
                2,
                1,
                2,
                64,
                62,
                1,
                0,
                4,
                undefined,
                () => {
                    this.currentAnimation = this.animations.middle;
                }
            ),
            middle: this.createAnimation(
                0,
                noFire ? 15 : 167,
                noFire ? 156 : 20,
                7,
                1,
                7,
                61,
                45,
                1,
                0,
                4,
                undefined,
                () => {
                    this.currentAnimation = this.animations.end;
                }
            ),
            end: this.createAnimation(
                0,
                noFire ? 17 : 11,
                noFire ? 221 : 84,
                9,
                1,
                9,
                54,
                44,
                1,
                0,
                4,
                undefined,
                () => {
                    if (onEnd) {
                        onEnd(this);
                    } else {
                        this.game.removeSprite(this);
                    }
                }
            )
        };
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of Explosion.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {Object<string, number>} animations object.
     */
    get animations() {
        return this.#animations;
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
     * @returns {boolean} true if damaging.
     */
    get damaging() {
        return this.#damaging;
    }

    /**
     * @returns {boolean} true if not fire animation.
     */
    get noFire() {
        return this.#noFire;
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
        return new Explosion(
            this.x,
            this.y,
            this.scale,
            this.noFire,
            this.damaging,
            this.hitBoxBrush
        );
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
     * Start the explosion animation.
     */
    start() {
        this.currentAnimation = this.animations.start;
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "explosion";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Explosion.type;
    }
}
