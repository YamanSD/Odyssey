/**
 * @class CollisionDirection
 *
 * Class used as an enum for collision direction.
 */
export default class CollisionDirection {
    /**
     * @type {number} Direction of the collision.
     * @private
     */
    #dir;

    /**
     * Collision directions.
     *
     * @type {{S: number, E: number, W: number, N: number}}
     * @private
     */
    static directions = {
        N:      0b1000,
        S:      0b0100,
        E:      0b0010,
        W:      0b0001,
        NONE:   0b0000
    };

    /**
     * @param dir {number} direction of collision.
     * @private
     */
    constructor(dir) {
        this.#dir = dir;
    }

    /**
     * @param dir {number} direction to check.
     * @returns {boolean} the read bit.
     * @private
     */
    readBit(dir) {
        return Boolean(this.#dir & dir);
    }

    /**
     * @returns {CollisionDirection} no collision.
     * @constructor
     */
    static get None() {
        return new CollisionDirection(this.directions.NONE);
    }

    /**
     * @returns {CollisionDirection} north collision.
     * @constructor
     */
    static get north() {
        return new CollisionDirection(this.directions.N);
    }

    /**
     * @returns {CollisionDirection} south collision.
     * @constructor
     */
    static get south() {
        return new CollisionDirection(this.directions.S);
    }

    /**
     * @returns {CollisionDirection} east collision.
     * @constructor
     */
    static get east() {
        return new CollisionDirection(this.directions.E);
    }

    /**
     * @returns {CollisionDirection} west collision.
     * @constructor
     */
    static get west() {
        return new CollisionDirection(this.directions.W);
    }

    /**
     * Sets the vertical direction of the collision to north.
     * @return {CollisionDirection} this instance.
     */
    get north() {
        this.#dir |= CollisionDirection.directions.N;
        this.#dir &= ~CollisionDirection.directions.S;

        return this;
    }

    /**
     * Sets the vertical direction of the collision to south.
     * @return {CollisionDirection} this instance.
     */
    get south() {
        this.#dir |= CollisionDirection.directions.S;
        this.#dir &= ~CollisionDirection.directions.N;

        return this;
    }

    /**
     * Sets the horizontal direction of the collision to east.
     * @return {CollisionDirection} this instance.
     */
    get east() {
        this.#dir |= CollisionDirection.directions.E;
        this.#dir &= ~CollisionDirection.directions.W;

        return this;
    }

    /**
     * Sets the horizontal direction of the collision to west.
     * @return {CollisionDirection} this instance.
     */
    get west() {
        this.#dir |= CollisionDirection.directions.W;
        this.#dir &= ~CollisionDirection.directions.E;

        return this;
    }

    /**
     * @returns {true} if the collision is northern.
     */
    get isNorth() {
        return this.readBit(CollisionDirection.directions.N);
    }

    /**
     * @returns {true} if the collision is southern.
     */
    get isSouth() {
        return this.readBit(CollisionDirection.directions.S);
    }

    /**
     * @returns {true} if the collision is eastern.
     */
    get isEast() {
        return this.readBit(CollisionDirection.directions.E);
    }

    /**
     * @returns {true} if the collision is western.
     */
    get isWest() {
        return this.readBit(CollisionDirection.directions.W);
    }

    /**
     * @returns {boolean} true if no collision.
     */
    get isNone() {
        return this.#dir === CollisionDirection.directions.NONE;
    }

    /**
     * @returns {string} string representation of the collision direction.
     */
    toString() {
        if (this.isNone) {
            return "None";
        }

        let v = null, h = null;

        if (this.isNorth || this.isSouth) {
            v = this.isNorth ? "North" : "South";
        }

        if (this.isEast || this.isWest) {
            h = this.isEast ? "East" : "West";
        }

        if (v) {
            if (h) {
                return `${v}-${h}`;
            }

            return v;
        } else if (h) { // Always true if reached here
            return h;
        }

        // Silence warnings
        return "";
    }
}
