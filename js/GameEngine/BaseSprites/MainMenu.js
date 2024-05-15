'use strict';


/**
 * @exports MainMenu
 */

/**
 * State for the main menu.
 *
 * @type {{onOptions: number, waitingForClick: number, onStart: number}}
 */
const MainMenuState = {
    waitingForClick: 1,
    onStart: 2,
    onOptions: 3,
};

/**
 * @class MainMenu
 *
 * Class representing the main menu screen.
 */
class MainMenu extends Sprite {
    /**
     * Object containing the animations of the main menu.
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
     * Constructor for the main menu screen.
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
                        switch (this.states.get(MainMenuState)) {
                            case MainMenuState.waitingForClick:
                                switch (e.key) {
                                    case 'Enter':
                                        this.#foregroundAnimation = this.animations.onButtons;
                                        this.states.set(MainMenuState, MainMenuState.onStart);
                                        break;
                                }
                                break;
                            case MainMenuState.onStart:
                            case MainMenuState.onOptions:
                                switch (e.key) {
                                    case 'Enter':
                                        if (keyHandlerId !== undefined) {
                                            if (this.states.get(MainMenuState) === MainMenuState.onStart) {
                                                const ls = new LoadingScreen(true);

                                                this.game.insertSprite(ls);

                                                this.game.setTimeout(() => {
                                                    // TODO start level 1
                                                    /*this.game.insertSprite(
                                                        new Level_1()
                                                    );*/
                                                    this.game.removeSprite(ls);
                                                    this.game.removeEventListener('keydown', keyHandlerId);
                                                    this.game.removeSprite(this);
                                                }, 250, true);
                                            } else if (this.states.get(MainMenuState) === MainMenuState.onOptions) {
                                                // TODO
                                            }
                                        }
                                        break;
                                    case 'ArrowUp':
                                    case 'ArrowDown':
                                        this.moveAnimation(this.#foregroundAnimation);
                                        break;
                                }
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
            undefined,
            undefined,
            1024 / 320
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
            waitingForClick: this.createAnimation(
                0,
                606,
                21,
                2,
                1,
                2,
                144,
                12,
                1,
                0,
                12
            ),
            onButtons: this.createAnimation(
                0,
                617,
                96,
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

        // Initialize the main menu state
        this.states.set(MainMenuState, MainMenuState.waitingForClick);
        this.currentAnimation = this.animations.background;
        this.#foregroundAnimation = this.animations.waitingForClick;
    }

    /**
     * Moves the current animations.
     */
    moveCurrentAnimation() {
        if (this.states.get(MainMenuState) === MainMenuState.waitingForClick) {
            this.moveAnimation(this.#foregroundAnimation);
        }

        super.moveCurrentAnimation();
    }

    /**
     * @returns {Object<string, number>} animations of the main menu.
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

        // Draw the main menu animation
        this.drawCurrentAnimation(
            0,
            0,
            context
        );

        if (this.states.get(MainMenuState) === MainMenuState.waitingForClick) {
            this.drawAnimation(
                this.#foregroundAnimation,
                this.width / 2 - 72 * this.scale,
                this.height / 2 + 50 * this.scale,
                context
            );
        } else {
            this.drawAnimation(
                this.#foregroundAnimation,
                this.width / 2 - 43.5 * this.scale,
                this.height / 2 + 30 * this.scale,
                context
            );
        }
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "main menuScreen";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return MainMenu.type;
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
        return MainMenu.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return MainMenu.sounds;
    }
}
