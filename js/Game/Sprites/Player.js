'use strict'

/**
 * @exports Player
 */

/**
 * States for the player control activity.
 *
 * @type {{inactive: number, active: number}}
 */
const PlayerControlsState = {
    inactive: 0,
    active: 1
};

/**
 * States for the player spawn state.
 *
 * @type {{spawning: number, spawned: number, beaming: number}}
 */
const PlayerSpawnState = {
    beaming: 0,
    spawning: 1,
    spawned: 2,
};

/**
 * States for the player attack state.
 *
 * @type {{charging: number, none: number, shot: number}}
 */
const PlayerAttackState = {
    none: 0,
    charging: 1,
    shot: 2,
};

/**
 * State for the player movement.
 *
 * @type {{move: number, idle: number, dash: number}}
 */
const PlayerDisplacementState = {
    idle: 0,
    move: 1,
    dash: 2
};

/**
 * Primary states of the player.
 *
 * @type {{falling: number, hoverIdle: number, idle: number, stopDashing: number, dashing: number, running: number, landing: number, startRunning: number, damaged: number, startDashing: number, hoverForward: number, startJumping: number, hoverBackwards: number}}
 */
const PlayerMoveState = {
    idle: 0,
    // Running
    startRunning: 1,
    running: 2,
    // Jumping
    startJumping: 3,
    falling: 4,
    landing: 5,
    // Dashing
    startDashing: 6,
    dashing: 7,
    stopDashing: 8,
    // Hover
    hoverIdle: 9,
    hoverForward: 10,
    hoverBackwards: 11,
    // Damaged
    damaged: 12,
};


/**
 * @class Player
 *
 * Class representing the playable character Player.
 */
