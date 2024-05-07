import {Sprite} from "../../GameEngine";
import IrisBeam from "./IrisBeam.js";
import IrisCrystal, {CrystalState} from "./IrisCrystal.js";
import SuicideDrone from "./SuicideDrone.js";


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
 * State for the energy field.
 *
 * @type {{created: number, deformed: number}}
 */
const FieldState = {
    deformed: 0,
    created: 1,
    despawned: 2,
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
     * Total number of spawned drones.
     *
     * @type {number}
     * @private
     */
    #droneCount;

    /**
     * Iris's energy field
     *
     * @type IrisField,
     * @private
     */
    #crystalField;

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
     * Initial coordinates.
     *
     * @type {[number, number]}
     * @private
     */
    #initCoords;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param energyField {IrisField} iris energy field. Insert before iris.
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
        energyField,
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
                    case ActState.forming:
                        // If formed
                        switch (this.#crystal.states.get(CrystalState)) {
                            case CrystalState.formed:
                                switch (this.states.get(FieldState)) {
                                    case FieldState.deformed:
                                        this.states.set(FieldState, FieldState.created);

                                        // If not ready and the crystal has formed
                                        this.currentAnimation = this.animations.transitionAir;
                                        this.spawnField();
                                        break;
                                }
                                break;
                        }
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

        // Iris field
        this.#crystalField = energyField;

        // Drone count
        this.#droneCount = 0;

        // Initial coordinates
        this.#initCoords = [this.x, this.y];

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

                    if (this.states.get(FieldState) === FieldState.created) {
                        this.despawnCrystal();
                    }
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
            h: new IrisBeam(0, 0, this.scale, false, 500, () => {
                switch (this.states.get(FieldState)) {
                    case FieldState.despawned:
                        this.spawnCrystal();
                        this.states.set(FieldState, FieldState.created);
                        break;
                    case FieldState.created:
                        this.forwardRush();
                        break;
                }
            }),
            v: new IrisBeam(0, 0, this.scale, true, 600, () => {

            })
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
        this.states.set(FieldState, FieldState.deformed);

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
        return undefined;
    }

    /**
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);

        if (this.states.get(AttackState) === AttackState.laserGridWait) {
            this.drawAnimation(
                this.#energyField,
                this.x - 70,
                this.y + this.height / 2 - 23,
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
     * Returns iris back to initial position.
     */
    fallback() {
        // TODO returns iris back to initial position
    }

    /**
     * Starts the laser grid attack.
     */
    laserGrid() {
        // TODO make the crystal shoot a beam (make sure it spawns)
        // TODO make Iris fallback before attacking
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
     * Spawns drones when dashing.
     */
    spawnDrones() {
        if (this.states.get(AttackState) === AttackState.forwardRush) {
            this.game.insertSprites(
                new SuicideDrone(
                    this.x + this.width / 2 - 10,
                    this.y + this.height / 2,
                    this.scale,
                ),
                new SuicideDrone(
                    this.x + this.width / 2 - 10,
                    this.y + this.height / 2 - 50,
                    this.scale,
                ),
            )

            this.#droneCount += 2;

            // On the 16th drone switch to laserGrid
            if (this.#droneCount % 16 === 0) {
                this.laserGrid();
            }
        }
    }

    /**
     * Starts the crystal spawning sequence.
     */
    spawnCrystal() {
        const crystal = this.#crystal;

        if (this.states.get(ActState) === ActState.ready) {
            // TODO finish this
            this.currentAnimation = this.animations.idleGlow;

            crystal.x = this.x + this.width / 2 - crystal.width / 2;
            crystal.y = this.y + 50;
            this.game.insertSprite(crystal);
        } else {
            this.currentAnimation = this.animations.transitionStart;

            crystal.x = this.x + this.width / 2 - crystal.width / 2;
            crystal.y = this.y - 47;
            this.game.insertSprite(crystal);

            crystal.moveTo(
                crystal.x,
                crystal.y - 250,
                2,
                () => {
                    crystal.form();
                }
            );
        }
    }

    /**
     * De-spawns the crystal.
     */
    despawnCrystal() {
        this.#crystal.moveTo(
            this.#crystal.x,
            this.y,
            2,
            () => {
                this.game.removeSprite(this.#crystal);
                this.states.set(FieldState, FieldState.despawned);

                // Start the attack
                this.game.setTimeout(() => {
                    this.forwardRush();
                }, 50);
            }
        );
    }

    /**
     * Starts the field sequence.
     */
    spawnField() {
        const field = this.#crystalField;
        field.x = this.x;
        field.y = this.y - 150;
        field.by = this.y - this.height / 2;
        field.activate();
        field.y -= field.height;
        field.x -= field.width / 2 - this.width / 2;

        this.game.setTimeout(() => {
            field.deactivate();
            this.form();
        }, 100);
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
