/**
 * @class {CRectangle} rectangle class used by the Camera object.
 */
export default class CRectangle {
    /**
     * The description is in the following order [x, y, width, height].
     *
     * @type {[number, number, number, number]} description of the rectangle.
     * @private
     */
    #desc;

    /**
     * @param desc {{
     *     x?: number,
     *     y?: number,
     *     width: number,
     *     height: number
     * }} description of the rectangle.
     */
    constructor(desc) {
        this.x = desc.x ?? 0;
        this.y = desc.y ?? 0;
        this.width = desc.width;
        this.height = desc.height;
    }

    /**
     * @returns {number} the x-coordinate of the rectangle.
     */
    get x() {
        return this.#desc[0];
    }

    /**
     * @returns {number} the y-coordinate of the rectangle.
     */
    get y() {
        return this.#desc[1];
    }

    /**
     * @returns {number} the rightmost coordinate of the rectangle.
     */
    get rx() {
        return this.x + this.width;
    }

    /**
     * @returns {number} the bottommost coordinate of the rectangle.
     */
    get by() {
        return this.y + this.height;
    }

    /**
     * @returns {number} the width of the rectangle.
     */
    get width() {
        return this.#desc[2];
    }

    /**
     * @returns {number} the height of the rectangle.
     */
    get height() {
        return this.#desc[3];
    }

    /**
     * @param value {number} new value.
     */
    set x(value) {
        this.#desc[0] = value;
    }

    /**
     * @param value {number} new value.
     */
    set y(value) {
        this.#desc[1] = value;
    }

    /**
     * @param value {number} new value.
     */
    set width(value) {
        this.#desc[2] = value;
    }

    /**
     * @param value {number} new value.
     */
    set height(value) {
        this.#desc[3] = value;
    }

    /**
     * @param rect {CRectangle} rectangle to check if it falls within.
     * @returns {boolean} True if the given rect falls within this rect.
     */
    isWithin(rect) {
        return (
            rect.x <= this.x
            && rect.rx >= this.rx
            && rect.y <= this.y
            && rect.by >= this.by
        );
    }
}