class Player extends Sprite {
    /**
     * Object containing the animations of Player.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of Player.
     * @param onUpdate {(function(number): boolean)?} called on each update cycle, with the current tick.
     * @param hitBoxBrush {{
     *    borderWidth?: number,
     *    borderColor?: string,
     *    fillColor?: string,
     *    font?: string
     *  }?} object hit-box brush properties.
     */
    constructor(
        x,
        y,
        scale,
        onUpdate,
        hitBoxBrush
    ) {
        let addedListeners = false;

        super(
            {
                lives: 2,
                moveSpeed: 8,
                dashSpeed: 16,
                dashDuration: 50, // In ticks
                jumpForce: 10,
                gravity: 15,
                initDashDuration: 50, // In ticks
                tempState: PlayerMoveState.idle
            },
            [x, y],
            (t) => {
                switch (this.states.get(PlayerSpawnState)) {
                    case PlayerSpawnState.beaming:
                        const col = this.colliding(this.level);

                        if (col) {
                            this.states.set(PlayerSpawnState, PlayerSpawnState.spawning)

                            // Important switch to get idle animation height not spawn_1
                            this.setIdle();
                            this.by = col.collided.projectX(this.x);
                            this.currentAnimation = this.animations.spawn_1;

                            // Recenter from beam going down
                            this.x -= 32 * scale;
                        } else {
                            this.y += 30;
                        }

                        break;
                    case PlayerSpawnState.spawned:
                        if (!addedListeners) {
                            this.addListeners();
                            addedListeners = true;
                        }

                        // If not active do not take commands
                        if (this.states.get(PlayerControlsState) === PlayerControlsState.active) {
                            switch (this.states.get(PlayerDisplacementState)) {
                                case PlayerDisplacementState.move:
                                    this.move();
                                    break;
                                case PlayerDisplacementState.dash:
                                    this.dash();
                                    break;
                            }
                        }

                        const lvlCol = this.colliding(this.level);

                        switch (this.states.get(PlayerMoveState)) {
                            case PlayerMoveState.startJumping:
                                if (lvlCol) {
                                    // TODO separate the collision
                                }

                                this.y -= this.jumpForce;
                                break;
                            case PlayerMoveState.falling:
                                this.y += this.gravity;

                                if (lvlCol) {
                                    this.by = lvlCol.collided.projectX(this.x);
                                    this.transitionTo(PlayerMoveState.landing);
                                }
                                break;
                        }
                        break;
                }

                if (onUpdate) {
                    onUpdate(t);
                }
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale,
            100,
            30
        );

        // TODO Add rest of animations and update buster
        // TODO add zero (not vital)

        // Create the animations
        this.#animations = {
            spawn_0: this.createAnimation(
                0,
                62,
                25,
                1,
                1,
                1,
                6,
                77,
                0,
                0,
                1,
                undefined,
                undefined,
                (x, y) => {
                    return [
                        {
                            x,
                            y,
                            width: 6,
                            height: 77
                        }
                    ];
                }
            ),
            spawn_1: this.createAnimation(
                0,
                146,
                35,
                8,
                2,
                15,
                64,
                64,
                1,
                1,
                4,
                () => {
                    this.states.set(PlayerSpawnState, PlayerSpawnState.spawning);
                },
                () => {
                    // Recenter from beam going down
                    this.x += 12 * scale;

                    this.states.set(PlayerSpawnState, PlayerSpawnState.spawned);
                    this.states.set(PlayerControlsState, PlayerControlsState.active);
                    this.setIdle();
                }
            ),
            idle: this.createAnimation(
                1,
                232,
                7,
                5,
                1,
                5,
                39,
                49,
                1,
                0,
                18,
            ),
            idleTired: this.createAnimation(
                0,
                12,
                547,
                6,
                1,
                6,
                33,
                48,
                1,
                0,
                18
            ),
            damaged: this.createAnimation(
                1,
                262,
                66,
                4,
                1,
                4,
                51,
                56,
                1,
                0,
                3,
                undefined,
                () => {
                    this.transitionTo(this.tempState);
                }
            ),
            startRun: this.createAnimation(
                1,
                14,
                522,
                3,
                1,
                3,
                33,
                49,
                1,
                0,
                3,
                undefined,
                () => {
                    this.currentAnimation = this.animations.runLoop_0;
                }
            ),
            runLoop_0: this.createAnimation(
                1,
                156,
                517,
                8,
                1,
                8,
                42,
                51,
                1,
                0,
                3,
                undefined,
                () => {
                    this.currentAnimation = this.animations.runLoop_1;
                }
            ),
            runLoop_1: this.createAnimation(
                1,
                14,
                677,
                5,
                1,
                5,
                49,
                50,
                1,
                0,
                3,
                undefined,
                () => {
                    this.currentAnimation = this.animations.runLoop_0;
                }
            ),
            startJump: this.createAnimation(
                1,
                27,
                415,
                7,
                1,
                7,
                34,
                58,
                1,
                0,
                3,
                undefined,
                () => {
                    this.transitionTo(PlayerMoveState.falling);
                }
            ),
            falling: this.createAnimation(
                1,
                359,
                438,
                1,
                1,
                1,
                29,
                57,
                0,
                0,
                1,
                undefined,
                undefined,
                (x, y) => {
                    return [
                        {
                            x,
                            y,
                            width: 29,
                            height: 57
                        }
                    ];
                }
            ),
            land: this.createAnimation(
                1,
                400,
                434,
                3,
                1,
                3,
                33,
                54,
                1,
                0,
                3,
                undefined,
                () => {
                    if (this.states.get(PlayerDisplacementState) === PlayerDisplacementState.idle) {
                        this.transitionTo(PlayerMoveState.idle);
                    } else {
                        this.transitionTo(PlayerMoveState.startRunning);
                    }
                }
            ),
            dashStart: this.createAnimation(
                1,
                14,
                851,
                3,
                1,
                3,
                53,
                44,
                1,
                0,
                2,
                undefined,
                () => {
                    this.states.set(PlayerMoveState, PlayerMoveState.dashing);
                    this.currentAnimation = this.animations.dash;
                }
            ),
            dash: this.createAnimation(
                1,
                212,
                845,
                1,
                1,
                1,
                57,
                34,
                0,
                0,
                1,
                undefined,
                undefined,
                (x, y) => {
                    return [
                        {
                            x,
                            y,
                            width: 55,
                            height: 30
                        }
                    ];
                }
            ),
            dashEnd: this.createAnimation(
                1,
                334,
                843,
                4,
                1,
                4,
                41,
                46,
                1,
                0,
                4,
                undefined,
                () => {
                    this.setIdle();
                }
            ),
        };

        this.states.set(PlayerDisplacementState, PlayerDisplacementState.idle);
        this.states.set(PlayerMoveState, PlayerMoveState.idle);
        this.states.set(PlayerSpawnState, PlayerSpawnState.beaming);
        this.states.set(PlayerControlsState, PlayerControlsState.inactive);
        this.currentAnimation = this.#animations.spawn_0;
    }

