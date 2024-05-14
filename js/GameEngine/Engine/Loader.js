/**
 * @exports loadResources
 */

/**
 * Loads all game resources and initializes a game instance.
 *
 * @returns {Game} new game instance.
 */
function loadGame() {
    /**
     * @note that this method of loading is the most viable
     * client-side loading method. Alternatives require a server.
     */

    // Initialize the game here to start the loading screen,
    // before loading the rest of the resources.
    const game = new Game("mainCanvas");

    /**
     * List of all classes to load the resources for.
     *
     * @type {(typeof Sprite)[]}
     */
    const SpriteClasses = [
        Sprite,
        MainMenu,
        Segment,
        Text,
        Void,
        Level_1,
        Level_2,
        Level_3,
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
        VerticalMeteor,
        HealthBar
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

    return game;
}
