import {RelativePoint, Sprite} from "../../GameEngine";

/**
 * @class Circle.
 *
 * Class representing circles in canvas.
 */
export default class Circle extends Sprite {
    /**
     * @param description {{
     *   centerCoords: [number, number],
     *   radius: number,
     * }} sprite geometric description.
     * @param onTick {(function(number): {
     *     tick: number,
     *     insertAfter?: number
     * }) | undefined} called on each tick cycle.
     * @param onUpdate {(function(Set<HitBox>): boolean)?} called on each update cycle
     * @param brush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?}
     *  @param hitBoxBrush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?}
     */
    constructor(
        description,
        onTick,
        onUpdate,
        brush,
        hitBoxBrush
    ) {
        super(
            description,
            description.centerCoords,
            onTick,
            onUpdate,
            brush,
            hitBoxBrush,
        );
    }

    /**
     * @returns {{
     *   centerCoords: [number, number],
     *   radius: number
     * }} description of the circle.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {number} the radius of the circle.
     */
    get radius() {
        return this.desc.radius;
    }

    /**
     * @returns {Sprite} a clone of this sprite.
     */
    get clone() {
        return new Circle(
            this.desc,
            this.onTick,
            this.onUpdate,
            this.brush,
            this.hitBoxBrush
        );
    }

    /**
     * @param x {number} x-coordinate of a point.
     * @param y {number} y-coordinate of a point.
     * @returns {boolean} true if point (x, y) is in the circle.
     */
    hasPoint(x, y) {
        // This includes border, to remove border use < 1 instead.
        return (
            ((x - this.x) / this.radius) ** 2 +
            ((y - this.y) / this.radius) ** 2
        ) <= 1;
    }

    /**
     * Draws the circle in the 2d context.
     *
     * @Abstract
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        // No need to dynamicCanvas fill and border separately
        context.ellipse(
            this.x,
            this.y,
            this.radius,
            this.radius,
            0,
            0,
            2 * Math.PI,
        );
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "circle";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Circle.type;
    }

    get hitBox() {
        // Alias for the desc parameters
        const r = this.radius + (this.brush.borderWidth ?? 1);

        return this.convertHitBoxes([{
            x: this.x - r,
            y: this.y - r,
            width: 2 * r,
            height: 2 * r,
        }]);
    }
}
