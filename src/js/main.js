import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', async () => {
    const game = new Game();
    await game.init();
    if (game.ui.hideLoader) {
        game.ui.hideLoader();
    }
    game.start();
});
