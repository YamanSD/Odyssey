'use strict';

import Vector from './Vector.js';
import DLine from './DLine.js';


/**
 * @class HitBox
 *
 * Class representing hit boxes in canvas.
 */
export default class HitBox {
    /**
     * @type {Sprite} owner of this instance hit-box.
     * @private
     */
    #sprite;

    /**
     * @type {{
     *   topLeftCoords: [number, number],
     *   height: number,
     *   width: number,
     *   rotation?: number
     * }} hit box geometric description.
     * @private
     */
    #desc;

    /**
     * @param description {{
     *   topLeftCoords: [number, number],
     *   height: number,
     *   width: number,
     *   rotation?: number
     * }} hit box geometric description. Default rotation is 0.
     * @param sprite {Sprite} owner of the hit-box.
     */
    constructor(description, sprite) {
        this.#desc = description;
        this.#sprite = sprite;
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number],
     *   height: number,
     *   width: number,
     *   rotation: number
     * }} description of the hit box.
     */
    get desc() {
        return this.#desc;
    }

    /**
     * @returns {number} the x-coordinate of the hit box.
     */
    get x() {
        return this.#desc.topLeftCoords[0];
    }

    /**
     * @returns {number} the y-coordinate of the hit box.
     */
    get y() {
        return this.#desc.topLeftCoords[1];
    }

    /**
     * @returns {number} the width of the hit box.
     */
    get width() {
        return this.desc.width;
    }

    /**
     * {@link DLine} links the Line class.
     * @returns {[DLine, DLine]} the two axis of center of the hit box.
     */
    get axis() {
        const ox = new Vector(1, 0), oy = new Vector(0, 1);
        const rx = ox.rotate(this.rotation), ry = oy.rotate(this.rotation);
        const center = this.center;

        return [
            new DLine(center.x, center.y, rx.x, rx.y),
            new DLine(center.x, center.y, ry.x, ry.y)
        ];
    }

    /**
     * @returns {[Vector, Vector, Vector, Vector]} four vectors for the corners of the
     *                                             hit box.
     */
    get vectorCorners() {
        const axis = this.axis;
        const rx = axis[0].direction.multiply(this.width / 2);
        const ry = axis[1].direction.multiply(this.height / 2);
        const center = this.center;

        return [
            center.add(rx).add(ry),
            center.add(rx).add(ry.multiply(-1)),
            center.add(rx.multiply(-1)).add(ry.multiply(-1)),
            center.add(rx.multiply(-1)).add(ry)
        ];
    }

    /**
     * @returns {Vector} vector for the center of the hit box.
     */
    get center() {
        return new Vector(
            ...this.#rotatePoint(
                this.x + this.width / 2,
                this.y + this.height / 2
            )
        );
    }

    /**
     * @returns {number} the height of the hit box.
     */
    get height() {
        return this.desc.height;
    }

    /**
     * @returns {Sprite} owner of this hit box.
     */
    get sprite() {
        return this.#sprite;
    }

    /**
     * @return {[number, number][]} list of coordinates for the hit box polygon.
     */
    get corners() {
        return [
            [this.x, this.y],
            this.#rotatePoint(this.x + this.width, this.y),
            this.#rotatePoint(this.x, this.y + this.height),
            this.#rotatePoint(this.x + this.width, this.y + this.height)
        ];
    }

    /**
     * In radians.
     *
     * @returns {number} the rotation of the hit box.
     */
    get rotation() {
        return this.desc.rotation ?? 0;
    }

    /**
     * @param x {number} x-coordinate of a point.
     * @param y {number} y-coordinate of a point.
     * @returns {boolean} true if point (x, y) is in the hit box.
     */
    hasPoint(x, y) {
        return this.x <= x && x <= this.x + this.width
            && this.y <= y && y <= this.y + this.height;
    }

    /**
     * @param x {number} x-coordinate of the point to rotate.
     * @param y {number} y-coordinate of the point to rotate.
     * @returns {[number, number]} the rotated coordinates.
     * @private
     */
    #rotatePoint(x, y) {
        const a = this.rotation;
        const s = Math.sin(a), c = Math.cos(a);

        // Translate
        x -= this.x;
        y -= this.y;

        return [
            c * x - s * y + this.x,
            s * x + c * y + this.y
        ];
    }
}
