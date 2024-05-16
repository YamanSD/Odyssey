/**
 * @exports SigmaLaser
 */

/**
 * @class SigmaLaser
 *
 * Class representing lasers in canvas.
 */
class SigmaLaser extends Sprite {
    /**
     * Coordinates for the second point.
     *
     * @type {[number, number]}
     * @private
     */
    #coords1;

    /**
     * True if the laser is red (and thus more deadly).
     *
     * @type {boolean}
     * @private
     */
    #red;

    /**
     * @param x {number} starting x-coordinate of the laser.
     * @param y {number} starting y-coordinate of the laser.
     * @param groundY {number} y-coordinate of the ground.
     * @param maxRotation {number} maxRotation to rotate by.
     * @param toLeft {boolean} if true the laser shoots to the left.
     * @param onEnd {function()?} callback function when the laser ends.
     * @param speed {number?} speed of rotation of the laser from staring point to end point.
     * @param duration {number?} duration of the laser after reaching its destination. Does not end if not given.
     * @param red {boolean?} true if the laser is red and thus more deadly.
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
        groundY,
        maxRotation,
        toLeft,
        onEnd,
        speed = 2,
        duration,
        red,
        hitBoxBrush
    ) {
        if (!toLeft) {
            maxRotation *= -1;
        }

        // Used to not set multiple timeout timers
        let haveTimeout=  false;

        super(
            {},
            [x, y],
            () => {
                if (toLeft) {
                    this.rotation = Math.min(maxRotation, this.rotation + speed);
                } else {
                    this.rotation = Math.max(maxRotation, this.rotation - speed);
                }

                this.x1 = -Math.tan(this.radRotation) * (this.y1 - this.y) + this.x;

                const col = this.colliding(this.player);

                if (col) {
                    this.player.damage(red ? 2 : 1);
                }

                this.moveCurrentAnimation();

                if (duration !== undefined && this.rotation === maxRotation && !haveTimeout) {
                    haveTimeout = true;

                    this.game.setTimeout(() => {
                        this.level.removeSprite(this);

                        if (onEnd) {
                            onEnd();
                        }
                    }, duration);
                }
            },
            {
                fillColor: red ? "#C70E20EE" : "#E888D8EE",
            },
            hitBoxBrush,
            undefined,
            undefined,
            undefined,
            1
        );

        // Initialize the coordinates
        this.#coords1 = [this.x, groundY];
        this.#red = red;

        // Stores the rotation
        this.rotation = 0;

        this.currentAnimation = this.createAnimation(
            0,
            555,
            this.#red ? 255 : 226,
            4,
            1,
            4,
            39,
            28,
            1,
            0,
            2,
        );
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number],
     *   height: number,
     *   width: number
     * }} description of the laser.
     */
    get desc() {
        return super.desc;
    }

    /**
     * @returns {number} the x-coordinate of the second point.
     */
    get x1() {
        return this.#coords1[0];
    }

    /**
     * @returns {number} the y-coordinate of the second point.
     */
    get y1() {
        return this.#coords1[1];
    }

    /**
     * @returns {number} width of the laser.
     */
    get width() {
        return this.#red ? 3 : 2;
    }

    /**
     * @returns {number} height of the laser.
     */
    get height() {
        return this.euclideanDistancePt(
            [this.x, this.y],
            [this.x1, this.y1]
        );
    }

    /**
     * @param v {number} new x-coordinate of the second point.
     */
    set x1(v) {
        this.#coords1[0] = v;
    }

    /**
     * @param v {number} new y-coordinate of the second point.
     */
    set y1(v) {
        this.#coords1[1] = v;
    }

    /**
     * @returns {HitBox[]} the smallest laser that surrounds the shape.
     */
    get defaultHitBox() {
        return this.convertHitBoxes([{
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation
        }]);
    }

    /**
     * Draws the laser in the 2d context.
     *
     * @param context {CanvasRenderingContext2D} 2d canvas element context.
     */
    draw(context) {
        context.save();

        // Translate the context
        context.translate(this.x, this.y);

        // Rotate the rectangle
        context.rotate(this.degToRadians(this.rotation));

        // Draw fill laser
        context.fillRect(
            0,
            0,
            this.width,
            this.height
        );

        // Restore the context to draw the animation
        context.restore();

        // Save current rotation and set rotation to zero to not rotate the animation
        const temp = this.rotation;
        this.rotation = 0;

        // Draw the laser effect
        this.drawCurrentAnimation(
            this.x1 - 39,
            this.y1 - 50,
            context,
            2
        );

        // Restore the rotation
        this.rotation = temp;
    }

    /**
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "enemyProjectile";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return SigmaLaser.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['sigma_1.png'];
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
        return SigmaLaser.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return SigmaLaser.sounds;
    }
}
