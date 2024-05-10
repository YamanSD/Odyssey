'use strict';

/**
 * @exports RelativePoint
 */

/**
 * @class RelativePoint
 *
 * Class used for setting the relative points of Sprites.
 */
class RelativePoint {
    /**
     * @type {[number, number]} coordinates of the point.
     * @private
     */
    #coords;

    /**
     * @returns {RelativePoint} top-left of the canvas.
     * @constructor
     */
    static get TopLeft() {
        return new RelativePoint([0, 0]);
    }

    /**
     * @returns {RelativePoint} top-right of the canvas.
     * @constructor
     */
    static get TopRight() {
        return new RelativePoint([1, 0]);
    }

    /**
     * @returns {RelativePoint} bottom-left of the canvas.
     * @constructor
     */
    static get BottomLeft() {
        return new RelativePoint([0, 1]);
    }

    /**
     * @returns {RelativePoint} bottom-right of the canvas.
     * @constructor
     */
    static get BottomRight() {
        return new RelativePoint([1, 1]);
    }

    /**
     * @returns {RelativePoint} center of the canvas.
     * @constructor
     */
    static get Center() {
        return new RelativePoint([0.5, 0.5]);
    }

    /**
     * @param coords {[number, number]} coordinates of the point
     * @protected
     */
    constructor(coords) {
        this.#coords = coords;
    }

    /**
     * @returns {number} the x-coordinate of the point.
     */
    get x() {
        return this.#coords[0];
    }

    /**
     * @returns {number} the y-coordinate of the point.
     */
    get y() {
        return this.#coords[1];
    }
}
