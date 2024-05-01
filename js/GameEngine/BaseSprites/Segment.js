'use strict';

import Sprite from "./Sprite.js";


/**
 * @class Segment
 *
 * Class representing line segments in canvas.
 * Used for detecting when a sprite passes a certain coordinate.
 * Shown only when hit boxes are enabled in the Game instance.
 */
export default class Segment extends Sprite {
    /**
     * Error tolerance for checks involving floating points.
     * Used to avoid unexpected bugs with floating point precision.
     * Any point whose distance is less than the tolerance is considered
     * on the segment.
     *
     * @type {number}
     * @private
     */
    static #epsilon = 1e-6;

    /**
     * Factory for simple segments, that can be used for event triggering of certain sprites.
     *
     * @param p0 {[number, number]} first point of the segment.
     * @param p1 {[number, number]} second point of the segment.
     * @returns {Segment} The created static segment.
     * @constructor
     */
    static simpleSegment(p0, p1) {
        return new Segment(
            {
                p0,
                p1
            },
            undefined,
            undefined,
            undefined,
            true
        );
    }

    /**
     * @param p0 {[number, number]} first point.
     * @param p1 {[number, number]} second point.
     * @returns {number} the ditance between the two points.
     */
    static distance(p0, p1) {
        return Math.sqrt(
            (p0[0] - p1[0]) ** 2 + (p0[1] - p1[1]) ** 2
        );
    }

    /**
     * @param v {number} to check.
     * @returns {boolean} true if v is in the range (-epsilon, epsilon).
     */
    static tolerated(v) {
        return -this.#epsilon < v < this.#epsilon;
    }

