'use strict';

import {HitBox} from "../Tree";
import {RelativePoint, Sound} from "../Engine";
import SpriteSheet from "./SpriteSheet.js";


/**
 * @Abstract
 * @class Sprite
 *
 * Should be as an abstract class.
 */
export default class Sprite {
    /**
     * @type {number} ID counter for the sprites.
     * @private
     */
    static #idCounter = 0;

    /**
     * @type {number} the tick used to indicate dead ticks.
     * @private
     */
    static #deadTick = -1;

    /**
     * @type {Object<number, Sprite>} maps sprite IDs to Sprite objects.
     * @private
     */
    static #sprites = {};

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
     * True indicates that the sprite does not tick.
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
     *     nonLinked: boolean,
     *     currentRow: number,
     *     currentCol: number
     *  }>
     * }
     * @private
     */
    #animations;

    /**
     * Set of non-linked animation IDs.
     *
     * @type {Set<number>}
     * @private
     */
    #nonLinkedAnimations;

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
     * }>): any) | undefined} called on each update cycle.
     * @private
     */
    #onUpdate;

    /**
     * The function returns the tick on which to trigger the update.
     * Use dead tick to not trigger an update.
     * Insert after inserts the Sprite after the given sprite ID,
     * was inserted into the queue at any tick (except dead tick).
     * This has the effect of inserting the object tick-ticks after the insertAfter
     * is performed.
     *
     * @type {(function(number): {
     *     tick: number,
     *     insertAfter?: number
     * }) | undefined} called on each tick.
     * @private
     */
    #onTick;

    /**
     * @returns {number} a usable sprite ID.
     * @private
     */
    static #spriteId() {
        return Sprite.#idCounter++;
    }

    /**
     * @returns {number} the dead tick value.
     */
    static get deadTick() {
        return Sprite.#deadTick;
    }

    /**
     * @returns {Object<number, Sprite>} the sprites map.
     */
    static get sprites() {
        return Sprite.#sprites;
    }

    /**
     * @returns {{tick: number}} used whenever no ticking is required.
     */
    static get noTick() {
        return {
            tick: Sprite.deadTick
        };
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
     * @param onTick {(function(number): {
     *     tick: number,
     *     insertAfter?: number
     * })?} called on each tick.
     * @param onUpdate {(function(Set<HitBox>): any)?} called on each update cycle.
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
     *  @param ignorable {boolean} true if the instance does not have collisions.
     *  @param isStatic {boolean} true indicates that the sprite does not tick.
     */
    constructor(
        description,
        sheets,
        coords,
        onTick,
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
        this.#nonLinkedAnimations = new Set();
        this.#animationId = 0;
        this.#states = new Map();
        this.brush = brush;
        this.hitBoxBrush = hitBoxBrush;
        this.onUpdate = onUpdate;
        this.onTick = onTick;
        this.relativePoint = relativePoint;
        this.ignorable = ignorable;
        this.static = isStatic;

        // Store the sprite reference into the sprites map
        Sprite.sprites[this.id] = this;
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
     * @returns {(function(Set<HitBox>): any)} the onUpdate function.
     */
    get onUpdate() {
        return this.#onUpdate ?? (() => undefined);
    }

    /**
     * @returns {(function(number): {
     *     tick: number,
     *     insertAfter?: number
     * })} the onTick function.
     */
    get onTick() {
        return this.#onTick ?? ((tick) => ({tick}));
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
     * @returns {boolean} true if the sprite does not tick.
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
     * @param value {boolean} true indicates that the sprite does not tick.
     */
    set static(value) {
        this.#static = value;
    }

    /**
     * @param value {boolean} true indicates that the sprite does not collide.
     */
    set ignorable(value) {
        this.#ignorable = value;
    }

    /**
     * @param onUpdate {(function(Set<HitBox>): any)?} new onUpdate function.
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
     * @param onTick {(function(number): {
     *     tick: number,
     *     insertAfter?: number
     * })?} new onTick function.
     * The function returns the tick on which to trigger the update.
     * Use dead tick to not trigger an update.
     * Insert after inserts the Sprite after the given sprite ID,
     * was inserted into the queue at any tick (except dead tick).
     * This has the effect of inserting the object tick-ticks after the insertAfter
     * is performed.
     */
    set onTick(onTick) {
        this.#onTick = onTick;
    }

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
     * @Abstract
     * @param x {number} x-coordinate of a point.
     * @param y {number} y-coordinate of a point.
     * @returns {boolean} true if point (x, y) is in the sprite.
     */
    hasPoint(x, y) {}

    /**
     * @param src {string} path to the sound file to play.
     * @param reload {boolean} true to reload sound file.
     * @returns {HTMLAudioElement} Audio instance for use.
     */
    getSound(src, reload = false) {
        return Sound.load(src, reload);
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
     * @param nonLinked {boolean} true if the animation is played with a call to non-linked play.
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
        nonLinked
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
            nonLinked,
            currentRow: 0,
            currentCol: 0
        };

        if (nonLinked) {
            this.#nonLinkedAnimations.add(id);
        }

        return id;
    }

    /**
     * @param id {number} ID of the animation to remove.
     */
    removeAnimation(id) {
        if (this.#animations[id].nonLinked) {
            this.#nonLinkedAnimations.delete(id);
        }

        delete this.#animations[id];
    }

    /**
     * @param id {number} ID of the animation to move one frame.
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

        // In case of overflow, jump back to start
        if (anim.currentRow >= anim.rows) {
            anim.currentRow = 0;
        }
    }

    /**
     * Moves all the non-linked animation one frame.
     */
    moveNonLinkedAnimations() {
        this.#nonLinkedAnimations.forEach(id => {
            this.moveAnimation(id);
        });
    }

    /**
     * @param x {number} x-coordinate of the top-left corner of the destination.
     * @param y {number} y-coordinate of the top-left corner of the destination.
     * @param id {number} ID of the animation to draw.
     * @param ctx {CanvasRenderingContext2D} 2d canvas element context.
     */
    drawAnimation(x, y, id, ctx) {
        const anim = this.#animations[id];

        ctx.drawImage(
            SpriteSheet.load(this.sheets[anim.sheetInd]),
            anim.singleWidth * anim.currentCol + anim.startX,
            anim.singleHeight * anim.currentRow + anim.startY,
            anim.singleWidth,
            anim.singleHeight,
            x,
            y,
            anim.singleWidth,
            anim.singleHeight,
        );
    }
}
