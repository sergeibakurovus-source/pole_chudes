import { StateMachine, GameState } from './state.js';
import { UI } from './ui.js';

export class Game {
    constructor() {
        this.wordList = [
            {word: 'АВТОМОБИЛЬ', hint: 'Мечта каждого участника'},
            {word: 'МЕТАФОРА', hint: 'Скрытое сравнение'},
            {word: 'КАПИТАЛ', hint: 'Главное богатство программы'},
            {word: 'ПОЛЕ', hint: 'Место, где происходят чудеса'},
            {word: 'БАРАБАН', hint: 'То, что нужно вращать'}
        ];
        const randomItem = this.wordList[Math.floor(Math.random() * this.wordList.length)];

        this.context = {
            players: [
                { id: 1, name: 'Гарри', avatar: 'assets/avatar_harry.png', score: 0, isEliminated: false },
                { id: 2, name: 'Гермиона', avatar: 'assets/avatar_hermione.png', score: 0, isEliminated: false },
                { id: 3, name: 'Рон', avatar: 'assets/avatar_ron.png', score: 0, isEliminated: false }
            ],
            activePlayerIndex: 0,
            secretWord: randomItem.word,
            hint: randomItem.hint,
            revealedLetters: new Set(),
            currentSectorValue: 0,
            consecutiveGuesses: 0,
            isSuperGame: false,
            superGameSetupLettersLeft: 3,
            superGameTimer: null
        };

        this.ui = new UI(this);
        this.stateMachine = new StateMachine(this);
    }

    start() {
        this.ui.initBoard(this.context.secretWord, this.context.hint);
        this.ui.updatePlayers(this.context.players, this.context.activePlayerIndex);
        this.stateMachine.transition(GameState.NEXT_PLAYER_ANNOUNCE);
    }

    handleSpinClick() {
        if (this.stateMachine.state === GameState.WAITING_FOR_SPIN) {
            this.stateMachine.transition(GameState.SPINNING);
        }
    }

    handleGuessWordClick() {
        if (this.stateMachine.state === GameState.WAITING_FOR_SPIN) {
            this.stateMachine.transition(GameState.GUESSING_WORD);
        }
    }

    handleLetterClick(letter, isVowel) {
        if (this.stateMachine.state === GameState.WAITING_FOR_LETTER) {
            this.stateMachine.transition(GameState.CHECK_MATCH, { letter, isVowel });
        } else if (this.stateMachine.state === GameState.SUPER_GAME_SETUP) {
            this.context.superGameSetupLettersLeft--;
            if (this.context.secretWord.includes(letter)) {
                this.revealLetter(letter);
            }
            if (this.context.superGameSetupLettersLeft <= 0) {
                this.stateMachine.transition(GameState.SUPER_GAME_PLAYING);
            } else {
                this.ui.updateStatus(`Супер-игра: выберите еще ${this.context.superGameSetupLettersLeft} букв(ы) для открытия.`);
            }
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

    eliminateCurrentPlayer() {
        this.context.players[this.context.activePlayerIndex].isEliminated = true;
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
        const activePlayers = this.context.players.filter(p => !p.isEliminated);
        if (activePlayers.length === 0) {
            return false;
        }

        if (activePlayers.length === 1 && activePlayers[0] === this.context.players[this.context.activePlayerIndex]) {
            return true;
        }

        let attempts = 0;
        do {
            this.context.activePlayerIndex = (this.context.activePlayerIndex + 1) % this.context.players.length;
            attempts++;
        } while (this.context.players[this.context.activePlayerIndex].isEliminated && attempts < this.context.players.length);
        
        this.ui.updatePlayers(this.context.players, this.context.activePlayerIndex);
        return true;
    }

    setupSuperGame() {
        this.context.isSuperGame = true;
        this.context.secretWord = 'ИНВЕСТИЦИЯ'; 
        this.context.hint = 'Вложение средств';
        this.context.revealedLetters = new Set();
        this.context.superGameSetupLettersLeft = 3;
        this.ui.initBoard(this.context.secretWord, this.context.hint);
        
        Array.from(this.ui.keyboardElement.children).forEach(btn => btn.disabled = false);
        this.ui.enableKeyboard();
        this.ui.updateStatus(`Супер-игра: выберите 3 буквы для открытия.`);
    }
}
