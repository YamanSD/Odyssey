import {QuadTree} from "../Tree";
import {Sprite, Timeout, Void} from "../BaseSprites";


/**
 * @class Game
 *
 * Class encapsulating the Odyssey game engine.
 * // TODO implement sounds.
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
     * Stores the sprites.
     *
     * @type {QuadTree} partitions the grid into smaller quadrants.
     * @protected
     */
    #quadTree;

    /**
     * Stores the ticks that have Sprites to update.
     * Note that here the order of updates will be LIFO.
     * We can create a priority queue to handle this issue if we wish
     * for a specific order of updates for the sprites.
     *
     * @type {Object<number, Sprite[]>} maps tick value to sprite updates.
     * @protected
     */
    #updateQueue;

    /**
     * @type {Object<number, Object<number, number>>} maps the object ID into a
     * map (SpriteId: tick) of Sprites waiting for the sprite with the ID to be inserted, and
     * the ticks after insertAfter ticks to insert the object at.
     * @protected
     */
    #spriteWaitQueue;

    /**
     * @type {Set<number>} set of sprite IDs that have been inserted into the updateQueue.
     * @protected
     */
    #insertedSpriteSet;

    /**
     * @type {Set<number>} set of sprite IDs that have been erased from the canvas.
     * @protected
     */
    #erasedSpriteSet;

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
     */
    #quadrantBrush;

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
     * @param canvas {HTMLElement} to be resized to full screen.
     * @protected
     */
    static resizeCanvas(canvas) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
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
     * @param canvasId {string} HTML5 ID of the canvas element.
     * @param showHitBoxes {boolean?} true to show sprite hit-boxes.
     * @param quadrantBrush {{
     *     borderWidth?: number,
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

        // Adjust canvas size to cover the screen
        Game.resizeCanvas(canvas);

        // Remove margins and padding
        Game.zeroMarginElements();

        // 2d context for the main canvas element
        this.#context = canvas.getContext("2d");

        // Initialize the data fields
        this.clear();

        this.addEventListener('resize', () => {
            // Store old width and height
            const oldWidth = this.width, oldHeight = this.height;

            Game.resizeCanvas(canvas);

            // Redraw the sprites
            this.resetTree(oldWidth, oldHeight);
        }, true);

        // Hit-boxes value
        this.showHitBoxes = showHitBoxes;

        // Set quadrant brush
        this.quadrantBrush = quadrantBrush;

        // Start the game
        this.#start();
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
     * @returns {{borderWidth?: number, borderColor?: string, fillColor?: string, font?: string}|unescape}
     *          the quadrant brush.
     */
    get quadrantBrush() {
        return this.#quadrantBrush;
    }

    /**
     * @returns {number} width of the canvas.
     */
    get width() {
        return this.canvas.width;
    }

    /**
     * @returns {number} half the width of the canvas.
     */
    get halfWidth() {
        return this.width / 2;
    }

    /**
     * @returns {number} height of the canvas.
     */
    get height() {
        return this.canvas.height;
    }

    /**
     * @returns {number} half the height of the canvas.
     */
    get halfHeight() {
        return this.height / 2;
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
     * @param v {boolean} true to show the object hit-boxes.
     */
    set showHitBoxes(v) {
        this.#showHitBoxes = v;
    }

    /**
     * @param value {(function(number))} new post-tick function.
     */
    set postTick(value) {
        this.#postTick = value;
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
     * @returns {boolean} if the hit-boxes of both sprites are overlapping.
     */
    areColliding(s0, s1) {
        for (const h0 of s0.hitBox) {
            for (const h1 of s1.hitBox) {
                if (this.areCollidingHitBoxes(h0, h1)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * @param s0 {Sprite} first sprite.
     * @param hitBoxes {HitBox[]} list of hit boxes.
     * @returns {boolean} if the hit-boxes of both sprites are overlapping.
     */
    isColliding(s0, hitBoxes) {
        for (const h0 of s0.hitBox) {
            for (const h1 of hitBoxes) {
                if (this.areCollidingHitBoxes(h0, h1)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * {@link DLine} links the Line class.
     * @param r0 {HitBox} first hit box.
     * @param r1 {HitBox} second hit box.
     * @returns {boolean} true if the hit boxes are colliding.
     */
    areCollidingHitBoxes(r0, r1) {
        return this.areCollidingProjections(r0, r1) && this.areCollidingProjections(r1, r0);
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

        // Reset the canvas and its data fields
        this.clearScreen();

        // Create a new quadtree
        this.#quadTree = new QuadTree({
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        });

        // Remove all sprites from the Sprite class
        if (this.#sprites) {
            for (const sprite of this.#sprites) {
                Sprite.removeSprite(sprite.id);
            }
        }

        // Initialize these basic fields
        this.#sprites = new Set();
        this.#updateQueue = {};
        this.#events = {};

        // Check if there is an inserted sprite set
        if (!this.#insertedSpriteSet) {
            this.#insertedSpriteSet = new Set();
        }

        // Check if there is a removed sprite set
        if (!this.#removedSprites) {
            this.#removedSprites = new Set();
        }

        // Check if there is an erased sprite set
        if (!this.#erasedSpriteSet) {
            this.#erasedSpriteSet = new Set();
        }

        this.#removedSprites.clear();
        this.#insertedSpriteSet.clear();
        this.#erasedSpriteSet.clear();

        // Initialize the rest of the fields
        this.#spriteWaitQueue = {};
        this.#tick = 0;
        this.#handlerId = 0;
        this.#latestRenderTime = 0;
        this.#isRunning = false;

        // Assigns the initial timestamp
        this.#initRenderTime = performance.now();
    }

    /**
     * @param sprite {Sprite} to be inserted into the canvas.
     */
    insertSprite(sprite) {
        // Adjust the coordinates of the sprite on insertion
        this.adjustRelativity(sprite, this.width, this.height);

        // Draw the sprite
        this.render(sprite);

        // Insert the sprite to the quadtree
        this.insertToTree(sprite);

        // Add the sprite to the sprites set
        this.#sprites.add(sprite);
    }

    /**
     * @param sprite {Sprite} to be removed.
     */
    removeSprite(sprite) {
        // Erase the sprite and remove it from the Tree
        this.eraseSprite(sprite);

        // Remove the sprite from the sprites set
        this.#sprites.delete(sprite);

        // Add to the removed set
        this.#removedSprites.add(sprite);
    }

    /**
     * @param p0 {[number, number]} coordinates of first point.
     * @param p1 {[number, number]} coordinates of second point.
     * @returns {number} the Euclidean distance between p0 and p1.
     */
    euclideanDistance(p0, p1) {
        return Math.sqrt(
            (p0[0] - p1[0]) ** 2 + (p0[1] - p1[1]) ** 2
        );
    }

    /**
     * @param p0 {[number, number]} coordinates of first point.
     * @param p1 {[number, number]} coordinates of second point.
     * @returns {number} the Manhattan distance between p0 and p1.
     */
    manhattanDistance(p0, p1) {
        return Math.abs(p0[0] - p1[0]) + Math.abs(p0[1] - p1[1]);
    }

    /**
     * @param angle {number} angle in degrees.
     * @returns {number} the angle in radians.
     */
    degToRadians(angle) {
        return angle * Math.PI / 180;
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
     * @param handler {function()} called on every time the ticks pass.
     * @param ticks {number} number of ticks to wait each cycle.
     * @returns {Timeout} a Timeout instance to control the event.
     */
    setInterval(handler, ticks) {
        // Create the void sprite
        const v = new Void(
            ticks,
            this.currentTick,
            () => {
                handler();

                if (!v.canceled) {
                    // Reinsert the tick update
                    this.insertTick(
                        v,
                        this.currentTick + ticks,
                        undefined
                    );
                }
            }
        );

        // Add to the sprites
        this.insertSprite(v);

        // Return the timeout instance
        return new Timeout(v);
    }

    /**
     * @param handler {function()} called after the given ticks pass.
     * @param ticks {number} number of ticks to wait after the sprite is inserted.
     * @param sprite {Sprite} sprite to wait for.
     * @returns {Timeout} a Timeout instance to control the event.
     */
    setTimeoutAfter(handler, ticks, sprite) {
        // Create the void sprite
        const v = new Void(
            ticks,
            this.currentTick,
            handler,
            sprite.id
        );

        // Add to the sprites
        this.insertSprite(v);

        // Return the timeout instance
        return new Timeout(v);
    }

    /**
     * Attempts to free memory.
     */
    cleanUp() {
        this.#quadTree.cleanUp();
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
     * @param sprite {Sprite} to be inserted to the quadtree.
     * @protected
     */
    insertToTree(sprite) {
        for (const hitBox of sprite.hitBox) {
            this.#quadTree.insert(hitBox);
        }
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
     * Draws the quadrant outlines.
     * @protected
     */
    showQuadrants() {
        // Check if the game is running
        if (!this.#isRunning) {
            return;
        }

        const brush = this.quadrantBrush;

        // Set the new brush
        const oldBrush = this.setBrush(brush);

        // Display the quadrants
        for (const bound of this.#quadTree.displayBounds) {
            this.clearRect(bound);
            this.markedRect(bound, brush);
        }

        // Reset the old brush
        this.setBrush(oldBrush);
    }

    /**
     * Redraws all the sprites, without triggering their updates.
     * Resets the quad tree.
     *
     * @param oldWidth {number} old width of the canvas.
     * @param oldHeight {number} old height of the canvas.
     * @protected
     */
    resetTree(oldWidth, oldHeight) {
        // Clear the screen
        this.clearScreen();

        // Clear the tree
        this.#quadTree.clear();

        // Redraw and re-insert the sprites
        for (const sprite of this.#sprites) {
            this.adjustRelativity(
                sprite,
                this.width - oldWidth,
                this.height - oldHeight
            );

            this.insertToTree(sprite);
            this.render(sprite);
        }
    }

    /**
     * Used to animate the game.
     *
     * @param timestamp {DOMHighResTimeStamp} current animation timestamp.
     * @protected
     */
    loop(timestamp) {
        // Calculate the time difference. Currently not used
        // const deltaTime = timestamp - this.#latestRenderTime;
        // this.#latestRenderTime = timestamp;

        // Tick the game
        this.tick();

        // Go to next tick
        this.#requestAnimationFrame();
    }

    /**
     * Ticks all the game objects, and updates the ones that can
     * be updated.
     * @protected
     */
    tick() {
        // Show the quadrants
        if (this.showHitBoxes) {
            this.showQuadrants();
        }

        // Call the pre-tick
        this.preTick(this.currentTick);

        // Check if the game is running
        if (!this.#isRunning) {
            return;
        }

        // Current tick
        const curTick = this.#progressTick;

        // Trigger the onTick for all sprites
        for (const sprite of this.#sprites) {
            // Ignore the sprite
            if (sprite.ignorable || this.#removedSprites.has(sprite)) {
                continue;
            }

            // Get the sprite tick instructions
            const sti = sprite.onTick(curTick);

            // Insert the sprite tick
            this.insertTick(sprite, sti.tick, sti.insertAfter);
        }

        // Process the updates
        this.tickUpdate(curTick);

        // Call the post-tick
        this.postTick(this.currentTick);

        // Clear the removed sprites
        this.#removedSprites.clear();
    }

    /**
     * Erases the object, exposing any objects beneath it.
     *
     * @param sprite {Sprite} to be erased.
     * @returns {Set<HitBox>} the intersection rectangles.
     * @protected
     */
    eraseSprite(sprite) {
        const hitBoxes = sprite.hitBox;

        // Get the intersection rectangles
        const interRects = this.#quadTree.retrieve(
            hitBoxes
        );

        // Clear the hit-box rectangles
        for (let hitBox of hitBoxes) {
            let borderWidth = 0;

            // Erase the marked hit-box if needed
            if (this.showHitBoxes) {
                // Border width
                borderWidth = sprite.hitBoxBrush?.borderWidth ?? 1;
            } else {
                // Border width
                borderWidth = sprite.brush?.borderWidth ?? 1;
            }

            // Clear the sprite
            this.clearRect({
                x: hitBox.x - borderWidth + (this.showHitBoxes ? 1 : 0),
                y: hitBox.y - borderWidth,
                width: hitBox.width + 2 * borderWidth,
                height: hitBox.height + 2 * borderWidth,
                rotation: hitBox.rotation
            });
        }

        // Add to the erased sprite set
        this.#erasedSpriteSet.add(sprite.id);

        // Iterate over the sprites in the collision rectangles and redraw
        for (const interRect of interRects) {
            const rectSprite = interRect.sprite;

            // Redraw all the sprites except the ones erased
            if (!this.#erasedSpriteSet.has(rectSprite.id)) {
                this.render(rectSprite);
            } else if (rectSprite.id === sprite.id) {
                // Remove from QuadTree
                this.#quadTree.remove(interRect);
            }
        }

        return interRects;
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
    }

    /**
     * Clears all the screen.
     * @protected
     */
    clearScreen() {
        this.clearRect({
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
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
     * Does not insert dead ticks.
     *
     * @param sprite {Sprite} to be inserted into the given tick.
     * @param tick {number} the tick to insert at.
     * @param insertAfter {number | undefined} the ID of the Sprite to check if
     *        present before inserting. If not, this sprite is added to a queue waiting for
     *        a Sprite with the given ID to be inserted.
     * @protected
     */
    insertTick(sprite, tick, insertAfter) {
        // Check if the tick is dead
        if (tick !== Sprite.deadTick) {
            // Handle insertAfter
            if (
                insertAfter !== undefined
                && !this.#insertedSpriteSet.has(insertAfter)
            ) {
                // Check if there is not a wait queue
                if (!(insertAfter in this.#spriteWaitQueue)) {
                    // Create an empty array
                    this.#spriteWaitQueue[insertAfter] = {};
                }

                this.#spriteWaitQueue[insertAfter][sprite.id] = tick;
                return;
            }

            // Check if the there is not a queue for the tick
            if (!(tick in this.#updateQueue)) {
                // Create empty stack
                this.#updateQueue[tick] = [];
            }

            // Sprite ID
            const sid = sprite.id;

            // Push the sprite into the stack & inserted set
            this.#updateQueue[tick].push(sprite);
            this.#insertedSpriteSet.add(sid);

            // Check if the sprite has waiting sprites
            if (sid in this.#spriteWaitQueue) {
                for (const [waitingSpriteId, waitTicks]
                    of Object.entries(this.#spriteWaitQueue[sid])) {
                    // Insert the waiting sprite
                    this.insertTick(
                        Sprite.getSprite(Number(waitingSpriteId)),
                        tick + waitTicks,
                        undefined
                    );
                }

                // Delete the sprite wait queue
                delete this.#spriteWaitQueue[sid];
            }
        }
    }

    /**
     * @param tick {number} whose Sprites to be triggered.
     * @protected
     */
    tickUpdate(tick) {
        const tickList = this.#updateQueue[tick];

        /**
         * @type {Sprite}
         */
        let sprite;

        // Check if the list is undefined
        if (tickList) {
            let i = tickList.length;

            // Iterate over the Sprite objects in reverse
            while (i--) {
                sprite = tickList[i];

                // Do not update a removed sprite
                if (this.#removedSprites.has(sprite)) {
                    continue;
                }

                // Trigger the Sprite update
                this.update(sprite);
            }

            // Reset i
            i = tickList.length;

            // Iterate over the Sprite objects in reverse and redraw
            while (i--) {
                sprite = tickList[i];

                // Do not update a removed sprite
                if (this.#removedSprites.has(sprite)) {
                    continue;
                }

                // Process the Sprite update
                this.render(sprite);
            }
        }

        // Delete the tick list to save memory
        delete this.#updateQueue[tick];
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
    render(sprite, brush) {
        // Apply brush styles, store old context style parameters
        const oldBrush = this.setBrush(brush ?? sprite.brush);

        // Check if the sprite is textual and set its metrics
        if (sprite.textual) {
            sprite.metrics = this.measureText(sprite.text);
        }

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

        // Remove from the erased sprite set
        this.#erasedSpriteSet.delete(sprite.id);

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
     * @protected
     */
    update(sprite) {
        // Erase the sprite
        const interRects = this.eraseSprite(sprite);

        // Call the sprite update function
        sprite.onUpdate(interRects);

        // Re-insert to the QuadTree
        this.insertToTree(sprite);
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

        let isCollide = true;

        lines.forEach((line, dimension) => {
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
                isCollide = false;
            }
        });

        return isCollide;
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
