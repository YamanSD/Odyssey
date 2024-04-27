'use strict';

import {HitBox} from "../Tree";
import {RelativePoint, Sound} from "../Engine";
import SpriteSheet from "./SpriteSheet.js";


/**
 * @Abstract
 * @class Sprite
 *
 * Should be treated as an abstract class.
 */
export default class Sprite {
    /**
     * @type {number} ID counter for the sprites.
     * @private
     */
    static #idCounter = 0;

    /**
     * @type {Object<number, Sprite>} maps sprite IDs to Sprite objects.
     * @private
     */
    static #sprites = {};

    /**
     * True if the Game instance is showing hit boxes.
     *
     * @type {boolean}
     * @private
     */
    static #showingHitBoxes = false;

    /**
     * @type {any} sprite geometric description.
     * @private
     */
    #desc;

    /**
     * @type {string[]} list of sprite sheet paths.
     * @private
     */
    #sheet;

    /**
     * Current animation ID.
     *
     * @type {number}
     * @private
     */
    #animationId;

    /**
     * True indicates that the sprite must not be collided with.
     *
     * @type {boolean}
     * @private
     */
    #ignorable;

    /**
     * ID of the current dominant animation to draw.
     *
     * @type {number | undefined}
     * @private
     */
    #currentAnimation;

    /**
     * True indicates that the sprite does not update.
     *
     * @type {boolean}
     * @private
     */
    #static;

    /**
     * Maps the animation IDs to animation objects.
     *
     * @type {
     *  Object<number, {
     *     sheetInd: number,
     *     startX: number,
     *     startY: number,
     *     columns: number,
     *     rows: number,
     *     frameCnt: number,
     *     singleWidth: number,
     *     singleHeight: number,
     *     rSpace: number,
     *     cSpace: number,
     *     currentRow: number,
     *     currentCol: number
     *  }>
     * }
     * @private
     */
    #animations;

    /**
     * Proxy map holding the states of the instance.
     *
     * @type {Map<any, any>}
     * @private
     */
    #states;

    /**
     * @type {[number, number]} the 2d coordinates of the sprite.
     * @private
     */
    #coords;

    /**
     * Brush properties before drawing the shape instance.
     *
     * @type {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  } | undefined}
     * @private
     */
    #brush;

    /**
     * Brush properties before drawing the shape's hit-boxes.
     *
     * @type {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  } | undefined}
     * @private
     */
    #hitBoxBrush;

    /**
     * Used in drawing the sprite.
     *
     * @type {RelativePoint} relative point of the sprite.
     * @private
     */
    #relativePoint;

    /**
     * @type {number} ID of the sprite.
     * @private
     */
    #id;

    /**
     * @type {(function(Set<{
     *     x: number,
     *     y: number,
     *     height: number,
     *     width: number,
     *     sprite: Sprite
     * }>, number): any) | undefined} called on each update cycle, with the current tick.
     * @private
     */
    #onUpdate;

