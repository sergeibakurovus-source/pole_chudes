import { Game } from './game.js?v=8.0.2';

document.addEventListener('DOMContentLoaded', async () => {
    const game = new Game();
    await game.init();
    if (game.ui.hideLoader) {
        game.ui.hideLoader();
    }

    const btnMuseum = document.getElementById('btn-open-museum');
    if (btnMuseum) {
        btnMuseum.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            game.ui.showMuseumModal();
        });
    }

    game.start();
});


