'use strict';

import {Sprite, Timeout, Void, SpriteSheet} from "../BaseSprites";
import Sound from "./Sound.js";


/**
 * @class Game
 *
 * Class encapsulating the Odyssey game engine.
 */
export default class Game {
    /**
     * @type {number} ID counter for the event handlers.
     * @protected
     */
    #handlerId;

    /**
     * @type {CanvasRenderingContext2D} 2d canvas element context.
     * @protected
     */
    #context;

    /**
     * @type {Set<Sprite>} set of sprite objects.
     * @protected
     */
    #sprites;

    /**
     * We start facing issues after 2^53 - 1 (Number.MAX_SAFE_INTEGER),
     * so no worries about overflow or loss of precision.
     *
     * @type {number} the current game tick.
     * @protected
     */
    #tick;

    /**
     * @type {Set<Sprite>} set of Sprites removed from the Game.
     * @protected
     */
    #removedSprites;

    /**
     * @type {Object<string, {
     *     handlers: Object<number, {func: function(Event), noPause: boolean}>,
     *     listening: boolean,
     * }>} maps events to a list of event handlers.
     * @protected
     */
    #events;

    /**
     * @type {boolean} true if the game is running.
     * @protected
     */
    #isRunning;

    /**
     * @type {boolean} true if the game shows the object hit-boxes.
     * @protected
     */
    #showHitBoxes;

    /**
     * @type {DOMHighResTimeStamp} records the latest tick timestamp.
     * @protected
     */
    #latestRenderTime;

    /**
     * @type {DOMHighResTimeStamp} records the first tick timestamp.
     * @protected
     */
    #initRenderTime;

    /**
     * @type {{
     *     borderWidth?: number,
     *     borderColor?: string,
     *     fillColor?: string,
     *     font?: string
     * } | unescape} controls the style of the quadrants on draw.
     * @protected
     */
    #quadrantBrush;

    /**
     * @type {Sprite} followed sprite.
     * @protected
     */
    #followed;

    /**
     * Object containing game settings.
     *
     * @type {Map<any, any>}
     * @private
     */
    #settings;

    /**
     * The perceived map dimensions by the player, not the actual.
     * Where (x, y) are the perceived coordinates of the center,
     * and (width, height) are the perceived dimensions.
     *
     * @type {{
     *     x: number,
     *     y: number,
     *     width: number,
     *     height: number,
     * }}
     * @private
     */
    #perceivedDimensions;

    /**
     * Logical width of the game
     *
     * @type {number}
     * @private
     */
    #width;

    /**
     * Logical height of the game
     *
     * @type {number}
     * @private
     */
    #height;

    /**
     * State map for the game.
     *
     * @type {Map<any, any>}
     * @private
     */
    #state;

    /**
     * @type {function(number)} called before ticking the objects,
     *                          given current tick.
     *                          Called even if the game is paused.
     * @protected
     */
    #preTick;

    /**
     * @type {function(number)} called after ticking, given new tick.
     *
     * @protected
     */
    #postTick;

    /**
     * @returns {boolean} true if assets are loading.
     */
    static get loading() {
        return Sound.loading !== 0 && SpriteSheet.loading !== 0;
    }

    /**
     * @returns {number} the browser window height.
     */
    static get windowHeight() {
        return window.innerHeight;
    }

    /**
     * @returns {number} the browser window width.
     */
    static get windowWidth() {
        return window.innerWidth;
    }

    /**
     * Sets the margin and padding to zero of all the given class elements.
     *
     * @param name {string} class name to zero its elements.
     * @protected
     */
    static zeroMarginPaddings(name) {
        // Set margin and padding of the element to zero
        for (const element of document.querySelectorAll(name)) {
            element.style.padding = element.style.margin = '0';
            element.style.verticalAlign = 'middle';
            element.style.overflowY = element.style.overflowX = 'hidden';
        }
    }

