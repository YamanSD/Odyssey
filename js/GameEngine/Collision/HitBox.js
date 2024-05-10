'use strict';

/**
 * @exports HitBox
 */


/**
 * @class HitBox
 *
 * Class representing hit boxes in canvas.
 */
class HitBox {
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
     * @type {{
     *     sin: number,
     *     cos: number,
     *     tan: number
     * }} common trig-values of rotation.
     * @private
     */
    #trig;

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
        this.rotation = description.rotation ?? 0;
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
     * @returns {number} rightmost x of the hit-box.
     */
    get rx() {
        return this.x + this.width;
    }

    /**
     * @returns {number} Bottommost y of the hit-box.
     */
    get by() {
        return this.y + this.height;
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
     * @returns {number} sine of the rotation.
     */
    get sin() {
        return this.#trig.sin;
    }

    /**
     * @returns {number} cosine of the rotation.
     */
    get cos() {
        return this.#trig.cos;
    }

    /**
     * @returns {number} tangent of the rotation.
     */
    get tan() {
        return this.#trig.tan;
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
     * @param value {number} new value.
     */
    set width(value) {
        this.desc.width = value;
    }

    /**
     * @param value {number} new rotation of the hit-box in radians.
     */
    set rotation(value) {
        this.desc.rotation = value;
        this.#trig = {
            sin: Math.sin(value),
            cos: Math.cos(value),
            tan: Math.tan(value)
        };
    }

    /**
     * @param rx {number} new rightmost x-coordinate.
     */
    set rx(rx) {
        this.x = rx - this.width;
    }

    /**
     * @param by {number} new bottommost y-coordinate.
     */
    set by(by) {
        this.y = by - this.height;
    }

    /**
     * @param value {number} new value.
     */
    set height(value) {
        this.desc.height = value;
    }

    /**
     * @param value {number} new value.
     */
    set x(value) {
        this.desc.topLeftCoords[0] = value;
    }

    /**
     * @param value {number} new value.
     */
    set y(value) {
        this.desc.topLeftCoords[1] = value;
    }

    /**
     * @param s {number} scale value.
     * @param x {number} x-coordinate of the sprite.
     * @param y {number} y-coordinate of the sprite
     * @returns {HitBox} reference to this hit box.
     */
    scale(s, x, y) {
        this.width *= s;
        this.height *= s;
        this.x = s * (this.x - x) + x;
        this.y = s * (this.y - y) + y;
        return this;
    }

    /**
     * Flips the hit-box horizontally around the sprite half-width.
     */
    flip() {
        this.x = 2 * (this.sprite.x + this.sprite.width / 2) - this.rx;
    }

    /**
     * @param x {number} x-coordinate to be projected properly to the top of the rectangle.
     */
    projectX(x) {
        return this.tan * (x - this.x) + this.y;
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
        const s = this.sin, c = this.cos;

        // Translate
        x -= this.x;
        y -= this.y;

        return [
            c * x - s * y + this.x,
            s * x + c * y + this.y
        ];
    }
}
