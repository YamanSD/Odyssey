import {Sprite} from "../../GameEngine";

/**
 * @class Rectangle.
 *
 * Class representing rectangles in canvas.
 */
export default class Rectangle extends Sprite {
    /**
     * @param description {{
     *   topLeftCoords: [number, number],
     *   height: number,
     *   width: number
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
     *  }?} object hit-box brush properties.
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
            description.topLeftCoords,
            onTick,
            onUpdate,
            brush,
            hitBoxBrush
        );
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number],
     *   height: number,
     *   width: number
     * }} description of the rectangle.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {number} the width of the rectangle.
     */
    get width() {
        return this.desc.width;
    }

    /**
     * @returns {number} the height of the rectangle.
     */
    get height() {
        return this.desc.height;
    }

    get centerX() {
        return this.x + this.width / 2;
    }

    get centerY() {
        return this.y + this.height / 2;
    }

    /**
     * @param x {number} x-coordinate of a point.
     * @param y {number} y-coordinate of a point.
     * @returns {boolean} true if point (x, y) is in the rectangle.
     */
    hasPoint(x, y) {
        return this.x <= x && x <= this.x + this.width
            && this.y <= y && y <= this.y + this.height;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get hitBox() {
        return this.convertHitBoxes([{
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        }]);
    }

    /**
     * @returns {Sprite} a clone of this sprite.
     */
    get clone() {
        return new Rectangle(
            this.desc,
            this.onTick,
            this.onUpdate,
            this.brush,
            this.hitBoxBrush
        );
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @Abstract
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        // Draw fill rectangle
        context.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        // Draw the border rectangle
        context.rect(
            this.x,
            this.y,
            this.width,
            this.height
        );
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "rectangle";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Rectangle.type;
    }
}