    /**
     * Removes all the margins and padding for the necessary elements.
     * @protected
     */
    static zeroMarginElements() {
        // Iterate over the vital classes
        for (const element of ["body", "canvas"]) {
            Game.zeroMarginPaddings(element);
        }
    }

    /**
     * @param canvas {HTMLCanvasElement} canvas to resize to fullscreen.
     */
    static resizeCanvas(canvas) {
        // Set the width and height of the canvas.
        canvas.width = Game.windowWidth;
        canvas.height = Game.windowHeight;

        // This allows us to upscale images without them being blurry
        canvas.getContext('2d').imageSmoothingEnabled = false;
    }

    /**
     * @param canvasId {string} HTML5 ID of the canvas element.
     * @param width {number?} width of the game map.
     * @param height {number?} height of the game map.
     * @param showHitBoxes {boolean?} true to show sprite hit-boxes.
     * @param quadrantBrush {{
     *     borderWidth?: number,
     *     borderColor?: string,
     *     borderColor?: string,
     *     fillColor?: string,
     *     font?: string
     * }?} controls the style of the quadrants.
     * @param preTick {function(number)?} called before ticking the objects,
     *        given current tick. Called even if the game is paused.
     * @param postTick {function(number)?} called after ticking, given new tick.
     */
    constructor(
        canvasId,
        width,
        height,
        showHitBoxes,
        quadrantBrush,
        preTick,
        postTick
    ) {
        // Get the canvas HTML5 element from the document
        const canvas = document.getElementById(canvasId);

        // Check if the canvas element exists
        if (!canvas) {
            throw new Error("CANVAS DOES NOT EXIST");
        }

        // Assign pre-tick and post-tick
        this.preTick = preTick;
        this.postTick = postTick;

        // Resize the canvas to fill the screen
        Game.resizeCanvas(canvas);

        // Remove margins and padding
        Game.zeroMarginElements();

        // 2d context for the main canvas element
        this.#context = canvas.getContext("2d");

        // Initialize the data fields
        this.clear();

        // Logical width and height of the map
        this.resize(width ?? 0, height ?? 0);

        this.addEventListener('resize', () => {
            Game.resizeCanvas(this.canvas);
            this.clearScreen();
        }, true);

        // Hit-boxes value
        this.showHitBoxes = showHitBoxes;

        // Set quadrant brush
        this.quadrantBrush = quadrantBrush;

        // Start the game
        this.#start();
    }

    /**
     * @returns {Map<any, any>} the settings of the game.
     */
    get settings() {
        return this.#settings;
    }

    /**
     * @returns {{x: number, y: number, width: number, height: number}} the perceived dimensions.
     */
    get perceivedDimensions() {
        return this.#perceivedDimensions;
    }

    /**
     * @returns {number} the x-coordinate of the camera.
     */
    get cameraX() {
        if (this.followed) {
            return Math.max(
                this.followed.x - this.halfWindowWidth,
                this.perceivedDimensions.x
            );
        }

        return 0;
    }

    /**
     * @returns {number} the right line of camera.
     */
    get cameraRX() {
        return Math.min(
            this.cameraX + this.windowWidth,
            this.perceivedDimensions.width + this.perceivedDimensions.x
        );
    }

    /**
     * @returns {number} the bottom line of camera.
     */
    get cameraBY() {
        return Math.min(
            this.cameraY + this.windowHeight,
            this.perceivedDimensions.height + this.perceivedDimensions.y
        );
    }

    /**
     * @returns {number} the y-coordinate of the camera.
     */
    get cameraY() {
        if (this.followed) {
            return Math.max(
                this.followed.y - this.halfWindowHeight,
                this.perceivedDimensions.y
            );
        }

        return 0;
    }

    /**
     * @returns {number} the browser window height.
     */
    get windowHeight() {
        return Game.windowHeight;
    }

    /**
     * @returns {number} the browser window width.
     */
    get windowWidth() {
        return Game.windowWidth;
    }

    /**
     * @returns {number} half the browser window height.
     */
    get halfWindowHeight() {
        return Math.floor(this.windowHeight / 2);
    }