    /**
     * @returns {number} a usable sprite ID.
     * @private
     */
    static #spriteId() {
        return Sprite.#idCounter++;
    }

    /**
     * @returns {Object<number, Sprite>} the sprites map.
     */
    static get sprites() {
        return Sprite.#sprites;
    }

    /**
     * @returns {boolean} true if the Game instance is showing hit-boxes.
     * @protected
     */
    static get showingHitBoxes() {
        return this.#showingHitBoxes;
    }

    /**
     * Note: DO NOT use outside Game class.
     *
     * @param value {boolean} true if showing, else false.
     */
    static set showingHitBoxes(value) {
        this.#showingHitBoxes = value;
    }

    /**
     * @param id {number} the ID of the sprite.
     * @returns {Sprite | undefined} the sprite associated with the ID if present.
     *          Otherwise, undefined.
     */
    static getSprite(id) {
        return Sprite.sprites[id];
    }

    /**
     * @param id {number} the ID of the sprite to be removed.
     * @returns {Sprite | undefined} the deleted sprite if present.
     *          Otherwise, undefined.
     */
    static removeSprite(id) {
        const res = Sprite.#sprites[id];

        // Delete the sprite
        delete Sprite.#sprites[id];

        return res;
    }

    /**
     * @param description {any} sprite geometric description.
     * @param sheets {string[]} list of sprite sheets.
     * @param coords {[number, number]} the coordinates of the sprite.
     * @param onUpdate {(function(Set<HitBox>, number): any)?} called on each update cycle,
     *                                                         given all hit-boxes and current tick.
     * @param brush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?} object brush properties.
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
        sheets,
        coords,
        onUpdate,
        brush,
        hitBoxBrush,
        relativePoint,
        ignorable,
        isStatic
    ) {
        this.#id = Sprite.#spriteId();
        this.#desc = description;
        this.#sheet = sheets;
        this.#coords = coords;
        this.#animations = {};
        this.#animationId = 0;
        this.#states = new Map();
        this.brush = brush;
        this.hitBoxBrush = hitBoxBrush;
        this.onUpdate = onUpdate;
        this.relativePoint = relativePoint;
        this.ignorable = ignorable ?? false;
        this.static = isStatic ?? false;

        // Store the sprite reference into the sprites map
        Sprite.sprites[this.id] = this;
    }

    /**
     * @returns {number|undefined} ID of the current animation to draw.
     */
    get currentAnimation() {
        return this.#currentAnimation;
    }

    /**
     * @returns {number} the sprite ID.
     */
    get id() {
        return this.#id;
    }

    /**
     * @returns {Object<any, any>} the states object.
     */
    get states() {
        return this.#states;
    }

    /**
     * @returns {RelativePoint} the relative point of the sprite.
     */
    get relativePoint() {
        return this.#relativePoint;
    }

    /**
     * @returns {number} the x-coordinate of the sprite.
     */
    get x() {
        return this.#coords[0];
    }

    /**
     * @returns {number} the y-coordinate of the sprite.
     */
    get y() {
        return this.#coords[1];
    }

    /**
     * @returns {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  } | undefined} object brush properties.
     */
    get brush() {
        return this.#brush;
    }

    /**
     * Default is ({
     *     fillColor: "#FF000044"
     * });
     *
     * @returns {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }} hit-box brush properties.
     */
    get hitBoxBrush() {
        return this.#hitBoxBrush ?? {
            fillColor: "#FF000044"
        };
    }

    /**
     * @returns {(function(Set<HitBox>, number): any)} the onUpdate function.
     */
    get onUpdate() {
        return this.#onUpdate ?? (() => undefined);
    }

    /**
     * A child class must implement it to provide type hints.
     *
     * @Abstract
     * @returns {any} the sprite description.
     */
    get desc() {
        return this.#desc;
    }

    /**
     * @returns {string[]} list of sprite sheets of the Sprite.
     */
    get sheets() {
        return this.#sheet;
    }

    /**
     * @Abstract
     * @returns {number} number representing the type of the sprite.
     */
    static get type() {}

    /**
     * @Abstract
     * @returns {number} number representing the type of the sprite.
     */
    get type() {}

    /**
     * @returns {boolean} true if the sprite does not update.
     */
    get static() {
        return this.#static;
    }

    /**
     * Override by child class to change to true.
     * Returns false be default.
     *
     * @returns {boolean} true if the sprite does not have collision.
     */
    get ignorable() {
        return this.#ignorable;
    }

    /**
     * @Note that if we have more attributes of this form, a flag system
     *       can be implemented.
     * Returns false by default.
     *
     * @returns {boolean} true if the sprite is text based.
     */
    get textual() {
        return false;
    }

    /**
     * used by textual shapes.
     *
     * @returns {TextMetrics}
     */
    get metrics() {
        return undefined;
    }

    /**
     * Used by textual shapes.
     *
     * @returns {string} the text inside the Sprite.
     */
    get text() {}

    /**
     * @returns {Sprite} a clone of this sprite.
     * @Abstract
     */
    get clone() {}

    /**
     * @returns {number} a usable animation ID.
     * @private
     */
    get animationId() {
        return this.#animationId++;
    }

    /**
     * @param value {boolean} true indicates that the sprite does not update.
     */
    set static(value) {
        this.#static = value;
    }

    /**
     * @param value {number} new ID of the next animation to play.
     */
    set currentAnimation(value) {
        // Reset the current animation
        if (this.#currentAnimation !== undefined) {
            this.resetAnimation(this.#currentAnimation);
        }

        this.#currentAnimation = value;
    }

    /**
     * @param value {boolean} true indicates that the sprite does not collide.
     */
    set ignorable(value) {
        this.#ignorable = value;
    }

    /**
     * @param onUpdate {(function(Set<HitBox>, number): any)?} new onUpdate function.
     */
    set onUpdate(onUpdate) {
        this.#onUpdate = onUpdate;
    }

    /**
     * @param v {RelativePoint | undefined} new relative point of the Sprite.
     */
    set relativePoint(v) {
        this.#relativePoint = v ?? RelativePoint.TopLeft;
    }

    /**
     * New text metrics.
     * Used by textual shapes only.
     *
     * @param metrics {TextMetrics} new metrics.
     */
    set metrics(metrics) {}

    /**
     * @param brush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }} new object brush properties.
     */
    set brush(brush) {
        this.#brush = brush;
    }

    /**
     * @param brush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }} new hit-box brush properties.
     */
    set hitBoxBrush(brush) {
        this.#hitBoxBrush = brush;
    }

    /**
     * @param x {number} new x-coordinate of the sprite.
     */
    set x(x) {
        this.#coords[0] = x;
    }

    /**
     * @param y {number} new y-coordinate of the sprite.
     */
    set y(y) {
        this.#coords[1] = y;
    }

    /**
     * Stops the current dominant animation.
     */
    stopAnimation() {
        this.currentAnimation = undefined;
    }

    /**
     * @param src {string} path to the sound file to play.
     * @param reload {boolean} true to reload sound file.
     * @returns {HTMLAudioElement} Audio instance for use.
     */
    getSound(src, reload = false) {
        return Sound.load(src, reload);
    }

    /**
     * Plays the given audio properly.
     *
     * @param audio {HTMLAudioElement} to play.
     */
    playAudio(audio) {
        Sound.playAudio(audio);
    }

    /**
     * @param rects {{
     *   x: number,
     *   y: number,
     *   height: number,
     *   width: number,
     *   rotation?: number
     *  }[]} list of rectangles to convert to HitBox instances.
     */
    convertHitBoxes(rects) {
        return rects.map(r => new HitBox({
            topLeftCoords: [r.x, r.y],
            rotation: r.rotation,
            height: r.height,
            width: r.width
        }, this));
    }

    /**
     * The returned hit box is used in collision detection and quadtree.
     *
     * @Abstract
     * @returns {HitBox[]} a list of hit boxes that represent the hit-boxes of the sprite.
     */
    get hitBox() {}

    /**
     * Draws the sprite in the 2d context.
     *
     * @Abstract
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {}

    /**
     * Creates a sprite animation that can be used.
     *
     * @param sheetInd {number} index of the sprite sheet from the sheets list.
     * @param startX {number} x-coordinate of the top-left point of the starting rectangle.
     * @param startY {number} y-coordinate of the top-left point of the starting rectangle.
     * @param columns {number} maximum number of columns for the animation.
     * @param rows {number} maximum number of rows for the animation.
     * @param frameCnt {number} total number of frames in the animation.
     * @param singleWidth {number} width of a single frame (in pixels).
     * @param singleHeight {number} height of a single frame (in pixels).
     * @param cSpace {number} space between each column.
     * @param rSpace {number} space between each row.
     * @returns {number} the animation ID, used for moving it.
     */
    createAnimation(
        sheetInd,
        startX,
        startY,
        columns,
        rows,
        frameCnt,
        singleWidth,
        singleHeight,
        cSpace,
        rSpace
    ) {
        // Generate an animation ID
        const id = this.animationId;

        // Add the animation to the animations object
        this.#animations[id] = {
            sheetInd,
            startX,
            startY,
            columns,
            rows,
            frameCnt,
            singleWidth,
            singleHeight,
            cSpace,
            rSpace,
            currentRow: 0,
            currentCol: 0
        };

        // Reset the animation before returning for any recalibrations
        this.resetAnimation(id);

        return id;
    }

    /**
     * @param id {number} ID of the animation to remove.
     */
    removeAnimation(id) {
        if (id === this.currentAnimation) {
            this.currentAnimation = undefined;
        }

        delete this.#animations[id];
    }

    /**
     * Draws the current dominant animation.
     *
     * @param x {number} x-coordinate of the top-left corner of the destination.
     * @param y {number} y-coordinate of the top-left corner of the destination.
     * @param ctx {CanvasRenderingContext2D} 2d canvas element context.
     * @param scale {number?} scale of the final image.
     * @protected
     */
    drawCurrentAnimation(x, y, ctx, scale) {
        if (this.currentAnimation !== undefined) {
            this.drawAnimation(
                x,
                y,
                this.currentAnimation,
                ctx,
                undefined,
                undefined,
                undefined,
                scale
            );
        }
    }

    /**
     * Resets the animation to its original state.
     *
     * @param id {number} ID of the animation to reset.
     * @protected
     */
    resetAnimation(id) {
        // Reference to the animation
        const anim = this.#animations[id];

        anim.currentRow = anim.currentCol = 0;
    }

    /**
     * Must be used inside the update function.
     *
     * @param id {number} ID of the animation to move one frame.
     * @protected
     */
    moveAnimation(id) {
        const anim = this.#animations[id];

        // Increment the current column
        anim.currentCol++;

        // In case of overflow, jump to next row
        if (
            anim.currentCol >= anim.columns
            || anim.currentCol + anim.currentRow * anim.columns > anim.frameCnt
        ) {
            anim.currentCol = 0;
            anim.currentRow++;
        }

        // In case of overflow, reset the animation
        if (anim.currentRow >= anim.rows) {
            this.resetAnimation(id);
        }
    }

    /**
     * @param id {number} ID of the animation.
     * @returns {{currentCol: number, columns: number, cSpace: number, currentRow: number, startY: number, rSpace: number, startX: number, rows: number, singleWidth: number, singleHeight: number, sheetInd: number, frameCnt: number}} copy of the animation object.
     * @protected
     */
    getAnimation(id) {
       return {
           ...this.#animations[id]
       } ;
    }

    /**
     * Must be used inside the draw function & must be used manually only with non-dominant animations.
     *
     * @param x {number} x-coordinate of the top-left corner of the destination.
     * @param y {number} y-coordinate of the top-left corner of the destination.
     * @param id {number} ID of the animation to draw.
     * @param ctx {CanvasRenderingContext2D} 2d canvas element context.
     * @param forceLoad {boolean?} true to force load the file.
     * @param width {number?} width to map the image to.
     * @param height {number?} height to map the image to.
     * @param scale {number?} scale of the final image.
     * @protected
     */
    drawAnimation(
        x,
        y,
        id,
        ctx,
        forceLoad,
        width,
        height,
        scale
    ) {
        const anim = this.#animations[id];

        if (scale === undefined) {
            scale = 1;
        }

        ctx.drawImage(
            SpriteSheet.load(this.sheets[anim.sheetInd], forceLoad, width, height),
            (anim.singleWidth + anim.cSpace) * anim.currentCol + anim.startX,
            (anim.singleHeight + anim.rSpace) * anim.currentRow + anim.startY,
            anim.singleWidth,
            anim.singleHeight,
            x,
            y,
            scale * anim.singleWidth,
            scale * anim.singleHeight,
        );
    }
}
