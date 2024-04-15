import CRectangle from "./CRectangle";

// TODO DELETE
/**
 * @class CameraAxis
 * Static class for the state of the camera movement.
 *
 * None: Camera does not follow its target.
 *
 * Horizontal: Camera only follows its target horizontally.
 *
 * Vertical: Camera only follows its target vertically.
 *
 * Both: Camera follows its target in both directions.
 */
export class CameraAxis {
    static get None() {
        return 0;
    }

    static get Horizontal() {
        return 1;
    }

    static get Vertical() {
        return 2;
    }

    static get Both() {
        return 3;
    }
}


/**
 * @class Camera
 *
 * Class encapsulating the Camera viewport.
 */
export default class Camera {
    /**
     * @type {number} current axis of the camera.
     * @protected
     */
    #axis;

    /**
     * @type {[number, number]} position of the camera's top-left corner.
     * @protected
     */
    #coords;

    /**
     * @type {[number, number]} distance followed object to border before camera moves.
     * @protected
     */
    #deadZone;

    /**
     * @type {[number, number]} dimensions of the view port.
     * @protected
     */
    #viewportDims;

    /**
     * @type {Sprite} object to be followed.
     * @protected
     */
    #followed;

    /**
     * @type {CRectangle} rectangle of the viewport.
     * @protected
     */
    #viewportRect;

    /**
     * @type {CRectangle} rectangle of the entire game space.
     * @protected
     */
    #gameRect;

    /**
     * @param x {number} x-coordinate of the viewport.
     * @param y {number} y-coordinate of the viewport.
     * @param width {number} width of the viewport.
     * @param height {number} height of the viewport.
     * @param gameWidth {number} width of the entire game space.
     * @param gameHeight {number} height of the entire game space.
     */
    constructor(x, y, width, height, gameWidth, gameHeight) {
        this.x = x;
        this.y = y;
        this.deadZoneX = 0;
        this.deadZoneY = 0;
        this.width = width;
        this.height = height;

        // Allows the camera to move freely
        this.axis = CameraAxis.Both;
        this.followed = null;

        this.viewportRect = new CRectangle({
            x, y, width, height
        });

        this.gameRect = new CRectangle({
            x: 0,
            y: 0,
            width: gameWidth,
            height: gameHeight
        });
    }

    /**
     * Gets the current axis of the camera.
     * @returns {number} The current axis of the camera.
     */
    get axis() {
        return this.#axis;
    }

    /**
     * Sets the current axis of the camera.
     * @param {number} axis The new axis of the camera.
     */
    set axis(axis) {
        this.#axis = axis;
    }

    /**
     * Gets the x position of the camera's top-left corner.
     * @returns {number} The x position of the camera's top-left corner.
     */
    get x() {
        return this.#coords[0];
    }

    /**
     * Sets the x position of the camera's top-left corner.
     * @param {number} x The new x position of the camera's top-left corner.
     */
    set x(x) {
        this.#coords[0] = x;
    }

    /**
     * Gets the y position of the camera's top-left corner.
     * @returns {number} The y position of the camera's top-left corner.
     */
    get y() {
        return this.#coords[1];
    }

    /**
     * Sets the y position of the camera's top-left corner.
     * @param {number} y The new y position of the camera's top-left corner.
     */
    set y(y) {
        this.#coords[1] = y;
    }

    /**
     * Gets the x component of the distance from the followed object to the border before the camera moves.
     * @returns {number} The x component of the distance from the followed object to the border before the camera moves.
     */
    get deadZoneX() {
        return this.#deadZone[0];
    }

    /**
     * Sets the x component of the distance from the followed object to the border before the camera moves.
     * @param {number} x The new x component of the distance from the followed object to the border before the camera moves.
     * @protected
     */
    set deadZoneX(x) {
        this.#deadZone[0] = x;
    }

    /**
     * Gets the y component of the distance from the followed object to the border before the camera moves.
     * @returns {number} The y component of the distance from the followed object to the border before the camera moves.
     */
    get deadZoneY() {
        return this.#deadZone[1];
    }

