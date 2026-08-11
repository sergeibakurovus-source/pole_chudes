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
        this.modalCaskets = document.getElementById('modal-caskets');
        this.modalSuperOffer = document.getElementById('modal-super-offer');
        
        this.vowels = ['А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'];
        this.wheelSectors = [100, 250, 'Б', 500, '0', 750, 1000, 'П', 350, 500, '+', 800];
        
        this.audioCtx = null;
        
        this.setupKeyboard();
        this.spinBtn.addEventListener('click', () => {
            this.initAudio();
            this.game.handleSpinClick();
        });
        this.guessBtn.addEventListener('click', () => {
            this.initAudio();
            this.game.handleGuessWordClick();
        });
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTick() {
        if(!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, this.audioCtx.currentTime + 0.1);
        osc.stop(this.audioCtx.currentTime + 0.1);
    }

    playWin() {
        if(!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
        osc.frequency.setValueAtTime(600, this.audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, this.audioCtx.currentTime + 1);
        osc.stop(this.audioCtx.currentTime + 1);
    }

    triggerConfetti() {
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confetti.style.zIndex = '9999';
            confetti.style.borderRadius = '50%';
            confetti.style.transition = `transform ${Math.random() * 2 + 2}s linear, top ${Math.random() * 2 + 2}s linear`;
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.style.top = '100vh';
                confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
            }, 50);

            setTimeout(() => {
                confetti.remove();
            }, 4050);
        }
    }

    setupKeyboard() {
        const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
        this.keyboardElement.innerHTML = '';
        alphabet.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'key';
            btn.textContent = letter;
            btn.dataset.letter = letter;
            
            // Increment 3: Vowels unlocked. (They will just reveal without points, logic handled in Game)
            
            btn.addEventListener('click', () => {
                this.initAudio();
                btn.disabled = true;
                this.game.handleLetterClick(letter, this.vowels.includes(letter));
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
                this.playTick();
            }
        }
    }

    enableCellClick(callback) {
        Array.from(this.boardElement.children).forEach(cell => {
            if (!cell.classList.contains('revealed')) {
                cell.classList.add('clickable');
                const handler = () => {
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
        
        const sectorAngle = 30;
        const targetDeg = (spins * 360) - (randomSectorIndex * sectorAngle); 
        
        this.wheel.style.transition = 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)';
        this.wheel.style.transform = `rotate(${targetDeg}deg)`;
        
        let tickInterval = setInterval(() => this.playTick(), 300);

        setTimeout(() => {
            clearInterval(tickInterval);
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

    showCasketsModal(onWin, onLose) {
        const btn1 = document.getElementById('btn-casket-1');
        const btn2 = document.getElementById('btn-casket-2');
        
        const winningCasket = Math.random() < 0.5 ? 1 : 2;

        const makeSelection = (selected) => {
            btn1.removeEventListener('click', handler1);
            btn2.removeEventListener('click', handler2);
            this.modalCaskets.classList.add('hidden');
            if (selected === winningCasket) {
                onWin();
            } else {
                onLose();
            }
        };

        const handler1 = () => makeSelection(1);
        const handler2 = () => makeSelection(2);

        btn1.addEventListener('click', handler1);
        btn2.addEventListener('click', handler2);

        this.modalCaskets.classList.remove('hidden');
    }

    showSuperGameOffer(onAccept, onDecline) {
        const btnYes = document.getElementById('btn-super-yes');
        const btnNo = document.getElementById('btn-super-no');

        const yesHandler = () => {
            cleanup();
            onAccept();
        };
        const noHandler = () => {
            cleanup();
            onDecline();
        };

        const cleanup = () => {
            btnYes.removeEventListener('click', yesHandler);
            btnNo.removeEventListener('click', noHandler);
            this.modalSuperOffer.classList.add('hidden');
        };

        btnYes.addEventListener('click', yesHandler);
        btnNo.addEventListener('click', noHandler);

        this.modalSuperOffer.classList.remove('hidden');
    }
}
