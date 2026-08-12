import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Dictionary Data Validation', () => {
    const dictPath = path.join(process.cwd(), 'src', 'assets', 'dictionary.json');
    let dictionary;

    test('Dictionary file exists and contains valid JSON', () => {
        assert.ok(fs.existsSync(dictPath), 'dictionary.json must exist');
        const fileContent = fs.readFileSync(dictPath, 'utf-8');
        dictionary = JSON.parse(fileContent);
        assert.ok(Array.isArray(dictionary), 'Dictionary must be an array');
    });

    test('Dictionary has exactly 500 words', () => {
        assert.strictEqual(dictionary.length, 500, 'Dictionary must contain exactly 500 words');
    });

    test('All dictionary items have required fields and correct data types', () => {
        dictionary.forEach((item, index) => {
            assert.strictEqual(typeof item.word, 'string', `Item at index ${index} must have a string "word"`);
            assert.strictEqual(typeof item.hint, 'string', `Item at index ${index} must have a string "hint"`);
            assert.strictEqual(typeof item.category, 'string', `Item at index ${index} must have a string "category"`);
            assert.ok([1, 2].includes(item.difficulty), `Item at index ${index} must have difficulty 1 or 2`);
            assert.strictEqual(typeof item.superGame, 'boolean', `Item at index ${index} must have boolean "superGame"`);
        });
    });

    test('All words are unique', () => {
        const words = dictionary.map(item => item.word.toUpperCase());
        const uniqueWords = new Set(words);
        assert.strictEqual(uniqueWords.size, words.length, 'All words must be unique');
    });

    test('Dictionary is perfectly balanced with 5 categories of 100 words each', () => {
        const expectedCategories = ['Животные', 'Природа', 'Сказки', 'Изобретения', 'Космос'];
        const categoryCounts = {};
        
        dictionary.forEach(item => {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        });

        const actualCategories = Object.keys(categoryCounts).sort();
        assert.deepStrictEqual(actualCategories, expectedCategories.sort(), 'Must have exactly the expected 5 categories');

        for (const cat of expectedCategories) {
            assert.strictEqual(categoryCounts[cat], 100, `Category "${cat}" must have exactly 100 words`);
        }
    });
});
