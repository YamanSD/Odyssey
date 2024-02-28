import {Sprite} from "./index.js";

/**
 * @class Void.
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
     * @param updateAfter {number} number of ticks to wait before updating.
     * @param currentTick {number} current game tick.
     * @param onUpdate {function()} update function to trigger after the ticks pass.
     * @param insertAfter {number?} ID of the sprite to insert after.
     *                             Overrides the current tick.
     */
    constructor(
        updateAfter,
        currentTick,
        onUpdate,
        insertAfter
    ) {
        super(
            undefined,
            undefined, insertAfter !== undefined
                ? () => {
                    return {
                        tick: updateAfter,
                        insertAfter: insertAfter
                    };
                }
                : (tick) => {
                    if (tick === currentTick + updateAfter) {
                        return {tick};
                    }

                    return Sprite.noTick;
                },
            onUpdate,
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
     *  function(Set<HitBox>): *
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
     *  function(Set<HitBox>): *
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
     * @param x {number} x-coordinate of a point.
     * @param y {number} y-coordinate of a point.
     * @returns {boolean} true if point (x, y) is in the void.
     */
    hasPoint(x, y) {
        return false;
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
    get hitBox() {
        return [];
    }
}
