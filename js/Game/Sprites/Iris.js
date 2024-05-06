import {Sprite} from "../../GameEngine";
import IrisBeam from "./IrisBeam.js";
import IrisCrystal from "./IrisCrystal.js";


/**
 * State for the activity of Iris.
 *
 * @type {{forming: number, active: number, ready: number}}
 */
const ActState = {
    forming: 0,
    active: 1,
    ready: 2,
};

/**
 * State for the attacks of Iris.
 *
 * @type {{none: number, forwardRush: number, laserGrid: number, laserGridWait: number}}
 */
const AttackState = {
    none: 0,
    forwardRush: 1,
    laserGrid: 2,
    laserGridWait: 3,
};

/**
 * @class Iris
 *
 * Class representing the Iris boss.
 */
export default class Iris extends Sprite {
    /**
     * Object containing the animations of Iris.
     *
     * @type {Object<string, number>}
     * @private
     */
    #animations;

    /**
     * Energy field animation.
     *
     * @type {number}
     * @private
     */
    #energyField;

    /**
     * Iris's crystal
     *
     * @type {IrisCrystal | undefined}
     * @private
     */
    #crystal;

    /**
     * Laser beams.
     *
     * @type {{
     *     h: IrisBeam,
     *     v: IrisBeam
     * }}
     * @private
     */
    #beams;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of Iris.
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
        hitBoxBrush
    ) {
        super(
            {},
            ['iris_0.gif'],
            [x, y],
            () => {
                // Handle activity states
                switch (this.states.get(ActState)) {
                    case ActState.ready:
                        break;
                    case ActState.active:
                        this.states.set(ActState, ActState.forming);

                        this.game.setTimeout(() => {
                            // Change to idle from idleGlow
                            this.x += 6;
                            this.y += 6;

                            this.states.set(ActState, ActState.ready);
                            this.currentAnimation = this.animations.idle;
                        }, 20);
                        break;
                }

                // Handle attack states
                switch (this.states.get(AttackState)) {
                    case AttackState.forwardRush:
                        this.moveTo(this.player.x, this.player.y - this.player.height, 1);
                        break;
                    case AttackState.laserGrid:

                        this.states.set(AttackState, AttackState.laserGridWait);
                        break;
                }

                this.moveCurrentAnimation();
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale
        );

        // Create the animations
        this.#animations = {
            idleHuman: this.createAnimation(
                0,
                86,
                50,
                4,
                1,
                4,
                32,
                45,
                1,
                0,
                4
            ),
            transitionStart: this.createAnimation(
                0,
                246,
                44,
                1,
                1,
                1,
                27,
                51,
                0,
                0,
                1
            ),
            transitionAir: this.createAnimation(
                0,
                279,
                46,
                4,
                1,
                4,
                34,
                51,
                1,
                0,
                4
            ),
            humanDead: this.createAnimation(
                0,
                436,
                81,
                1,
                1,
                1,
                54,
                18,
                0,
                0,
                1
            ),
            formLeftHand_0: this.createAnimation(
                0,
                154,
                115,
                2,
                1,
                2,
                35,
                56,
                1,
                0,
                4,
                undefined,
                () => {
                    // Center calibration
                    this.x -= 18;

                    this.currentAnimation = this.animations.formLeftHand_1;
                }
            ),
            formLeftHand_1: this.createAnimation(
                0,
                234,
                115,
                2,
                1,
                2,
                43,
                53,
                1,
                0,
                4,
                undefined,
                () => {
                    // Center calibration
                    this.x += 6;

                    this.currentAnimation = this.animations.formLeftHand_2;
                }
            ),
            formLeftHand_2: this.createAnimation(
                0,
                333,
                115,
                5,
                1,
                5,
                45,
                51,
                1,
                0,
                4,
                undefined,
                () => {
                    this.currentAnimation = this.animations.formChest;
                }
            ),
            formChest: this.createAnimation(
                0,
                107,
                183,
                5,
                1,
                5,
                43,
                51,
                1,
                0,
                4,
                undefined,
                () => {
                    // Center calibration
                    this.x -= 64;

                    this.currentAnimation = this.animations.formRightHand;
                }
            ),
            formRightHand: this.createAnimation(
                0,
                410,
                183,
                4,
                1,
                4,
                67,
                51,
                1,
                0,
                4,
                undefined,
                () => {
                    this.x += 3;

                    this.currentAnimation = this.animations.formLegs;
                }
            ),
            formLegs: this.createAnimation(
                0,
                41,
                252,
                9,
                1,
                9,
                66,
                83,
                1,
                0,
                4,
                undefined,
                () => {
                    // Calibrate center
                    this.x += 3;
                    this.y -= 78;

                    this.currentAnimation = this.animations.formWings_0;
                }
            ),
            formWings_0: this.createAnimation(
                0,
                7,
                348,
                3,
                1,
                3,
                98,
                109,
                1,
                0,
                4,
                undefined,
                () => {
                    // Calibrate center
                    this.y -= 11;

                    this.currentAnimation = this.animations.formWings_1;
                }
            ),
            formWings_1: this.createAnimation(
                0,
                304,
                344,
                3,
                1,
                3,
                126,
                113,
                1,
                0,
                4,
                undefined,
                () => {
                    // Calibrate center
                    this.y += 6;

                    this.currentAnimation = this.animations.formHelmet;
                }
            ),
            formHelmet: this.createAnimation(
                0,
                44,
                475,
                4,
                1,
                4,
                124,
                111,
                1,
                0,
                4,
                undefined,
                () => {
                    this.currentAnimation = this.animations.formFinish_0;
                }
            ),
            idle: this.createAnimation(
                0,
                544,
                475,
                1,
                1,
                1,
                124,
                111,
                0,
                0,
                1
            ),
            idleGlow: this.createAnimation(
                0,
                15,
                596,
                1,
                1,
                1,
                128,
                115,
                0,
                0,
                1
            ),
            formFinish_0: this.createAnimation(
                0,
                162,
                598,
                2,
                1,
                2,
                124,
                111,
                1,
                0,
                15,
                undefined,
                () => {
                    this.currentAnimation = this.animations.formFinish_1;
                }
            ),
            formFinish_1: this.createAnimation(
                0,
                426,
                612,
                2,
                1,
                2,
                143,
                97,
                1,
                0,
                15,
                undefined,
                () => {
                    // Calibrate center
                    this.x -= 14;
                    this.y -= 40;

                    this.states.set(ActState, ActState.active);
                    this.currentAnimation = this.animations.idleGlow;
                }
            ),
            moveForward: this.createAnimation(
                0,
                115,
                724,
                4,
                1,
                4,
                120,
                111,
                1,
                0,
                4
            ),
            moveDown: this.createAnimation(
                0,
                59,
                845,
                4,
                1,
                4,
                144,
                88,
                1,
                0,
                4
            ),
            prepareBackwards: this.createAnimation(
                0,
                94,
                943,
                4,
                1,
                4,
                127,
                111,
                1,
                0,
                4
            ),
            goBackwards: this.createAnimation(
                0,
                7,
                1067,
                4,
                1,
                4,
                173,
                115,
                1,
                0,
                4
            ),
            shootBeam: this.createAnimation(
                0,
                89,
                1191,
                4,
                1,
                4,
                131,
                112,
                1,
                0,
                4
            ),
            dead: this.createAnimation(
                0,
                559,
                1554,
                1,
                1,
                1,
                151,
                91,
                0,
                0,
                1
            )
        };

        // Initialize the iris beams
        this.#beams = {
            h: new IrisBeam(0, 0, this.scale, false, 500),
            v: new IrisBeam(0, 0, this.scale, true, 600)
        };

        // Initialize the iris crystal
        this.#crystal = new IrisCrystal(0, 0, this.scale);

        this.#energyField = this.createAnimation(
            0,
            353,
            1536,
            2,
            2,
            4,
            90,
            86,
            1,
            1,
            4
        );

        this.states.set(ActState, ActState.forming);
        this.states.set(AttackState, AttackState.none);

        this.currentAnimation = this.animations.idleHuman;
    }

    /**
     * @returns {Object<string, number>} animations object.
     */
    get animations() {
        return this.#animations;
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of Iris.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {HitBox[]} the smallest rectangle that surrounds the shape.
     */
    get defaultHitBox() {
        return this.convertHitBoxes([
            {
                x: this.x,
                y: this.y,
                width: 127,
                height: 111
            }
        ]);
    }

    /**
     * @returns {number} current width of the animation.
     */
    get width() {
        if (this.currentAnimation === undefined) {
            return 0;
        }

        return this.scale * this.getAnimation(this.currentAnimation).singleWidth;
    }

    /**
     * @returns {number} current height of the animation.
     */
    get height() {
        if (this.currentAnimation === undefined) {
            return 0;
        }

        return this.scale * this.getAnimation(this.currentAnimation).singleHeight;
    }

    /**
     * @returns {Sprite} a clone of this sprite.
     */
    get clone() {
        return new Iris(
            this.x,
            this.y,
            this.scale,
            this.hitBoxBrush
        );
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @Abstract
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);

        if (this.states.get(AttackState) === AttackState.laserGridWait) {
            this.drawAnimation(
                this.#energyField,
                this.x / this.scale - this.width + 60,
                this.y / this.scale + 133,
                context,
                1
            );
        }
    }

    /**
     * Starts the formation of Iris.
     */
    form() {
        this.currentAnimation = this.animations.formLeftHand_0;
    }

    moveCurrentAnimation() {
        if (this.states.get(AttackState) === AttackState.laserGridWait) {
            this.moveAnimation(this.#energyField);
        }

        super.moveCurrentAnimation();
    }

    /**
     * Starts the forward rush attack.
     */
    forwardRush() {
        if (this.states.get(ActState) === ActState.ready) {
            this.currentAnimation = this.animations.moveForward;
            this.states.set(AttackState, AttackState.forwardRush);
        }
    }

    /**
     * Starts the laser grid attack.
     */
    laserGrid() {
        if (this.states.get(ActState) === ActState.ready) {
            this.currentAnimation = this.animations.shootBeam;
            this.states.set(AttackState, AttackState.laserGrid);

            // Reference
            const hBeam = this.#beams.h;

            hBeam.start();
            hBeam.x = this.x - hBeam.width - 20;
            hBeam.y = this.y + this.height / 2 - hBeam.height / 3;

            this.game.insertSprite(hBeam);
        }
    }

    /**
     * Initializes the crystal spawning sequence.
     */
    spawnCystal() {

    }

    /**
     * @param value {number} value of the damage.
     */
    damage(value) {
        // TODO
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "boss";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return Iris.type;
    }
}
