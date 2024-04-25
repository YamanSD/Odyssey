'use strict';

/**
 * @class Sound
 *
 * Static class used to load sound effects.
 */
export default class Sound {
    /**
     * Continuation of the path, add to the beginning of each name.
     *
     * @type {string}
     * @private
     */
    static #pathContinuation = '/assets/sounds/';

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
     * @param name {string} name of the file.
     * @returns {string} the full path to the file.
     */
    static source(name) {
        return `${this.#pathContinuation}/${name}`;
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
