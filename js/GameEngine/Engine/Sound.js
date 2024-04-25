'use strict';

/**
 * @class Sound
 *
 * Static class used to load sound effects.
 */
export default class Sound {
    /**
     * Maps loaded file names to their respective loaded sounds.
     *
     * @type {Object<string, HTMLAudioElement>}
     * @private
     */
    static #loaded = {};

    /**
     * Number of currently loading audio assets.
     *
     * @type {number}
     * @private
     */
    static #loading;

    /**
     * @returns {number} number of loading audio assets.
     */
    static get loading() {
        return this.#loading;
    }

    /**
     * @param src {string} source of the sound file.
     * @param forceLoad {boolean} true to force load the file.
     * @returns {HTMLAudioElement} the loaded audio instance.
     */
    static load(src, forceLoad = false) {
        if (!forceLoad && src in this.#loaded) {
            return this.#loaded[src];
        }

        // Load the sound
        this.#loaded[src] = new Audio(src);

        this.#loading++;
        this.#loaded[src].onload = () => {
            this.#loading--;
        };

        return this.#loaded[src];
    }

    /**
     * @param audio {HTMLAudioElement} audio instance to play.
     */
    static playAudio(audio) {
        audio.cloneNode().play();
    }

    /**
     * Clears the loaded sounds.
     */
    static clear() {
        this.#loaded = {};
    }
}
