import { Game } from './game.js?v=9.0.0';

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
        window.game = game;
        window.openMuseum = () => game.ui.showMuseumModal();
        window.openWardrobe = () => game.ui.showWardrobeModal();

        const btnMuseum = document.getElementById('btn-open-museum');
        if (btnMuseum) {
            btnMuseum.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                game.ui.showMuseumModal();
            });
        }

        const btnWardrobe = document.getElementById('btn-open-wardrobe');
        if (btnWardrobe) {
            btnWardrobe.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                game.ui.showWardrobeModal();
            });
        }

        const btnWardrobeHeader = document.getElementById('btn-open-wardrobe-header');
        if (btnWardrobeHeader) {
            btnWardrobeHeader.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                game.ui.showWardrobeModal();
            });
        }

        if (window.location.search.includes('openMuseum')) {
            game.ui.showMuseumModal();
        }
        if (window.location.search.includes('openWardrobe')) {
            game.ui.showWardrobeModal();
        }

        game.start();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
