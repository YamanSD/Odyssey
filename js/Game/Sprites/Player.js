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
 * State used while hovering.
 *
 * @type {{idle: number, up: number, down: number, float: number}}
 */
const PlayerVerticalDisplacementState = {
    idle: 0,
    up: 1,
    down: 2,
    float: 3,
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
     * Object containing the shooting animations of the player.
     *
     * @type {Object<string, number>}
     * @private
     */
    #shootingAnimations;

    /**
     * Maps IDs of animations from non-shooting to shooting.
     *
     * @type {Object<number, number>}
     * @private
     */
    #shootMap;

    /**
     * Maps IDs of animations from shooting to non-shooting.
     *
     * @type {Object<number, number>}
     * @private
     */
    #nonShootingMap;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of Player.
     * @param onUpdate {(function(number): boolean)?} called on each update cycle, with the current tick.
     * @param animateBackground {boolean?} if true, the background moves instead of the player.
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
        animateBackground,
        hitBoxBrush
    ) {
        let addedListeners = false;

        super(
            {
                lives: 2,
                moveSpeed: 8,
                dashSpeed: 16,
                hoverTimer: 0,
                maxHoverTimer: 240, // In ticks
                dashDuration: 40, // In ticks
                jumpForce: 10,
                gravity: 15,
                power: 1, // Power of the shot
                initDashDuration: 40, // In ticks
                tempAnimation: undefined,
                animateBg: animateBackground,
                mapMovement: 0,
            },
            [x, y],
            (t) => {
                switch (this.states.get(PlayerSpawnState)) {
                    case PlayerSpawnState.beaming:
                        const bCol = this.colliding(this.level);

                        if (bCol) {
                            this.states.set(PlayerSpawnState, PlayerSpawnState.spawning)

                            // Important switch to get idle animation height not spawn_1
                            this.setIdle();
                            this.by = bCol.collided.projectX(this.x);
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
                            if (this.desc.mapMovement === 1000) {
                                this.desc.mapMovement++;
                                this.desc.animateBg = false;

                                this.level.insertSprite(
                                    new Teleporter(
                                        240 * this.level.scale,
                                        150 * this.level.scale,
                                        this.level.scale,
                                        () => {
                                            this.progressLevel();
                                        }
                                    )
                                );
                            }
                            if (this.desc.mapMovement % 100 === 0) {
                                this.desc.mapMovement++;
                                this.level.spawnEnemies();
                            }


                            switch (this.states.get(PlayerAttackState)) {
                                case PlayerAttackState.charging:
                                    this.power++;
                                    break;
                            }

                            switch (this.states.get(PlayerDisplacementState)) {
                                case PlayerDisplacementState.move:
                                    this.move();
                                    break;
                                case PlayerDisplacementState.dash:
                                    this.dash();
                                    break;
                            }

                            switch (this.states.get(PlayerVerticalDisplacementState)) {
                                case PlayerVerticalDisplacementState.up:
                                    this.y -= 2;
                                    this.hoverTimer++;
                                    break;
                                case PlayerVerticalDisplacementState.down:
                                    this.y += 2;
                                    this.hoverTimer++;
                                    break;
                                case PlayerVerticalDisplacementState.float:
                                    this.hoverTimer++;
                                    break;
                            }

                            if (this.hoverTimer === this.desc.maxHoverTimer) {
                                this.transitionTo(PlayerMoveState.falling);
                                this.hoverTimer = 0;
                            }

                            const lvlCol = this.colliding(this.level);

                            switch (this.states.get(PlayerMoveState)) {
                                case PlayerMoveState.startJumping:
                                    if (lvlCol) {
                                        // TODO separate the collision
                                    }

                                    if (this.currentAnimation !== this.animations.damaged) {
                                        this.y -= this.jumpForce;
                                    } else {
                                        this.transitionTo(PlayerMoveState.falling);
                                    }
                                    break;
                                case PlayerMoveState.falling:
                                    this.y += this.gravity;

                                    if (lvlCol) {
                                        this.by = lvlCol.collided.projectX(this.x);
                                        this.transitionTo(PlayerMoveState.landing);
                                    }
                                    break;
                            }
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
            150,
        );

        // TODO add shooting animations and link
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
                    this.currentAnimation = this.tempAnimation;
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
            hoverIdle: this.createAnimation(
                1,
                265,
                999,
                3,
                1,
                3,
                33,
                64,
                1,
                0,
                3,
            ),
            hoverForward: this.createAnimation(
                1,
                15,
                1209,
                6,
                1,
                6,
                41,
                56,
                1,
                0,
                3,
            ),
            hoverBackward: this.createAnimation(
                1,
                15,
                1008,
                6,
                1,
                6,
                33,
                61,
                1,
                0,
                3,
            ),
            charge_0: this.createAnimation(
                3,
                5,
                121,
                9,
                1,
                9,
                84,
                84,
                1,
                0,
                2
            ),
            charge_1: this.createAnimation(
                2,
                9,
                8,
                7,
                1,
                7,
                47,
                46,
                1,
                0,
                2,
            )
        };
        this.#shootingAnimations = {
            idle: this.createAnimation(
                1,
                341,
                132,
                1,
                1,
                1,
                49,
                47,
                0,
                0,
                1
            ),
            startJump: this.createAnimation(
                1,
                27,
                297,
                7,
                1,
                7,
                40,
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
                322,
                1,
                1,
                1,
                38,
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
                322,
                3,
                1,
                3,
                44,
                55,
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
            startRun: this.createAnimation(
                1,
                14,
                572,
                3,
                1,
                3,
                45,
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
                569,
                8,
                1,
                8,
                53,
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
                728,
                5,
                 1,
                5,
                56,
                50,
                1,
                0,
                3,
                undefined,
                () => {
                    this.currentAnimation = this.animations.runLoop_0;
                }
            ),
            dashStart: this.createAnimation(
                1,
                14,
                896,
                3,
                1,
                3,
                62,
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
                880,
                1,
                1,
                1,
                66,
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
                890,
                4,
                1,
                4,
                48,
                46,
                1,
                0,
                3,
                undefined,
                () => {
                    this.setIdle();
                }
            ),
            hoverIdle: this.createAnimation(
                1,
                265,
                1064,
                3,
                1,
                3,
                39,
                64,
                1,
                0,
                3
            ),
            hoverForward: this.createAnimation(
                1,
                15,
                1266,
                6,
                1,
                6,
                55,
                56,
                1,
                0,
                3,
            ),
            hoverBackward: this.createAnimation(
                1,
                15,
                1070,
                5,
                1,
                5,
                34,
                61,
                1,
                0,
                3
            )
        };
        this.#shootMap = {};
        this.#nonShootingMap = {};
        // Link animations.
        this.link();

        this.states.set(PlayerVerticalDisplacementState, PlayerVerticalDisplacementState.idle);
        this.states.set(PlayerDisplacementState, PlayerDisplacementState.idle);
        this.states.set(PlayerMoveState, PlayerMoveState.idle);
        this.states.set(PlayerSpawnState, PlayerSpawnState.beaming);
        this.states.set(PlayerControlsState, PlayerControlsState.inactive);
        this.currentAnimation = this.#animations.spawn_0;
    }

    /**
     * @returns {number} current x.
     */
    get x() {
        return super.x;
    }

    /**
     * @param v {number} new x.
     */
    set x(v) {
        if (this.animateBg) {
                if (this.x !== v) {
                    this.desc.mapMovement++;
                    this.level.moveCurrentAnimation();
                }
        } else {
            super.x = v;
        }
    }

    /**
     * @returns {Segment}
     */
    get segment() {
        return Segment.simpleSegment(
            [this.x, this.y],
                [this.rx, this.y]
        );
    }

    /**
     * Links the shooting and normal animations.
     */
    link() {
        for (let k of Object.keys(this.#animations)) {
            if (k in this.#shootingAnimations) {
                const nid = this.#animations[k],
                    sid = this.#shootingAnimations[k];

                this.linkAnimations(sid, nid);
                this.#shootMap[nid] = sid;
                this.#nonShootingMap[sid] = nid;
            }
        }
    }

    /**
     * @param state {number} state to transition to.
     */
    transitionTo(state) {
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
                    case PlayerMoveState.hoverIdle:
                        this.toHover();
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
            case PlayerMoveState.hoverBackwards:
                // Fall through
            case PlayerMoveState.hoverForward:
                // Fall through
            case PlayerMoveState.hoverIdle:
                switch (state) {
                    case PlayerMoveState.hoverIdle:
                        this.currentAnimation = this.animations.hoverIdle;
                        this.states.set(PlayerDisplacementState, PlayerDisplacementState.idle);
                        break;
                    case PlayerMoveState.hoverForward:
                        this.currentAnimation = this.animations.hoverForward;
                        break;
                    case PlayerMoveState.hoverBackwards:
                        this.currentAnimation = this.animations.hoverBackward;
                        break;
                    case PlayerMoveState.startDashing:
                        this.states.set(PlayerVerticalDisplacementState, PlayerVerticalDisplacementState.idle);
                        this.toDashing();
                        break;
                    case PlayerMoveState.falling:
                        this.states.set(PlayerVerticalDisplacementState, PlayerVerticalDisplacementState.idle);
                        this.toFalling();
                        break;
                }
                break;
        }
    }

    /**
     * @returns {number|undefined} current animation.
     */
    get currentAnimation() {
        return super.currentAnimation;
    }

    /**
     * @param id {number} new current animations.
     */
    set currentAnimation(id) {
        if (this.states.get(PlayerAttackState) === PlayerAttackState.charging) {
            if (id in this.#shootMap) {
                super.currentAnimation = this.#shootMap[id];
            } else {
                super.currentAnimation = id;
            }
        } else {
            if (id in this.#nonShootingMap) {
                super.currentAnimation = this.#nonShootingMap[id];
            } else {
                super.currentAnimation = id;
            }
        }
    }

    toHover() {
        this.states.set(PlayerMoveState, PlayerMoveState.hoverIdle);
        this.currentAnimation = this.animations.hoverIdle;
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

    /**
     * Moves the player to the flip direction.
     */
    move() {
        if (this.currentAnimation === this.animations.hoverBackward) {
            this.x -= this.speed;
        } else {
            this.x += this.flip ? -this.speed : this.speed;
        }
    }

    /**
     * Dashes the player to the flip direction.
     */
    dash() {
        if (this.dashDuration <= 0) {
            this.y -= 19 * this.scale;
            this.transitionTo(PlayerMoveState.stopDashing);
            this.dashDuration = this.desc.initDashDuration;
            return;
        }

        // First dash
        if (this.dashDuration === this.desc.initDashDuration) {
            this.y += 19 * this.scale;
        }

        this.x += this.flip ? -this.dashSpeed : this.dashSpeed;
        this.dashDuration--;
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
     *   tempAnimation: number,
     *   hoverTimer: number,
     *   maxHoverTimer: number,
     *   power: number,
     *   animateBg: boolean,
     *   mapMovement: number
     * }} description of Player.
     */
    get desc() {
        return super.desc;
    }

    get animateBg() {
        return this.desc.animateBg;
    }

    /**
     * @returns {number}
     */
    get power() {
        return this.desc.power;
    }

    /**
     * @returns {number} previous player state.
     */
    get tempAnimation() {
        return this.desc.tempAnimation;
    }

    /**
     * @returns {number} current hover timer.
     */
    get hoverTimer() {
        return this.desc.hoverTimer;
    }

    /**
     * @returns {number} height of X.
     */
    get height() {
        return 49 * this.scale;
    }

    /**
     * @param v {number}
     */
    set hoverTimer(v) {
        this.desc.hoverTimer = v;
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
     * @param v {number}
     */
    set power(v) {
        this.desc.power = v;
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
     * @param v {number} new temp animations.
     */
    set tempAnimation(v) {
        this.desc.tempAnimation = v;
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
     * Charges the shot.
     */
    charge() {
        if (this.states.get(PlayerAttackState) !== PlayerAttackState.charging) {
            this.states.set(PlayerAttackState, PlayerAttackState.charging);

            // To switch the animation to shooting
            this.currentAnimation = this.#shootMap[this.currentAnimation];
        }
    }

    /**
     * @returns {number} actual shot power.
     */
    get shotPower() {
        return Math.ceil(this.power / 12);
    }

    /**
     * Fires the shot.
     */
    shoot() {
        this.states.set(PlayerAttackState, PlayerAttackState.none);

        // To switch the animation to non shooting
        this.currentAnimation = this.currentAnimation;

        this.level.insertSprite(
            new BusterShot(
                this.flip ? this.x : (this.rx - 30),
                this.y + this.height / 2 - 22,
                this.flip,
                Math.min(4, this.shotPower),
                this.scale
            )
        );

        this.power = 0;
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

                        if (this.states.get(PlayerMoveState) === PlayerMoveState.hoverIdle) {
                            this.flip = false;
                            this.transitionTo(PlayerMoveState.hoverBackwards);
                        } else {
                            this.transitionTo(PlayerMoveState.startRunning);
                        }
                    }
                    break;
                case 'ArrowRight':
                    if (this.states.get(PlayerDisplacementState) !== PlayerDisplacementState.dash) {
                        this.flip = false;
                        this.states.set(PlayerDisplacementState, PlayerDisplacementState.move);

                        if (this.states.get(PlayerMoveState) === PlayerMoveState.hoverIdle) {
                            this.transitionTo(PlayerMoveState.hoverForward);
                        } else {
                            this.transitionTo(PlayerMoveState.startRunning);
                        }
                    }
                    break;
                case 'ArrowDown':
                    if (this.states.get(PlayerVerticalDisplacementState) === PlayerVerticalDisplacementState.float) {
                        this.states.set(PlayerVerticalDisplacementState, PlayerVerticalDisplacementState.down);
                    }
                    break;
                case 'ArrowUp':
                    if (this.states.get(PlayerVerticalDisplacementState) === PlayerVerticalDisplacementState.float) {
                        this.states.set(PlayerVerticalDisplacementState, PlayerVerticalDisplacementState.up);
                    }
                    break;
                case 'x':
                    this.charge();
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

                        if (this.states.get(PlayerMoveState) === PlayerMoveState.hoverIdle) {
                            this.transitionTo(PlayerMoveState.hoverIdle);
                        } else {
                            this.transitionTo(PlayerMoveState.idle);
                        }
                    }
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    this.states.set(PlayerVerticalDisplacementState, PlayerVerticalDisplacementState.float);
                    break;
                case 'x':
                    this.shoot();
                    break;
            }
        };

        /**
         * @param e {KeyboardEvent}
         */
        const keyPressHandler = (e) => {
            switch (e.key) {
                case ' ':
                    if (
                        this.states.get(PlayerMoveState) === PlayerMoveState.falling
                        || this.states.get(PlayerMoveState) === PlayerMoveState.startJumping
                ) {
                        this.states.set(PlayerVerticalDisplacementState, PlayerVerticalDisplacementState.float);
                        this.transitionTo(PlayerMoveState.hoverIdle);
                    } else {
                        this.transitionTo(PlayerMoveState.startJumping);
                    }
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
     * Moves the current animation.
     */
    moveCurrentAnimation() {
        if (this.states.get(PlayerAttackState) === PlayerAttackState.charging && this.shotPower >= 1.5) {
            this.moveAnimation(
                this.animations.charge_0
            );
            this.moveAnimation(
                this.animations.charge_1
            );
        } else {
            this.resetAnimation(
                this.animations.charge_0
            );
            this.resetAnimation(
                this.animations.charge_1
            );
        }

        super.moveCurrentAnimation();
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        if (this.states.get(PlayerAttackState) === PlayerAttackState.charging && this.shotPower >= 1.5) {
            this.drawAnimation(
                this.animations.charge_0,
                this.x - (this.flip ? 10 : 25) * this.scale,
                this.y - 15 * this.scale,
                context
            );
            this.drawAnimation(
                this.animations.charge_1,
                this.x - (this.flip ? -1 : 1) * 5 * this.scale,
                this.y + 2 * this.scale,
                context
            );
        }

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
        this.tempAnimation = this.currentAnimation;
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
        return ['x_0.png', 'x_1.png', 'x_2.png', 'x_3.gif'];
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

    restartLevel() {

    }

    progressLevel() {

    }

    /**
     * Destroys the sprite
     */
    destroy() {
        // TODO implement player death
        const level = this.level;

        for (let i = 0; i < this.initHp / 10; i++) {
            this.game.setTimeout(() => {
                const e = new Explosion(
                    this.x + (-10 + Math.random() * 20),
                    this.y + (-10 + Math.random() * 20),
                    this.scale
                )

                level.insertSprite(e);

                e.start();
            }, i * 10);
        }

        this.level.removeSprite(this);
    }

}
