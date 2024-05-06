'use strict';

import {Sprite} from "./index.js";


/**
 * @class Void
 *
 * Class used to schedule independent timeout events.
 */
export default class Void extends Sprite {
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
     */
    constructor(
        updateAfter,
        currentTick,
        onUpdate,
    ) {
        super(
            {},
            [],
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
            undefined
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
     * Cannot clone Void.
     *
     * @returns {Sprite} a clone of this sprite.
     */
    get clone() {
        return undefined;
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
}
