/**
 * @class QuadTree.
 * Class used by a 2d canvas to divide the screen into sub-quadrants recursively.
 * Provides better performance for handling clicks on canvas and collisions.
 * // TODO optimize
 */
export default class QuadTree {
    /**
     * @type {number} max objects a node can hold before splitting into 4 sub-nodes (default: 5).
     * @private
     */
    #maxObjects;

    /**
     * @type {number} total max levels inside root QuadTree (default: 5).
     * @private
     */
    #maxLevels;

    /**
     * @type {number} depth level, required for sub-nodes (default: 0).
     * @private
     */
    #level;

    /**
     * @type {{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number
     * }} bounds of the node.
     * @private
     */
    #bounds;

    /**
     * Using an array instead of a set, since not many sprites will be held
     * in the same QuadTree.
     *
     * {@link Sprite} links the Sprite class.
     * @type {{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number,
     *   sprite: Sprite,
     * }[]} array of rectangular objects inside the node's boundaries.
     * @private
     */
    #sprites;

    /**
     * @type {QuadTree[]} list of child nodes.
     * @private
     */
    #childrenNodes;

    /**
     * QuadTree Constructor.
     * @param {{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number
     * }} bounds bounds of the node.
     * @param {number?} [maxObjects=5] max objects a node can hold before splitting into 4 sub-nodes (default: 10).
     * @param {number?} [maxLevels=5] total max levels inside root QuadTree (default: 4).
     * @param {number?} [level=0] depth level, required for sub-nodes (default: 0).
     */
    constructor(bounds, maxObjects, maxLevels, level) {
        this.#maxObjects = maxObjects || 5;
        this.#maxLevels = maxLevels || 5;
        this.#level = level || 0;
        this.#bounds = bounds;
        this.#sprites = [];
        this.#childrenNodes = [];
    }

    /**
     * @return {boolean} true if this QuadTree is the root.
     */
    get isRoot() {
        return this.#level === 0;
    }

    /**
     * {@link Sprite} links the Sprite class.
     * Insert the object into the node. If the node
     * exceeds the capacity, it will split and add all
     * objects to their corresponding sub-nodes.
     * @param {{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number,
     *   sprite: Sprite
     * }} rect one of the bounds of the object to be added.
     */
    insert(rect) {
        // If we have sub-nodes, call insert on matching sub-nodes
        if (this.#childrenNodes.length) {
            const indices = this.#getIndices(rect);

            for (const index of indices) {
                this.#childrenNodes[index].insert(rect);
            }
            return;
        }

        // Otherwise, store object here
        this.#sprites.push(rect);

        // Max_objects reached
        if (this.#sprites.length > this.#maxObjects && this.#level < this.#maxLevels) {
            // Split if we do not already have sub-nodes
            if (!this.#childrenNodes.length) {
                this.#split();
            }

            // Add all objects to their corresponding sub-node
            for (const spriteRect of this.#sprites) {
                const indices = this.#getIndices(spriteRect);

                for (const index of indices) {
                    this.#childrenNodes[index].insert(spriteRect);
                }
            }

            // Clean up this node
            this.#sprites = [];
        }
    }

