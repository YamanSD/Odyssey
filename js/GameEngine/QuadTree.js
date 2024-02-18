/**
 * @class QuadTree.
 * Class used by a 2d canvas to divide the screen into sub-quadrants recursively.
 * Provides better performance for handling clicks on canvas and collisions.
 */
export default class QuadTree {
    /**
     * @type {number} max objects a node can hold before splitting into 4 sub-nodes (default: 10).
     * @private
     */
    #maxObjects;

    /**
     * @type {number} total max levels inside root QuadTree (default: 4).
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
     * }}  bounds of the node.
     * @private
     */
    #bounds;

    /**
     * {@link Sprite} links the Sprite class.
     * @type {Set<{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number,
     *   sprite: Sprite,
     * }>} set of rectangular objects inside the node's boundaries.
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
     * @param {number?} [maxObjects=10] max objects a node can hold before splitting into 4 sub-nodes (default: 10).
     * @param {number?} [maxLevels=4] total max levels inside root QuadTree (default: 4).
     * @param {number?} [level=0] depth level, required for sub-nodes (default: 0).
     */
    constructor(bounds, maxObjects, maxLevels, level) {
        this.#maxObjects = maxObjects || 10;
        this.#maxLevels = maxLevels || 4;
        this.#level = level || 0;
        this.#bounds = bounds;
        this.#sprites = new Set();
        this.#childrenNodes = [];
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
     * }} rect bounds of the object to be added.
     */
    insert(rect) {
        let i = 0;
        let indexes;

        // if we have sub-nodes, call insert on matching sub-nodes
        if (this.#childrenNodes.length) {
            indexes = this.#getIndex(rect);

            for (i = 0; i < indexes.length; i++) {
                this.#childrenNodes[indexes[i]].insert(rect);
            }
            return;
        }

        // otherwise, store object here
        this.#sprites.add(rect);

        // max_objects reached
        if (this.#sprites.size > this.#maxObjects && this.#level < this.#maxLevels) {
            // split if we don't already have sub-nodes
            if (!this.#childrenNodes.length) {
                this.#split();
            }

            // add all objects to their corresponding sub-node
            for (i = 0; i < this.#sprites.size; i++) {
                indexes = this.#getIndex(this.#sprites[i]);
                for (let k = 0; k < indexes.length; k++) {
                    this.#childrenNodes[indexes[k]].insert(this.#sprites[i]);
                }
            }

            // clean up this node
            this.#sprites.clear();
        }
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
     * @return {Set<{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number,
     *   sprite: Sprite
     * }>} array with all detected objects.
     */
    retrieve(rects) {
        const indices = [];

        // Get the rect indices
        for (const rect of rects) {
            indices.push(this.#getIndex(rect));
        }

        let returnObjects = new Set(this.#sprites);

        // if we have sub-nodes, retrieve their objects
        if (this.#childrenNodes.length) {
            for (const index of indices) {
                this.#childrenNodes[index]?.retrieve(rects)?.forEach((rect) => {
                   returnObjects.add(rect);
                });
            }
        }

        // remove duplicates
        if (this.#level === 0) {
            const idSet = new Set();
            const returnSet = new Set();

            // iterate over the return set
            for (const rect of returnObjects) {
                if (!idSet.has(rect.sprite.id)) {
                    returnSet.add(rect);
                    idSet.add(rect.sprite.id);
                }
            }

            return returnSet;
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
     */
    remove(rect) {
        // if we have sub-nodes, call insert on matching sub-nodes
        if (this.#childrenNodes.length) {
            const indexes = this.#getIndex(rect);

            for (const index of indexes) {
                this.#childrenNodes[index].remove(rect);
            }

            return;
        }

        // Delete the element from the sprites
        this.#sprites.delete(rect);
    }

    /**
     * Clears the quadtree.
     */
    clear() {
        this.#sprites.clear();

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
        const nextLevel = this.#level + 1;
        const subWidth = this.#bounds.width / 2;
        const subHeight = this.#bounds.height / 2;
        const x = this.#bounds.x;
        const y = this.#bounds.y;

        // top right node
        this.#childrenNodes[0] = new QuadTree(
            { x: x + subWidth, y, width: subWidth, height: subHeight },
            this.#maxObjects,
            this.#maxLevels,
            nextLevel
        );

        // top left node
        this.#childrenNodes[1] = new QuadTree(
            { x, y, width: subWidth, height: subHeight },
            this.#maxObjects,
            this.#maxLevels,
            nextLevel
        );

        // bottom left node
        this.#childrenNodes[2] = new QuadTree(
            { x, y: y + subHeight, width: subWidth, height: subHeight },
            this.#maxObjects,
            this.#maxLevels,
            nextLevel
        );

        // bottom right node
        this.#childrenNodes[3] = new QuadTree(
            { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
            this.#maxObjects,
            this.#maxLevels,
            nextLevel
        );
    }

    /**
     * Determine which node the object belongs to
     * @param {{
     *   width: number,
     *   height: number,
     *   x: number,
     *   y: number
     * }} rect bounds of the area to be checked.
     * @return {number[]}  an array of indexes of the intersecting sub-nodes
     *         (0-3 = top-right, top-left, bottom-left, bottom-right / ne, nw, sw, se)
     * @private
     */
    #getIndex(rect) {
        const indexes = [];
        const verticalMidpoint = this.#bounds.x + this.#bounds.width / 2;
        const horizontalMidpoint = this.#bounds.y + this.#bounds.height / 2;

        const startIsNorth = rect.y < horizontalMidpoint;
        const startIsWest = rect.x < verticalMidpoint;
        const endIsEast = rect.x + rect.width > verticalMidpoint;
        const endIsSouth = rect.y + rect.height > horizontalMidpoint;

        // top-right quad
        if (startIsNorth && endIsEast) {
            indexes.push(0);
        }

        // top-left quad
        if (startIsWest && startIsNorth) {
            indexes.push(1);
        }

        // bottom-left quad
        if (startIsWest && endIsSouth) {
            indexes.push(2);
        }

        // bottom-right quad
        if (endIsEast && endIsSouth) {
            indexes.push(3);
        }

        return indexes;
    }
}
