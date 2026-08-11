export const GameState = {
    INIT: 'INIT',
    NEXT_PLAYER_ANNOUNCE: 'NEXT_PLAYER_ANNOUNCE',
    WAITING_FOR_SPIN: 'WAITING_FOR_SPIN',
    SPINNING: 'SPINNING',
    EVALUATE_SECTOR: 'EVALUATE_SECTOR',
    WAITING_FOR_LETTER: 'WAITING_FOR_LETTER',
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
                this.game.ui.enableSpinButton();
                this.game.ui.disableKeyboard();
                this.game.ui.updateStatus(`Ход игрока: ${this.game.context.players[this.game.context.activePlayerIndex].name}. Крутите барабан!`);
                break;
            case GameState.SPINNING:
                this.game.ui.disableControls();
                this.game.ui.spinWheel((sector) => {
                    this.transition(GameState.EVALUATE_SECTOR, sector);
                });
                break;
            case GameState.EVALUATE_SECTOR:
                this.game.context.currentSectorValue = payload;
                this.transition(GameState.WAITING_FOR_LETTER);
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
                        this.transition(GameState.WAITING_FOR_SPIN);
                    }, 1000);
                }
                break;
            case GameState.PASSING_TURN:
                this.game.nextPlayer();
                this.transition(GameState.NEXT_PLAYER_ANNOUNCE);
                break;
            case GameState.ROUND_WIN:
                this.game.ui.showModal(
                    'Победа!',
                    `Победил ${this.game.context.players[this.game.context.activePlayerIndex].name}!`,
                    'Играть снова',
                    () => location.reload()
                );
                break;
        }
    }
}
