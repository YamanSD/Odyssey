'use strict'

/**
 * @exports GigaDeath
 */


/**
 * State used to track the last shot state.
 *
 * @type {{noShot: number, shot: number}}
 */
const ShotState = {
    noShot: 0,
    shot: 1
};

/**
 * @class GigaDeath
 *
 * Class representing the giga death enemy.
 */
class GigaDeath extends Sprite {
    /**
     * Cool down period.
     *
     * @type {number}
     * @private
     */
    #coolDown;

    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param toLeft {boolean} true to throw the giga death to the left.
     * @param scale {number} scale of GigaDeath.
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
        toLeft,
        scale,
        hitBoxBrush
    ) {
        super(
            {},
            [x, y],
            () => {
                const py = this.player.y;

                switch (this.states.get(ShotState)) {
                    case ShotState.shot:
                        this.x -= 2;
                        this.states.set(ShotState, ShotState.noShot);
                        break;
                }

                // If player in range
                if (this.y <= py && py <= this.by && this.#coolDown <= 0) {
                    this.shoot();

                    // Reset the cool down
                    this.#coolDown = 200;
                }

                this.#coolDown--;
            },
            undefined,
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            scale
        );

        // Initialize the speed vector
        this.#coolDown = 200;

        this.currentAnimation = this.createAnimation(
            0,
            118,
            265,
            1,
            1,
            1,
            84,
            74,
            0,
            0,
            1,
        );

        // Shot state
        this.states.set(ShotState, ShotState.noShot);

        // Flip the sprite
        if (!toLeft) {
            this.flip = true;
        }
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of GigaDeath.
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
                width: 118,
                height: 265
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
    }

    /**
     * Shoots two rockets.
     */
    shoot() {
        this.x += 2;

        // Update the shot state
        this.states.set(ShotState, ShotState.shot);

        this.game.insertSprites(
            new Rocket(
                this.level,
                this.x,
                this.y + 46 * this.scale,
                !this.flip,
                2
            ),
            new Rocket(
                this.level,
                this.x,
                this.y + 51 * this.scale,
                !this.flip,
                2
            )
        );
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "enemy";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return GigaDeath.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['gigadeath.png'];
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
        return GigaDeath.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return GigaDeath.sounds;
    }
}