    /**
     * Sets the y component of the distance from the followed object to the border before the camera moves.
     * @param {number} y The new y component of the distance from the followed object to the border before the camera moves.
     * @protected
     */
    set deadZoneY(y) {
        this.#deadZone[1] = y;
    }

    /**
     * Gets the width of the view port.
     * @returns {number} The width of the view port.
     */
    get width() {
        return this.#viewportDims[0];
    }

    /**
     * Sets the width of the view port.
     * @param {number} width The new width of the view port.
     */
    set width(width) {
        this.#viewportDims[0] = width;
    }

    /**
     * Gets the height of the view port.
     * @returns {number} The height of the view port.
     */
    get height() {
        return this.#viewportDims[1];
    }

    /**
     * Sets the height of the view port.
     * @param {number} height The new height of the view port.
     */
    set height(height) {
        this.#viewportDims[1] = height;
    }

    /**
     * Gets the object to be followed.
     * @returns {Sprite} The object to be followed.
     */
    get followed() {
        return this.#followed;
    }

    /**
     * Sets the object to be followed.
     * @param {Sprite | null} followed The new object to be followed.
     * @protected
     */
    set followed(followed) {
        this.#followed = followed;
    }

    /**
     * Gets the rectangle of the view port.
     * @returns {CRectangle} The rectangle of the view port.
     */
    get viewportRect() {
        return this.#viewportRect;
    }

    /**
     * Sets the rectangle of the view port.
     * @param {CRectangle} viewportRect The new rectangle of the view port.
     */
    set viewportRect(viewportRect) {
        this.#viewportRect = viewportRect;
    }

    /**
     * Gets the rectangle of the entire game space.
     * @returns {CRectangle} The rectangle of the entire game space.
     */
    get gameRect() {
        return this.#gameRect;
    }

    /**
     * Sets the rectangle of the entire game space.
     * @param {CRectangle} gameRect The new rectangle of the entire game space.
     */
    set gameRect(gameRect) {
        this.#gameRect = gameRect;
    }

    /**
     * @param sprite {Sprite} sprite to follow.
     * @param deadZoneX {number} dead zone x-margin.
     * @param deadZoneY {number} dead zone y-margin.
     */
    follow(sprite, deadZoneX, deadZoneY) {
        this.followed = sprite;
        this.deadZoneX = deadZoneX;
        this.deadZoneY = deadZoneY;
    }

    /**
     * Updates the camera state.
     */
    update() {
        // Follow the sprite
        if (this.followed) {
            // Move camera on horizontal axis based on followed object position
            if (this.axis === CameraAxis.Horizontal || this.axis === CameraAxis.Both) {
                if (this.followed.x - this.x + this.deadZoneX > this.width) {
                    this.x = this.followed.x - (this.width - this.deadZoneX);
                } else if (this.followed.x - this.deadZoneX < this.x) {
                    this.x = this.followed.x - this.deadZoneX;
                }
            }

            // Move camera on vertical axis based on followed object position
            if (this.axis === CameraAxis.Vertical || this.axis === CameraAxis.Both) {
                if (this.followed.y - this.y + this.deadZoneY > this.height) {
                    this.y = this.followed.y - (this.height - this.deadZoneY);
                } else if (this.followed.y - this.deadZoneY < this.y) {
                    this.y = this.followed.y - this.deadZoneY;
                }
            }
        }

        // Update viewportRect
        this.viewportRect.x = this.x;
        this.viewportRect.y = this.y;

        // Don't let camera leaves the world's boundary
        if (!this.viewportRect.isWithin(this.gameRect)) {
            if (this.viewportRect.x < this.gameRect.x) {
                this.x = this.gameRect.x;
            }

            if (this.viewportRect.y < this.gameRect.y) {
                this.y = this.gameRect.y;
            }

            if (this.viewportRect.rx > this.gameRect.rx) {
                this.x = this.gameRect.rx - this.width;
            }

            if (this.viewportRect.by > this.gameRect.by) {
                this.y = this.gameRect.by - this.height;
            }
        }
    }
}
