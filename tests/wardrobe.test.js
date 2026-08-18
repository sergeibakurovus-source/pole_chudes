import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage
global.localStorage = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, value) { this._data[key] = String(value); },
    removeItem(key) { delete this._data[key]; },
    clear() { this._data = {}; }
};

import { YAKVADRATISH_WARDROBE, WardrobeManager } from '../src/js/wardrobe.js';

describe('Yakvadratish Wardrobe Catalog Validation', () => {
    test('Catalog contains exactly 5 authentic outfits with valid rarities and conditions', () => {
        assert.strictEqual(YAKVADRATISH_WARDROBE.length, 5, 'Wardrobe must contain exactly 5 outfits');
        const validRarities = ['common', 'rare', 'epic', 'legendary'];
        const validUnlockTypes = ['default', 'round_win', 'museum_count', 'total_points', 'super_game_win'];

        YAKVADRATISH_WARDROBE.forEach(outfit => {
            assert.ok(outfit.id, 'Outfit must have id');
            assert.ok(outfit.name, 'Outfit must have name');
            assert.ok(validRarities.includes(outfit.rarity), `Invalid rarity: ${outfit.rarity}`);
            assert.ok(outfit.icon, 'Outfit must have icon');
            assert.ok(outfit.unlockConditionText, 'Outfit must have unlockConditionText');
            assert.ok(validUnlockTypes.includes(outfit.unlockType), `Invalid unlockType: ${outfit.unlockType}`);
            assert.ok(typeof outfit.unlockThreshold === 'number', 'unlockThreshold must be a number');
            assert.ok(outfit.avatarSrc, 'Outfit must have avatarSrc');
            assert.ok(outfit.quote, 'Outfit must have quote');
            assert.ok(outfit.description, 'Outfit must have description');
        });
    });

    test('All 5 outfits map to clean room SVG vector assets', () => {
        YAKVADRATISH_WARDROBE.forEach(outfit => {
            assert.ok(outfit.avatarSrc.endsWith('.svg'), `Avatar src must be .svg: ${outfit.avatarSrc}`);
            assert.ok(outfit.avatarSrc.startsWith('assets/avatar_yakvadratish_'), `Avatar path must follow clean room naming: ${outfit.avatarSrc}`);
        });
    });

    test('Contains classic tuxedo as common default outfit', () => {
        const tuxedo = YAKVADRATISH_WARDROBE.find(o => o.id === 'outfit_tuxedo');
        assert.ok(tuxedo, 'Tuxedo must exist in catalog');
        assert.strictEqual(tuxedo.rarity, 'common');
        assert.strictEqual(tuxedo.unlockType, 'default');
        assert.strictEqual(tuxedo.avatarSrc, 'assets/avatar_yakvadratish_tuxedo.svg');
    });

    test('Contains legendary cosmonaut helmet outfit for super game winner', () => {
        const cosmonaut = YAKVADRATISH_WARDROBE.find(o => o.id === 'outfit_cosmonaut');
        assert.ok(cosmonaut, 'Cosmonaut outfit must exist');
        assert.strictEqual(cosmonaut.rarity, 'legendary');
        assert.strictEqual(cosmonaut.unlockType, 'super_game_win');
        assert.strictEqual(cosmonaut.avatarSrc, 'assets/avatar_yakvadratish_cosmonaut.svg');
    });
});

describe('Wardrobe Cache Migration & Normalization', () => {
    beforeEach(() => {
        global.localStorage.clear();
    });

    test('getWardrobeState normalizes corrupted/legacy state with .png paths or invalid IDs', () => {
        global.localStorage.setItem('pole_chudes_wardrobe', JSON.stringify({
            equippedOutfit: 'assets/avatar_yakubovich.png',
            unlockedOutfits: ['assets/avatar_yakubovich.png', 'invalid_id']
        }));

        const wm = new WardrobeManager();
        const state = wm.getWardrobeState();
        assert.strictEqual(state.equippedOutfit, 'outfit_tuxedo');
        assert.deepStrictEqual(state.unlockedOutfits, ['outfit_tuxedo']);
    });
});

