import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock DOM before importing
global.document = {
    getElementById: () => ({
        addEventListener: () => {},
        children: Array.from({length: 33}).map(() => ({ disabled: false })),
        style: {},
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {},
        innerHTML: ''
    }),
    createElement: () => ({
        classList: { add: () => {} },
        addEventListener: () => {},
        appendChild: () => {},
        style: {},
        dataset: {}
    }),
};
global.window = {
    AudioContext: class {
        createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} } }; }
        createGain() { return { connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
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

describe('Game Word Selection Logic', () => {
    beforeEach(() => {
        global.localStorage.clear();
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
        
        // Первый вызов внутри init
        const w1 = game.context.secretWord;
        
        // Второй вызов
        const pick2 = game.pickRandomWord(false);
        const w2 = pick2.word.toUpperCase();
        
        assert.notStrictEqual(w1, w2, 'Should pick a different word');
        assert.strictEqual(game.playedWordsCache.size, 2, 'Cache should contain 2 words');
        
        // Третий вызов (словарь обычных слов исчерпан, ожидается сброс)
        const pick3 = game.pickRandomWord(false);
        const w3 = pick3.word.toUpperCase();
        
        assert.strictEqual(game.playedWordsCache.size, 1, 'Cache should be cleared and then 1 word added');
        assert.ok(w3 === 'ПЕРВОЕ' || w3 === 'ВТОРОЕ', 'Should pick a valid regular word');
        
        // Проверка записи в localStorage
        const cachedStr = global.localStorage.getItem('pole_chudes_cache');
        assert.ok(cachedStr, 'localStorage should have cache');
        const cachedArr = JSON.parse(cachedStr);
        assert.deepStrictEqual(cachedArr, [w3], 'localStorage should match memory cache');
    });
});
