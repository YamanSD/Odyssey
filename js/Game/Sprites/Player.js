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
 * States for the player move state.
 *
 * @type {{startRun: number, run: number, startJump: number, hoverIdle: number, idle: number, wallSlide: number, endJump: number, dash: number, hoverForwards: number, jump: number, hoverBackwards: number, nova: number}}
 */
const PlayerMoveState = {
    idle: 0,
    startRun: 1,
    run: 2,
    startJump: 4,
    jump: 5,
    endJump: 6,
    hoverIdle: 7,
    hoverBackwards: 8,
    hoverForwards: 9,
    dash: 10,
    wallSlide: 11,
    nova: 12
};

/**
 * States for whether the player is moving horizontally or not.
 *
 * @type {{move: number, idle: number}}
 */
const PlayerDisplacementState = {
    idle: 0,
    move: 1,
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
        let keyDownId = undefined, keyUpId = undefined;

        super(
            {
                lives: 2,
                moveSpeed: 8,
                jumpForce: 10,
                gravity: 15,
            },
            [x, y],
            (t) => {
                switch (this.states.get(PlayerSpawnState)) {
                    case PlayerSpawnState.beaming:
                        const col = this.colliding(this.level);

                        if (col) {
                            this.states.set(PlayerSpawnState, PlayerSpawnState.spawning)

                            // Important switch to get idle animation height not spawn_1
                            this.currentAnimation = this.animations.idle;
                            this.by = col.collided.projectX(this.x);
                            this.currentAnimation = this.animations.spawn_1;

                            // Recenter from beam going down
                            this.x -= 32 * scale;
                        } else {
                            this.y += 30;
                        }

                        break;
                    case PlayerSpawnState.spawned:
                        if (keyDownId === undefined) {
                            /**
                             * @param e {KeyboardEvent}
                             */
                            const keyPressHandler = (e) => {
                                switch (e.key) {
                                    case 'ArrowLeft':
                                        this.flip = true;

                                        if (this.states.get(PlayerMoveState) === PlayerMoveState.idle) {
                                            this.states.set(PlayerMoveState, PlayerMoveState.startRun);
                                        }

                                        this.states.set(PlayerDisplacementState, PlayerDisplacementState.move);
                                        break;
                                    case 'ArrowRight':
                                        this.flip = false;

                                        if (this.states.get(PlayerMoveState) === PlayerMoveState.idle) {
                                            this.states.set(PlayerMoveState, PlayerMoveState.startRun);
                                        }

                                        this.states.set(PlayerDisplacementState, PlayerDisplacementState.move);
                                        break;
                                    case ' ':
                                        if (!this.isInAir) {
                                            this.states.set(PlayerMoveState, PlayerMoveState.startJump);
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
                                        this.states.set(PlayerDisplacementState, PlayerDisplacementState.idle);

                                        if (
                                            this.states.get(PlayerMoveState) === PlayerMoveState.run
                                            || this.states.get(PlayerMoveState) === PlayerMoveState.startRun
                                        ) {
                                            this.states.set(PlayerMoveState, PlayerMoveState.idle);
                                        }
                                        break;
                                }
                            };

                            keyDownId = this.game.addEventListener('keydown', keyPressHandler);
                            keyUpId = this.game.addEventListener('keyup', keyLiftHandler);
                        }

                        // If not active do not take commands
                        if (this.states.get(PlayerControlsState) === PlayerControlsState.active) {
                            switch (this.states.get(PlayerDisplacementState)) {
                                case PlayerDisplacementState.move:
                                    this.x += this.flip ? -this.speed : this.speed;
                                    break;
                            }

                            switch (this.states.get(PlayerMoveState)) {
                                case PlayerMoveState.idle:
                                    this.setIdle();
                                    break;
                                case PlayerMoveState.startRun:
                                    this.currentAnimation = this.animations.startRun;
                                    this.states.set(PlayerMoveState, PlayerMoveState.run);
                                    break;
                                case PlayerMoveState.startJump:
                                    this.y -= this.jumpForce;
                                    this.currentAnimation = this.animations.startJump;
                                    break;
                                case PlayerMoveState.jump:
                                    const col = this.colliding(this.level);

                                    this.currentAnimation = this.animations.jump;
                                    this.y += this.gravity;

                                    if (col) {
                                        this.states.set(PlayerMoveState, PlayerMoveState.endJump);

                                        this.setIdle();
                                        this.by = col.collided.projectX(this.x);
                                    }
                                    break;
                                case PlayerMoveState.endJump:
                                    this.currentAnimation = this.animations.land;
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
                    this.currentAnimation = this.animations.idle;
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
                5,
                undefined,
                () => {
                    this.currentAnimation = this.animations.idle;
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
                    this.states.set(PlayerMoveState, PlayerMoveState.jump);
                }
            ),
            jump: this.createAnimation(
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
                4,
                undefined,
                () => {
                    if (this.states.get(PlayerDisplacementState) === PlayerDisplacementState.idle) {
                        this.states.set(PlayerMoveState, PlayerMoveState.idle);
                    } else {
                        this.currentAnimation = this.animations.runLoop_0;
                        this.states.set(PlayerMoveState, PlayerMoveState.run);
                    }
                }
            )
        };

        this.states.set(PlayerDisplacementState, PlayerDisplacementState.idle);
        this.states.set(PlayerAttackState, PlayerAttackState.none);
        this.states.set(PlayerMoveState, PlayerMoveState.idle);
        this.states.set(PlayerSpawnState, PlayerSpawnState.beaming);
        this.states.set(PlayerControlsState, PlayerControlsState.inactive);
        this.currentAnimation = this.#animations.spawn_0;
    }

    /**
     * @returns {Object<string, number>} animations object.
     */
    get animations() {
        return this.#animations;
    }

    /**
     * @returns {{
     *   lives: number,
     *   moveSpeed: number,
     *   jumpForce: number,
     *   gravity: number
     * }} description of Player.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {boolean} true if the player is in the air.
     */
    get isInAir() {
        const airStates = new Set([
            PlayerMoveState.startJump,
            PlayerMoveState.jump,
            PlayerMoveState.hoverIdle,
            PlayerMoveState.hoverBackwards,
            PlayerMoveState.hoverForwards,
            PlayerMoveState.nova
        ]);

        const s = this.states.get(PlayerMoveState);

        return airStates.has(s);
    }

    /**
     * @returns {number} gravity applied on player.
     */
    get gravity() {
        return this.desc.gravity;
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
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);
    }

    /**
     * Sets the moving state to idle. Works based on HP.
     */
    setIdle() {
        // Switch animation if player is low on health
        if (this.hp <= this.initHp / 2 && this.currentAnimation === this.animations.idle) {
            this.currentAnimation = this.animations.idleTired;
        } else if (this.hp > this.initHp / 2 && this.currentAnimation === this.animations.idleTired) {
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
