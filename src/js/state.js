export const GameState = {
    INIT: 'INIT',
    NEXT_PLAYER_ANNOUNCE: 'NEXT_PLAYER_ANNOUNCE',
    WAITING_FOR_SPIN: 'WAITING_FOR_SPIN',
    SPINNING: 'SPINNING',
    EVALUATE_SECTOR: 'EVALUATE_SECTOR',
    WAITING_FOR_LETTER: 'WAITING_FOR_LETTER',
    WAITING_FOR_CELL: 'WAITING_FOR_CELL',
    PRIZE_BARGAIN: 'PRIZE_BARGAIN',
    GUESSING_WORD: 'GUESSING_WORD',
    CHECK_MATCH: 'CHECK_MATCH',
    PASSING_TURN: 'PASSING_TURN',
    CHECK_WIN: 'CHECK_WIN',
    ROUND_WIN: 'ROUND_WIN',
    GAME_OVER: 'GAME_OVER',
    CASKET_GAME: 'CASKET_GAME',
    SUPER_GAME_OFFER: 'SUPER_GAME_OFFER',
    SUPER_GAME_SETUP: 'SUPER_GAME_SETUP',
    SUPER_GAME_PLAYING: 'SUPER_GAME_PLAYING',
    SUPER_GAME_WIN: 'SUPER_GAME_WIN',
    PRIZE_SHOP: 'PRIZE_SHOP'
};

export class StateMachine {
    constructor(game) {
        this.state = GameState.INIT;
        this.game = game;
    }

