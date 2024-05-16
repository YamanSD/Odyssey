'use strict'

/**
 * @exports Dialog
 */

/**
 * Types of dialogs.
 *
 * @type {{zero: number, sigma: number, iris: number, x: number}}
 */
const DialogType = {
    x: 0,
    zero: 1,
    sigma: 2,
    iris: 3,
};

/**
 * States of the dialog box.
 *
 * @type {{typing: number, ended: number, starting: number}}
 */
const DialogState = {
    starting: 0,
    typing: 1,
    ended: 2,
};

/**
 * @class Dialog
 *
 * Class representing the dialog of the player and enemies.
 */
class Dialog extends Sprite {
    /**
     * Text sprite.
     *
     * @type {Text}
     * @private
     */
    #text;

    /**
     * Object containing the animations of the dialog box.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * @type {number} ID of the head animation.
     * @private
     */
    #headAnimation;

    /**
     * @param text {string} text to be displayed.
     * @param type {number} one of the four DialogTypes.
     * @param scale {number?} scale of the dialog.
     * @param onEnd {function()?} called when the dialog is exited.
     */
    constructor(
        text,
        type,
        scale = 2.5,
        onEnd
    ) {
        // Used to store the key press handler ID.
        let handlerId = undefined;

        super(
            {
                dialog: text,
                dialogIdx: 0,
                type,
            },
            [0, 0],
            () => {
                if (handlerId === undefined) {
                    // Not inserted yet
                    this.game.insertSprite(this.#text);

                    /**
                     * @param e {KeyboardEvent}
                     */
                    const keyPressHandler = (e) => {
                        switch (e.key) {
                            case 'Enter':
                                switch (this.states.get(DialogState)) {
                                    case DialogState.starting:
                                        this.states.set(DialogState, DialogState.typing);
                                        this.currentAnimation = this.animations.idle;
                                        break;
                                    case DialogState.typing:
                                        this.#text.text = '';

                                        for (let i = 1; i <= this.dialog.length; i++) {
                                            this.#text.text += this.dialog.charAt(i - 1);

                                            if (i % 32 === 0) {
                                                this.#text.text += '\n';
                                            }
                                        }

                                        this.states.set(DialogState, DialogState.ended);
                                        break;
                                    case DialogState.ended:
                                        if (onEnd) {
                                            onEnd();
                                        } else {
                                            this.endDialog();
                                        }
                                        break;
                                }
                                break;
                        }
                    };

                    handlerId = this.game.addEventListener('keydown', keyPressHandler);
                }

                this.x = this.game.cameraX + (7 + Game.windowWidth / 20) * scale + (this.isBoss ? 0 : 120);
                this.y = this.game.cameraBY - 80 * scale;

                this.moveCurrentAnimation();
            },
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            scale
        );

        this.#text = new Text(
            {
                bottomLeftCoords: [0, 0],
                text: ""
            },
            () => {
                switch (this.states.get(DialogState)) {
                    case DialogState.typing:
                        this.#text.text += this.dialog.charAt(this.dialogIdx++);

                        if (this.dialogIdx % 32 === 0) {
                            this.#text.text += '\n';
                        }

                        // Finish typing
                        if (this.dialogIdx >= this.dialog.length) {
                            this.states.set(DialogState, DialogState.ended);
                        }

                        break;
                }

                this.#text.x = this.x + 4.5 * this.scale;
                this.#text.y = this.y + this.scale + this.#text.height;
            },
            {
                font: `bold ${12 * (scale ?? 1)}px Courier New`,
                fillColor: 'white',
            }

        );

        this.#animations = {
            start_0: this.createAnimation(
                0,
                12,
                53,
                1,
                1,
                1,
                244,
                3,
                0,
                0,
                2,
                undefined,
                () => {
                    this.currentAnimation = this.animations.start_1;
                }
            ),
            start_1: this.createAnimation(
                0,
                11,
                71,
                1,
                1,
                1,
                246,
                14,
                0,
                0,
                2,
                undefined,
                () => {
                    this.currentAnimation = this.animations.start_2;
                }
            ),
            start_2: this.createAnimation(
                0,
                10,
                91,
                1,
                1,
                1,
                246,
                46,
                0,
                0,
                2,
                undefined,
                () => {
                    this.currentAnimation = this.animations.start_3;
                }
            ),
            start_3: this.createAnimation(
                0,
                10,
                145,
                1,
                1,
                1,
                246,
                70,
                0,
                0,
                2,
                undefined,
                () => {
                    this.states.set(DialogState, DialogState.typing);
                    this.currentAnimation = this.animations.idle;
                }
            ),
            idle: this.createAnimation(
                0,
                10,
                221,
                1,
                1,
                1,
                246,
                70,
                0,
                0,
                2
            ),
            xHead: this.createAnimation(
                1,
                136,
                128,
                1,
                1,
                1,
                102,
                92,
                0,
                0,
                1
            ),
            zeroHead: this.createAnimation(
                1,
                359,
                130,
                1,
                1,
                1,
                112,
                92,
                0,
                0,
                1,
            ),
            irisHead: this.createAnimation(
                1,
                128,
                260,
                1,
                1,
                1,
                112,
                92,
                0,
                0,
                1,
            ),
            sigmaHead: this.createAnimation(
                1,
                486,
                260,
                1,
                1,
                1,
                99,
                92,
                0,
                0,
                1
            )
        };

