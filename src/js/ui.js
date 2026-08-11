export class UI {
    constructor(game) {
        this.game = game;
        this.boardElement = document.getElementById('scoreboard');
        this.playersElement = document.getElementById('players-container');
        this.statusElement = document.getElementById('status-bar');
        this.keyboardElement = document.getElementById('keyboard');
        this.spinBtn = document.getElementById('btn-spin');
        this.wheel = document.getElementById('wheel');
        this.modalOverlay = document.getElementById('modal-overlay');
        
        this.vowels = ['А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'];
        this.wheelSectors = [100, 250, 500, 750, 1000, 350, 500, 800];
        
        this.setupKeyboard();
        this.spinBtn.addEventListener('click', () => {
            this.game.handleSpinClick();
        });
    }

    setupKeyboard() {
        const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
        this.keyboardElement.innerHTML = '';
        alphabet.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'key';
            btn.textContent = letter;
            btn.dataset.letter = letter;
            
            // В Инкременте 1 гласные заблокированы
            if (this.vowels.includes(letter)) {
                btn.disabled = true;
            }
            
            btn.addEventListener('click', () => {
                btn.disabled = true;
                this.game.handleLetterClick(letter);
            });
            this.keyboardElement.appendChild(btn);
        });
    }

    initBoard(word) {
        this.boardElement.innerHTML = '';
        for (let i = 0; i < word.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            this.boardElement.appendChild(cell);
        }
    }

    updateBoard(word, revealedLetters) {
        for (let i = 0; i < word.length; i++) {
            const cell = this.boardElement.children[i];
            if (revealedLetters.has(word[i]) && !cell.classList.contains('revealed')) {
                cell.classList.add('revealed');
                cell.textContent = word[i];
            }
        }
    }

    updatePlayers(players, activeIndex) {
        this.playersElement.innerHTML = '';
        players.forEach((p, index) => {
            const div = document.createElement('div');
            div.className = `player-card ${index === activeIndex ? 'active' : ''} ${p.isEliminated ? 'eliminated' : ''}`;
            div.innerHTML = `
                <div class="player-name">${p.name}</div>
                <div class="player-score">${p.score}</div>
            `;
            this.playersElement.appendChild(div);
        });
    }

    updateStatus(message) {
        this.statusElement.textContent = message;
    }

    enableSpinButton() {
        this.spinBtn.disabled = false;
    }

    disableControls() {
        this.spinBtn.disabled = true;
        this.disableKeyboard();
    }

    enableKeyboard() {
        this.keyboardElement.classList.remove('disabled');
    }

    disableKeyboard() {
        this.keyboardElement.classList.add('disabled');
    }

    spinWheel(callback) {
        // Упрощенная анимация для Инкремента 1
        const spins = 3;
        const randomSectorIndex = Math.floor(Math.random() * this.wheelSectors.length);
        const sectorValue = this.wheelSectors[randomSectorIndex];
        
        // 360 градусов / 8 секторов = 45 градусов на сектор.
        // Вычисляем угол, чтобы остановиться на нужном секторе (с учетом направления)
        const sectorAngle = 45;
        const targetDeg = (spins * 360) - (randomSectorIndex * sectorAngle); 
        
        this.wheel.style.transition = 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)';
        this.wheel.style.transform = `rotate(${targetDeg}deg)`;
        
        setTimeout(() => {
            // Reset transform string for next spin without animation jump
            this.wheel.style.transition = 'none';
            this.wheel.style.transform = `rotate(${targetDeg % 360}deg)`;
            
            // Allow layout repaint
            void this.wheel.offsetWidth;
            
            callback(sectorValue);
        }, 3000);
    }

    showModal(title, text, btnText, onAction) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-text').textContent = text;
        const btn = document.getElementById('btn-modal-action');
        btn.textContent = btnText;
        
        const handler = () => {
            btn.removeEventListener('click', handler);
            this.modalOverlay.classList.add('hidden');
            onAction();
        };
        btn.addEventListener('click', handler);
        this.modalOverlay.classList.remove('hidden');
    }
}
