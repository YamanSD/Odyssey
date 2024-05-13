/**
 * @exports SpriteSheet
 */

/**
 * @class SpriteSheet
 *
 * Static class used for loading sprite sheet images.
 */
class SpriteSheet {
    /**
     * Continuation of the path, add to the beginning of each name.
     *
     * @type {string}
     * @private
     */
    static #pathContinuation = './assets/images/';

    /**
     * If true, the user is warned in the console for late loading.
     * Useful if we forget to add a class to the list of sprites.
     *
     * @type {boolean}
     * @private
     */
    static #warn = false;

    /**
     * Maps loaded file names to their respective loaded images.
     *
     * @type {Object<string, HTMLImageElement>}
     * @private
     */
    static #loaded = {};

    /**
     * Number of currently loading assets.
     *
     * @type {number}
     * @private
     */
    static #loading = 0;

    /**
     * @returns {number} number of loading assets.
     */
    static get loading() {
        return this.#loading;
    }

    /**
     * @param name {string} name of the file.
     * @returns {string} the full path to the file.
     */
    static source(name) {
        return `${this.#pathContinuation}${name}`;
    }

    /**
     * Call after loading all resources.
     */
    static finishLoading() {
        this.#warn = true;
    }

    /**
     * @param name {string} name of the image file to load.
     * @param forceLoad {boolean} true to force load the file.
     * @param width {number?} width to map the image to.
     * @param height {number?} height to map the image to.
     * @returns {HTMLImageElement} the loaded image instance.
     */
    static load(name, forceLoad = false, width, height) {
        if (!forceLoad && name in this.#loaded) {
            return this.#loaded[name];
        }

        // Warn the user
        if (this.#warn) {
            console.warn(`Late loading ${name}`);
        }

        // Load the image
        this.#loaded[name] = new Image(width, height);

        this.#loading++;
        this.#loaded[name].src = this.source(name);
        this.#loaded[name].onload = () => {
            this.#loading--;
        };

        return this.#loaded[name];
    }

    /**
     * Clears the loaded images.
     */
    static clear() {
        this.#loaded = {};
    }
}
