import QuadTree from "./QuadTree.js";
import {Sprite, Timeout, Void} from "./BaseSprites";
import {Rectangle} from "../GameScenario/Sprites";


/**
 * @class Game
 *
 * Class encapsulating the Odyssey game engine.
 * // TODO implement sounds.
 * // TODO fix quadtree collisions.
 * https://github.com/timohausmann/quadtree-ts/tree/main/src
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
     * @param canvasId {string} HTML5 ID of the canvas element.
     * @param preTick {function(number)?} called before ticking the objects,
     *        given current tick. Called even if the game is paused.
     * @param postTick {function(number)?} called after ticking, given new tick.
     */
    constructor(canvasId, preTick, postTick) {
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

        // 2d context for the main canvas element
        this.#context = canvas.getContext("2d");

        // Initialize the data fields
        this.clear();

        this.addEventListener('resize', () => {
            Game.resizeCanvas(canvas);

            // Redraw the sprites
            this.redrawSprites();
        }, true);

        // Start the game
        this.start();
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
        this.context.clearRect(0, 0, this.width, this.height);

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

        // Check if there is an erased sprite set
        if (!this.#erasedSpriteSet) {
            this.#erasedSpriteSet = new Set();
        }

        this.#erasedSpriteSet.clear();
        this.#insertedSpriteSet.clear();

        // Initialize the rest of the fields
        this.#spriteWaitQueue = {};
        this.#tick = -1;
        this.#handlerId = 0;
        this.#isRunning = false;
        this.#latestRenderTime = 0;

        // Assigns the initial timestamp
        this.#initRenderTime = performance.now();
    }

    /**
     * @param sprite {Sprite} to be inserted into the canvas.
     */
    insertSprite(sprite) {
        // Draw the sprite
        this.render(sprite);

        // Insert the sprite to the quadtree
        for (const rect of sprite.hitBox) {
            this.#quadTree.insert({
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                sprite: sprite
            });
        }

        // Add the sprite to the sprites set
        this.#sprites.add(sprite);
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
     * Redraws all the sprites, without triggering their updates.
     * @protected
     */
    redrawSprites() {
        // Redraw the sprites
        for (const sprite of this.#sprites) {
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
     * Starts the game for the first time.
     * @protected
     */
    start() {
        // Initialize the game loop
        this.#requestAnimationFrame();
    }

    /**
     * Ticks all the game objects, and updates the ones that can
     * be updated.
     * @protected
     */
    tick() {
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
            if (sprite.ignorable) {
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
    }

    /**
     * Erases the object, exposing any objects beneath it.
     *
     * @param sprite {Sprite} to be erased.
     * @returns {Set<{
     *     x: number,
     *     y: number,
     *     height: number,
     *     width: number,
     *     sprite: Sprite
     * }>} the intersection rectangles.
     * @protected
     */
    eraseSprite(sprite) {
        // Get the intersection rectangles
        const interRects = this.#quadTree.retrieve(
            sprite.hitBox
        );

        // Clear the hit-box rectangles
        for (let rect of interRects) {
            this.clearRect(rect);
        }

        // Add to the erased sprite set
        this.#erasedSpriteSet.add(sprite.id);

        // Iterate over the sprites in the collision rectangles and redraw
        for (const interRect of interRects) {
            const {sprite: rectSprite} = interRect;

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
     *     width: number
     * }} rectangle to clear.
     * @protected
     */
    clearRect(rect) {
        this.context.clearRect(
            rect.x,
            rect.y,
            rect.width,
            rect.height
        );
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

        // Check if the list is undefined
        if (tickList) {
            let i = tickList.length;

            // Iterate over the Sprite objects in reverse
            while (i--) {
                // Trigger the Sprite update
                this.update(tickList.pop());
            }
        }

        // Delete the tick list to save memory
        delete this.#updateQueue[tick];
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
     * @protected
     */
    setBrush(brush) {
        // Apply brush styles
        this.context.lineWidth = brush?.borderWidth ?? 0;
        this.context.strokeStyle = brush?.borderColor ?? "transparent";
        this.context.fillStyle = brush?.fillColor ?? "transparent";
        this.context.font = brush?.font;
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
        // Begin new path
        this.context.beginPath();

        // Store old context style parameters
        const oldBrush = {
            borderWidth: this.context.lineWidth,
            borderColor: this.context.strokeStyle,
            fillColor: this.context.fillStyle,
            font: this.context.font
        };

        // Apply brush styles
        this.setBrush(brush ?? sprite.brush);

        // Draw the sprite
        sprite.draw(this.context);

        // Process the drawing action
        this.process()

        // Apply old brush styles
        this.setBrush(oldBrush);

        // End path
        this.context.closePath();

        // Remove from the erased sprite set
        this.#erasedSpriteSet.delete(sprite.id);
    }

    /**
     * {@link Sprite} links the Sprite class.
     * @param sprite {Sprite} sprite to be drawn.
     * @protected
     */
    update(sprite) {
        // Erase the sprite
        const interRects = this.eraseSprite(sprite);

        // Call the sprite update function
        sprite.onUpdate(interRects);

        // Redraw the sprite
        this.insertSprite(sprite);
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
     * @protected
     */
    #requestAnimationFrame() {
        requestAnimationFrame((timestamp) => {
            this.loop(timestamp);
        });
    }
}
