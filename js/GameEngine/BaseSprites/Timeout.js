'use strict';

/**
 * @exports Timeout
 */

/**
 * @class Timeout
 *
 * Used as an interface between the user and the timeout events.
 */
class Timeout {
    /**
     * @type {Void} void instance that represents the timeout.
     * @private
     */
    #void;

    /**
     * @param voidObj {Void} void instance.
     */
    constructor(voidObj) {
        this.#void = voidObj;
    }

    /**
     * @returns {boolean} true if the event was canceled before it finished.
     */
    cancel() {
        this.#void.canceled = true;

        return !this.#void.done;
    }

    /**
     * Note that this does not reschedule the event after the specified period,
     * but rather at the previously established time.
     * Example: event scheduled after 5 ticks at tick 0;
     *          stopped at tick 2;
     *          restarted at tick 4;
     *          still finishes on tick 5.
     *
     * @returns {boolean} true if the event was able to restart the waiting process.
     */
    restart() {
        this.#void.canceled = false;

        return !this.#void.done;
    }
}