    /**
     * @returns {number} half the browser window width.
     */
    get halfWindowWidth() {
        return Math.floor(this.windowWidth / 2);
    }

    /**
     * @returns {boolean} true if the hit-boxes are shown.
     */
    get showHitBoxes() {
        return this.#showHitBoxes;
    }

    /**
     * @returns {Set<Sprite>} set of all sprites in the game.
     */
    get sprites() {
        return this.#sprites;
    }

    /**
     * @returns {Sprite} the followed sprite.
     */
    get followed() {
        return this.#followed;
    }

    /**
     * @returns {number} the logical width of the canvas.
     */
    get width() {
        return this.#width;
    }

    /**
     * @returns {number} half the logical width of the canvas.
     */
    get halfWidth() {
        return Math.floor(this.width / 2);
    }

    /**
     * @returns {number} the logical height of the canvas.
     */
    get height() {
        return this.#height;
    }

    /**
     * @returns {number} half the logical height of the canvas.
     */
    get halfHeight() {
        return Math.floor(this.height / 2);
    }

    /**
     * @returns {CanvasRenderingContext2D} canvas context.
     */
    get context() {
        return this.#context;
    }

    /**
     * @returns {HTMLCanvasElement} canvas element.
     */
    get canvas() {
        return this.context.canvas;
    }

    /**
     * @returns {number} the current game tick.
     */
    get currentTick() {
        return this.#tick;
    }

    /**
     * @returns {string} the background color of the canvas, but not in Hex format.
     */
    get backgroundColor() {
        return window
            .getComputedStyle(this.canvas)
            .getPropertyValue('background-color');
    }

    /**
     * @return {boolean} true if the game is running.
     */
    get isRunning() {
        return this.#isRunning;
    }

    /**
     * @returns {Map<*, *>} game state.
     */
    get state() {
        return this.#state;
    }

    /**
     * @returns {number} a usable handler ID.
     * @protected
     */
    get handlerId() {
        return this.#handlerId++;
    }

    /**
     * @returns {(function(number))|(function())|*} function called right before ticking.
     */
    get preTick() {
        return this.#preTick ?? (() => {});
    }

    /**
     * @returns {(function(number))|(function())|*} function called after ticking.
     */
    get postTick() {
        return this.#postTick ?? (() => {});
    }

    /**
     * @param value {(function(number))} new pre-tick function.
     */
    set preTick(value) {
        this.#preTick = value;
    }