    /**
     * @returns {{
     *     x: number,
     *     y: number,
     *     width: number,
     *     height: number
     * }[]} list of bounds to be drawn.
     */
    get displayBounds() {
        const res = [this.#bounds];

        // Append to the children
        for (const child of this.#childrenNodes) {
            res.push(...child.displayBounds);
        }

        return res;
    }

    /**
     * {@link Sprite} links the Sprite class.
     * Return all objects that could collide with the given object
     * @param {{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number
     * }[]} rects bounds of the object to be checked.
     * @return {{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number,
     *   sprite: Sprite
     * }[]} array with all detected objects.
     */
    retrieve(rects) {
        /**
         * @type {number[]}
         */
        const indices = [];

        // Get the rect indices
        for (const rect of rects) {
            indices.push(...this.#getIndices(rect));
        }

        // List of objects to return
        let returnObjects = this.#sprites;

        // If we have sub-nodes, retrieve their objects
        if (this.#childrenNodes.length) {
            for (const index of indices) {
                returnObjects = returnObjects.concat(
                    this.#childrenNodes[index].retrieve(rects)
                );
            }
        }

        // Remove duplicates at root
        if (this.isRoot) {
            return  Array.from(new Set(returnObjects));
        }

        return returnObjects;
    }

    /**
     * @param rect {{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number,
     *   sprite: Sprite
     * }} removes sprite from the intersecting hit-boxes.
     * @returns {boolean} true if the object was removed from this node.
     */
    remove(rect) {
        // Get the index of the rectangle object
        const indexOf = this.#sprites.indexOf(rect);

        // Remove object
        if(indexOf > -1) {
            this.#sprites.splice(indexOf, 1);
        }

        // Remove object from all children
        for (const child of this.#childrenNodes) {
            child.remove(rect);
        }

        // If we found the rect, then indexOf is not -1
        return indexOf !== -1;
    }

    /**
     * Tries to clean up memory by merging nodes.
     * @returns {{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number,
     *   sprite: Sprite
     * }[]} all the sprites from this node and its children combined.
     */
    cleanUp() {
        // Duplicate the sprites
        let allObjects= Array.from(this.#sprites);

        // Join with the children
        for (const child of this.#childrenNodes) {
            allObjects.push(...child.cleanUp());
        }

        // Remove duplicates
        const uniqueObjects = Array.from(new Set(allObjects));

        // If the number of unique objects is less than max (valid), then join
        if (uniqueObjects.length <= this.#maxObjects) {
            this.#sprites = uniqueObjects;
            this.#childrenNodes = [];
        }

        return allObjects;
    }

    /**
     * Clears the quadtree.
     */
    clear() {
        this.#sprites = [];

        for (let i = 0; i < this.#childrenNodes.length; i++) {
            if (this.#childrenNodes.length) {
                this.#childrenNodes[i].clear();
            }
        }

        this.#childrenNodes = [];
    }

    /**
     * Splits the node into 4 sub-nodes.
     * @private
     */
    #split() {
        // Boundaries of the new children
        const level= this.#level + 1,
            width = this.#bounds.width / 2,
            height = this.#bounds.height / 2,
            x = this.#bounds.x,
            y = this.#bounds.y;

        // Coordinates of the new children
        const coords = [
            {
                x: x + width,
                y: y
            },
            {
                x: x,
                y: y
            },
            {
                x: x,
                y: y + height
            },
            {
                x: x + width,
                y: y + height
            },
        ];

        // Iterate over the four children
        for (let i = 0; i < 4; i++) {
            this.#childrenNodes[i] = new QuadTree({
                x: coords[i].x,
                y: coords[i].y,
                width,
                height
            }, this.#maxObjects, this.#maxLevels, level);
        }
    }

    /**
     * Determine which node the object belongs to
     * @param {{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number
     * }} rect bounds of the area to be checked.
     * @return {number[]}  an array of indices of the intersecting sub-nodes
     *         (0-3 = top-right, top-left, bottom-left, bottom-right / ne, nw, sw, se)
     * @private
     */
    #getIndices(rect) {
        /**
         * @type {number[]}
         */
        const indices = [];
        const verticalMidpoint = this.#bounds.x + this.#bounds.width / 2;
        const horizontalMidpoint = this.#bounds.y + this.#bounds.height / 2;

        const startIsNorth = rect.y < horizontalMidpoint;
        const startIsWest = rect.x < verticalMidpoint;
        const endIsEast = rect.x + rect.width > verticalMidpoint;
        const endIsSouth = rect.y + rect.height > horizontalMidpoint;

        // Top-right quad
        if (startIsNorth && endIsEast) {
            indices.push(0);
        }

        // Top-left quad
        if (startIsWest && startIsNorth) {
            indices.push(1);
        }

        // Bottom-left quad
        if (startIsWest && endIsSouth) {
            indices.push(2);
        }

        // Bottom-right quad
        if (endIsEast && endIsSouth) {
            indices.push(3);
        }

        return indices;
    }
}
