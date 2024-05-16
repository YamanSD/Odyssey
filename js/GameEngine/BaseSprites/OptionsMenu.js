'use strict';


/**
 * @exports PauseMenu
 */

/**
 * State for the pause menu.
 *
 * @type {{onOptions: number, onContinue: number}}
 */
const PauseMenuState = {
    onContinue: 2,
    onOptions: 3,
};

/**
 * @class PauseMenu
 *
 * Class representing the pause menu screen.
 */
class PauseMenu extends Sprite {
    /**
     * Object containing the animations of the pause menu.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * @type {number} ID of the current foreground animation.
     * @private
     */
    #foregroundAnimation;

    /**
     * Constructor for the pause menu screen.
     */
    constructor() {
        // Used to not add multiple listeners
        let addedListener = false, keyHandlerId = undefined;

        super(
            {},
            [0, 0],
            () => {
                if (!addedListener) {
                    addedListener = true;

                    /**
                     * @param e {KeyboardEvent}
                     */
                    const keyPressHandler = (e) => {
                        switch (e.key) {
                            case 'Enter':
                                if (keyHandlerId !== undefined) {
                                    if (this.states.get(PauseMenuState) === PauseMenuState.onContinue) {
                                        this.game.removeEventListener('keydown', keyHandlerId);
                                        this.game.follow(this.player);
                                        this.game.resume();
                                        this.game.removeSprite(this);
                                    } else if (this.states.get(PauseMenuState) === PauseMenuState.onOptions) {
                                        // TODO
                                    }
                                }
                                break;
                            case 'ArrowUp':
                            case 'ArrowDown':
                                this.moveAnimation(this.#foregroundAnimation);
                                break;
                        }
                    };

                    keyHandlerId = this.game.addEventListener('keydown', keyPressHandler, true);
                }

                this.moveCurrentAnimation();
            },
            {
                fillColor: 'black'
            },
            undefined,
            undefined,
            true,
            undefined,
            1024 / 320,
        );

        this.#animations = {
            background: this.createAnimation(
                0,
                4,
                5,
                1,
                1,
                1,
                320,
                240,
                0,
                0,
                1,
            ),
            onButtons: this.createAnimation(
                0,
                661,
                140,
                2,
                1,
                2,
                87,
                26,
                1,
                0,
                1,
            )
        };

        // Initialize the pause menu state
        this.states.set(PauseMenuState, PauseMenuState.onContinue);
        this.currentAnimation = this.animations.background;
        this.#foregroundAnimation = this.animations.onButtons;
    }

    /**
     * @returns {Object<string, number>} animations of the pause menu.
     */
    get animations() {
        return this.#animations;
    }

    /**
     * @returns {{}} of the screen.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {number} width of the screen.
     */
    get width() {
        return Game.windowWidth;
    }

    /**
     * @returns {number} height of the screen.
     */
    get height() {
        return Game.windowHeight;
    }

    /**
     * Draws the text in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        context.fillRect(
            this.x,
            this.y,
            this.width,
            this.height,
        );

        // Draw the pause menu animation
        this.drawCurrentAnimation(
            0,
            0,
            context
        );

        this.drawAnimation(
            this.#foregroundAnimation,
            this.width / 2 - 43.5 * this.scale,
            this.height / 2 + 30 * this.scale,
            context
        );
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "pauseScreen";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return PauseMenu.type;
    }

    /**
     * @returns {HitBox[]}
     */
    get defaultHitBox() {
        return [];
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['main_menu.gif'];
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
        return PauseMenu.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return PauseMenu.sounds;
    }
}
