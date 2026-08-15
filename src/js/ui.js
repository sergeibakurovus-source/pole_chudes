function showModal(el) {
    el.classList.remove('hidden');
    el.classList.remove('modal-entering');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            el.classList.add('modal-entering');
        });
    });
}
function hideModal(el) {
    el.classList.remove('modal-entering');
    el.classList.add('hidden');
}

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

        // Modals
        this.modalGuessWord = document.getElementById('modal-guess-word');
        this.modalPrize = document.getElementById('modal-prize');
        this.modalPrizeReveal = document.getElementById('modal-prize-reveal');
        this.modalCaskets = document.getElementById('modal-caskets');
        this.modalSuperOffer = document.getElementById('modal-super-offer');
        this.modalPrizeShop = document.getElementById('modal-prize-shop');
        this.modalMuseum = document.getElementById('modal-museum');
        this.museumBadge = document.getElementById('museum-badge');
        this.btnMuseum = document.getElementById('btn-open-museum');
        
        this.hostHintElement = document.getElementById('host-hint');
        
        this.vowels = ['А', 'Е', 'Ё', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я'];
        this.wheelSectors = [100, 250, 'Б', 500, '0', 750, 1000, 'П', 350, 500, '+', 800];
        
        this.audioCtx = null;
        this.currentMuseumFilter = 'all';
        
        this.setupKeyboard();
        if (this.spinBtn) {
            this.spinBtn.addEventListener('click', () => {
                this.initAudio();
                this.game.handleSpinClick();
            });
        }
        if (this.guessBtn) {
            this.guessBtn.addEventListener('click', () => {
                this.initAudio();
                this.game.handleGuessWordClick();
            });
        }
        if (this.btnMuseum) {
            this.btnMuseum.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.initAudio();
                this.showMuseumModal();
            });
        }
    }


    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTick() {
        if (!this.audioCtx) return;
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
        if (!this.audioCtx) return;
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

    playPurchase() {
        if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(987.77, now); // B5
        osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        osc2.frequency.setValueAtTime(1975.53, now + 0.16); // B6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start(now);
        osc2.start(now + 0.08);
        osc1.stop(now + 0.45);
        osc2.stop(now + 0.45);
    }

    updateMuseumBadge() {
        if (!this.museumBadge) return;
        const stats = this.game.museumManager.getStats();
        const total = this.game.museumManager.catalog.length;
        this.museumBadge.textContent = `(${stats.prizesCollected}/${total})`;
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
        if (!this.keyboardElement) return;
        this.keyboardElement.innerHTML = '';
        alphabet.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'key';
            btn.textContent = letter;
            btn.dataset.letter = letter;
            
            btn.addEventListener('click', () => {
                this.initAudio();
                btn.disabled = true;
                this.game.handleLetterClick(letter, this.vowels.includes(letter));
            });
            this.keyboardElement.appendChild(btn);
        });
    }

    resetKeyboard() {
        if (this.keyboardElement) {
            this.keyboardElement.classList.remove('disabled');
            Array.from(this.keyboardElement.children).forEach(key => {
                key.disabled = false;
            });
        }
    }

    initBoard(word, hint) {
        if (!this.boardElement) return;
        this.boardElement.innerHTML = '';
        if (hint && this.hostHintElement) {
            this.hostHintElement.textContent = `Задание: ${hint}`;
        }
        for (let i = 0; i < word.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            this.boardElement.appendChild(cell);
        }
    }

    updateBoard(word, revealedLetters) {
        if (!this.boardElement) return;
        for (let i = 0; i < word.length; i++) {
            const cell = this.boardElement.children[i];
            if (cell && revealedLetters.has(word[i]) && !cell.classList.contains('revealed')) {
                cell.classList.add('revealed', 'pop-in');
                cell.textContent = word[i];
                this.playTick();
            }
        }
    }

    enableCellClick(callback) {
        if (!this.boardElement) return;
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
        if (!this.playersElement) return;
        this.playersElement.innerHTML = '';
        players.forEach((p, index) => {
            const div = document.createElement('div');
            div.className = `player-card ${index === activeIndex ? 'active' : ''} ${p.isEliminated ? 'eliminated' : ''}`;
            const avatarHtml = p.avatar ? `<img src="${p.avatar}" alt="${p.name}" class="player-avatar">` : '';
            div.innerHTML = `
                ${avatarHtml}
                <div class="player-info">
                    <div class="player-name">${p.name}</div>
                    <div class="player-score">${p.score} ⭐</div>
                </div>
            `;
            this.playersElement.appendChild(div);
        });
    }

    updateStatus(message) {
        if (this.statusElement) {
            const statusEl = this.statusElement;
            statusEl.classList.remove('status-animate');
            void statusEl.offsetWidth; // force reflow
            statusEl.textContent = message;
            statusEl.classList.add('status-animate');
        }
    }

    enableSpinAndGuessButtons() {
        if (this.spinBtn) this.spinBtn.disabled = false;
        if (this.guessBtn) this.guessBtn.disabled = false;
    }

    disableControls() {
        if (this.spinBtn) this.spinBtn.disabled = true;
        if (this.guessBtn) this.guessBtn.disabled = true;
        this.disableKeyboard();
    }

    enableKeyboard() {
        if (this.keyboardElement) this.keyboardElement.classList.remove('disabled');
    }

    disableKeyboard() {
        if (this.keyboardElement) this.keyboardElement.classList.add('disabled');
    }

    spinWheel(callback) {
        if (!this.wheel) return;
        const spins = 3;
        const randomSectorIndex = Math.floor(Math.random() * this.wheelSectors.length);
        const sectorValue = this.wheelSectors[randomSectorIndex];
        
        const sectorAngle = 30;
        const targetDeg = (spins * 360) - (randomSectorIndex * sectorAngle) - (sectorAngle / 2); 
        
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
        const titleEl = document.getElementById('modal-title');
        const textEl = document.getElementById('modal-text');
        const btn = document.getElementById('btn-modal-action');

        if (titleEl) titleEl.textContent = title;
        if (textEl) textEl.textContent = text;
        if (btn) btn.textContent = btnText;
        
        const handler = () => {
            if (btn) btn.removeEventListener('click', handler);
            if (this.modalOverlay) hideModal(this.modalOverlay);
            if (onAction) onAction();
        };
        if (btn) btn.addEventListener('click', handler);
        if (this.modalOverlay) showModal(this.modalOverlay);
    }

    showPrizeModal(onTakePrize, onTakePoints) {
        const btnPrize = document.getElementById('btn-take-prize');
        const btnPoints = document.getElementById('btn-take-points');
        
        const prizeHandler = () => {
            if (btnPrize) btnPrize.removeEventListener('click', prizeHandler);
            if (btnPoints) btnPoints.removeEventListener('click', pointsHandler);
            if (this.modalPrize) hideModal(this.modalPrize);
            if (onTakePrize) onTakePrize();
        };

        const pointsHandler = () => {
            if (btnPrize) btnPrize.removeEventListener('click', prizeHandler);
            if (btnPoints) btnPoints.removeEventListener('click', pointsHandler);
            if (this.modalPrize) hideModal(this.modalPrize);
            if (onTakePoints) onTakePoints();
        };

        if (btnPrize) btnPrize.addEventListener('click', prizeHandler);
        if (btnPoints) btnPoints.addEventListener('click', pointsHandler);
        
        if (this.modalPrize) showModal(this.modalPrize);
    }

    showPrizeReveal(trophy, onAction) {
        if (!this.modalPrizeReveal) {
            if (onAction) onAction();
            return;
        }

        const prize = this.game.museumManager.catalog.find(p => p.id === (trophy ? trophy.prizeId : ''));
        const iconEl = document.getElementById('reveal-icon');
        const titleEl = document.getElementById('reveal-title');
        const descEl = document.getElementById('reveal-desc');
        const btn = document.getElementById('btn-reveal-ok');

        if (iconEl && prize) iconEl.textContent = prize.icon;
        if (titleEl && prize) titleEl.textContent = prize.name;
        if (descEl && prize) descEl.textContent = prize.description;

        this.playWin();
        this.triggerConfetti();

        const handler = () => {
            if (btn) btn.removeEventListener('click', handler);
            hideModal(this.modalPrizeReveal);
            if (onAction) onAction();
        };
        if (btn) btn.addEventListener('click', handler);
        showModal(this.modalPrizeReveal);
    }

    showGuessWordModal(onSubmit, onCancel) {
        const input = document.getElementById('input-guess-word');
        const btnSubmit = document.getElementById('btn-submit-word');
        const btnCancel = document.getElementById('btn-cancel-word');

        if (input) input.value = '';

        const submitHandler = () => {
            const word = input ? input.value.trim() : '';
            if (!word) return;
            cleanup();
            onSubmit(word);
        };

        const cancelHandler = () => {
            cleanup();
            onCancel();
        };

        const cleanup = () => {
            if (btnSubmit) btnSubmit.removeEventListener('click', submitHandler);
            if (btnCancel) btnCancel.removeEventListener('click', cancelHandler);
            if (this.modalGuessWord) hideModal(this.modalGuessWord);
        };

        if (btnSubmit) btnSubmit.addEventListener('click', submitHandler);
        if (btnCancel) btnCancel.addEventListener('click', cancelHandler);

        if (this.modalGuessWord) showModal(this.modalGuessWord);
        if (input) input.focus();
    }

    showCasketsModal(onWin, onLose) {
        const btn1 = document.getElementById('btn-casket-1');
        const btn2 = document.getElementById('btn-casket-2');
        
        const winningCasket = Math.random() < 0.5 ? 1 : 2;

        const makeSelection = (selected) => {
            if (btn1) btn1.removeEventListener('click', handler1);
            if (btn2) btn2.removeEventListener('click', handler2);
            if (this.modalCaskets) hideModal(this.modalCaskets);
            if (selected === winningCasket) {
                onWin();
            } else {
                onLose();
            }
        };

        const handler1 = () => makeSelection(1);
        const handler2 = () => makeSelection(2);

        if (btn1) btn1.addEventListener('click', handler1);
        if (btn2) btn2.addEventListener('click', handler2);

        if (this.modalCaskets) showModal(this.modalCaskets);
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
            if (btnYes) btnYes.removeEventListener('click', yesHandler);
            if (btnNo) btnNo.removeEventListener('click', noHandler);
            if (this.modalSuperOffer) hideModal(this.modalSuperOffer);
        };

        if (btnYes) btnYes.addEventListener('click', yesHandler);
        if (btnNo) btnNo.addEventListener('click', noHandler);

        if (this.modalSuperOffer) showModal(this.modalSuperOffer);
    }

    showPrizeShop(player, onFinish) {
        if (!this.modalPrizeShop) return;

        const shopScoreEl = document.getElementById('shop-player-score');
        const shopPlayerNameEl = document.getElementById('shop-player-name');
        const shopAvatarEl = document.getElementById('shop-player-avatar');
        const gridEl = document.getElementById('shop-prizes-grid');
        const btnFinish = document.getElementById('btn-shop-finish');

        const renderShop = () => {
            if (shopScoreEl) shopScoreEl.textContent = `${player.score} ⭐`;
            if (shopPlayerNameEl) shopPlayerNameEl.textContent = player.name;
            if (shopAvatarEl && player.avatar) shopAvatarEl.src = player.avatar;

            if (gridEl) {
                gridEl.innerHTML = '';
                this.game.museumManager.catalog.forEach(item => {
                    const isOwned = this.game.museumManager.isPrizeOwned(item.id);
                    const canAfford = player.score >= item.price;
                    
                    const card = document.createElement('div');
                    card.className = `prize-card rarity-${item.rarity} ${isOwned ? 'owned' : ''}`;
                    card.dataset.prizeId = item.id;

                    const rarityNameMap = {
                        common: 'Обычный',
                        rare: 'Редкий',
                        epic: 'Эпический',
                        legendary: 'Легендарный'
                    };

                    let btnHtml = '';
                    if (isOwned) {
                        btnHtml = `<button class="btn btn-shop-action btn-owned" disabled>✓ В коллекции</button>`;
                    } else if (canAfford) {
                        btnHtml = `<button class="btn btn-shop-action primary-btn btn-buy">Купить за ${item.price} ⭐</button>`;
                    } else {
                        btnHtml = `<button class="btn btn-shop-action btn-insufficient" disabled>Не хватает очков (${item.price} ⭐)</button>`;
                    }

                    card.innerHTML = `
                        <div class="prize-rarity-badge badge-${item.rarity}">${rarityNameMap[item.rarity] || item.rarity}</div>
                        <div class="prize-icon">${item.icon}</div>
                        <h4 class="prize-title">${item.name}</h4>
                        <div class="prize-category">${item.category}</div>
                        <p class="prize-desc">${item.description}</p>
                        <div class="prize-footer">
                            <div class="prize-price">${item.price === 0 ? 'Бесплатно' : item.price + ' ⭐'}</div>
                            ${btnHtml}
                        </div>
                    `;

                    const buyBtn = card.querySelector('.btn-buy');
                    if (buyBtn) {
                        buyBtn.addEventListener('click', () => {
                            this.initAudio();
                            const res = this.game.buyPrize(item.id);
                            if (res.success) {
                                this.playPurchase();
                                renderShop();
                                this.updateMuseumBadge();
                            } else {
                                card.classList.add('shake');
                                setTimeout(() => card.classList.remove('shake'), 600);
                            }
                        });
                    }

                    gridEl.appendChild(card);
                });
            }
        };

        renderShop();

        const finishHandler = () => {
            if (btnFinish) btnFinish.removeEventListener('click', finishHandler);
            hideModal(this.modalPrizeShop);
            if (onFinish) onFinish();
        };

        if (btnFinish) {
            btnFinish.removeEventListener('click', finishHandler);
            btnFinish.addEventListener('click', finishHandler);
        }

        showModal(this.modalPrizeShop);
    }

    showMuseumModal() {
        if (!this.modalMuseum) {
            this.modalMuseum = document.getElementById('modal-museum');
        }
        if (!this.modalMuseum) return;

        showModal(this.modalMuseum);

        try {
            const stats = this.game.museumManager.getStats();
            const totalCatalog = this.game.museumManager.catalog.length;
            const percent = Math.round((stats.prizesCollected / (totalCatalog || 1)) * 100);


        // Обновление дашборда статистики
        const elGames = document.getElementById('stat-games');
        const elRounds = document.getElementById('stat-rounds');
        const elSuper = document.getElementById('stat-super');
        const elPoints = document.getElementById('stat-points');
        const elPrizes = document.getElementById('stat-prizes');
        const elProgress = document.getElementById('stat-progress-bar');
        const elPercent = document.getElementById('stat-percent');

        if (elGames) elGames.textContent = stats.gamesPlayed;
        if (elRounds) elRounds.textContent = stats.roundsWon;
        if (elSuper) elSuper.textContent = stats.superGameWins;
        if (elPoints) elPoints.textContent = stats.totalPointsEarned;
        if (elPrizes) elPrizes.textContent = `${stats.prizesCollected} из ${totalCatalog}`;
        if (elProgress) elProgress.style.width = `${percent}%`;
        if (elPercent) elPercent.textContent = `${percent}%`;

        // Рендер грида трофеев
        const trophyGrid = document.getElementById('museum-trophies-grid');
        const renderTrophies = () => {
            if (!trophyGrid) return;
            trophyGrid.innerHTML = '';

            const filtered = this.game.museumManager.catalog.filter(p => {
                if (this.currentMuseumFilter === 'all') return true;
                return p.rarity === this.currentMuseumFilter;
            });

            const collection = this.game.museumManager.getCollection();

            filtered.forEach(item => {
                const trophyRecord = collection.find(t => t.prizeId === item.id);
                const isOwned = !!trophyRecord;

                const card = document.createElement('div');
                card.className = `trophy-card rarity-${item.rarity} ${isOwned ? 'unlocked' : 'locked'}`;

                const rarityNameMap = {
                    common: 'Обычный',
                    rare: 'Редкий',
                    epic: 'Эпический',
                    legendary: 'Легендарный'
                };

                const sourceNameMap = {
                    shop: 'Витрина подарков',
                    prize_sector: 'Сектор «Приз»',
                    super_game: 'Супер-игра'
                };

                if (isOwned) {
                    const dateStr = new Date(trophyRecord.unlockedAt).toLocaleDateString('ru-RU');
                    card.innerHTML = `
                        <div class="trophy-badge badge-${item.rarity}">${rarityNameMap[item.rarity]}</div>
                        <div class="trophy-icon">${item.icon}</div>
                        <h4 class="trophy-name">${item.name}</h4>
                        <div class="trophy-category">${item.category}</div>
                        <p class="trophy-desc">${item.description}</p>
                        <div class="trophy-meta">
                            <span>📅 ${dateStr}</span>
                            <span>🎯 ${sourceNameMap[trophyRecord.source] || trophyRecord.source}</span>
                            <span>👤 ${trophyRecord.playerName}</span>
                        </div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="trophy-badge badge-${item.rarity}">${rarityNameMap[item.rarity]}</div>
                        <div class="trophy-icon">🔒</div>
                        <h4 class="trophy-name">???</h4>
                        <div class="trophy-category">${item.category}</div>
                        <p class="trophy-desc">Экспонат еще не открыт. Заработайте очки на витрине или выиграйте в супер-игре!</p>
                        <div class="trophy-meta">
                            <span>⭐ Цена: ${item.price} очков</span>
                        </div>
                    `;
                }

                trophyGrid.appendChild(card);
            });
        };

        renderTrophies();

        // Фильтры табов
        const tabBtns = document.querySelectorAll('.museum-tab-btn');
        tabBtns.forEach(btn => {
            btn.onclick = () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentMuseumFilter = btn.dataset.filter || 'all';
                renderTrophies();
            };
        });

        // Кнопка закрытия
        const btnClose = document.getElementById('btn-close-museum');
        const btnCloseTop = document.getElementById('btn-close-museum-top');
        const closeHandler = () => {
            hideModal(this.modalMuseum);
            if (this.game && this.game.stateMachine && this.game.stateMachine.state === 'PRIZE_SHOP') {
                this.game.restartNewGame();
            }
        };
        if (btnClose) btnClose.onclick = closeHandler;
        if (btnCloseTop) btnCloseTop.onclick = closeHandler;

        // Кнопка новой игры
        const btnNewGame = document.getElementById('btn-new-game-museum');
        if (btnNewGame) {
            btnNewGame.onclick = () => {
                hideModal(this.modalMuseum);
                this.game.restartNewGame();
            };
        }

        // Кнопка сброса прогресса
        const btnReset = document.getElementById('btn-reset-museum');
        if (btnReset) {
            btnReset.onclick = () => {
                if (confirm('Вы действительно хотите очистить коллекцию Музея и обнулить статистику?')) {
                    this.game.museumManager.resetProgress();
                    this.updateMuseumBadge();
                    this.showMuseumModal();
                }
            };
            }
        } catch (error) {
            console.error('Error rendering Museum modal:', error);
        }
    }


    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
            loader.style.display = 'none';
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }
    }
}


