import { Game } from './game.js';

async function bootstrap() {
    let game;
    try {
        game = new Game();
        await game.init();
    } catch (err) {
        console.error('Bootstrap init error:', err);
    } finally {
        if (game && game.ui && game.ui.hideLoader) {
            game.ui.hideLoader();
        } else {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.classList.add('hidden');
                loader.style.display = 'none';
            }
        }
    }

    if (game) {
        const btnMuseum = document.getElementById('btn-open-museum');
        if (btnMuseum) {
            btnMuseum.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                game.ui.showMuseumModal();
            });
        }

        game.start();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}