    transition(newState, payload = null) {
        console.log(`State transition: ${this.state} -> ${newState}`, payload);
        this.state = newState;

        switch(newState) {
            case GameState.NEXT_PLAYER_ANNOUNCE:
                this.game.ui.showModal(
                    'Переход хода',
                    `Ход переходит к богатырю: ${this.game.context.players[this.game.context.activePlayerIndex].name}`,
                    'Начать ход',
                    () => this.transition(GameState.WAITING_FOR_SPIN)
                );
                break;
            case GameState.WAITING_FOR_SPIN:
                this.game.ui.enableSpinAndGuessButtons();
                this.game.ui.disableKeyboard();
                this.game.ui.updateStatus(`Ход богатыря: ${this.game.context.players[this.game.context.activePlayerIndex].name}. Крутите барабан или назовите слово!`);
                break;
            case GameState.SPINNING:
                this.game.ui.disableControls();
                this.game.ui.spinWheel((sector) => {
                    this.transition(GameState.EVALUATE_SECTOR, sector);
                });
                break;
            case GameState.EVALUATE_SECTOR:
                this.game.context.currentSectorValue = payload;
                if (payload === 'Б') {
                    this.game.context.players[this.game.context.activePlayerIndex].score = 0;
                    this.game.ui.updatePlayers(this.game.context.players, this.game.context.activePlayerIndex);
                    this.game.ui.updateStatus('Банкрот! Все богатырские очки сгорают! Ход переходит дальше.');
                    setTimeout(() => this.transition(GameState.PASSING_TURN), 2000);
                } else if (payload === '0') {
                    this.game.ui.updateStatus('Сектор НОЛЬ! Переход хода к следующему богатырю.');
                    setTimeout(() => this.transition(GameState.PASSING_TURN), 2000);
                } else if (payload === '+') {
                    this.transition(GameState.WAITING_FOR_CELL);
                } else if (payload === 'П') {
                    this.transition(GameState.PRIZE_BARGAIN);
                } else {
                    this.transition(GameState.WAITING_FOR_LETTER);
                }
                break;
            case GameState.WAITING_FOR_CELL:
                this.game.ui.updateStatus('Сектор ПЛЮС! Кликните на любую закрытую букву на табло, чтобы открыть ее.');
                this.game.ui.enableCellClick((index) => {
                    const letter = this.game.context.secretWord[index];
                    this.game.revealLetter(letter); 
                    this.transition(GameState.CHECK_WIN, { keepTurn: true });
                });
                break;
            case GameState.PRIZE_BARGAIN:
                this.game.ui.showPrizeModal(
                    () => { 
                        const trophy = this.game.acceptPrizeBargain();
                        this.game.ui.showPrizeReveal(trophy, () => {
                            this.transition(GameState.PASSING_TURN);
                        });
                    },
                    () => { 
                        this.game.addPoints(1000);
                        this.game.ui.updateStatus('Вы взяли 1000 очков! Продолжайте игру.');
                        setTimeout(() => this.transition(GameState.WAITING_FOR_SPIN), 2000);
                    }
                );
                break;
            case GameState.GUESSING_WORD:
                this.game.ui.showGuessWordModal(
                    (word) => {
                        if (word.toUpperCase() === this.game.context.secretWord) {
                            this.game.context.secretWord.split('').forEach(l => this.game.revealLetter(l));
                            if (this.game.context.isSuperGame) {
                                this.transition(GameState.SUPER_GAME_WIN);
                            } else {
                                this.transition(GameState.ROUND_WIN);
                            }
                        } else {
                            if (this.game.context.isSuperGame) {
                                if (this.game.context.superGameTimer) clearInterval(this.game.context.superGameTimer);
                                this.game.ui.showModal(
                                    'Неверно',
                                    'Слово названо неверно! Переходим к Витрине подарков.',
                                    'К Витрине призов',
                                    () => this.transition(GameState.PRIZE_SHOP)
                                );
                            } else {
                                this.game.eliminateCurrentPlayer();
                                this.game.ui.updateStatus(`Слово названо неверно! Вы выбываете из текущего тура.`);
                                setTimeout(() => this.transition(GameState.PASSING_TURN), 2000);
                            }
                        }
                    },
                    () => {
                        this.transition(GameState.WAITING_FOR_SPIN);
                    }
                );
                break;
            case GameState.WAITING_FOR_LETTER:
                this.game.ui.enableKeyboard();
                if (this.state === GameState.SUPER_GAME_SETUP) {
                    this.game.ui.updateStatus(`Супер-игра: выберите 3 буквы для открытия.`);
                } else {
                    this.game.ui.updateStatus(`Выпало ${this.game.context.currentSectorValue} очков. Выберите букву! Гласные очков не приносят.`);
                }
                break;
            case GameState.CHECK_MATCH:
                this.game.ui.disableControls();
                const { letter, isVowel } = payload;

                if (this.game.context.secretWord.includes(letter)) {
                    this.game.revealLetter(letter);
                    const count = this.game.context.secretWord.split('').filter(c => c === letter).length;
                    
                    if (!isVowel) {
                        this.game.addPoints(this.game.context.currentSectorValue * count);
                        this.game.context.consecutiveGuesses += 1;
                    }
                    
                    this.transition(GameState.CHECK_WIN, { keepTurn: true, justGuessedRight: true, isVowel });
                } else {
                    this.game.ui.updateStatus(`Буквы "${letter}" нет в слове! Переход хода.`);
                    this.game.context.consecutiveGuesses = 0;
                    setTimeout(() => {
                        this.transition(GameState.PASSING_TURN);
                    }, 1500);
                }
                break;
            case GameState.CHECK_WIN:
                if (this.game.isWordFullyRevealed()) {
                    if (this.game.context.isSuperGame) {
                        this.transition(GameState.SUPER_GAME_WIN);
                    } else {
                        this.transition(GameState.ROUND_WIN);
                    }
                } else {
                    setTimeout(() => {
                        if (payload && payload.justGuessedRight && !payload.isVowel && this.game.context.consecutiveGuesses >= 3 && !this.game.context.isSuperGame) {
                            this.transition(GameState.CASKET_GAME);
                        } else if (payload && payload.keepTurn) {
                            this.transition(GameState.WAITING_FOR_SPIN);
                        } else {
                            this.transition(GameState.WAITING_FOR_SPIN);
                        }
                    }, 1000);
                }
                break;
            case GameState.PASSING_TURN:
                this.game.context.consecutiveGuesses = 0;
                const hasNext = this.game.nextPlayer();
                if (!hasNext) {
                    this.transition(GameState.GAME_OVER);
                } else {
                    const activePlayers = this.game.context.players.filter(p => !p.isEliminated);
                    if (activePlayers.length === 1 && activePlayers[0] === this.game.context.players[this.game.context.activePlayerIndex]) {
                        this.game.ui.updateStatus('Остался один богатырь! Продолжайте игру.');
                        setTimeout(() => this.transition(GameState.WAITING_FOR_SPIN), 1500);
                    } else {
                        this.transition(GameState.NEXT_PLAYER_ANNOUNCE);
                    }
                }
                break;
            case GameState.ROUND_WIN:
                this.game.ui.playWin();
                this.game.ui.triggerConfetti();
                const activeWinner = this.game.context.players[this.game.context.activePlayerIndex];
                this.game.recordRoundWin(activeWinner ? activeWinner.score : 0);
                setTimeout(() => {
                    this.transition(GameState.SUPER_GAME_OFFER);
                }, 4000);
                break;
            case GameState.GAME_OVER:
                this.game.ui.showModal(
                    'Игра окончена',
                    'Все богатыри выбыли. Победителя нет.',
                    'Начать заново',
                    () => {
                        this.game.restartNewGame();
                    }
                );
                break;
            
            case GameState.CASKET_GAME:
                this.game.ui.updateStatus('Две шкатулки от Яквадратиша! Выберите одну из них.');
                this.game.ui.showCasketsModal(
                    () => {
                        this.game.addPoints(5000);
                        this.game.ui.updateStatus('Вы угадали! Получаете 5000 очков!');
                        this.game.context.consecutiveGuesses = 0;
                        setTimeout(() => this.transition(GameState.WAITING_FOR_SPIN), 2000);
                    },
                    () => {
                        this.game.ui.updateStatus('Шкатулка пуста! Ничего страшного, продолжаем.');
                        this.game.context.consecutiveGuesses = 0;
                        setTimeout(() => this.transition(GameState.WAITING_FOR_SPIN), 2000);
                    }
                );
                break;

            case GameState.SUPER_GAME_OFFER:
                this.game.ui.showSuperGameOffer(
                    () => this.transition(GameState.SUPER_GAME_SETUP),
                    () => this.transition(GameState.PRIZE_SHOP)
                );
                break;
            
            case GameState.SUPER_GAME_SETUP:
                this.game.setupSuperGame();
                break;

            case GameState.SUPER_GAME_PLAYING:
                let timeLeft = 60;
                this.game.ui.updateStatus(`Супер-игра началась! У вас 60 секунд. Оставшееся время: ${timeLeft}`);
                this.game.ui.disableKeyboard();
                this.game.ui.guessBtn.disabled = false;
                
                this.game.context.superGameTimer = setInterval(() => {
                    timeLeft--;
                    this.game.ui.updateStatus(`Супер-игра началась! У вас 60 секунд. Оставшееся время: ${timeLeft}`);
                    if (timeLeft <= 0) {
                        clearInterval(this.game.context.superGameTimer);
                        this.game.ui.showModal(
                            'Время вышло',
                            'К сожалению, вы не успели угадать слово. Переходим к Витрине подарков!',
                            'К Витрине призов',
                            () => this.transition(GameState.PRIZE_SHOP)
                        );
                    }
                }, 1000);
                
                this.game.ui.guessBtn.onclick = () => {
                    this.game.ui.showGuessWordModal(
                        (word) => {
                            clearInterval(this.game.context.superGameTimer);
                            if (word.toUpperCase() === this.game.context.secretWord) {
                                this.game.context.secretWord.split('').forEach(l => this.game.revealLetter(l));
                                this.transition(GameState.SUPER_GAME_WIN);
                            } else {
                                this.game.ui.showModal(
                                    'Неверно',
                                    'Слово названо неверно! Переходим к Витрине призов.',
                                    'К Витрине призов',
                                    () => this.transition(GameState.PRIZE_SHOP)
                                );
                            }
                        },
                        () => {}
                    );
                };
                break;

            case GameState.SUPER_GAME_WIN:
                if (this.game.context.superGameTimer) clearInterval(this.game.context.superGameTimer);
                this.game.awardSuperGamePrize();
                this.game.ui.playWin();
                this.game.ui.triggerConfetti();
                this.game.ui.showModal(
                    'Супер-победа!',
                    'Вы выиграли Супер-игру! Легендарный богатырский конь Бурушка добавлен в ваш Музей!',
                    'К Витрине призов',
                    () => this.transition(GameState.PRIZE_SHOP)
                );
                break;

            case GameState.PRIZE_SHOP:
                const winner = this.game.context.players[this.game.context.activePlayerIndex];
                this.game.ui.showPrizeShop(
                    winner,
                    () => {
                        this.game.ui.showMuseumModal();
                    }
                );
                break;
        }
    }
}
