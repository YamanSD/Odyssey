'use strict'

/**
 * @exports HealthBar
 */

/**
 * Types of health bars.
 *
 * @type {{zero: number, sigma: number, iris: number, x: number}}
 */
const HealthBarType = {
    x: 0,
    zero: 1,
    sigma: 2,
    iris: 3,
};

/**
 * @class HealthBar
 *
 * Class representing the health bar of the player and enemies.
 */
class HealthBar extends Sprite {
    /**
     * Colors for the HP values.
     *
     * @type {{}}
     */
    static #colors = {
        [HealthBarType.x]: '#6140EF',
        [HealthBarType.zero]: '#FF3333',
        [HealthBarType.sigma]: '#800080',
        [HealthBarType.iris]: '#2B0A78'
    };

    /**
     * Animation ID of the number of lives.
     *
     * @type {number}
     * @private
     */
    #livesAnimation;

    /**
     * @param type {number} one of the four HealthBarTypes.
     * @param target {Sprite | Player} target whose HP is displayed.
     * @param scale {number} scale of the health bar.
     */
    constructor(
        type,
        target,
        scale
    ) {
        super(
            {
                type,
                target
            },
            [0, 0],
            () => {
                switch (this.targetType) {
                    case HealthBarType.x:
                        // Fall through
                    case HealthBarType.zero:
                        this.x = this.game.lastCameraX + 10;
                        this.lives = target.lives;
                        break;
                    case HealthBarType.sigma:
                        // Fall through
                    case HealthBarType.iris:
                        this.x = this.game.cameraRX - 10 - this.width;
                        break;
                }

                this.y = this.game.lastCameraY + 100;
            },
            {
                fillColor: HealthBar.#colors[type]
            },
            undefined,
            undefined,
            undefined,
            undefined,
            scale
        );

        this.#livesAnimation = this.createAnimation(
            0,
            77,
            type === HealthBarType.zero ? 103 : 95,
            10,
            1,
            10,
            3,
            7,
            1,
            0,
            1
        );

        // Initialize the lives
        this.lives = 0;

        switch (type) {
            case HealthBarType.x:
                this.currentAnimation = this.createAnimation(
                    0,
                    5,
                    7,
                    1,
                    1,
                    1,
                    35,
                    74,
                    0,
                    0,
                    1,
                );
                this.lives = target.lives;
                break;
            case HealthBarType.zero:
                this.currentAnimation = this.createAnimation(
                    0,
                    45,
                    7,
                    1,
                    1,
                    1,
                    35,
                    74,
                    0,
                    0,
                    1,
                );
                this.lives = target.lives;
                break;
            case HealthBarType.sigma:
                this.currentAnimation = this.createAnimation(
                    0,
                    129,
                    5,
                    1,
                    1,
                    1,
                    29,
                    80,
                    0,
                    0,
                    1,
                );
                break;
            case HealthBarType.iris:
                this.currentAnimation = this.createAnimation(
                    0,
                    163,
                    5,
                    1,
                    1,
                    1,
                    30,
                    80,
                    0,
                    0,
                    1,
                );
                break;
            default:
                throw new Error("Invalid HP Bar type");
        }
    }

    /**
     * @returns {{
     *   type: number,
     *   target: Sprite,
     *   lives: number,
     * }} description of HealthBar.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get defaultHitBox() {
        return [];
    }

    /**
     * @returns {number} HP of the target.
     */
    get hp() {
        return this.target.hp;
    }

    /**
     * @returns {number | undefined} number of lives on display.
     */
    get lives() {
        return this.desc.lives;
    }

    /**
     * @returns {number} type of the HP bar.
     */
    get targetType() {
        return this.desc.type;
    }

    /**
     * @returns {Sprite | Player} the target sprite.
     */
    get target() {
        return this.desc.target;
    }

    /**
     * @returns {boolean} true if the health bar is for a boss.
     */
    get isBoss() {
        return this.targetType === HealthBarType.sigma || this.targetType === HealthBarType.iris;
    }

    /**
     * @param value {number} new lives value.
     */
    set lives(value) {
        if (this.lives < value && value <= 9) {
            for (let i = 0; i < value - this.lives; i++) {
                this.moveAnimation(this.#livesAnimation);
            }
        } else if (this.lives > value) {
            // Move back to zero
            for (let i = 0; i < 10 - this.lives; i++) {
                this.moveAnimation(this.#livesAnimation);
            }

            // Move back up
            for (let i = 0; i < value; i++) {
                this.moveAnimation(this.#livesAnimation);
            }
        }

        this.desc.lives = value;
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);

        const maxHeight = (this.isBoss ? 56 : 54) * this.scale;
        const width = 7 * this.scale;
        const x = (this.isBoss ? 3 * this.scale : 0) + this.x + width + this.scale,
            y = this.y + 2 * this.scale,
            height = maxHeight * (this.target.hp / this.target.initHp);

        context.fillRect(
            x,
            y + maxHeight - height,
            width,
            height,
        );

        if (!this.isBoss) {
            this.drawAnimation(
                this.#livesAnimation,
                this.rx - 11 * this.scale,
                this.by - 12.7 * this.scale,
                context
            );
        }
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "hud";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return HealthBar.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['hud.png'];
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
        return HealthBar.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return HealthBar.sounds;
    }
}
