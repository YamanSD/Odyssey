/**
 * @exports loadResources
 */

/**
 * Loads all game resources and initializes a game instance.
 *
 * @returns {Game} new game instance.
 */
function loadGame() {
    const game = new Game("mainCanvas");

    /**
     * @note that this method of loading is the most viable
     * client-side loading method. Alternatives require a server.
     */

    /**
     * List of all classes to load the resources for.
     *
     * @type {(typeof Sprite)[]}
     */
    const SpriteClasses = [
        Segment,
        Text,
        Void,
        Level_1,
        Level_2,
        Bee,
        Bomb,
        BomberBat,
        BusterShot,
        Dejira,
        DejiraProjectile,
        Explosion,
        GigaDeath,
        Grenade,
        GrenadeMan,
        Iris,
        IrisBeam,
        IrisCrystal,
        IrisField,
        Mettaur,
        MettaurProjectile,
        Player,
        Rocket,
        ShockProjectile,
        Sigma,
        SigmaLaser,
        SigmaShockProjectile,
        SigmaSickle,
        Spiky,
        SuicideDrone,
        TrapBlast,
        VerticalMeteor
    ];

    // Load all the resources for each class
    SpriteClasses.forEach(cls => {
        cls.sheets.forEach(s => {
            SpriteSheet.load(s);
        });

        cls.sounds.forEach(s => {
            Sound.load(s);
        });
    });

    // Finish loading
    SpriteSheet.finishLoading();
    Sound.finishLoading();

    // Wait for loading
    // game.waitForLoading();

    return game;
}
