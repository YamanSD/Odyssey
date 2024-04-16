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
     * @returns {HTMLImageElement} the loaded image instance.
     */
    static load(src, forceLoad = false) {
        if (!forceLoad && src in this.#loaded) {
            return this.#loaded[src];
        }

        // Load the image
        this.#loaded[src] = new Image();
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
