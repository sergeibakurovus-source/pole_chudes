import { StateMachine, GameState } from './state.js';
import { UI } from './ui.js';
import { MuseumManager } from './prizes.js';

export class Game {
    constructor() {
        this.wordList = [];
        this.playedWordsCache = new Set();
        this.museumManager = new MuseumManager();

        this.context = {
            players: [
                { id: 1, name: 'Гарри', avatar: 'assets/avatar_harry.png', score: 0, isEliminated: false },
                { id: 2, name: 'Гермиона', avatar: 'assets/avatar_hermione.png', score: 0, isEliminated: false },
                { id: 3, name: 'Рон', avatar: 'assets/avatar_ron.png', score: 0, isEliminated: false }
            ],
            activePlayerIndex: 0,
            secretWord: '',
            hint: '',
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

    async init() {
        try {
            const response = await fetch('assets/dictionary.json');
            if (!response.ok) throw new Error('Network response was not ok');
            this.wordList = await response.json();
        } catch (error) {
            console.error("Failed to load dictionary:", error);
            this.wordList = [{word: "ОШИБКА", hint: "Словарь не загружен", superGame: false}];
        }

        const cache = localStorage.getItem('pole_chudes_cache');
        if (cache) {
            try {
                this.playedWordsCache = new Set(JSON.parse(cache));
            } catch (e) {
                this.playedWordsCache = new Set();
            }
        }

        const randomItem = this.pickRandomWord(false);

        this.context.secretWord = randomItem.word.toUpperCase();
        this.context.hint = randomItem.hint;
    }

    pickRandomWord(isSuperGame) {
        let availableWords = this.wordList.filter(w => !!w.superGame === isSuperGame && !this.playedWordsCache.has(w.word.toUpperCase()));
        
        if (availableWords.length === 0) {
            this.playedWordsCache.clear();
            localStorage.removeItem('pole_chudes_cache');
            availableWords = this.wordList.filter(w => !!w.superGame === isSuperGame);
        }
        
        const randomItem = availableWords[Math.floor(Math.random() * availableWords.length)];
        if (randomItem) {
            this.playedWordsCache.add(randomItem.word.toUpperCase());
            localStorage.setItem('pole_chudes_cache', JSON.stringify(Array.from(this.playedWordsCache)));
        }
        
        return randomItem || { word: "ОШИБКА", hint: "Словарь пуст" };
    }

    start() {
        this.museumManager.recordGamePlayed();
        this.ui.initBoard(this.context.secretWord, this.context.hint);
        this.ui.updatePlayers(this.context.players, this.context.activePlayerIndex);
        this.ui.updateMuseumBadge();
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

    buyPrize(prizeId) {
        const activePlayer = this.context.players[this.context.activePlayerIndex];
        const res = this.museumManager.buyPrize(prizeId, activePlayer);
        if (res.success) {
            this.ui.updatePlayers(this.context.players, this.context.activePlayerIndex);
        }
        return res;
    }

    acceptPrizeBargain() {
        const activePlayer = this.context.players[this.context.activePlayerIndex];
        const trophy = this.museumManager.grantRandomPrize('prize_sector', activePlayer.name);
        this.eliminateCurrentPlayer();
        this.ui.updateMuseumBadge();
        return trophy;
    }

    awardSuperGamePrize() {
        const activePlayer = this.context.players[this.context.activePlayerIndex];
        const trophy = this.museumManager.grantPrize('prize_car', 'super_game', activePlayer.name, 0);
        this.museumManager.recordSuperGameWin();
        this.ui.updateMuseumBadge();
        return trophy;
    }

    recordRoundWin(points = 0) {
        this.museumManager.recordRoundWin(points);
        this.ui.updateMuseumBadge();
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
        const randomSuper = this.pickRandomWord(true);

        this.context.isSuperGame = true;
        this.context.secretWord = randomSuper.word.toUpperCase(); 
        this.context.hint = randomSuper.hint;
        this.context.revealedLetters = new Set();
        this.context.superGameSetupLettersLeft = 3;
        this.ui.initBoard(this.context.secretWord, this.context.hint);
        
        Array.from(this.ui.keyboardElement.children).forEach(btn => btn.disabled = false);
        this.ui.enableKeyboard();
        this.ui.updateStatus(`Супер-игра: выберите 3 буквы для открытия.`);
    }
}

