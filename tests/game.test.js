import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock DOM before importing
global.document = {
    getElementById: () => ({
        addEventListener: () => {},
        removeEventListener: () => {},
        children: Array.from({length: 33}).map(() => ({ disabled: false, classList: { add: () => {}, remove: () => {}, contains: () => false } })),
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        appendChild: () => {},
        innerHTML: ''
    }),
    querySelectorAll: () => [],
    createElement: () => ({
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        addEventListener: () => {},
        removeEventListener: () => {},
        appendChild: () => {},
        querySelector: () => ({ addEventListener: () => {} }),
        style: {},
        dataset: {}
    }),
};
global.window = {
    AudioContext: class {
        createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} } }; }
        createGain() { return { connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
        get currentTime() { return 0; }
        get destination() { return {}; }
    }
};

// Mock localStorage
global.localStorage = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, value) { this._data[key] = String(value); },
    removeItem(key) { delete this._data[key]; },
    clear() { this._data = {}; }
};

// Mock fetch with test dictionary
global.fetch = async () => ({
    ok: true,
    json: async () => [
        { word: 'ПЕРВОЕ', hint: 'Тест 1', superGame: false },
        { word: 'ВТОРОЕ', hint: 'Тест 2', superGame: false },
        { word: 'СУПЕР', hint: 'Тест 3', superGame: true }
    ]
});

import { Game } from '../src/js/game.js';
import { GameState } from '../src/js/state.js';
import { PRIZES_CATALOG, MuseumManager } from '../src/js/prizes.js';
import { WardrobeManager } from '../src/js/wardrobe.js';

describe('Game Word Selection Logic & Three Bogatyrs', () => {
    beforeEach(() => {
        global.localStorage.clear();
    });

    test('Game initializes with Three Bogatyrs (Public Domain / Clean Room IP)', () => {
        const game = new Game();
        assert.strictEqual(game.context.players.length, 3);
        assert.strictEqual(game.context.players[0].name, 'Илья Муромец');
        assert.strictEqual(game.context.players[1].name, 'Добрыня Никитич');
        assert.strictEqual(game.context.players[2].name, 'Алёша Попович');
    });

    test('Game initializes with a regular word (not superGame)', async () => {
        const game = new Game();
        await game.init();
        const wordInfo = game.wordList.find(w => w.word.toUpperCase() === game.context.secretWord);
        assert.ok(wordInfo, 'Word should exist in word list');
        assert.strictEqual(wordInfo.superGame, false, 'Word should not be a super game word');
    });

    test('setupSuperGame selects a superGame word', async () => {
        const game = new Game();
        await game.init();
        game.setupSuperGame();
        const wordInfo = game.wordList.find(w => w.word.toUpperCase() === game.context.secretWord);
        assert.ok(wordInfo, 'Word should exist in word list');
        assert.strictEqual(wordInfo.superGame, true, 'Word should be a super game word');
        assert.strictEqual(game.context.isSuperGame, true, 'isSuperGame should be true');
        assert.strictEqual(game.context.superGameSetupLettersLeft, 3, 'Should allow 3 letters to open');
    });

    test('pickRandomWord avoids played words and clears cache when exhausted', async () => {
        const game = new Game();
        await game.init(); 
        
        const w1 = game.context.secretWord;
        
        const pick2 = game.pickRandomWord(false);
        const w2 = pick2.word.toUpperCase();
        
        assert.notStrictEqual(w1, w2, 'Should pick a different word');
        assert.strictEqual(game.playedWordsCache.size, 2, 'Cache should contain 2 words');
        
        const pick3 = game.pickRandomWord(false);
        const w3 = pick3.word.toUpperCase();
        
        assert.strictEqual(game.playedWordsCache.size, 1, 'Cache should be cleared and then 1 word added');
        assert.ok(w3 === 'ПЕРВОЕ' || w3 === 'ВТОРОЕ', 'Should pick a valid regular word');
        
        const cachedStr = global.localStorage.getItem('pole_chudes_cache');
        assert.ok(cachedStr, 'localStorage should have cache');
        const cachedArr = JSON.parse(cachedStr);
        assert.deepStrictEqual(cachedArr, [w3], 'localStorage should match memory cache');
    });
});