describe('WardrobeManager Logic & Persistence', () => {
    beforeEach(() => {
        global.localStorage.clear();
    });

    test('Initial state has outfit_tuxedo equipped and unlocked', () => {
        const wm = new WardrobeManager();
        const state = wm.getWardrobeState();
        assert.strictEqual(state.equippedOutfit, 'outfit_tuxedo');
        assert.ok(state.unlockedOutfits.includes('outfit_tuxedo'));

        const equipped = wm.getEquippedOutfit();
        assert.strictEqual(equipped.id, 'outfit_tuxedo');
        assert.strictEqual(wm.isUnlocked('outfit_tuxedo'), true);
        assert.strictEqual(wm.isUnlocked('outfit_bogatyr'), false);
    });

    test('unlockOutfit unlocks and persists an outfit', () => {
        const wm = new WardrobeManager();
        assert.strictEqual(wm.isUnlocked('outfit_bogatyr'), false);

        const unlocked = wm.unlockOutfit('outfit_bogatyr');
        assert.strictEqual(unlocked, true);
        assert.strictEqual(wm.isUnlocked('outfit_bogatyr'), true);

        // Check new instance loads persisted state
        const wm2 = new WardrobeManager();
        assert.strictEqual(wm2.isUnlocked('outfit_bogatyr'), true);
    });

    test('equipOutfit changes equipped outfit if unlocked', () => {
        const wm = new WardrobeManager();
        
        // Cannot equip locked outfit
        const failRes = wm.equipOutfit('outfit_boyar');
        assert.strictEqual(failRes.success, false);
        assert.strictEqual(wm.getEquippedOutfit().id, 'outfit_tuxedo');

        // Unlock and equip
        wm.unlockOutfit('outfit_boyar');
        const successRes = wm.equipOutfit('outfit_boyar');
        assert.strictEqual(successRes.success, true);
        assert.strictEqual(successRes.outfit.id, 'outfit_boyar');
        assert.strictEqual(wm.getEquippedOutfit().id, 'outfit_boyar');
    });

    test('checkAutoUnlocks triggers unlocks for round_win, museum_count, total_points, super_game_win', () => {
        const wm = new WardrobeManager();

        // 1. Round win unlock (outfit_bogatyr)
        let newlyUnlocked = wm.checkAutoUnlocks({ roundsWon: 1, totalPointsEarned: 1000 }, []);
        assert.deepStrictEqual(newlyUnlocked, ['outfit_bogatyr']);
        assert.strictEqual(wm.isUnlocked('outfit_bogatyr'), true);

        // 2. Museum count unlock (outfit_boyar requires 4 items)
        newlyUnlocked = wm.checkAutoUnlocks({ roundsWon: 1, totalPointsEarned: 1000 }, [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        assert.deepStrictEqual(newlyUnlocked, ['outfit_boyar']);
        assert.strictEqual(wm.isUnlocked('outfit_boyar'), true);

        // 3. Total points unlock (outfit_folk_robe requires 7500 points)
        newlyUnlocked = wm.checkAutoUnlocks({ roundsWon: 1, totalPointsEarned: 8000 }, [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        assert.deepStrictEqual(newlyUnlocked, ['outfit_folk_robe']);
        assert.strictEqual(wm.isUnlocked('outfit_folk_robe'), true);

        // 4. Super game win unlock (outfit_cosmonaut)
        newlyUnlocked = wm.checkAutoUnlocks({ roundsWon: 1, totalPointsEarned: 8000, superGameWins: 1 }, [], true);
        assert.deepStrictEqual(newlyUnlocked, ['outfit_cosmonaut']);
        assert.strictEqual(wm.isUnlocked('outfit_cosmonaut'), true);
    });

    test('resetWardrobe restores initial default state', () => {
        const wm = new WardrobeManager();
        wm.unlockOutfit('outfit_bogatyr');
        wm.equipOutfit('outfit_bogatyr');
        assert.strictEqual(wm.getEquippedOutfit().id, 'outfit_bogatyr');

        wm.resetWardrobe();
        const wmAfter = new WardrobeManager();
        assert.strictEqual(wmAfter.getEquippedOutfit().id, 'outfit_tuxedo');
        assert.strictEqual(wmAfter.isUnlocked('outfit_bogatyr'), false);
    });
});
