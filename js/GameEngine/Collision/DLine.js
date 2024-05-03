'use strict';

import {Vector} from "./index.js";


/**
 * @class DLine
 *
 * Line class used by hit boxes.
 */
export default class DLine {
    /**
     * @type {Vector} vector representing the origin point of the Line.
     * @private
     */
    #origin;

    /**
     * @type {Vector} vector representing the direction of the line.
     * @private
     */
    #direction;

    /**
     * @param x {number} x-coordinate of the origin.
     * @param y {number} y-coordinate of the origin.
     * @param dx {number} rate of change for the x-direction.
     * @param dy {number} rate of change for the y-direction.
     */
    constructor(x, y, dx, dy) {
        this.origin = new Vector(x, y);
        this.direction = new Vector(dx, dy);
    }

    /**
     * @returns {Vector} the origin of the line.
     */
    get origin() {
        return this.#origin;
    }

    /**
     * @returns {Vector} the direction of the line.
     */
    get direction() {
       return this.#direction;
    }

    /**
     * @param v {Vector} new origin of the line.
     */
    set origin(v) {
        this.#origin = v;
    }

    /**
     * @param v {Vector} new direction of the line.
     */
    set direction(v) {
        this.#direction = v;
    }
}
