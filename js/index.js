'use strict';

// Start loading the resources
const g = loadGame();

const mm = new MainMenu();
g.showHitBoxes = true;
g.insertSprite(mm);
g.resume();
