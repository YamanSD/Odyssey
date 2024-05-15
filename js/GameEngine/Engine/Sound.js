'use strict';

/**
 * @exports Sound
 */

/**
 * @class Sound
 *
 * Static class used to load sound effects.
 */
class Sound {
    /**
     * Continuation of the path, add to the beginning of each name.
     *
     * @type {string}
     * @private
     */
    static #pathContinuation = './assets/sounds/';

    /**
     * Maps loaded file names to their respective loaded sounds.
     *
     * @type {Object<string, HTMLAudioElement>}
     * @private
     */
    static #loaded = {};

    /**
     * If true, the user is warned in the console for late loading.
     * Useful if we forget to add a class to the list of sprites.
     *
     * @type {boolean}
     * @private
     */
    static #warn = false;

    /**
     * Number of currently loading audio assets.
     *
     * @type {number}
     * @private
     */
    static #loading = 0;

    /**
     * @returns {number} number of loading audio assets.
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
     * @param name {string} name of the sound file to load.
     * @param forceLoad {boolean} true to force load the file.
     * @returns {HTMLAudioElement} the loaded audio instance.
     */
    static load(name, forceLoad = false) {
        if (!forceLoad && name in this.#loaded) {
            return this.#loaded[name];
        }

        // Warn the user
        if (this.#warn) {
            console.warn(`Late loading ${name}`);
        }

        // Load the sound
        this.#loaded[name] = new Audio(this.source(name));

        this.#loading++;
        this.#loaded[name].onload = () => {
            this.#loading--;
        };

        return this.#loaded[name];
    }

    /**
     * @param audio {HTMLAudioElement} audio instance to play.
     * @param noOverlap {boolean?} if true, the audio does not overlap over itself.
     */
    static playAudio(audio, noOverlap) {
        if (noOverlap) {
            // Ignore the promise
            audio.play();
        } else {
            audio.cloneNode().play();
        }
    }

    /**
     * Clears the loaded sounds.
     */
    static clear() {
        this.#loaded = {};
    }
}
