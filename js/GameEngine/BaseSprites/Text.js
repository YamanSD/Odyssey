import Sprite from "./Sprite.js";

/**
 * @class Text.
 *
 * Class representing texts in canvas.
 */
export default class Text extends Sprite {
    /**
     * @type {TextMetrics | undefined} stores geometric text info.
     */
    #metrics;

    /**
     * @param description {{
     *   bottomLeftCoords: [number, number],
     *   text: string,
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
            description.bottomLeftCoords,
            onTick,
            onUpdate,
            brush,
            hitBoxBrush
        );
    }

    /**
     * @returns {{
     *   bottomLeftCoords: [number, number],
     *   text: string,
     *   metrics: TextMetrics,
     *   font?: string
     * }} description of the text.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @param metrics {TextMetrics} new metrics.
     */
    set metrics(metrics) {
        this.#metrics = metrics;
    }

    /**
     * @returns {TextMetrics} the geometric text info.
     */
    get metrics() {
        return this.#metrics;
    }

    /**
     * @returns {number} text height if metrics are defined.
     */
    get height() {
        return (this.metrics?.fontBoundingBoxAscent ?? 0
            + this.metrics?.fontBoundingBoxDescent ?? 0);
    }

    /**
     * @returns {number} text width if metrics are defined.
     */
    get width() {
        return (this.metrics?.width ?? 0);
    }

    /**
     * @returns {number} the x-coordinate of the bottom-left point of the sprite.
     */
    get x() {
        return this.desc.bottomLeftCoords[0];
    }

    /**
     * @returns {number} the y-coordinate of the bottom-left point of the sprite.
     */
    get y() {
        return this.desc.bottomLeftCoords[1];
    }

    /**
     * @returns {string} the text data.
     */
    get text() {
        return this.desc.text;
    }

    /**
     * @param v {string} new text value.
     */
    set text(v) {
        this.desc.text = v;
    }

    /**
     * Overrides the DynamicCanvas brush font.
     *
     * @returns {string} the text font.
     */
    get font() {
        return this.desc.font;
    }

    /**
     * @returns {boolean} true for text.
     */
    get textual() {
        return true;
    }

    /**
     * @param x {number} x-coordinate of a point.
     * @param y {number} y-coordinate of a point.
     * @returns {boolean} true if point (x, y) is in the text.
     */
    hasPoint(x, y) {
        const metrics = this.metrics;

        // Check for metrics existence
        if (!metrics) {
            return false;
        }

        // topLeftCoordinate of text.
        const topY = this.y - this.height;

        return this.x <= x && x <= this.x + this.width
            && topY <= y && y <= topY + this.height;
    }

    /**
     * Draws the text in the 2d context.
     *
     * @Abstract
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        // Store old font
        const oldFont = context.font;

        // Override context font
        context.font = this.font;

        // Draw the text fill
        context.fillText(this.text, this.x, this.y);

        // Restore old font
        context.font = oldFont;
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "text";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Text.type;
    }

    /**
     * The returned hit box is used in collision detection and quadtree.
     *
     * @returns {HitBox[]} a list of hit boxes that represent the hit-boxes of the sprite.
     */
    get hitBox() {
        const metrics = this.metrics;

        // Check for metrics existence
        if (!metrics) {
            return [];
        }

        return this.convertHitBoxes([{
            x: this.x,
            y: this.y - this.height + 1,
            width: this.width,
            height: this.height + 1
        }]);
    }
}
