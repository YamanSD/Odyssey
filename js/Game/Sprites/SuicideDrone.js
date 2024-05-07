import {Sprite} from "../../GameEngine";
import Explosion from "./Explosion.js";


/**
 * State for the drone deployment.
 *
 * @type {{deploying: number, deployed: number}}
 */
const DeploymentState = {
    deploying: 0,
    deployed: 1,
};


/**
 * @class SuicideDrone
 *
 * Class representing the suicide drones of Iris.
 */
export default class SuicideDrone extends Sprite {
    /**
     * Object containing the animations of IrisCrystal.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of SuicideDrone.
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
        speed = 1,
        hitBoxBrush
    ) {
        super(
            {},
            ['iris_0.gif'],
            [x, y],
            () => {
                if (this.states.get(DeploymentState) === DeploymentState.deployed) {
                    this.moveTo(this.player.x, this.player.y, speed);

                    if (this.colliding(this.player)) {
                        this.explode(true);
                    }
                } else {
                    this.moveTo(this.x + 50, this.y - 50, 2);
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

        this.#animations = {
            deploymentStart: this.createAnimation(
                0,
                386,
                1426,
                3,
                1,
                3,
                24,
                12,
                1,
                0,
                5,
                undefined,
                () => {
                    this.currentAnimation = this.animations.deploymentEnd;
                }
            ),
            deploymentEnd: this.createAnimation(
                0,
                461,
                1423,
                3,
                1,
                3,
                30,
                17,
                1,
                0,
                5,
                () => {
                    // Center calibration
                    this.x -= 6;
                    this.y -= 5;
                },
                () => {
                    // Center calibration
                    this.x += 2;
                    this.y += 1;

                    this.states.set(DeploymentState, DeploymentState.deployed);
                    this.currentAnimation = this.animations.idle;
                }
            ),
            idle: this.createAnimation(
                0,
                557,
                1421,
                4,
                1,
                4,
                26,
                21,
                1,
                0,
                4,
                undefined,
                undefined,
                (x, y) => {
                    return [
                        {
                            x,
                            y,
                            width: 26,
                            height: 21
                        }
                    ];
                }
            ),
        };

        this.currentAnimation = this.animations.deploymentStart;
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of SuicideDrone.
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
        return this.convertHitBoxes([]);
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
     * @param damaging {boolean?} if true the explosion damages the player.
     */
    explode(damaging) {
        const exp = new Explosion(
            this.x - 50,
            this.y - 50,
            this.scale,
            damaging
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
        return SuicideDrone.type;
    }
}
