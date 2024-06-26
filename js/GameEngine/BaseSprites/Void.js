'use strict';


/**
 * @exports Void
 */

/**
 * @typedef {import('./Sprite.js').Sprite} Sprite
 */

/**
 * @class Void
 *
 * Class used to schedule independent timeout events.
 */
class Void extends Sprite {
    /**
     * @type {boolean} true if the event is canceled.
     * @private
     */
    #canceled;

    /**
     * @type {boolean} true if the event has passed.
     * @private
     */
    #done;

    /**
     * Here a tick is defined to be an update call.
     *
     * @param updateAfter {number} number of ticks to wait before updating.
     * @param currentTick {number} current game tick.
     * @param onUpdate {function()} update function to trigger after the ticks pass.
     * @param nonPausable {boolean} if true, the sprite updates regardless of the game being paused.
     */
    constructor(
        updateAfter,
        currentTick,
        onUpdate,
        nonPausable
    ) {
        super(
            {},
            [0, 0],
            (tick) => {
                if (tick === currentTick + updateAfter) {
                    onUpdate();

                    // Remove from the game
                    this.game.removeSprite(this);
                }
            },
            undefined,
            undefined,
            undefined,
            nonPausable
        );

        // Set canceled to false
        this.canceled = false;
        this.done = false;
    }

    /**
     * @returns {{}} description of the void.
     */
    get desc() {
        return super.desc;
    }

    /**
     * Marks the Void as done.
     *
     * @returns {
     *  function(number): *
     * } the update function.
     */
    get onUpdate() {
        // Set to done
        this.done = true;

        return !this.canceled ? super.onUpdate : () => {};
    }

    /**
     * Needed because we must override both getter and setter.
     *
     * @param onUpdate {
     *  function(number): *
     * } the new update function.
     */
    set onUpdate(onUpdate) {
        super.onUpdate = onUpdate;
    }

    /**
     * @returns {boolean} current cancellation status.
     */
    get canceled() {
        return this.#canceled;
    }

    /**
     * @param value {boolean} new cancellation status.
     */
    set canceled(value) {
        this.#canceled = value;
    }

    /**
     * @returns {boolean} current done status.
     */
    get done() {
        return this.#done;
    }

    /**
     * @param value {boolean} new done status.
     */
    set done(value) {
        this.#done = value;
    }

    /**
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {}

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "void";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Void.type;
    }

    /**
     * Void has no hit-box.
     *
     * @returns {[]}
     */
    get defaultHitBox() {
        return [];
    }

    /**
     * @returns {number} void has no width.
     */
    get width() {
        return 0;
    }

    /**
     * @returns {number} void has no height.
     */
    get height() {
        return 0;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return [];
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
        return Void.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Void.sounds;
    }
}