    /**
     * @param state {number} state to transition to.
     */
    transitionTo(state) {
        // TODO add player damaged state here
        switch (this.states.get(PlayerMoveState)) {
            case PlayerMoveState.idle:
                switch (state) {
                    case PlayerMoveState.startRunning:
                        this.idleToRunning();
                        break;
                    case PlayerMoveState.startJumping:
                        this.idleToJumping();
                        break;
                    case PlayerMoveState.startDashing:
                        this.toDashing();
                        break;
                }
                break;
            case PlayerMoveState.startRunning:
                // Fall through
            case PlayerMoveState.running:
                switch (state) {
                    case PlayerMoveState.idle:
                        this.toIdle();
                        break;
                    case PlayerMoveState.startJumping:
                        this.runningToJumping();
                        break;
                    case PlayerMoveState.startDashing:
                        this.toDashing();
                        break;
                }
                break;
            case PlayerMoveState.startJumping:
                switch (state) {
                    case PlayerMoveState.falling:
                        this.toFalling();
                        break;
                    case PlayerMoveState.startDashing:
                        this.toDashing();
                        break;
                }
                break;
            case PlayerMoveState.falling:
                switch (state) {
                    case PlayerMoveState.landing:
                        this.fallingToLanding();
                        break;
                    case PlayerMoveState.startDashing:
                        this.toDashing();
                        break;
                }
                break;
            case PlayerMoveState.landing:
                switch (state) {
                    case PlayerMoveState.idle:
                        this.toIdle();
                        break;
                    case PlayerMoveState.startDashing:
                        this.toDashing();
                        break;
                    case PlayerMoveState.startRunning:
                        this.landingToRunning();
                        break;
                }
                break;
            case PlayerMoveState.dashing:
                switch (state) {
                    case PlayerMoveState.stopDashing:
                        this.stopDashing();
                        break;
                }
                break;
        }
    }

    idleToRunning() {
        this.states.set(PlayerMoveState, PlayerMoveState.running);
        this.currentAnimation = this.animations.startRun;
    }

    toIdle() {
        this.states.set(PlayerMoveState, PlayerMoveState.idle);
        this.setIdle();
    }

    toFalling() {
        this.states.set(PlayerMoveState, PlayerMoveState.falling);
        this.currentAnimation = this.animations.falling;
    }

    idleToJumping() {
        this.states.set(PlayerMoveState, PlayerMoveState.startJumping);
        this.currentAnimation = this.animations.startJump;
    }

    fallingToLanding() {
        this.states.set(PlayerMoveState, PlayerMoveState.landing);
        this.currentAnimation = this.animations.land;
    }

    toDashing() {
        this.states.set(PlayerMoveState, PlayerMoveState.startDashing);
        this.currentAnimation = this.animations.dashStart;
    }

    stopDashing() {
        this.states.set(PlayerMoveState, PlayerMoveState.idle);
        this.states.set(PlayerDisplacementState, PlayerDisplacementState.idle);
        this.currentAnimation = this.animations.dashEnd;
    }

    runningToJumping() {
        this.states.set(PlayerMoveState, PlayerMoveState.startJumping);
        this.currentAnimation = this.animations.startJump;
    }

    landingToRunning() {
        this.states.set(PlayerMoveState, PlayerMoveState.startRunning);
        this.currentAnimation = this.animations.startRun;
    }

    dashingToDamaged() {
        this.states.set(PlayerMoveState, PlayerMoveState.damaged);
        this.states.set(PlayerDisplacementState, PlayerDisplacementState.idle);

        // Player stops when damaged while dashing
        this.tempState = PlayerMoveState.idle;
        this.currentAnimation = this.animations.damaged;
    }

    hoverToDamaged() {
        // TODO
    }

    jumpingToHover() {
        // TODO
    }

    fallingToHover() {
        // TODO
    }

    /**
     * Moves the player to the flip direction.
     */
    move() {
        if (this.currentAnimation !== this.animations.damaged) {
            this.x += this.flip ? -this.speed : this.speed;
        }
    }

    /**
     * Dashes the player to the flip direction.
     */
    dash() {
        if (this.dashDuration <= 0) {
            this.transitionTo(PlayerMoveState.stopDashing);
            this.dashDuration = this.desc.initDashDuration;
            return;
        }

        if (this.currentAnimation !== this.animations.damaged) {
            this.x += this.flip ? -this.dashSpeed : this.dashSpeed;
            this.dashDuration--;
        }
    }

    /**
     * @returns {Object<string, number>} animations object.
     */
    get animations() {
        return this.#animations;
    }

    /**
     * @returns {number} the dash duration.
     */
    get dashDuration() {
        return this.desc.dashDuration;
    }

