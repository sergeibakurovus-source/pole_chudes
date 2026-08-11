import { test, describe, before } from 'node:test';
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

global.fetch = async () => ({
    ok: true,
    json: async () => [
        { word: 'ПРОГРАММА', hint: 'Тест', superGame: false },
        { word: 'СУПЕР', hint: 'Тест 2', superGame: true }
    ]
});

import { Game } from '../src/js/game.js';

describe('Game Word Selection Logic', () => {
    test('Game initializes with a regular word (not superGame)', async () => {
        const game = new Game();
        await game.init();
        const wordInfo = game.wordList.find(w => w.word === game.context.secretWord);
        assert.ok(wordInfo, 'Word should exist in word list');
        assert.strictEqual(wordInfo.superGame, false, 'Word should not be a super game word');
    });

    test('setupSuperGame selects a superGame word', async () => {
        const game = new Game();
        await game.init();
        game.setupSuperGame();
        const wordInfo = game.wordList.find(w => w.word === game.context.secretWord);
        assert.ok(wordInfo, 'Word should exist in word list');
        assert.strictEqual(wordInfo.superGame, true, 'Word should be a super game word');
        assert.strictEqual(game.context.isSuperGame, true, 'isSuperGame should be true');
        assert.strictEqual(game.context.superGameSetupLettersLeft, 3, 'Should allow 3 letters to open');
    });
});
