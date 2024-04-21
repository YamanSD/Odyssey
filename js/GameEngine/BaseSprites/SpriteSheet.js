/**
 * @class SpriteSheet
 *
 * Static class used for loading sprite sheet images.
 */
export default class SpriteSheet {
    /**
     * Maps loaded file names to their respective loaded images.
     *
     * @type {Object<string, HTMLImageElement>}
     * @private
     */
    static #loaded = {};

    /**
     * @param src {string} source of the image file.
     * @param forceLoad {boolean} true to force load the file.
     * @param width {number?} width to map the image to.
     * @param height {number?} height to map the image to.
     * @returns {HTMLImageElement} the loaded image instance.
     */
    static load(src, forceLoad = false, width, height) {
        if (!forceLoad && src in this.#loaded) {
            return this.#loaded[src];
        }

        // Load the image
        this.#loaded[src] = new Image(width, height);
        this.#loaded[src].src = src;

        return this.#loaded[src];
    }

    /**
     * Clears the loaded images.
     */
    static clear() {
        this.#loaded = {};
    }
}
