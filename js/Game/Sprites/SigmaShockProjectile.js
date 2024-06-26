'use strict'

/**
 * @exports SigmaShockProjectile
 */

/**
 * State for the movement state of the projectile.
 *
 * @type {{horizontal: number, vertical: number, down: number}}
 */
const SigmaShockProjectileState = {
    down: 0,
    horizontal: 1,
    vertical: 2,
};

/**
 * @class SigmaShockProjectile
 *
 * Class representing the shock projectile.
 */
class SigmaShockProjectile extends Sprite {
    /**
     * @param x {number} x-coordinate of the hero.
     * @param y {number} y-coordinate of the hero.
     * @param scale {number} scale of SigmaShockProjectile.
     * @param toLeft {boolean} if true goes to the left.
     * @param speed {number?} speed of the projectile.
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
        toLeft,
        speed = 6,
        hitBoxBrush
    ) {
        super(
            {},
            [x, y],
            () => {
                switch (this.states.get(SigmaShockProjectileState)) {
                    case SigmaShockProjectileState.down:
                        this.x += toLeft ? -speed : speed;
                        this.y += speed;
                        break;
                    case SigmaShockProjectileState.vertical:
                        this.y -= speed;

                        if (this.by < 0) {
                            this.level.removeSprite(this);
                            return;
                        }

                        break;
                    case SigmaShockProjectileState.horizontal:
                        this.x += toLeft ? -speed : speed;
                        break;
                }

                const col = this.colliding(this.level);

                if (col) {
                    switch (this.states.get(SigmaShockProjectileState)) {
                        case SigmaShockProjectileState.horizontal:
                            this.states.set(SigmaShockProjectileState, SigmaShockProjectileState.vertical);

                            // Subtract or add due to difference in widths between hit box and animation width
                            if (toLeft) {
                                this.x = col.collided.rx;
                            } else {
                                this.rx = col.collided.x;
                            }
                            break;
                        case SigmaShockProjectileState.down:
                            this.states.set(SigmaShockProjectileState, SigmaShockProjectileState.horizontal);
                            this.by = col.collided.y - 1;
                            break;
                    }
                }

                const pcol = this.colliding(this.player);

                if (pcol) {
                    this.player.damage(2);
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

        this.states.set(SigmaShockProjectileState, SigmaShockProjectileState.down);
        this.currentAnimation = this.createAnimation(
            0,
            234,
            152,
            3,
            1,
            3,
            32,
            30,
            1,
            0,
            2,
        );
    }

    /**
     * @returns {{
     *   topLeftCoords: [number, number]
     * }} description of SigmaShockProjectile.
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
                width: 32,
                height: 30
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
     * @returns {string} the type of the sprite.
     */
    static get type() {
        return "enemyProjectile";
    }

    /**
     * @returns {string} the type of the sprite.
     */
    get type() {
        return SigmaShockProjectile.type;
    }

    /**
     * @returns {string[]} sprite sheets.
     */
    static get sheets() {
        return ['sigma_3.png'];
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
        return SigmaShockProjectile.sheets;
    }

    /**
     * @returns {string[]} sound files.
     */
    get sounds() {
        return SigmaShockProjectile.sounds;
    }
}