    /**
     * @param value {{
     *     x?: number,
     *     y?: number,
     *     width?: number,
     *     height?: number,
     * }} new perceived dimensions
     */
    set perceivedDimensions(value) {
        this.#perceivedDimensions = {
            ...this.#perceivedDimensions,
            ...value
        }
    }

    /**
     * @param brush {{
     *     borderWidth?: number,
     *     borderColor?: string,
     *     fillColor?: string,
     *     font?: string
     * }?} new brush style of the quadrants.
     */
    set quadrantBrush(brush) {
        this.#quadrantBrush = brush;
    }

    /**
     * @param value {boolean} true to show the object hit-boxes.
     */
    set showHitBoxes(value) {
        this.#showHitBoxes = value;
        Sprite.showingHitBoxes = value;
    }

    /**
     * @param value {(function(number))} new post-tick function.
     */
    set postTick(value) {
        this.#postTick = value;
    }

    /**
     * Changes the perceived dimensions to the given ones.
     *
     * @param width {number} new logical width of the game.
     * @param height {number} new logical height of the game.
     */
    resize(width, height) {
        this.#width = width;
        this.#height = height;

        this.perceivedDimensions = {
            width,
            height
        };
    }

    /**
     * @param origin {[number, number]} coordinates of the point of reference.
     * @param coords {[number, number]} coordinates to map to the relative to the origin.
     * @returns {[number, number]} the mapped coordinates relative to the origin.
     */
    mapRelative(origin, coords) {
        return [origin[0] + coords[0], origin[1] + coords[1]];
    }

    /**
     * @param s0 {Sprite} first sprite.
     * @param s1 {Sprite} second sprite.
     * @returns {CollisionDirection | null} if the hit-boxes of both sprites are overlapping, else null.
     */
    areColliding(s0, s1) {
        for (const h0 of s0.hitBox) {
            for (const h1 of s1.hitBox) {
                const res = this.areCollidingHitBoxes(h0, h1);

                if (res) {
                    return res;
                }
            }
        }

        return null;
    }

    /**
     * @param s0 {Sprite} first sprite.
     * @param hitBoxes {HitBox[]} list of hit boxes.
     * @returns {CollisionDirection | null} if the hit-boxes of both sprites are overlapping, else null.
     */
    isColliding(s0, hitBoxes) {
        for (const h0 of s0.hitBox) {
            for (const h1 of hitBoxes) {
                const res = this.areCollidingHitBoxes(h0, h1);

                if (res) {
                    return res;
                }
            }
        }

        return null;
    }

    /**
     * Waits for the game to finish loading the assets.
     */
    waitForLoading() {
        while (Game.loading) {
            // Wait for the game to finish loading
        }
    }

    /**
     * {@link DLine} links the Line class.
     * @param r0 {HitBox} first hit box.
     * @param r1 {HitBox} second hit box.
     * @returns {CollisionDirection | null} direction of the collision if present, else null.
     */
    areCollidingHitBoxes(r0, r1) {
        if (this.areCollidingProjections(r0, r1) && this.areCollidingProjections(r1, r0)) {
            return r0.sprite.movementDirection;
        }

        return null;
    }

    /**
     * @param coords {[number, number]} coordinates to map relative to the
     *                                  top right corner.
     * @returns {[number, number]} the mapped coordinates relative to the top right corner
     *                             of the canvas.
     */
    mapTopRight(coords) {
        return this.mapRelative([this.width, 0], coords);
    }

    /**
     * @param coords {[number, number]} coordinates to map relative to the
     *                                  bottom right corner.
     * @returns {[number, number]} the mapped coordinates relative to the bottom right corner
     *                             of the canvas.
     */
    mapBottomRight(coords) {
        return this.mapRelative([this.width, this.height], coords);
    }

    /**
     * @param coords {[number, number]} coordinates to map relative to the
     *                                  center.
     * @returns {[number, number]} the mapped coordinates relative to the center
     *                             of the canvas.
     */
    mapCenter(coords) {
        return this.mapRelative([this.halfWidth, this.halfHeight], coords);
    }

    /**
     * @param coords {[number, number]} coordinates to map relative to the
     *                                  bottom left corner.
     * @returns {[number, number]} the mapped coordinates relative to the bottom left corner
     *                             of the canvas.
     */
    mapBottomLeft(coords) {
        return this.mapRelative([0, this.height], coords);
    }

    /**
     * Attaches the given event listener.
     * The sprite and game objects must be in the caller's scope.
     *
     * @param event {string} the event to listen for.
     * @param handler {function(Event)} event handler.
     * @param noPause {boolean?} true if the event is not affected by pausing.
     * @returns the ID of the handler (used to remove it or update it).
     */
    addEventListener(event, handler, noPause) {
        // Check if the event does not exist
        if (!(event in this.#events)) {
            this.#events[event] = {
                handlers: {},
                listening: false
            };

            // Start the event handler
            this.startEventListener(event);
        }

        // Generate a handler ID
        const id = this.handlerId;

        // Add to list of event handlers
        this.#events[event].handlers[id] = {
            func: handler,
            noPause: noPause
        };

        return id;
    }

    /**
     * Updates the given handler function.
     * If the event or the ID are non-present, nothing happens.
     *
     * @param event {string} the event to listen for.
     * @param id {number} ID of the handler.
     * @param handler {{
     *     func?: function(Event),
     *     noPause?: boolean
     * }} new event handler.
     */
    updateEventListener(event, id, handler) {
        // Check if there is an event
        if (event in this.#events
            && id in this.#events[event].handlers) {
            this.#events[event].handlers[id] = {
                ...this.#events[event].handlers[id],
                ...handler
            };
        }
    }

    /**
     * Removes the given handler function.
     *
     * @param event {string} the event to listen for.
     * @param id {number} ID of the handler to remove.
     */
    removeEventListener(event, id) {
        // Check if there is an event
        if (event in this.#events
            && id in this.#events[event].handlers) {
            delete this.#events[event].handlers[id];
        }
    }

    /**
     * Clears the canvas.
     * Resets all the variables.
     */
    clear() {
        // Reset the brush
        this.setBrush(undefined);

        // Set the perceived dimensions
        this.perceivedDimensions = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
        };

        // Reset the canvas and its data fields
        this.clearScreen();

        // Clear the sounds and sprite sheets cache
        Sound.clear();
        SpriteSheet.clear();

        // Remove all sprites from the Sprite class
        if (this.#sprites) {
            for (const sprite of this.#sprites) {
                Sprite.removeSprite(sprite.id);
            }
        }

        // Initialize these basic fields
        this.#sprites = new Set();
        this.#events = {};

        // Check if there is a removed sprite set
        if (!this.#removedSprites) {
            this.#removedSprites = new Set();
        }

        this.#removedSprites.clear();

        // Initialize the rest of the fields
        this.#tick = 0;
        this.#handlerId = 0;
        this.#latestRenderTime = 0;
        this.#isRunning = false;
        this.#followed = null;
        this.#state = new Map();

        // Assigns the initial timestamp
        this.#initRenderTime = performance.now();
    }

    /**
     * @param sprite {Sprite} to be inserted into the canvas.
     */
    insertSprite(sprite) {
        sprite.game = this;

        // Adjust the coordinates of the sprite on insertion
        this.adjustRelativity(sprite, this.width, this.height);

        // Draw the sprite
        this.drawSprite(sprite);

        // Add the sprite to the sprites set
        this.#sprites.add(sprite);
    }

    /**
     * Inserts the given sprites in order into the engine.
     *
     * @param sprites {Sprite} iterable of sprites to insert.
     */
    insertSprites(...sprites) {
        sprites.forEach(s => this.insertSprite(s));
    }

    /**
     * Only one sprite can be followed at a time.
     *
     * @param sprite {Sprite} sprite to follow.
     */
    follow(sprite) {
        this.#followed = sprite;

        this.clearScreen();
    }

    /**
     * Unfollows the current followed sprite.
     */
    unfollow() {
        this.follow(null);
    }

    /**
     * @param sprite {Sprite} to be removed.
     */
    removeSprite(sprite) {
        // Remove the sprite from the sprites set
        this.#sprites.delete(sprite);

        // Add to the removed set
        this.#removedSprites.add(sprite);

        sprite.game = undefined;
    }

    /**
     * @param event {MouseEvent} mouse event to be mapped into a 2d point (x, y).
     * @param handler {(args: {x: number, y: number, event: MouseEvent}) => any} callback function
     *        that takes the (x, y) coordinates of the mouse click location,
     *        relative to the canvas.
     */
    mapMouseEvent(event, handler) {
        // Calculate canvas offsets
        const cl = this.canvas.offsetLeft + this.canvas.clientLeft,
            ct = this.canvas.offsetTop + this.canvas.clientTop;

        // Calculate (x, y)
        const x = event.pageX - cl,
            y = event.pageY - ct;

        // Process the click
        handler({x, y, event});
    }

    /**
     * @param handler {function()} called after the given ticks pass.
     * @param ticks {number} number of ticks to wait.
     * @returns {Timeout} a Timeout instance to control the event.
     */
    setTimeout(handler, ticks) {
        // Create the void sprite
        const v = new Void(
            ticks,
            this.currentTick,
            handler
        );

        // Add to the sprites
        this.insertSprite(v);

        // Return the timeout instance
        return new Timeout(v);
    }

    /**
     * Resumes the game if paused.
     */
    resume() {
        this.#isRunning = true;
    }

    /**
     * Pauses the game.
     */
    pause() {
        this.#isRunning = false;
    }

    /**
     * @param sprite {Sprite} Sprite whose coordinates adjusted.
     * @param x {number} x-component of the adjustment.
     * @param y {number} y-component of the adjustment.
     * @protected
     */
    adjustRelativity(sprite, x, y) {
        const rp = sprite.relativePoint;
        sprite.x += rp.x * x;
        sprite.y += rp.y * y;
    }

    /**
     * Used to animate the game.
     *
     * @param ignore {DOMHighResTimeStamp} current animation timestamp.
     * @protected
     */
    loop(ignore) {
        // Calculate the time difference. Currently not used
        // const deltaTime = timestamp - this.#latestRenderTime;
        // this.#latestRenderTime = timestamp;

        // Update the game
        this.update();

        // Redraw the sprites
        this.draw();

        // Go to next tick
        this.#requestAnimationFrame();
    }

    /**
     * Updates all the game objects.
     * @protected
     */
    update() {
        // Clear the screen before ticking the game
        this.clearScreen();

        // Call the pre-tick
        this.preTick(this.currentTick);

        // Check if the game is running
        if (!this.#isRunning) {
            return;
        }

        // Current tick
        const curTick = this.#progressTick;

        // Must tick the followed sprite first
        if (this.followed) {
            this.updateSprite(this.followed, curTick);
        }

        // Trigger the onTick for all sprites
        for (const sprite of this.#sprites) {
            if (
                sprite !== this.followed
                && !(sprite.static || this.#removedSprites.has(sprite))
            ) {
                this.updateSprite(sprite, curTick);
            }
        }

        // Call the post-tick
        this.postTick(this.currentTick);

        // Clear the removed sprites
        this.#removedSprites.clear();
    }

    /**
     * Redraws all the sprites.
     * @protected
     */
    draw() {
        // Iterate over the Sprite objects in reverse and redraw
        for (const sprite of this.sprites) {
            // Do not update a removed sprite
            if (this.#removedSprites.has(sprite)) {
                continue;
            }

            // Process the Sprite update
            this.drawSprite(sprite);
        }
    }

    /**
     * Does the necessary translations for the camera.
     *
     * @param multiplier {number} multiplier for the translation distance.
     * @protected
     */
    translateCamera(multiplier) {
        if (this.followed) {
            const perceived = this.perceivedDimensions;

            let x = this.halfWindowWidth - this.followed.x,
                y = this.halfWindowHeight - this.followed.y;

            const width = perceived.width, height = perceived.height;

            if (this.cameraX === perceived.x || width < this.windowWidth) {
                // Check if the camera reached the left bound
                x = -perceived.x;
            } else if (this.cameraRX === width + perceived.x) {
                // Check if the camera reached the right bound

                // Flip the sign
                x = this.windowWidth - width - perceived.x;
            }

            if (this.cameraY === perceived.y || height < this.windowHeight) {
                // Check if the camera reached the top bound
                y = -perceived.y;
            } else if (this.cameraBY === height + perceived.y) {
                // Check if the camera reached the bottom bound

                // Flip the sign
                y = this.windowHeight - height - perceived.y;
            }

            // Apply the camera changes
            this.context.translate(
                multiplier * x,
                multiplier * y
            );
        }
    }

    /**
     * Adjusts the camera according to the followed sprite.
     * @protected
     */
    adjustCamera() {
        this.translateCamera(1);
    }

    /**
     * Resets the camera according to the followed sprite.
     * @protected
     */
    revertCamera() {
        this.translateCamera(-1);
    }

    /**
     * @param rect {{
     *     x: number,
     *     y: number,
     *     height: number,
     *     width: number,
     *     rotation?: number
     * } | HitBox} rectangle to clear.
     * @protected
     */
    clearRect(rect) {
        this.adjustCamera();

        // Begin a new path
        this.context.beginPath();

        const rotation = rect.rotation ?? 0;

        // Translate to the top-left point
        this.context.translate(rect.x, rect.y);

        // Rotate the context
        this.context.rotate(rotation);

        this.context.clearRect(
            0,
            0,
            rect.width,
            rect.height
        );

        // Rotate back to original rotation
        this.context.rotate(-rotation);

        // Translate back to origin
        this.context.translate(-rect.x, -rect.y);

        // Close the path
        this.context.closePath();
        this.revertCamera();
    }

    /**
     * Clears all the screen.
     * @protected
     */
    clearScreen() {
        this.clearRect({
            x: this.cameraX,
            y: this.cameraY,
            width: this.windowWidth,
            height: this.windowHeight
        });
    }

    /**
     * @param rect {{
     *     x: number,
     *     y: number,
     *     height: number,
     *     width: number,
     *     rotation?: number
     * } | HitBox} rectangle to draw.
     * @param brush {{
     *     borderWidth?: number,
     *     borderColor?: string,
     *     fillColor?: string,
     *     font?: string
     * }?} style brush.
     * @protected
     */
    markedRect(rect, brush) {
        this.adjustCamera();

        // Begin the path
        this.context.beginPath();

        const rotation = rect.rotation ?? 0;

        // Translate to the top-left point
        this.context.translate(rect.x, rect.y);

        // Rotate the context
        this.context.rotate(rotation);

        const oldBrush = this.setBrush(brush);

        // Draw the border
        this.context.rect(
            0,
            0,
            rect.width,
            rect.height
        );

        // Fill the rectangle
        this.context.fillRect(
            0,
            0,
            rect.width,
            rect.height
        );

        // Process the rects
        this.process();

        // Rotate back to original rotation
        this.context.rotate(-rotation);

        // Translate back to origin
        this.context.translate(-rect.x, -rect.y);

        // Close the path
        this.context.closePath();
        this.revertCamera();

        // Reset the brush
        this.setBrush(oldBrush);
    }

    /**
     * Initiates a listener to the given eventType.
     *
     * @param eventType {string} event type to initialize listener for.
     * @protected
     */
    startEventListener(eventType) {
        // Check if the eventType is not listening and add a listener
        if (!this.#events[eventType].listening) {
            window.addEventListener(eventType,
                (event) => {
                    // Iterate over the current list of events
                    for (const handler
                        of Object.values(this.#events[eventType].handlers)) {
                        // Check if the game is running or the event cannot be paused
                        if (this.#isRunning || handler.noPause) {
                            handler.func(event);
                        }
                    }
                }
            );

            // Set as listening
            this.#events[eventType].listening = true;
        }
    }

    /**
     * @param text {string} to be measured.
     * @returns {TextMetrics} of the string after measuring.
     */
    measureText(text) {
        return this.context.measureText(text);
    }

    /**
     * Applies the given brush to the context.
     * Missing properties will be replaced by the respective default.
     *
     * @param [brush={
     *  borderWidth: 0,
     *  borderColor: 'transparent',
     *  fillColor: 'transparent',
     *  font: undefined
     * }]
     * {
     *  {
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?
     * } properties of the brush that draws the sprite.
     * @returns {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }} old brush.
     * @protected
     */
    setBrush(brush) {
        // Old brush
        const rs = {
            borderWidth: this.context.lineWidth,
            borderColor: this.context.strokeStyle,
            fillColor: this.context.fillStyle,
            font: this.context.font
        };

        // Apply brush styles
        this.context.lineWidth = brush?.borderWidth ?? 0;
        this.context.strokeStyle = brush?.borderColor ?? "transparent";
        this.context.fillStyle = brush?.fillColor ?? "transparent";
        this.context.font = brush?.font;

        return rs;
    }

    /**
     * Processes the draw and fill actions given previously.
     * @protected
     */
    process() {
        // Process the fill actions
        this.context.fill();

        // Process the draw actions
        this.context.stroke();
    }

    /**
     * {@link Sprite} links the Sprite class.
     * @param sprite {Sprite} sprite to be drawn.
     * @param brush {{
     *     borderWidth?: number,
     *     borderColor?: string,
     *     fillColor?: string,
     *     font?: string
     * }?} overrides the sprite brush.
     * @protected
     */
    drawSprite(sprite, brush) {
        // Save the context
        this.context.save();

        // Apply brush styles, store old context style parameters
        const oldBrush = this.setBrush(brush ?? sprite.brush);

        // Check if the sprite is textual and set its metrics
        if (sprite.textual) {
            sprite.metrics = this.measureText(sprite.text);
        }

        // Adjust camera
        this.adjustCamera();

        // Begin new path
        this.context.beginPath();

        // Draw the sprite
        sprite.draw(this.context);

        // Process the drawing action
        this.process();

        // Apply old brush styles
        this.setBrush(oldBrush);

        // End path
        this.context.closePath();

        // Adjust camera
        this.revertCamera();

        // Restore the old context
        this.context.restore();

        // Draw the hit-box if needed
        if (this.showHitBoxes) {
            // Hit-box brush
            const brush = sprite.hitBoxBrush;

            for (const hitBox of sprite.hitBox) {
                this.markedRect(hitBox, brush);
            }
        }
    }

    /**
     * Does not redraw the updated sprite, only erases it.
     *
     * {@link Sprite} links the Sprite class.
     * @param sprite {Sprite} sprite to be updated.
     * @param curTick {number} the current game tick.
     * @protected
     */
    updateSprite(sprite, curTick) {
        sprite.onUpdate(curTick);
    }

    /**
     * @param hitBox {HitBox}
     * @param line {DLine}
     * @param corner {Vector}
     * @returns {number} the signed distance
     * @protected
     */
    getSignedDistance(hitBox, line, corner) {
        const projected = corner.project(line);
        const CP = projected.add(hitBox.center.multiply(-1));

        // Sign: Same direction of axis: true.
        const sign = CP.x * line.direction.x + CP.y * line.direction.y > 0;
        return CP.magnitude * (sign ? 1 : -1);
    }

    /**
     * {@link DLine} links the Line class.
     * @param r0 {HitBox} first hit box.
     * @param r1 {HitBox} second hit box.
     * @returns {boolean} true if the hit boxes are colliding.
     * @protected
     */
    areCollidingProjections(r0, r1) {
        const lines = r1.axis;
        const corners = r0.vectorCorners;

        for (let dimension = 0; dimension < lines.length; dimension++) {
            const line = lines[dimension];

            /**
             * @type {{
             *     signedDistance: number,
             *     corner: Vector,
             * }[]}
             */
            let minMax = [null, null];

            // Size of r1 half the size on the line direction
            const rectHalfSize = (dimension === 0 ? r1.width : r1.height) / 2;

            corners.forEach(corner => {
                const signedDistance = this.getSignedDistance(r1, line, corner);

                if (!minMax[0] || minMax[0].signedDistance > signedDistance) {
                    minMax[0] = {signedDistance, corner};
                }
                if (!minMax[1] || minMax[1].signedDistance < signedDistance) {
                    minMax[1] = {signedDistance, corner};
                }
            });

            if (
                !(minMax[0].signedDistance < 0 && minMax[1].signedDistance > 0
                    || Math.abs(minMax[0].signedDistance) < rectHalfSize
                    || Math.abs(minMax[1].signedDistance) < rectHalfSize)
            ) {
                return false
            }
        }

        return true;
    }

    /**
     * @returns {number} the current game tick.
     *          Increments the #tick field.
     * @protected
     */
    get #progressTick() {
        return this.#tick++;
    }

    /**
     * Requests an animation frame for the game.
     * @private
     */
    #requestAnimationFrame() {
        requestAnimationFrame((timestamp) => {
            this.loop(timestamp);
        });
    }

    /**
     * Starts the game for the first time.
     * @private
     */
    #start() {
        // Initialize the game loop
        this.#requestAnimationFrame();
    }
}
