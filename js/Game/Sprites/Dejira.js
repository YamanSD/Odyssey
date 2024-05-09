import {Sprite} from "../../GameEngine";
import DejiraProjectile from "./DejiraProjectile.js";


/**
 * Flip state of dejira.
 *
 * @type {{flipping: number, left: number, right: number}}
 */
const FlipState = {
    left: 0,
    right: 1,
    flipping: 2,
};

/**
 * Attack state of dejira.
 *
 * @type {{noAttack: number, attack: number}}
 */
const AttackState = {
    noAttack: 0,
    attack: 1,
};

/**
 * State used for the core glow.
 *
 * @type {{noShot: number, shot: number}}
 */
const ShootState = {
    noShot: 0,
    shot: 1
};


/**
 * @class Dejira
 *
 * Class representing the dejira enemy.
 */
export default class Dejira extends Sprite {
    /**
     * Object containing the animations of Dejira.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * Number of performed shots.
     *
     * @type {number}
     * @private
     */
    #attackCounter;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of Dejira.
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
            ['dejira.gif'],
            [x, y],
            (tick) => {
                switch (this.states.get(AttackState)) {
                    case AttackState.noAttack:
                        if (this.manhattanDistance(this.player) < 400) {
                            this.attack();
                        }

                        this.moveTo(this.player.x, this.y, 5);
                        break;
                    case AttackState.attack:
                        if (this.#attackCounter === 5 && this.states.get(FlipState) === FlipState.left) {
                            this.retreat();
                        }

                        if (tick % 20 === 0) {
                            this.shoot();
                        }
                        break;
                }

                switch (this.states.get(FlipState)) {
                    case FlipState.right:
                        this.moveTo(this.game.width, 0, 5, () => {
                            this.game.removeSprite(this);
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
            scale
        );

        // Create the animations
        this.#animations = {
            idleLeft: this.createAnimation(
                0,
                44,
                4,
                1,
                1,
                1,
                28,
                28,
                0,
                0,
                1
            ),
            flipHorizontal: this.createAnimation(
                0,
                73,
                4,
                4,
                1,
                4,
                28,
                28,
                1,
                0,
                4,
                () => {
                    this.states.set(FlipState, FlipState.flipping);
                },
                () => {
                    this.states.set(AttackState, AttackState.attack);
                    this.states.set(FlipState, FlipState.left);
                    this.currentAnimation = this.animations.idleFlipped;
                }
            ),
            idleFlipped: this.createAnimation(
                0,
                160,
                4,
                1,
                1,
                1,
                28,
                28,
                0,
                0,
                4,
            ),
            redirect: this.createAnimation(
                0,
                247,
                4,
                3,
                1,
                3,
                21,
                28,
                1,
                0,
                4,
                () => {
                    this.states.set(FlipState, FlipState.flipping);
                },
                () => {
                    this.states.set(FlipState, FlipState.right);
                    this.currentAnimation = this.animations.idleRedirected;
                }
            ),
            idleRedirected: this.createAnimation(
                0,
                342,
                4,
                1,
                1,
                1,
                28,
                28,
                0,
                0,
                1
            ),
            thruster: this.createAnimation(
                0,
                314,
                42,
                4,
                1,
                4,
                21,
                15,
                1,
                0,
                3
            ),
            coreGlow: this.createAnimation(
                0,
                148,
                43,
                2,
                1,
                2,
                14,
                14,
                1,
                0,
                3,
                undefined,
                () => {
                    this.states.set(ShootState, ShootState.noShot);
                }
            )
        };

        this.#attackCounter = 0;
        this.states.set(ShootState, ShootState.noShot);
        this.states.set(AttackState, AttackState.noAttack);
        this.states.set(FlipState, FlipState.left);
        this.currentAnimation = this.animations.idleLeft;
    }

    /**
     * Moves the current animations.
     */
    moveCurrentAnimation() {
        if (this.states.get(FlipState) !== FlipState.flipping) {
            this.moveAnimation(this.animations.thruster);

            if (this.states.get(ShootState) === ShootState.shot) {
                this.moveAnimation(this.animations.coreGlow);
            }
        }

        super.moveCurrentAnimation();
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
     * }} description of Dejira.
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
                width: 28,
                height: 28
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
        return new Dejira(
            this.x,
            this.y,
            this.scale,
            this.hitBoxBrush
        );
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        const toLeft=  this.states.get(FlipState) === FlipState.left;

        if (this.states.get(FlipState) !== FlipState.flipping) {
            // Draw the thruster
            this.drawAnimation(
                this.animations.thruster,
                toLeft ? this.rx : (this.x - 21 * this.scale),
                this.y + this.height / 4,
                context,
                this.scale,
                !toLeft
            );
        }

        this.drawCurrentAnimation(this.x, this.y, context);

        if (
            this.states.get(FlipState) !== FlipState.flipping
            && this.states.get(ShootState) === ShootState.shot
        ) {
            this.drawAnimation(
                this.animations.coreGlow,
                toLeft ? this.x + 24 : this.x + 14,
                this.y + 19,
                context
            );
        }
    }

    /**
     * Shoots a dejira projectile.
     */
    shoot() {
        if (
            this.states.get(FlipState) !== FlipState.flipping
            && this.states.get(AttackState) === AttackState.attack
        ) {
            this.states.set(ShootState, ShootState.shot);

            this.game.insertSprite(
                new DejiraProjectile(
                    this.x + this.width / 2 - 10,
                    this.y + this.height / 2 - 14,
                    2,
                )
            );

            this.#attackCounter++;
        }
    }

    /**
     * Becomes in attack mode.
     */
    attack() {
        this.currentAnimation = this.animations.flipHorizontal;
    }

    /**
     * Flips dejira to the right.
     */
    retreat() {
        this.currentAnimation = this.animations.redirect;
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
        return Dejira.type;
    }
}