    /**
     * @returns {{
     *   lives: number,
     *   moveSpeed: number,
     *   jumpForce: number,
     *   gravity: number,
     *   dashSpeed: number,
     *   initDashDuration: number,
     *   dashDuration: number,
     *   tempState: number
     * }} description of Player.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {number} previous player state.
     */
    get tempState() {
        return this.desc.tempState;
    }

    /**
     * @returns {number} gravity applied on player.
     */
    get gravity() {
        return this.desc.gravity;
    }

    /**
     * @returns {number} the dash speed.
     */
    get dashSpeed() {
        return this.desc.dashSpeed;
    }

    /**
     * @returns {number} jump force of the player.
     */
    get jumpForce() {
        return this.desc.jumpForce;
    }

    /**
     * @returns {number} number of available lives.
     */
    get lives() {
       return this.desc.lives;
    }

    /**
     * @returns {number} movement speed of the player.
     */
    get speed() {
        return this.desc.moveSpeed;
    }

    /**
     * @param v {number} new number of lives.
     */
    set lives(v) {
        this.desc.lives = v;
    }

    /**
     * @param v {number} remaining dash duration.
     */
    set dashDuration(v) {
        this.desc.dashDuration = v;
    }

    /**
     * @param v {number} new dash speed.
     */
    set dashSpeed(v) {
        this.desc.dashSpeed = v;
    }

    /**
     * @param v {number} new temp state.
     */
    set tempState(v) {
        this.desc.tempState = v;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get defaultHitBox() {
        return this.convertHitBoxes([
            {
                x: this.x,
                y: this.y + 32,
                width: 12,
                height: 17
            },
            {
                x: this.x + 16,
                y: this.y + 3,
                width: 14,
                height: 11
            },
            {
                x: this.x + 12,
                y: this.y + 14,
                width: 23,
                height: 35
            },
            {
                x: this.x + 8,
                y: this.y + 19,
                width: 4,
                height: 13
            },
        ]);
    }

    /**
     * Activates the key listeners
     */
    addListeners() {
        /**
         * @param e {KeyboardEvent}
         */
        const keyHoldHandler = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    if (this.states.get(PlayerDisplacementState) !== PlayerDisplacementState.dash) {
                        this.flip = true;
                        this.states.set(PlayerDisplacementState, PlayerDisplacementState.move);
                        this.transitionTo(PlayerMoveState.startRunning);
                    }
                    break;
                case 'ArrowRight':
                    if (this.states.get(PlayerDisplacementState) !== PlayerDisplacementState.dash) {
                        this.flip = false;
                        this.states.set(PlayerDisplacementState, PlayerDisplacementState.move);
                        this.transitionTo(PlayerMoveState.startRunning);
                    }
                    break;
            }
        };

        /**
         * @param e {KeyboardEvent}
         */
        const keyLiftHandler = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    if (this.states.get(PlayerDisplacementState) !== PlayerDisplacementState.dash) {
                        this.states.set(PlayerDisplacementState, PlayerDisplacementState.idle);
                        this.transitionTo(PlayerMoveState.idle);
                    }
                    break;
            }
        };

        /**
         * @param e {KeyboardEvent}
         */
        const keyPressHandler = (e) => {
            switch (e.key) {
                case ' ':
                    this.transitionTo(PlayerMoveState.startJumping);
                    break;
            }
        }

        /**
         * @param e {KeyboardEvent}
         */
        const doubleKeyPressHandler = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.flip = true;
                    this.states.set(PlayerDisplacementState, PlayerDisplacementState.dash);
                    this.transitionTo(PlayerMoveState.startDashing);
                    break;
                case 'ArrowRight':
                    this.flip = false;
                    this.states.set(PlayerDisplacementState, PlayerDisplacementState.dash);
                    this.transitionTo(PlayerMoveState.startDashing);
                    break;
            }
        }

        this.game.addDoubleKeyListener(doubleKeyPressHandler);
        this.game.addEventListener('keydown', keyHoldHandler);
        this.game.addEventListener('keypress', keyPressHandler);
        this.game.addEventListener('keyup', keyLiftHandler);
    }

    /**
     * Starts the player nova attack.
     */
    nova() {

    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);
    }

    /**
     * Sets the current animation to idle. Works based on HP.
     * Does not affect the state.
     */
    setIdle() {
        // Switch animation if player is low on health
        if (this.hp < this.initHp / 2) {
            this.currentAnimation = this.animations.idleTired;
        } else {
            this.currentAnimation = this.animations.idle;
        }
    }

    damage(value) {
        this.currentAnimation = this.animations.damaged;
        super.damage(value);
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "hero";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Player.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['x_0.png', 'x_1.png'];
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
        return Player.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Player.sounds;
    }
}
