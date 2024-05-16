'use strict'

/**
 * @exports Iris
 */


/**
 * State for the activity of Iris.
 *
 * @type {{forming: number, active: number, ready: number}}
 */
const IrisActState = {
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
const IrisAttackState = {
    none: 0,
    forwardRush: 1,
    laserGrid: 2,
    laserGridWait: 3,
    // For the fallback
    goUp: 4,
    goBack: 5,
    goDown: 6,
    inBetween: 7
};

/**
 * State for the crystal attack.
 *
 * @type {{ready: number, notReady: number}}
 */
const CrystalAttackState = {
    notReady: 0,
    ready: 1,
    spawning: 2,
    follow: 3,
    attacking: 4,
};

/**
 * @class Iris
 *
 * Class representing the Iris boss.
 */
class Iris extends Sprite {
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
        let startedDialog = false;

        super(
            {},
            [x, y],
            () => {
                if (!startedDialog) {
                    startedDialog = true;

                    let sentence = 0

                    const d = new Dialog(
                        "Iris what are you doing here?",
                        DialogType.x,
                        undefined,
                        () => {
                            if (sentence === 0) {
                                d.dialogType = DialogType.iris;
                                d.dialog = "I am here to kill you!";
                                sentence++;
                            } else if (sentence === 1) {
                                d.dialogType = DialogType.x;
                                d.dialog = "IRIS NO WAIT!";
                                sentence++;
                            } else {
                                const hpB = new HealthBar(
                                    HealthBarType.iris,
                                    this,
                                    this.level.scale
                                );

                                this.level.insertSprite(hpB);

                                this.spawnCrystal();
                                d.endDialog();
                            }
                        }
                    );

                    this.game.insertSprite(
                        d
                    );
                }

                if (this.states.get(CrystalAttackState) === CrystalAttackState.follow) {
                    this.#crystal.moveTo(this.player.rx, this.player.by, 6);
                }

                // Handle activity states
                switch (this.states.get(IrisActState)) {
                    case IrisActState.ready:
                        break;
                    case IrisActState.active:
                        this.states.set(IrisActState, IrisActState.forming);

                        this.game.setTimeout(() => {
                            // Change to idle from idleGlow
                            this.x += 6;
                            this.y += 6;

                            this.states.set(IrisActState, IrisActState.ready);
                            this.currentAnimation = this.animations.idle;
                        }, 20);
                        break;
                    case IrisActState.forming:
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
                switch (this.states.get(IrisAttackState)) {
                    case IrisAttackState.forwardRush:
                        this.moveTo(this.player.x, this.player.y - this.player.height, 1);
                        break;
                    case IrisAttackState.laserGrid:
                        this.states.set(IrisAttackState, IrisAttackState.laserGridWait);
                        break;
                    case IrisAttackState.goUp:
                        this.moveTo(
                            this.x,
                            this.initY - 500,
                            4,
                            () => {
                                this.currentAnimation = this.animations.goBackwards;
                                this.states.set(IrisAttackState, IrisAttackState.goBack);
                            }
                        );
                        break;
                    case IrisAttackState.goDown:
                        this.moveTo(
                            this.x,
                            this.initY,
                            4,
                            () => {
                                this.laserGrid();
                            }
                        )
                        break;
                    case IrisAttackState.goBack:
                        this.moveTo(
                            this.initX,
                            this.y,
                            4,
                            () => {
                                this.currentAnimation = this.animations.moveDown;
                                this.states.set(IrisAttackState, IrisAttackState.goDown);
                            }
                        );
                        break;
                }

                this.moveCurrentAnimation();
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale,
            1000
        );

        // Iris field
        this.#crystalField = energyField;

        // Drone count
        this.#droneCount = 0;

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

                    this.states.set(IrisActState, IrisActState.active);
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
                2,
                1,
                2,
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
            h: new IrisBeam(0, 0, this.scale, false, 400, () => {
                switch (this.states.get(FieldState)) {
                    case FieldState.despawned:
                        if (this.states.get(CrystalAttackState) === CrystalAttackState.notReady) {
                            this.spawnCrystal();
                        }
                        break;
                    case FieldState.created:
                        this.forwardRush();
                        break;
                }
            }),
            v: new IrisBeam(0, 0, this.scale, true, 500, () => {
                this.states.set(CrystalAttackState, CrystalAttackState.follow);
            })
        };

        // Initialize the iris crystal
        this.#crystal = new IrisCrystal(0, 0, this.scale, this.#beams.v);

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

        this.states.set(IrisActState, IrisActState.forming);
        this.states.set(IrisAttackState, IrisAttackState.none);
        this.states.set(FieldState, FieldState.deformed);
        this.states.set(CrystalAttackState, CrystalAttackState.notReady);

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
     * Draws the rectangle in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        this.drawCurrentAnimation(this.x, this.y, context);

        if (this.states.get(IrisAttackState) === IrisAttackState.laserGridWait) {
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
        if (this.states.get(CrystalAttackState) === CrystalAttackState.ready) {
            this.currentAnimation = this.animations.formLeftHand_0;
        }
    }

    moveCurrentAnimation() {
        if (this.states.get(IrisAttackState) === IrisAttackState.laserGridWait) {
            this.moveAnimation(this.#energyField);
        }

        super.moveCurrentAnimation();
    }

    /**
     * Starts the forward rush attack.
     */
    forwardRush() {
        if (this.states.get(IrisActState) === IrisActState.ready) {
            this.currentAnimation = this.animations.moveForward;
            this.states.set(IrisAttackState, IrisAttackState.forwardRush);
        }
    }

    /**
     * Returns iris back to initial position.
     */
    fallback() {
        // Set to going up
        this.states.set(IrisAttackState, IrisAttackState.goUp);

        this.currentAnimation = this.animations.prepareBackwards;
    }

    /**
     * Starts the laser grid attack.
     */
    laserGrid() {
        if (this.states.get(IrisActState) === IrisActState.ready) {
            this.currentAnimation = this.animations.shootBeam;
            this.states.set(IrisAttackState, IrisAttackState.laserGrid);

            // Reference
            const hBeam = this.#beams.h;

            hBeam.start();
            hBeam.x = this.x - hBeam.width - 20;
            hBeam.y = this.y + this.height / 2 - hBeam.height / 3;

            // Check if the crystal has spawned.
            if (this.states.get(CrystalAttackState) === CrystalAttackState.follow) {
                const vBeam = this.#beams.v;

                vBeam.start();
                this.states.set(CrystalAttackState, CrystalAttackState.attacking);

                this.level.insertSprite(vBeam);
            }

            this.level.insertSprite(hBeam);
        }
    }

    /**
     * Spawns drones when dashing.
     */
    spawnDrones() {
        if (this.states.get(IrisAttackState) === IrisAttackState.forwardRush) {
            this.level.insertSprites(
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
                this.fallback();
            }
        }
    }

    /**
     * Starts the crystal spawning sequence.
     */
    spawnCrystal() {
        const crystal = this.#crystal;

        if (this.states.get(IrisActState) === IrisActState.ready) {
            this.currentAnimation = this.animations.idleGlow;

            // Stop attacks
            this.states.set(IrisAttackState, IrisAttackState.none);

            crystal.x = this.x + this.width / 2 - crystal.width / 2;
            crystal.y = this.y + 50;
            this.level.insertSprite(crystal);

            // Pauses the attacks
            this.states.set(CrystalAttackState, CrystalAttackState.spawning);

            crystal.moveTo(
                crystal.x,
                this.initY - 250,
                3,
                () => {
                    this.states.set(FieldState, FieldState.created);
                    this.states.set(CrystalAttackState, CrystalAttackState.follow);
                }
            );
        } else {
            this.currentAnimation = this.animations.transitionStart;

            crystal.x = this.x + this.width / 2 - crystal.width / 2;
            crystal.y = this.y - 47;
            this.level.insertSprite(crystal);

            crystal.moveTo(
                crystal.x,
                crystal.y - 250,
                2,
                () => {
                    crystal.form();
                }
            );

            this.states.set(CrystalAttackState, CrystalAttackState.ready);
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
                this.level.removeSprite(this.#crystal);
                this.states.set(FieldState, FieldState.despawned);
                this.states.set(CrystalAttackState, CrystalAttackState.notReady);

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
        this.spawnDrones();
        super.damage(value);
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

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['iris_0.png'];
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
        return Iris.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return Iris.sounds;
    }
    /**
     * Destroys the sprite
     */
    destroy() {
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
