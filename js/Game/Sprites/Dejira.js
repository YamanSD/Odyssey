'use strict'

/**
 * @exports Dejira
 */


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
const DejiraAttackState = {
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
class Dejira extends Sprite {
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
            [x, y],
            (tick) => {
                switch (this.states.get(DejiraAttackState)) {
                    case DejiraAttackState.noAttack:
                        if (this.manhattanDistance(this.player) < 400) {
                            this.attack();
                        }

                        this.moveTo(this.player.x, this.y, 5);
                        break;
                    case DejiraAttackState.attack:
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
                            this.level.removeSprite(this);
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
                    this.states.set(DejiraAttackState, DejiraAttackState.attack);
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
        this.states.set(DejiraAttackState, DejiraAttackState.noAttack);
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
            && this.states.get(DejiraAttackState) === DejiraAttackState.attack
        ) {
            this.states.set(ShootState, ShootState.shot);

            this.level.insertSprite(
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

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['dejira.png'];
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
        return Dejira.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Dejira.sounds;
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

        this.level.removeSprite(this);
    }

}
