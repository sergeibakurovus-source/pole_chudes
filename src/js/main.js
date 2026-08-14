import { Game } from './game.js';

async function bootstrap() {
    try {
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
    } catch (err) {
        console.error('Bootstrap error:', err);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}