    /**
     * @param p {[number, number]} first point.
     * @param q {[number, number]} second point.
     * @param r {[number, number]} third point.
     * @returns {number} 0 if p, q, & r are collinear; 1 if clockwise; 2 if counterclockwise.
     */
    static orientation(p, q, r) {
        // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
        // for details of below formula.
        const res = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] * q[1]);

        if (this.tolerated(res)) {
            return 0;
        }

        return 0 < res ? 1 : 2;
    }

    /**
     * All three are collinear.
     *
     * @param p {[number, number]} first point.
     * @param q {[number, number]} second point.
     * @param r {[number, number]} third point.
     * @returns {boolean} true if q lies on segment 'pr'
     */
    static collinearOnSegment(p, q, r) {
        return (
            q[0] <= Math.max(p[0], r[0])
            && q[0] >= Math.min(p[0], r[0])
            && q[1] <= Math.max(p[1], r[1])
            && q[1] >= Math.min(p[1], r[1])
        );
    }

    /**
     * @param description {{
     *     p0: [number, number],
     *     p1: [number, number],
     * }} sprite geometric description.
     * @param onUpdate {(function(Set<HitBox>, number): boolean)?} called on each update cycle
     * @param color {string?} color of the line to be drawn. Use for testing only.
     *  @param relativePoint {RelativePoint?} relative point of the sprite.
     *  default is TopLeft.
     *  @param isStatic {boolean?} true indicates that the sprite does not update. Default false.
     */
    constructor(
        description,
        onUpdate,
        color,
        relativePoint,
        isStatic
    ) {
        super(
            description,
            [],
            description.p0,
            onUpdate,
            {
                borderColor: color,
                borderWidth: 1,
            },
            undefined,
            relativePoint,
            true,
            isStatic
        );
    }

    /**
     * @returns {{
     *   p0: [number, number],
     *   p1: [number, number],
     * }} description of the line.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {[number,number]} the point closest to the top of the two.
     */
    get topPoint() {
        return this.p0[1] < this.p1[1] ? this.p0 : this.p1;
    }

    /**
     * @returns {[number,number]} the point closest to the bottom of the two.
     */
    get bottomPoint() {
        return this.p0[1] > this.p1[1] ? this.p0 : this.p1;
    }

    /**
     * @returns {[number,number]} the point closest to the left of the two.
     */
    get leftPoint() {
        return this.p0[0] < this.p1[0] ? this.p0 : this.p1;
    }

    /**
     * @returns {[number,number]} the point closest to the right of the two.
     */
    get rightPoint() {
        return this.p0[0] > this.p1[0] ? this.p0 : this.p1;
    }

    /**
     * @returns {[number,number]} reference to the start point on the segment.
     */
    get p0() {
        return this.desc.p0;
    }

    /**
     * @returns {[number,number]} reference to the end point on the segment
     */
    get p1() {
        return this.desc.p1;
    }

    /**
     * @returns {number} the x-coordinate of the line. Same as that of the first point.
     */
    get x() {
        return this.p0[0];
    }

    /**
     * @returns {number} the y-coordinate of the line. Same as that of the first point.
     */
    get y() {
        return this.p0[1];
    }

    /**
     * @returns {Sprite} a clone of this sprite.
     */
    get clone() {
        return new Segment(
            this.desc,
            this.onUpdate,
            this.brush,
            this.relativePoint,
            this.static
        );
    }

    /**
     * @returns {number} the slope of the segment.
     */
    get slope() {
        return (this.p1[1] - this.p0[1]) / (this.p1[0] - this.p0[0]);
    }

    /**
     * @returns {number} the length of the line.
     */
    get length() {
        return Segment.distance(this.p0, this.p1);
    }

    /**
     * @param v {number} to check.
     * @returns {boolean} true if v is in the range (-epsilon, epsilon).
     */
    tolerated(v) {
        return Segment.tolerated(v);
    }

    /**
     * @param x {number} x-coordinate of a point.
     * @param y {number} y-coordinate of a point.
     * @returns {boolean} true if point (x, y) is on the segment.
     */
    hasPoint(x, y) {
        return this.tolerated(
            Segment.distance(this.p0, [x, y])
            + Segment.distance([x, y], this.p1)
            - this.length
        );
    }

    /**
     * @param segment {Segment} segment to check its intersection.
     * @returns {boolean} true if the segments intersect.
     */
    intersects(segment) {
        const p1 = this.p0, q1 = this.p1;
        const p2 = segment.p0, q2 = segment.p1;

        // Get orientations for points
        const o1 = Segment.orientation(p1, q1, p2);
        const o2 = Segment.orientation(p1, q1, q2);
        const o3 = Segment.orientation(p2, q2, p1);
        const o4 = Segment.orientation(p2, q2, q1);

        // General case
        if (o1 !== o2 && o3 !== o4) {
            return true;
        }

        // Special Cases
        // p1, q1 and p2 are collinear and p2 lies on segment p1q1
        if (o1 === 0 && Segment.collinearOnSegment(p1, p2, q1)) {
            return true;
        }

        // p1, q1 and q2 are collinear and q2 lies on segment p1q1
        if (o2 === 0 && Segment.collinearOnSegment(p1, q2, q1)) {
            return true;
        }

        // p2, q2 and p1 are collinear and p1 lies on segment p2q2
        if (o3 === 0 && Segment.collinearOnSegment(p2, p1, q2)) {
            return true;
        }

        // p2, q2 and q1 are collinear and q1 lies on segment p2q2
        return o4 === 0 && Segment.collinearOnSegment(p2, q1, q2);
    }

    /**
     * @param v {number} new x-coordinate of the line.
     */
    set x(v) {
        this.desc.p0[0] = v;
    }

    /**
     * @param v {number} new y-coordinate of the line.
     */
    set y(v) {
        this.desc.p0[1] = v;
    }

    /**
     * Draws the text in the 2d context.
     *
     * @Abstract
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        // Draw line from point 'p0' to 'p1' iff the Game is showing hit boxes
        if (Sprite.showingHitBoxes) {
            context.moveTo(...this.p0);
            context.lineTo(...this.p1);
        }
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "segment";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Segment.type;
    }

    /**
     * @returns {HitBox[]}
     */
    get defaultHitBox() {
        return [];
    }
}
