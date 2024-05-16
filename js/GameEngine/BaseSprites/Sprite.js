'use strict';


/**
 * @exports Sprite
 */

/**
 * @abstract
 * @class Sprite
 *
 * Should be treated as an abstract class.
 */
class Sprite {
    /**
     * @typedef {{
     *     x: number,
     *     y: number,
     *     height: number,
     *     width: number,
     *     rotation?: number
     * }} BasicHitBox
     *
     * Rotation is in degrees.
     */

    /**
     * @typedef {{
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
     *     currentCol: number,
     *     moveDur: number,
     *     currentCycle: number,
     *     moves: number,
     *     linkedTo?: Set<number>,
     *     onEnd?: function(),
     *     onStart?: function(),
     *     hitBox?: (function(number, number): BasicHitBox[]) | undefined
     *  }} Animation
     */

    /**
     * @typedef {{
     *     x: number,
     *     y: number,
     *     acceleration: number,
     *     speed_0: number,
     *     speed?: number,
     *     max_speed?: number,
     * }} MovementType
     */

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
     * Player-controlled sprite.
     *
     * {@link Player} links the Player class.
     * @type {Player}
     * @private
     */
    static #player=  undefined;

    /**
     * Decides the damage flash interval length.
     *
     * @type {number}
     * @private
     */
    static #damageFrameIntervals = 5;

    /**
     * @type {any} sprite geometric description.
     * @private
     */
    #desc;

    /**
     * @type {number} scale of the sprite.
     * @private
     */
    #scale;

    /**
     * @type {boolean} if true, the sprite is mirrored vertically.
     * @private
     */
    #flip;

    /**
     * Affects the image drawing.
     *
     * @type {number} clockwise rotation of the sprite in degrees.
     * @private
     */
    #rotation;

    /**
     * @type {number} cached rotation in radians.
     * @private
     */
    #radRotation;

    /**
     * Current animation ID.
     *
     * @type {number}
     * @private
     */
    #animationId;

    /**
     * True if the instance does not pause with the game pause. Default false.
     *
     * @type {boolean}
     * @private
     */
    #nonPausable;

    /**
     * ID of the current dominant animation to draw.
     *
     * @type {number | undefined}
     * @private
     */
    #currentAnimation;

    /**
     * {@link Level}
     * Level instance of the sprite.
     *
     * @type {Level | undefined}
     * @private
     */
    #level;

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
     * @type {Object<number, Animation>}
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
     * @type {(function(number): any) | undefined} called on each update cycle, with the current tick.
     * @private
     */
    #onUpdate;

    /**
     * @type {HitBox[] | undefined} current sprite hit box.
     * @private
     */
    #currentHitBox;

    /**
     * @type {Game} game engine instance.
     * @private
     */
    #game;

    /**
     * Used for collision direction resolution.
     * Stores the previous coordinates.
     *
     * @type {[number, number]}
     * @private
     */
    #prevCoords;

    /**
     * @type {number | undefined} hit points of the sprite.
     * @private
     */
    #hp;

    /**
     * @type {number | undefined} initial hit points of the sprite.
     * @private
     */
    #initHp

    /**
     * @type {[number, number]} initial coordinates.
     * @protected
     */
    #initCoords;

    /**
     * @type {number} damage cool down.
     * @protected
     */
    #damageCoolDown;

    /**
     * Initial damage cool down period.
     *
     * @type {number}
     * @protected
     */
    #initDamageCoolDown;

    /**
     * @type {number} counter for the damage frames.
     * @protected
     */
    #damageFrames;

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
     * @param p {Player} player-controlled sprite.
     */
    static set player(p) {
        this.#player = p;
    }

    /**
     * @returns {Player} the player-controlled sprite.
     */
    static get player() {
        return this.#player;
    }

    /**
     * @returns {string[]} list of sprite sheets.
     */
    static get sheets() {
        return ['damage.png'];
    }

