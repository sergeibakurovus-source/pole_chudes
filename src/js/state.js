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
    GAME_OVER: 'GAME_OVER'
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
                    `Ход переходит к игроку: ${this.game.context.players[this.game.context.activePlayerIndex].name}`,
                    'Начать ход',
                    () => this.transition(GameState.WAITING_FOR_SPIN)
                );
                break;
            case GameState.WAITING_FOR_SPIN:
                this.game.ui.enableSpinAndGuessButtons();
                this.game.ui.disableKeyboard();
                this.game.ui.updateStatus(`Ход игрока: ${this.game.context.players[this.game.context.activePlayerIndex].name}. Крутите барабан или назовите слово!`);
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
                    this.game.ui.updateStatus('Банкрот! Ваши очки сгорают. Ход переходит дальше.');
                    setTimeout(() => this.transition(GameState.PASSING_TURN), 2000);
                } else if (payload === '0') {
                    this.game.ui.updateStatus('Сектор НОЛЬ! Вы теряете ход.');
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
                    this.game.revealLetter(letter); // points not added
                    this.transition(GameState.CHECK_WIN, { keepTurn: true });
                });
                break;
            case GameState.PRIZE_BARGAIN:
                this.game.ui.showPrizeModal(
                    () => { // Take prize
                        this.game.eliminateCurrentPlayer();
                        this.game.ui.updateStatus('Вы взяли приз и покидаете игру!');
                        setTimeout(() => this.transition(GameState.PASSING_TURN), 2000);
                    },
                    () => { // Take points
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
                            this.transition(GameState.ROUND_WIN);
                        } else {
                            this.game.eliminateCurrentPlayer();
                            this.game.ui.updateStatus(`Слово названо неверно! Вы выбываете.`);
                            setTimeout(() => this.transition(GameState.PASSING_TURN), 2000);
                        }
                    },
                    () => {
                        this.transition(GameState.WAITING_FOR_SPIN);
                    }
                );
                break;
            case GameState.WAITING_FOR_LETTER:
                this.game.ui.enableKeyboard();
                this.game.ui.updateStatus(`Выпало ${this.game.context.currentSectorValue} очков. Выберите согласную букву!`);
                break;
            case GameState.CHECK_MATCH:
                this.game.ui.disableControls();
                const letter = payload;

                if (this.game.context.secretWord.includes(letter)) {
                    this.game.revealLetter(letter);
                    const count = this.game.context.secretWord.split('').filter(c => c === letter).length;
                    this.game.addPoints(this.game.context.currentSectorValue * count);
                    this.transition(GameState.CHECK_WIN);
                } else {
                    this.game.ui.updateStatus(`Буквы "${letter}" нет в слове!`);
                    setTimeout(() => {
                        this.transition(GameState.PASSING_TURN);
                    }, 1500);
                }
                break;
            case GameState.CHECK_WIN:
                if (this.game.isWordFullyRevealed()) {
                    this.transition(GameState.ROUND_WIN);
                } else {
                    setTimeout(() => {
                        if (payload && payload.keepTurn) {
                            this.transition(GameState.WAITING_FOR_SPIN);
                        } else {
                            this.transition(GameState.WAITING_FOR_SPIN);
                        }
                    }, 1000);
                }
                break;
            case GameState.PASSING_TURN:
                const hasNext = this.game.nextPlayer();
                if (!hasNext) {
                    this.transition(GameState.GAME_OVER);
                } else {
                    const activePlayers = this.game.context.players.filter(p => !p.isEliminated);
                    if (activePlayers.length === 1 && activePlayers[0] === this.game.context.players[this.game.context.activePlayerIndex]) {
                        this.game.ui.updateStatus('Остался один игрок! Продолжайте игру.');
                        setTimeout(() => this.transition(GameState.WAITING_FOR_SPIN), 1500);
                    } else {
                        this.transition(GameState.NEXT_PLAYER_ANNOUNCE);
                    }
                }
                break;
            case GameState.ROUND_WIN:
                this.game.ui.showModal(
                    'Победа!',
                    `Победил ${this.game.context.players[this.game.context.activePlayerIndex].name}!`,
                    'Играть снова',
                    () => location.reload()
                );
                break;
            case GameState.GAME_OVER:
                this.game.ui.showModal(
                    'Игра окончена',
                    'Все игроки выбыли. Победителя нет.',
                    'Начать заново',
                    () => location.reload()
                );
                break;
        }
    }
}
