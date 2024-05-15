'use strict';

/**
 * @exports Text
 */

/**
 * @class Text
 *
 * Class representing texts in canvas.
 */
class Text extends Sprite {
    /**
     * @type {TextMetrics | undefined} stores geometric text info.
     */
    #metrics;

    /**
     * @type {string[]} array of lines in the text.
     * @private
     */
    #lines;

    /**
     * @param description {{
     *   bottomLeftCoords: [number, number],
     *   text: string,
     * }} sprite geometric description.
     * @param onUpdate {(function(number): boolean)?} called on each update cycle, with the current tick.
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
     *  @param relativePoint {RelativePoint?} relative point of the sprite.
     *  default is TopLeft.
     *  @param ignorable {boolean?} true if the instance does not have collisions. Default false.
     *  @param isStatic {boolean?} true indicates that the sprite does not update. Default false.
     */
    constructor(
        description,
        onUpdate,
        brush,
        hitBoxBrush,
        relativePoint,
        ignorable,
        isStatic
    ) {
        super(
            description,
            description.bottomLeftCoords,
            onUpdate,
            brush,
            hitBoxBrush,
            relativePoint,
            ignorable,
            isStatic
        );

        this.countLines(this.text);
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
     * @returns {string[]} number of lines.
     */
    get lines() {
        return this.#lines;
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
     * @returns {number} height of a single line.
     */
    get singleLineHeight() {
        return (this.metrics?.fontBoundingBoxAscent ?? 0)
            + (this.metrics?.fontBoundingBoxDescent ?? 0);
    }

    /**
     * @returns {number} text height if metrics are defined.
     */
    get height() {
        return this.singleLineHeight * this.#lines.length;
    }

    /**
     * @returns {number} text width if metrics are defined.
     */
    get width() {
        // There is a bug with this as it returns the length of
        // the sentences as if they were all a single sentence.
        // To fix this it requires a partial rewrite of the text
        // drawing logic in the game, not necessary so not doing it.
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
     * @returns {boolean} true for text.
     */
    get textual() {
        return true;
    }

    /**
     * @param v {string} new text value.
     */
    set text(v) {
        this.desc.text = v;
        this.countLines(v);
    }

    /**
     * @param v {number} new bottomLeft x-coordinate of the text.
     */
    set x(v) {
        this.desc.bottomLeftCoords[0] = v;
    }

    /**
     * @param v {number} new bottomLeft y-coordinate of the text.
     */
    set y(v) {
        this.desc.bottomLeftCoords[1] = v;
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
     * Assigns the value to the lines array.
     *
     * @param str {string} to count the lines for.
     */
    countLines(str) {
        this.#lines = [];
        let prevI = 0;

        // Count the lines
        for (let i = 0; i < str.length; i++) {
            if (str.charAt(i) === '\n') {
                this.#lines.push(str.substring(prevI, i - 1));
                prevI = i + 1;
            }
        }

        // Last sentence
        const last = str.substring(prevI);

        if (last.length) {
            this.#lines.push(last);
        }
    }

    /**
     * Draws the text in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        const l = this.lines.length;

        // Draw the text fill
        for (let i = 0; i < l; i++) {
            context.fillText(
                this.lines[i],
                this.x,
                this.y - (l - i - 0.99) * this.singleLineHeight
            );
        }
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
    get defaultHitBox() {
        const metrics = this.metrics;

        // Check for metrics existence
        if (!metrics) {
            return [];
        }

        return this.convertHitBoxes([{
            x: this.x,
            y: this.y - this.height + 1,
            width: this.width * 1.02,
            height: this.height * 1.25
        }]);
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return [];
    }

    /**
     * @returns {string[]} sound files.
     */
    static get sounds() {
        return [];
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    get sheets() {
        return Text.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Text.sounds;
    }
}