    /**
     * @returns {string[]} list of sound files.
     */
    static get sounds() {
        return [];
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
     * @param coords {[number, number]} the coordinates of the sprite.
     * @param onUpdate {(function(number): any)?} called on each update cycle,
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
     *  @param nonPausable {boolean?} true if the instance does not pause with the game pause. Default false.
     *  @param isStatic {boolean?} true indicates that the sprite does not update. Default false.
     *  @param scale {number?} scale of the sprite.
     *  @param hp {number?} hit points of the sprite. Undefined means it has no HP.
     *  @param damageCoolDown {number?} damage cool down of the sprite. Default is 1.
     */
    constructor(
        description,
        coords,
        onUpdate,
        brush,
        hitBoxBrush,
        relativePoint,
        nonPausable,
        isStatic,
        scale,
        hp,
        damageCoolDown = 1
    ) {
        this.#id = Sprite.#spriteId();
        this.#scale = scale ?? 1;
        this.#desc = description;
        this.#coords = coords;
        this.#initCoords = [...coords];
        this.#prevCoords = [...coords];
        this.#animations = {};
        this.#animationId = 0;
        this.#rotation = this.#radRotation = 0;
        this.#states = new Map();
        this.#level = undefined;
        this.#hp = this.#initHp = hp;

        // Initialize the damage cool down
        this.#initDamageCoolDown = damageCoolDown;
        this.#damageFrames = 0;
        this.#damageCoolDown = 0;

        // Do not use the setter, causes issues due to abstract nature of width
        this.#flip = false;

        this.brush = brush;
        this.hitBoxBrush = hitBoxBrush;
        this.onUpdate = onUpdate;
        this.relativePoint = relativePoint;
        this.nonPausable = nonPausable ?? false;
        this.static = isStatic ?? false;

        // Dummy value
        // Do not use the setter, since defaultHitBox is abstract
        this.#currentHitBox = undefined;

        // Store the sprite reference into the sprites map
        Sprite.sprites[this.id] = this;
    }

    /**
     * @returns {number} the sprite damage cool down.
     */
    get damageCoolDown() {
        return this.#damageCoolDown;
    }

    /**
     * @returns {number} the sprite damage cool down.
     */
    get damageFrames() {
        return this.#damageFrames;
    }

    /**
     * @returns {number|undefined} HP of the sprite.
     */
    get hp() {
        return this.#hp;
    }

    /**
     * @returns {boolean} true if the sprite is alive.
     */
    get isAlive() {
        return this.hp === undefined || this.hp > 0;
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
     * @returns {number} Initial x-coordinate.
     */
    get initX() {
        return this.#initCoords[0];
    }

    /**
     * @returns {number} Initial y-coordinate.
     */
    get initY() {
        return this.#initCoords[1];
    }

    /**
     * @returns {number|undefined} the initial HP.
     */
    get initHp() {
        return this.#initHp;
    }

    /**
     * @returns {boolean} true if the sprite is flipped vertically.
     */
    get flip() {
        return this.#flip;
    }

    /**
     * @returns {number} the rotation of the sprite in degrees.
     */
    get rotation() {
        return this.#rotation;
    }

    /**
     * @returns {Map<any, any>} the states object.
     */
    get states() {
        return this.#states;
    }

    /**
     * @returns {number} the scale of the sprite.
     */
    get scale() {
        return this.#scale ?? 1;
    }

    /**
     * @returns {Game} the parent game instance of this sprite.
     */
    get game() {
        return this.#game;
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
     * @returns {number} rotation in radians.
     */
    get radRotation() {
        return this.#radRotation;
    }

    /**
     * @returns {number} scaled x-coordinate.
     */
    get scaledX() {
        return this.x * this.scale;
    }

    /**
     * @returns {number} scaled y-coordinate.
     */
    get scaledY() {
        return this.y * this.scale;
    }

    /**
     * @returns {Player} the player controlled sprite.
     */
    get player() {
        return Sprite.player;
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
     * @returns {(function(number): any)} the onUpdate function.
     */
    get onUpdate() {
        return (ticks) => {
            this.#damageCoolDown--;
            return this.#onUpdate ? this.#onUpdate(ticks) : undefined;
        }
    }

    /**
     * A child class must implement it to provide type hints.
     *
     * @abstract
     * @returns {any} the sprite description.
     */
    get desc() {
        return this.#desc;
    }

    /**
     * @abstract
     * @returns {string[]} list of sprite sheets of the Sprite.
     */
    get sheets() {}

    /**
     * @abstract
     * @returns {string[]} list of sound files.
     */
    get sounds() {}

    /**
     * @abstract
     * @returns {string} string representing the type of the sprite.
     */
    static get type() {}

    /**
     * @abstract
     * @returns {string} string representing the type of the sprite.
     */
    get type() {}

    /**
     * @returns {number} current width of the animation.
     */
    get width() {
        if (this.currentAnimation === undefined) {
            return 0;
        }

        return Math.floor(this.scale * this.getAnimation(this.currentAnimation).singleWidth);
    }

    /**
     * @returns {number} current height of the animation.
     */
    get height() {
        if (this.currentAnimation === undefined) {
            return 0;
        }

        return Math.floor(this.scale * this.getAnimation(this.currentAnimation).singleHeight);
    }

    /**
     * @returns {number} rightmost x-coordinate.
     */
    get rx() {
        return this.x + this.width;
    }

    /**
     * @returns {number} bottommost y-coordinate.
     */
    get by() {
        return this.y + this.height;
    }

    /**
     * @returns {boolean} true if the sprite does not update.
     */
    get static() {
        return this.#static;
    }

    /**
     * @returns {Level|undefined} the sprite level.
     */
    get level() {
        return this.#level;
    }

    /**
     * Override by child class to change to true.
     * Returns false be default.
     *
     * @returns {boolean} true if the sprite does not have collision.
     */
    get nonPausable() {
        return this.#nonPausable;
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
     * @param value {boolean} true to flip the image, false to restore to original.
     */
    set flip(value) {
        // Flip the hit-boxes
        this.hitBox.forEach(h => h.flip(value));

        this.#flip = value;
    }

    /**
     * @param game {Game} parent game instance of the sprite.
     */
    set game(game) {
        this.#game = game;
    }

    /**
     * {@link Level}
     * @param level {Level} new sprite level.
     */
    set level(level) {
        this.#level = level;
    }

    /**
     * @param value {number} new previous x.
     */
    set prevX(value) {
        this.#prevCoords[0] = value;
    }

    /**
     * @param value {number} new previous y.
     */
    set prevY(value) {
        this.#prevCoords[1] = value;
    }

    /**
     * @param id {number} new ID of the next animation to play.
     */
    set currentAnimation(id) {
        this.setCurrentAnimation(id, false);
    }

    /**
     * Resets the animation if the same.
     *
     * @param id {number} new ID of the next animation to play.
     */
    set currentAnimationReset(id) {
        this.setCurrentAnimation(id, true);
    }

    /**
     * @param value {boolean} true indicates that the sprite does not collide.
     */
    set nonPausable(value) {
        this.#nonPausable = value;
    }

    /**
     * @param onUpdate {(function(number): any)?} new onUpdate function.
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
     * @param value {BasicHitBox[] | HitBox[] | undefined} new list of hit-boxes.
     */
    set hitBox(value) {
        if (value) {
            if (value[0] instanceof HitBox) {
                this.#currentHitBox = value;
            } else {
                this.#currentHitBox = this.convertHitBoxes(value);
            }
        } else {
            // Back to default
            this.#currentHitBox = undefined;
        }
    }

    /**
     * @param x {number} new x-coordinate of the sprite.
     */
    set x(x) {
        this.prevX = this.x;
        this.#currentHitBox?.forEach(h => {
            h.x += x - this.x;
        });
        this.#coords[0] = x;
    }

    /**
     * @param deg {number} new clockwise rotation in degrees.
     */
    set rotation(deg) {
        this.#currentHitBox?.forEach(h => {
            h.rotation += this.degToRadians(deg - this.rotation);
        });
        this.#rotation = deg;
        this.#radRotation = this.degToRadians(deg);
    }

    /**
     * @param y {number} new y-coordinate of the sprite.
     */
    set y(y) {
        this.prevY = this.y;
        this.#currentHitBox?.forEach(h => {
            h.y += y - this.y;
        });
        this.#coords[1] = y;
    }

    /**
     * @param rx {number} new rightmost x-coordinate.
     */
    set rx(rx) {
        this.x = rx - this.width;
    }

    /**
     * @param by {number} new bottommost y-coordinate.
     */
    set by(by) {
        this.y = by - this.height;
    }

    /**
     * @param value {number} new value of the damage frames.
     */
    set damageFrames(value) {
        this.#damageFrames = value * Sprite.#damageFrameIntervals;
    }

    /**
     * Stops the current dominant animation.
     */
    stopAnimation() {
        this.currentAnimation = undefined;
    }

    /**
     * Resets the damage cool down back to its original value.
     */
    resetDamageCoolDown() {
        this.#damageCoolDown = this.#initDamageCoolDown;
    }

    /**
     * Resets the damage frames back to their original value.
     */
    resetDamageFrames() {
        this.damageFrames = 6;
    }

    /**
     * @param index {string} index of the sound file in the sounds array.
     * @param reload {boolean} true to reload sound file.
     * @returns {HTMLAudioElement} Audio instance for use.
     */
    getSound(index, reload = false) {
        return Sound.load(this.sounds[index], reload);
    }

    /**
     * Plays the given audio properly.
     *
     * @param audio {HTMLAudioElement} to play.
     * @param noOverlap {boolean?} if true, the audio does not overlap over itself.
     */
    playSound(audio, noOverlap) {
        Sound.playAudio(audio, noOverlap);
    }

    /**
     * @param value {number} damages the sprite by the given value.
     */
    damage(value) {
        if (this.damageCoolDown <= 0) {
            this.#hp -= value;
            this.#hp = Math.max(0, this.#hp);
            this.resetDamageCoolDown();
            this.resetDamageFrames();
        }
    }

    /**
     * HP can exceed the initial HP value.
     *
     * @param value {number} heals the sprite by the given value.
     */
    heal(value) {
        this.#hp += value;
    }

    /**
     * Uses the centers for the calculation.
     *
     * @param s {Sprite} to get the distance with.
     * @returns {number} the Euclidean distance between this sprite and s.
     */
    euclideanDistance(s) {
        return this.euclideanDistancePt(this.center, s.center);
    }

    /**
     * Uses the centers for the calculation.
     *
     * @param s {Sprite} to get the distance with.
     * @returns {number} the Manhattan distance between this sprite and s.
     */
    manhattanDistance(s) {
        return this.manhattanDistancePt(this.center, s.center);
    }

    /**
     * @param p0 {[number, number]} first point.
     * @param p1 {[number, number]} second point.
     * @returns {number} the slope of the line connecting the points.
     */
    linearSlope(p0, p1) {
        return (p1[1] - p0[1]) / (p1[0] - p0[0]);
    }

    /**
     * @param p0 {[number, number]} coordinates of first point.
     * @param p1 {[number, number]} coordinates of second point.
     * @returns {number} the Euclidean distance between p0 and p1.
     */
    euclideanDistancePt(p0, p1) {
        return Math.sqrt(
            (p0[0] - p1[0]) ** 2 + (p0[1] - p1[1]) ** 2
        );
    }

    /**
     * @param p0 {[number, number]} coordinates of first point.
     * @param p1 {[number, number]} coordinates of second point.
     * @returns {number} the Manhattan distance between p0 and p1.
     */
    manhattanDistancePt(p0, p1) {
        return Math.abs(p0[0] - p1[0]) + Math.abs(p0[1] - p1[1]);
    }

    /**
     * @param s {Sprite} to check the collision with.
     * @returns {CollisionDirection | null} collision direction if colliding, else null.
     */
    colliding(s) {
        if (this.game) {
            return this.game.areColliding(this, s);
        }

        return null;
    }

    /**
     * @param angle {number} angle in degrees.
     * @returns {number} the angle in radians.
     */
    degToRadians(angle) {
        return angle * Math.PI / 180;
    }

    /**
     * @param rects {BasicHitBox[]} list of rectangles to convert to Collision instances.
     */
    convertHitBoxes(rects) {
        return rects.map(r => {
                const h = new HitBox({
                    topLeftCoords: [r.x, r.y],
                    rotation: this.degToRadians(r.rotation ?? 0),
                    height: r.height,
                    width: r.width
                }, this).scale(
                    this.scale,
                    this.x,
                    this.y
                );

                // Flip the hit-box
                if (this.flip) {
                    h.flip();
                }

                return h;
            }
        );
    }

    /**
     * The returned hit box is used in collision detection.
     *
     * @returns {HitBox[]} a list of hit boxes that represent the current hit-boxes of the sprite.
     */
    get hitBox() {
        return this.#currentHitBox ?? this.defaultHitBox;
    }

    /**
     * @returns {number[]} coordinates of the sprite center.
     */
    get center() {
        return [this.x + this.width / 2, this.y + this.height / 2];
    }

    /**
     * If the sprite is moving to the North, its flip is South.
     * If the sprite is moving South-West, its flip is North-East.
     *
     * @param collider {HitBox} collider hit box.
     * @param collided {HitBox} collided hit box.
     * @returns {CollisionDirection} the flipped direction of movement.
     */
    movementDirection(collider, collided) {
        const dx = this.x - this.prevX,
            dy = this.y - this.prevY;

        const res = CollisionDirection.None;

        // Check dx
        if (dx < 0) {
            res.east;
        } else if (dx > 0) {
            res.west;
        }

        // Check dy
        if (dy < 0) {
            res.south;
        } else if (dy > 0) {
            res.north;
        }

        // Set the collided hit boxes.
        res.collider = collider;
        res.collided = collided;

        return res;
    }

    /**
     * @returns {number} previous x.
     */
    get prevX() {
        return this.#prevCoords[0];
    }

    /**
     * @returns {number} previous y.
     */
    get prevY() {
        return this.#prevCoords[1];
    }

    /**
     * The returned hit box is used in collision detection.
     *
     * @abstract
     * @returns {HitBox[]} a list of hit boxes that represent the default hit-boxes of the sprite.
     */
    get defaultHitBox() {}

    /**
     * Draws the sprite in the 2d context.
     *
     * @abstract
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {}

    /**
     * Applies linear interpolation to move this sprite to the destination.
     *
     * @param x {number} destination x-coordinate.
     * @param y {number} destination y-coordinate.
     * @param speed {number} speed of movement.
     * @param onArrival {function()?} callback function. Triggered when the sprite reaches the destination.
     * @returns {[number, number]} the speed vector used.
     */
    moveTo(x, y, speed, onArrival) {
        const dx = x - this.x, dy = y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If the sprite is not yet at the target position
        if (distance > speed) {
            // Calculate the ratio of how much to move in each direction
            const ratio = speed / distance;
            const vector = [dx * ratio, dy * ratio];

            this.x += vector[0];
            this.y += vector[1];

            // Return the speed vector
            return vector;
        } else {
            this.x = x;
            this.y = y;

            if (onArrival) {
                onArrival();
            }

            // Didn't move
            return [0, 0];
        }
    }

    /**
     * @param angleRef {{
     *      value?: number,
     *      initValue?: number,
     * }}
     * @param x {number} x-coordinate of the center of path.
     * @param y {number} y-coordinate of the center of path.
     * @param angularSpeed {number} in degrees.
     * @param onCycle {function()?} called on each cycle.
     */
    circleAround(angleRef, x, y, angularSpeed, onCycle) {
        if (angleRef.value === undefined) {
            angleRef.value = angleRef.initValue = 0;
        } else if (angleRef.initValue === undefined) {
            angleRef.initValue = angularSpeed > 0 ? angleRef.value : Math.abs(angleRef.value);
        }

        // Radius of the movement
        const radius = this.euclideanDistancePt(
            [this.x, this.y],
            [x, y]
        );

        this.x = x + radius * Math.cos(this.degToRadians(angleRef.value));
        this.y = y + radius * Math.sin(this.degToRadians(angleRef.value));

        // Rotate
        angleRef.value += angularSpeed;

        // Call onCycle
        if (Math.abs(angleRef.value) >= 360 + angleRef.initValue && onCycle) {
            onCycle();
        }

        angleRef.value %= 360 + angleRef.initValue;
    }

    /**
     * Applies linear interpolation to accelerate this sprite to the destination.
     *
     * @param movement {MovementType} object controlling the sprite motion. Modified.
     * @param onArrival {function()?} callback function. Triggered when the sprite reaches the destination.
     * @returns {[number, number]} the latest speed vector used.
     */
    accelerateTo(movement, onArrival) {
        const {x, y} = movement;
        const dx = x - this.x, dy = y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Acceleration
        const accelerationFactor = movement.acceleration * distance;

        // Initialize the movement
        if (movement.speed === undefined) {
            movement.speed = movement.speed_0 ?? 0;
        }

        // Adjust the speed, compare with distance to not overshoot
        movement.speed = Math.min(
            distance,
            accelerationFactor + movement.speed,
            movement.max_speed ?? distance
        );

        return this.moveTo(x, y, movement.speed, onArrival);
    }

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
     * @param moveDur {number?} number of updates that trigger a move.
     * @param onStart {function()?} callback function used before the animation starts a cycle.
     * @param onEnd {function()?} callback function used after the animation ends a cycle.
     * @param hitBox {(function(number, number): BasicHitBox[])?} list of hit-boxes specifically for the animation.
     * If not provided, uses the default one.
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
        rSpace,
        moveDur = 1,
        onStart,
        onEnd,
        hitBox,
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
            moveDur,
            onStart,
            onEnd,
            hitBox,
            linkedTo: undefined,
            currentCycle: 1, // Skips the first cycle
            moves: 0,
            currentRow: 0,
            currentCol: 0
        };

        // Reset the animation before returning for any recalibrations
        this.resetAnimation(id);

        return id;
    }

    /**
     * Moves the current animation.
     */
    moveCurrentAnimation() {
        if (this.currentAnimation !== undefined) {
            this.moveAnimation(this.currentAnimation);
        }
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
     * @param scale {number?} scale of the animation. Defaults to the sprite scale.
     * @protected
     */
    drawCurrentAnimation(x, y, ctx, scale) {
        if (this.currentAnimation !== undefined) {
            this.drawAnimation(this.currentAnimation, x, y, ctx, scale ?? this.scale);
        }
    }

    /**
     * Draws the current dominant animation.
     *
     * @param id {number} ID of the animation to draw.
     * @param x {number} x-coordinate of the top-left corner of the destination.
     * @param y {number} y-coordinate of the top-left corner of the destination.
     * @param ctx {CanvasRenderingContext2D} 2d canvas element context.
     * @param scale {number?} scale of the animation. If not given, the sprite scale is used.
     * @param flip {boolean?} if true the animation is flipped horizontally.
     * @protected
     */
    drawAnimation(id, x, y, ctx, scale, flip) {
        this.drawAnimationFrame(
            x,
            y,
            id,
            ctx,
            undefined,
            undefined,
            undefined,
            scale ?? this.scale,
            flip
        );
    }

    /**
     * Links the animations to each other.
     * When transitioning from one to the other, the move order is preserved.
     *
     * @param a0 {number} ID of the first animation.
     * @param a1 {number} ID of the second animation.
     */
    linkAnimations(a0, a1) {
        const anim0 = this.getAnimation(a0), anim1 = this.getAnimation(a1);

        if (!anim0.linkedTo) {
            anim0.linkedTo = new Set();
        }

        if (!anim1.linkedTo) {
            anim1.linkedTo = new Set();
        }

        // Link the animations
        anim0.linkedTo.add(a0);
        anim1.linkedTo.add(a1);
    }

    /**
     * @param animations {number} links the give animations to each other.
     */
    multiLinkAnimations(...animations) {
        for (let i = 0; i < animations.length; i++) {
            for (let j = i + 1; j < animations.length; j++) {
                this.linkAnimations(animations[i], animations[j]);
            }
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

        anim.currentRow = anim.currentCol = anim.moves = 0;
    }

    /**
     * Must be used inside the update function.
     *
     * @param id {number} ID of the animation to move one frame.
     * @protected
     */
    moveAnimation(id) {
        const anim = this.#animations[id];

        // Move iff the animation has completed its waiting cycle
        if ((anim.currentCycle %= anim.moveDur) === 0) {
            // If this is the first frame, run onStart
            if (anim.onStart && anim.currentCol === 0 && anim.currentRow === 0) {
                anim.onStart();
            }

            // Increment the current column
            anim.currentCol++;

            // In case of overflow, jump to next row
            if (
                anim.currentCol >= anim.columns
                || anim.currentCol + anim.currentRow * anim.columns >= anim.frameCnt
            ) {
                anim.currentCol = 0;
                anim.currentRow++;
            }

            // Increment the number of moves
            anim.moves++;

            // In case of overflow, reset the animation
            if (anim.currentRow >= anim.rows) {
                this.resetAnimation(id);

                if (anim.onEnd) {
                    anim?.onEnd();
                }
            }
        }

        anim.currentCycle++;
    }

    /**
     * @param id {number} ID of the animation.
     * @returns {Animation} reference of the animation object.
     * @protected
     */
    getAnimation(id) {
       return this.#animations[id];
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
     * @param flip {boolean?} if true the animation is flipped horizontally. Does not override the flip data field.
     * @private
     */
    drawAnimationFrame(
        x,
        y,
        id,
        ctx,
        forceLoad,
        width,
        height,
        scale,
        flip
    ) {
        // Save the context
        ctx.save();

        const anim = this.#animations[id];

        if (scale === undefined) {
            scale = 1;
        }

        // Set the flip variable
        flip = this.flip || (flip ?? false);

        // Flip the sprite
        if (flip) {
            ctx.scale(-1, 1);
        }

        // Translate coordinates
        ctx.translate((flip ? Math.floor(-scale * anim.singleWidth - x) : x), y);

        // Rotate the image
        ctx.rotate(this.radRotation);

        if (this.damageFrames) {
            if (this.damageFrames % Sprite.#damageFrameIntervals === 0) {
                // Check https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
                ctx.globalCompositeOperation = 'xor';

                ctx.drawImage(
                    // the damage image
                    SpriteSheet.load(Sprite.sheets[0], forceLoad, width, height),
                    Math.floor((anim.singleWidth + anim.cSpace) * anim.currentCol + anim.startX),
                    Math.floor((anim.singleHeight + anim.rSpace) * anim.currentRow + anim.startY),
                    anim.singleWidth,
                    anim.singleHeight,
                    0, // Already translated
                    0, // Already translated
                    Math.floor(scale * anim.singleWidth),
                    Math.floor(scale * anim.singleHeight),
                );
            }

            this.#damageFrames--;
        }

        ctx.drawImage(
            SpriteSheet.load(this.sheets[anim.sheetInd], forceLoad, width, height),
            Math.floor((anim.singleWidth + anim.cSpace) * anim.currentCol + anim.startX),
            Math.floor((anim.singleHeight + anim.rSpace) * anim.currentRow + anim.startY),
            anim.singleWidth,
            anim.singleHeight,
            0, // Already translated
            0, // Already translated
            Math.floor(scale * anim.singleWidth),
            Math.floor(scale * anim.singleHeight),
        );

        // Restore the context
        ctx.restore();
    }

    /**
     * @param id {number} ID of the next animation to play.
     * @param reset {boolean} if true, the animation is reset, even if the animation is the same as current.
     * @private
     */
    setCurrentAnimation(id, reset) {
        if (!reset && this.currentAnimation === id) {
            return; // Do not do anything if is current
        }

        // Reset the current animation
        if (this.currentAnimation !== undefined) {
            const curAnim = this.getAnimation(this.currentAnimation);

            // If the animations are linked, move the same amount of steps
            if (curAnim.linkedTo?.has(id)) {
                for (let i = 0; i <= curAnim.moves; i++) {
                    this.moveAnimation(id);
                }
            }

            this.resetAnimation(this.currentAnimation);
        }

        this.#currentAnimation = id;
        const anim = this.getAnimation(id);

        if (anim.hitBox) {
            this.hitBox = anim.hitBox(this.x, this.y);
        } else {
            this.hitBox = undefined;
        }
    }
}
