import Sprite from "../../GameEngine/BaseSprites/Sprite.js";

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
     * @param onUpdate {(function(Set<{
     *     x: number,
     *     y: number,
     *     height: number,
     *     width: number,
     *     sprite: Sprite
     * }>): boolean)?} called on each update cycle
     * @param brush {{
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
        brush
    ) {
        super(
            description,
            description.topLeftCoords,
            onTick,
            onUpdate,
            brush
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
     * @returns {{
     *   x: number,
     *   y: number,
     *   height: number,
     *   width: number
     * }[]} the smallest rectangle that surrounds the shape.
     */
    get hitBox() {
        return [{
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        }];
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
