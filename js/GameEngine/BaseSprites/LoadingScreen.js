'use strict';


/**
 * @exports LoadingScreen
 */

/**
 * @class LoadingScreen
 *
 * Class representing the loading screen.
 */
class LoadingScreen extends Sprite {
    /**
     * Constructor for the loading screen.
     *
     * @param isFalseLoading {boolean?} if true, the loading screen does not lock the game.
     */
    constructor(isFalseLoading) {
        // Add the loading lock
        if (!isFalseLoading) {
            Game.addLock();
        }

        super(
            {},
            [0, 0],
            () => {
                if (!isFalseLoading && !Game.loadingAssets) {
                    Game.removeLock();
                    this.game.removeSprite(this);
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
            2
        );

        this.currentAnimation = this.createAnimation(
            0,
            1,
            1,
            2,
            1,
            2,
            125,
            13,
            0,
            0,
            12
        );
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

        // Draw the loading animation
        this.drawCurrentAnimation(
            20,
            this.by - 40,
            context
        );
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "loadingScreen";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return LoadingScreen.type;
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
        return ['loading.gif'];
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
        return LoadingScreen.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return LoadingScreen.sounds;
    }
}
