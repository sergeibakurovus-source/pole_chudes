export class UI {
    constructor(game) {
        this.game = game;
        this.boardElement = document.getElementById('scoreboard');
        this.playersElement = document.getElementById('players-container');
        this.statusElement = document.getElementById('status-bar');
        this.keyboardElement = document.getElementById('keyboard');
        this.spinBtn = document.getElementById('btn-spin');
        this.guessBtn = document.getElementById('btn-guess-word');
        this.wheel = document.getElementById('wheel');
        this.modalOverlay = document.getElementById('modal-overlay');

        // New modals
        this.modalGuessWord = document.getElementById('modal-guess-word');
        this.modalPrize = document.getElementById('modal-prize');
        
        this.vowels = ['А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'];
        this.wheelSectors = [100, 250, 'Б', 500, '0', 750, 1000, 'П', 350, 500, '+', 800];
        
        this.setupKeyboard();
        this.spinBtn.addEventListener('click', () => {
            this.game.handleSpinClick();
        });
        this.guessBtn.addEventListener('click', () => {
            this.game.handleGuessWordClick();
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

    enableCellClick(callback) {
        // Sector PLUS: Make unrevealed cells clickable
        Array.from(this.boardElement.children).forEach(cell => {
            if (!cell.classList.contains('revealed')) {
                cell.classList.add('clickable');
                const handler = () => {
                    // Remove clickable from all
                    Array.from(this.boardElement.children).forEach(c => {
                        c.classList.remove('clickable');
                        c.removeEventListener('click', c._clickHandler);
                    });
                    callback(parseInt(cell.dataset.index));
                };
                cell._clickHandler = handler;
                cell.addEventListener('click', handler);
            }
        });
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

    enableSpinAndGuessButtons() {
        this.spinBtn.disabled = false;
        this.guessBtn.disabled = false;
    }

    disableControls() {
        this.spinBtn.disabled = true;
        this.guessBtn.disabled = true;
        this.disableKeyboard();
    }

    enableKeyboard() {
        this.keyboardElement.classList.remove('disabled');
    }

    disableKeyboard() {
        this.keyboardElement.classList.add('disabled');
    }

    spinWheel(callback) {
        const spins = 3;
        const randomSectorIndex = Math.floor(Math.random() * this.wheelSectors.length);
        const sectorValue = this.wheelSectors[randomSectorIndex];
        
        // 360 градусов / 12 секторов = 30 градусов на сектор.
        const sectorAngle = 30;
        const targetDeg = (spins * 360) - (randomSectorIndex * sectorAngle); 
        
        this.wheel.style.transition = 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)';
        this.wheel.style.transform = `rotate(${targetDeg}deg)`;
        
        setTimeout(() => {
            this.wheel.style.transition = 'none';
            this.wheel.style.transform = `rotate(${targetDeg % 360}deg)`;
            
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

    showPrizeModal(onTakePrize, onTakePoints) {
        const btnPrize = document.getElementById('btn-take-prize');
        const btnPoints = document.getElementById('btn-take-points');
        
        const prizeHandler = () => {
            btnPrize.removeEventListener('click', prizeHandler);
            btnPoints.removeEventListener('click', pointsHandler);
            this.modalPrize.classList.add('hidden');
            onTakePrize();
        };

        const pointsHandler = () => {
            btnPrize.removeEventListener('click', prizeHandler);
            btnPoints.removeEventListener('click', pointsHandler);
            this.modalPrize.classList.add('hidden');
            onTakePoints();
        };

        btnPrize.addEventListener('click', prizeHandler);
        btnPoints.addEventListener('click', pointsHandler);
        
        this.modalPrize.classList.remove('hidden');
    }

    showGuessWordModal(onSubmit, onCancel) {
        const input = document.getElementById('input-guess-word');
        const btnSubmit = document.getElementById('btn-submit-word');
        const btnCancel = document.getElementById('btn-cancel-word');

        input.value = '';

        const submitHandler = () => {
            const word = input.value.trim();
            if (!word) return;
            cleanup();
            onSubmit(word);
        };

        const cancelHandler = () => {
            cleanup();
            onCancel();
        };

        const cleanup = () => {
            btnSubmit.removeEventListener('click', submitHandler);
            btnCancel.removeEventListener('click', cancelHandler);
            this.modalGuessWord.classList.add('hidden');
        };

        btnSubmit.addEventListener('click', submitHandler);
        btnCancel.addEventListener('click', cancelHandler);

        this.modalGuessWord.classList.remove('hidden');
        input.focus();
    }
}