describe('Slavic Folklore Prize Catalog & MuseumManager Logic', () => {
    beforeEach(() => {
        global.localStorage.clear();
    });

    test('PRIZES_CATALOG contains exactly 16 authentic Slavic folklore prizes with required fields', () => {
        assert.strictEqual(PRIZES_CATALOG.length, 16, 'Catalog must contain 16 items');
        const validRarities = ['common', 'rare', 'epic', 'legendary'];
        
        PRIZES_CATALOG.forEach(item => {
            assert.ok(item.id, 'Item must have id');
            assert.ok(item.name, 'Item must have name');
            assert.ok(validRarities.includes(item.rarity), `Invalid rarity: ${item.rarity}`);
            assert.ok(typeof item.price === 'number' && item.price >= 0, 'Price must be non-negative number');
            assert.ok(item.icon, 'Item must have icon');
            assert.ok(item.description, 'Item must have description');
            assert.ok(item.category, 'Item must have category');
            assert.ok(Array.isArray(item.sourcePool), 'Item must have sourcePool array');
        });
    });

    test('MuseumManager handles buying folklore prizes with score deduction and collection persistence', () => {
        const mm = new MuseumManager();
        const player = { id: 1, name: 'Илья Муромец', score: 3000 };

        const res = mm.buyPrize('prize_pickles', player);
        assert.strictEqual(res.success, true, 'Purchase should succeed');
        assert.strictEqual(player.score, 2900, 'Score should be deducted by 100');
        assert.strictEqual(mm.isPrizeOwned('prize_pickles'), true, 'Prize should be owned');

        const collection = mm.getCollection();
        assert.strictEqual(collection.length, 1);
        assert.strictEqual(collection[0].prizeId, 'prize_pickles');
        assert.strictEqual(collection[0].playerName, 'Илья Муромец');
        assert.strictEqual(collection[0].costPaid, 100);

        // Cannot buy same prize again
        const res2 = mm.buyPrize('prize_pickles', player);
        assert.strictEqual(res2.success, false, 'Duplicate purchase should fail');
    });

    test('MuseumManager overdraft protection prevents purchase when score is insufficient', () => {
        const mm = new MuseumManager();
        const player = { id: 3, name: 'Алёша Попович', score: 50 };

        const res = mm.buyPrize('prize_horse', player);
        assert.strictEqual(res.success, false, 'Overdraft purchase should fail');
        assert.strictEqual(player.score, 50, 'Score must remain unchanged');
        assert.strictEqual(mm.isPrizeOwned('prize_horse'), false, 'Prize must not be added');
    });

    test('Sector P accepts prize bargain and grants folklore trophy to museum', async () => {
        const game = new Game();
        await game.init();
        game.context.players[0].score = 500;

        const trophy = game.acceptPrizeBargain();
        assert.ok(trophy, 'Trophy should be returned');
        assert.strictEqual(game.context.players[0].isEliminated, true, 'Player should be eliminated after taking prize');
        assert.strictEqual(game.museumManager.isPrizeOwned(trophy.prizeId), true, 'Trophy should be stored in museum');
    });

    test('Super game win automatically awards the legendary horse Burushka and unlocks cosmonaut outfit', async () => {
        const game = new Game();
        await game.init();

        const trophy = game.awardSuperGamePrize();
        assert.strictEqual(trophy.prizeId, 'prize_horse');
        assert.strictEqual(trophy.source, 'super_game');
        assert.strictEqual(game.museumManager.isPrizeOwned('prize_horse'), true);

        const stats = game.museumManager.getStats();
        assert.strictEqual(stats.superGameWins, 1);

        // Verify cosmonaut outfit was unlocked in wardrobe
        assert.strictEqual(game.wardrobeManager.isUnlocked('outfit_cosmonaut'), true);
    });

    test('Resetting progress clears museum collection and statistics', () => {
        const mm = new MuseumManager();
        const player = { id: 2, name: 'Добрыня Никитич', score: 10000 };
        mm.buyPrize('prize_samovar', player);
        mm.recordRoundWin(2000);

        assert.strictEqual(mm.getCollection().length, 1);
        mm.resetProgress();

        assert.strictEqual(mm.getCollection().length, 0);
        const stats = mm.getStats();
        assert.strictEqual(stats.gamesPlayed, 0);
        assert.strictEqual(stats.roundsWon, 0);
        assert.strictEqual(stats.prizesCollected, 0);
    });
});

describe('Continuous Game Loop (restartNewGame)', () => {
    beforeEach(() => {
        global.localStorage.clear();
    });

    test('restartNewGame restores Three Bogatyrs and resets game state', async () => {
        const game = new Game();
        await game.init();
        
        game.context.isSuperGame = true;
        game.context.revealedLetters.add('А');
        game.context.players[0].score = 5000;
        game.context.players[1].isEliminated = true;
        game.stateMachine.state = GameState.GAME_OVER;
        
        game.restartNewGame();
        
        assert.strictEqual(game.context.isSuperGame, false, 'isSuperGame should be false');
        assert.strictEqual(game.context.revealedLetters.size, 0, 'revealedLetters should be empty');
        
        game.context.players.forEach((p, idx) => {
            assert.strictEqual(p.isEliminated, false, `Player ${idx} should not be eliminated`);
            assert.strictEqual(p.score, 0, `Player ${idx} score should be 0`);
        });

        assert.strictEqual(game.context.players[0].name, 'Илья Муромец');
        assert.strictEqual(game.context.players[1].name, 'Добрыня Никитич');
        assert.strictEqual(game.context.players[2].name, 'Алёша Попович');
        
        assert.strictEqual(game.stateMachine.state, GameState.WAITING_FOR_SPIN, 'State should be WAITING_FOR_SPIN');
    });
});
