'use strict';

/**
 * @class QuadTree
 * Class used by a 2d canvas to divide the screen into sub-quadrants recursively.
 * Provides better performance for handling collisions.
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
     * @type {Set<HitBox>} set of HitBox objects inside the node's boundaries.
     * @private
     */
    #hitBoxes;

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
        this.#hitBoxes = new Set();
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
     * @param {HitBox} hitBox one of the bounds of the object to be added.
     */
    insert(hitBox) {
        // If we have sub-nodes, call insert on matching sub-nodes
        if (this.#childrenNodes.length) {
            const indices = this.#getIndices(hitBox);

            for (const index of indices) {
                this.#childrenNodes[index].insert(hitBox);
            }
            return;
        }

        // Otherwise, store object here
        this.#hitBoxes.add(hitBox);

        // Max_objects reached
        if (this.#hitBoxes.size > this.#maxObjects && this.#level < this.#maxLevels) {
            // Split if we do not already have sub-nodes
            if (!this.#childrenNodes.length) {
                this.#split();
            }

            // Add all objects to their corresponding sub-node
            for (const spriteRect of this.#hitBoxes) {
                const indices = this.#getIndices(spriteRect);

                for (const index of indices) {
                    this.#childrenNodes[index].insert(spriteRect);
                }
            }

            // Clean up this node
            this.#hitBoxes.clear();
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
     * @param {HitBox[]} hitBoxes bounds of the object to be checked.
     * @return {Set<HitBox>} array with all detected objects.
     */
    retrieve(hitBoxes) {
        /**
         * @type {number[]}
         */
        const indices = [];

        // Get the hitBox indices
        for (const hitBox of hitBoxes) {
            indices.push(...this.#getIndices(hitBox));
        }

        // List of objects to return
        let returnObjects = new Set(this.#hitBoxes);

        // If we have sub-nodes, retrieve their objects
        if (this.#childrenNodes.length) {
            for (const index of indices) {
                this.#childrenNodes[index].retrieve(hitBoxes).forEach(r => {
                    returnObjects.add(r);
                });
            }
        }

        return returnObjects;
    }

    /**
     * @param hitBox {HitBox} removes sprite from the intersecting hit-boxes.
     */
    remove(hitBox) {
        // Delete the hitBox from the hit-boxes
        this.#hitBoxes.delete(hitBox);

        // Remove object from all children
        for (const child of this.#childrenNodes) {
            child.remove(hitBox);
        }

        // Cleanup
        this.cleanUp();
    }

    /**
     * Tries to clean up memory by merging nodes.
     * @returns {Set<HitBox>} all the sprites from this node and its children combined.
     */
    cleanUp() {
        // Duplicate the sprites
        let allObjects= this.#hitBoxes;

        // Join with the children
        for (const child of this.#childrenNodes) {
            child.cleanUp().forEach(obj => {
                allObjects.add(obj);
            });
        }

        // If the number of unique objects is less than max (valid), then join
        if (allObjects.size <= this.#maxObjects) {
            this.#hitBoxes = allObjects;
            this.#childrenNodes = [];
        }

        return allObjects;
    }

    /**
     * Clears the quadtree.
     */
    clear() {
        this.#hitBoxes.clear();

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
     * @param {[number, number]} point coordinates of point to be checked.
     * @return {Set<number>}  an array of indices of the intersecting sub-nodes
     *         (0-3 = top-right, top-left, bottom-left, bottom-right / ne, nw, sw, se)
     * @private
     */
    #getIndicesOfPoint(point) {
        /**
         * @type {Set<number>}
         */
        const indices = new Set();
        const xMidpoint = this.#bounds.x + this.#bounds.width / 2;
        const yMidpoint = this.#bounds.y + this.#bounds.height / 2;

        const isNorth = point[1] < yMidpoint;
        const isWest = point[0] < xMidpoint;

        // Top-right quad
        if (isNorth && !isWest) {
            indices.add(0);
        }

        // Top-left quad
        if (isWest && isNorth) {
            indices.add(1);
        }

        // Bottom-left quad
        if (isWest && !isNorth) {
            indices.add(2);
        }

        // Bottom-right quad
        if (!isWest && !isNorth) {
            indices.add(3);
        }

        return indices;
    }

    /**
     * Determine which node the object belongs to
     * @param {HitBox} hitBox bounds of the area to be checked.
     * @return {Set<number>}  an array of indices of the intersecting sub-nodes
     *         (0-3 = top-right, top-left, bottom-left, bottom-right / ne, nw, sw, se)
     * @private
     */
    #getIndices(hitBox) {
        /**
         * @type {Set<number>}
         */
        const indices = new Set();

        // Iterate over the points of a hit box to determine the quadrant
        for (const point of hitBox.corners) {
            this.#getIndicesOfPoint(point).forEach(q => {
                indices.add(q);
            });
        }

        return indices;
    }
}
