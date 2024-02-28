/**
 * @class Vector
 *
 * Vector class used by hit boxes.
 */
export default class Vector {
    /**
     * @type {[number, number]} components of the vector.
     * @private
     */
    #comp;

    /**
     * @param x {number} x-component of the vector.
     * @param y {number} y-component of the vector.
     */
    constructor(x, y) {
        this.#comp = [x, y];
    }

    /**
     * @returns {number} the x-component of the vector.
     */
    get x() {
        return this.#comp[0];
    }

    /**
     * @returns {number} the y-component of the vector.
     */
    get y() {
        return this.#comp[1];
    }

    /**
     * @param theta {number} degree in radians to rotate the vector by.
     * @returns {Vector} the rotated vector.
     */
    rotate(theta) {
        return new Vector(
            this.x * Math.cos(theta) - this.y * Math.sin(theta),
            this.x * Math.sin(theta) + this.y * Math.cos(theta),
        );
    }

    /**
     * @param factor {Vector | number} factor to add to the vector.
     * @returns {Vector} a new modified vector.
     */
    add(factor) {
        if (typeof factor === typeof 0) {
            return new Vector(
                this.x + factor,
                this.y + factor
            );
        }

        return new Vector(
            this.x + factor.x,
            this.y + factor.y
        );
    }

    /**
     * @param factor {Vector | number} factor to multiply by the vector.
     * @returns {Vector} a new modified vector.
     */
    multiply(factor) {
        if (typeof factor === typeof 0) {
            return new Vector(
                this.x * factor,
                this.y * factor
            );
        }

        return new Vector(
            this.x * factor.x,
            this.y * factor.y
        );
    }

    /**
     * @returns {number} the magnitude of the vector.
     */
    get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    /**
     * {@link DLine} links the Line class.
     * @param line {DLine} for every corner of a rectangle,
     * get the projection coordinate on both axis of the other rectangle.
     * @return {Vector} the projected vector.
     */
    project(line) {
        const dotValue = line.direction.x * (this.x - line.origin.x)
            + line.direction.y * (this.y - line.origin.y);

        return new Vector(
            line.origin.x + line.direction.x * dotValue,
            line.origin.y + line.direction.y * dotValue
        );
    }
}