        this.dialogType = type;

        // Initialize the dialog state
        this.states.set(DialogState, DialogState.starting);
        this.currentAnimation = this.animations.start_0;
    }

    /**
     * @returns {Object<string, number>} Object containing the animations of the dialog.
     */
    get animations() {
        return this.#animations;
    }

    /**
     * @returns {{
     *   type: number,
     *   dialog: string,
     *   dialogIdx: number,
     * }} description of Dialog.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {string} dialog content.
     */
    get dialog() {
        return this.desc.dialog;
    }

    /**
     * @returns {number} the current dialog index.
     */
    get dialogIdx() {
        return this.desc.dialogIdx;
    }

    /**
     * @param v {number} new dialog index.
     */
    set dialogIdx(v) {
        this.desc.dialogIdx = v;
    }

    /**
     * @param v {string} new dialog value.
     */
    set dialog(v) {
        this.dialogIdx = 0;
        this.#text.text = "";
        this.desc.dialog = v;
        this.states.set(DialogState, DialogState.typing);
    }

    /**
     * @param t {number} new dialog type.
     */
    set dialogType(t) {
        switch (t) {
            case DialogType.x:
                this.#headAnimation = this.animations.xHead;
                break;
            case DialogType.zero:
                this.#headAnimation = this.animations.zeroHead;
                break;
            case DialogType.iris:
                this.#headAnimation = this.animations.irisHead;
                break;
            case DialogType.sigma:
                this.#headAnimation = this.animations.sigmaHead;
                break;
            default:
                this.#headAnimation = undefined;
                break;
        }

        this.desc.type = t;
    }

    /**
     * @returns {number} the dialog type.
     */
    get dialogType() {
        return this.desc.type;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get defaultHitBox() {
        return [];
    }

    /**
     * @returns {boolean} true if the dialog is for a boss.
     */
    get isBoss() {
        return this.dialogType === DialogType.sigma || this.dialogType === DialogType.iris;
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);

        const hscale = this.scale / 1.31;

        if (this.#headAnimation !== undefined) {
            this.drawAnimation(
                this.#headAnimation,
                this.isBoss
                    ? this.rx
                    : this.x - hscale * (
                    this.getAnimation(this.#headAnimation).singleWidth - 2
                ),
                this.y,
                context,
                hscale
            );
        }
    }

    /**
     * Ends the dialog box.
     */
    endDialog() {
        this.game.removeSprite(this.#text);
        this.game.removeSprite(this);
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
        return Dialog.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['dialog.gif', 'mug_shots.gif'];
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
        return Dialog.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Dialog.sounds;
    }
}
