import { StateMachine, GameState } from './state.js';
import { UI } from './ui.js';

export class Game {
    constructor() {
        this.context = {
            players: [
                { id: 1, name: 'Игрок 1', score: 0, isEliminated: false },
                { id: 2, name: 'Игрок 2', score: 0, isEliminated: false },
                { id: 3, name: 'Игрок 3', score: 0, isEliminated: false }
            ],
            activePlayerIndex: 0,
            secretWord: 'КАПИТАЛ', // Для Инкремента 1 гласные просто заблокированы
            revealedLetters: new Set(),
            currentSectorValue: 0
        };
        
        // В Инкременте 1 используем слово без гласных для возможности победить, 
        // так как гласные заблокированы и покупка не реализована.
        this.context.secretWord = 'ВДНХ'; 

        this.ui = new UI(this);
        this.stateMachine = new StateMachine(this);
    }

    start() {
        this.ui.initBoard(this.context.secretWord);
        this.ui.updatePlayers(this.context.players, this.context.activePlayerIndex);
        this.stateMachine.transition(GameState.NEXT_PLAYER_ANNOUNCE);
    }

    handleSpinClick() {
        if (this.stateMachine.state === GameState.WAITING_FOR_SPIN) {
            this.stateMachine.transition(GameState.SPINNING);
        }
    }

    handleLetterClick(letter) {
        if (this.stateMachine.state === GameState.WAITING_FOR_LETTER) {
            this.stateMachine.transition(GameState.CHECK_MATCH, letter);
        }
    }

    revealLetter(letter) {
        this.context.revealedLetters.add(letter);
        this.ui.updateBoard(this.context.secretWord, this.context.revealedLetters);
    }

    addPoints(points) {
        this.context.players[this.context.activePlayerIndex].score += points;
        this.ui.updatePlayers(this.context.players, this.context.activePlayerIndex);
    }

    isWordFullyRevealed() {
        for (const char of this.context.secretWord) {
            if (!this.context.revealedLetters.has(char)) {
                return false;
            }
        }
        return true;
    }

    nextPlayer() {
        let attempts = 0;
        do {
            this.context.activePlayerIndex = (this.context.activePlayerIndex + 1) % this.context.players.length;
            attempts++;
        } while (this.context.players[this.context.activePlayerIndex].isEliminated && attempts < this.context.players.length);
        this.ui.updatePlayers(this.context.players, this.context.activePlayerIndex);
    }
}
