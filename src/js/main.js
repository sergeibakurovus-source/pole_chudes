import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', async () => {
    const game = new Game();
    await game.init();
    if (game.ui.hideLoader) {
        game.ui.hideLoader();
    }

    const btnMuseum = document.getElementById('btn-open-museum');
    if (btnMuseum) {
        btnMuseum.addEventListener('click', () => {
            game.ui.showMuseumModal();
        });
    }

    game.start();
});

