export const YAKVADRATISH_WARDROBE = [
    {
        id: 'outfit_tuxedo',
        name: 'Классический смокинг',
        rarity: 'common',
        icon: '🤵',
        unlockConditionText: 'Доступен сразу',
        unlockType: 'default',
        unlockThreshold: 0,
        avatarSrc: 'assets/avatar_yakvadratish_tuxedo.svg',
        quote: '«Классика не стареет, господа эрудиты!»',
        description: 'Элегантный черный смокинг с шелковыми лацканами, бабочкой и золотыми запонками. Фирменный образ Леонида Яквадратиша.'
    },
    {
        id: 'outfit_bogatyr',
        name: 'Богатырский шлем и кольчуга',
        rarity: 'rare',
        icon: '🛡️',
        unlockConditionText: 'Выиграть 1 тур (подарок от Ильи Муромца)',
        unlockType: 'round_win',
        unlockThreshold: 1,
        avatarSrc: 'assets/avatar_yakvadratish_bogatyr.svg',
        quote: '«Ну держись, супостат! С таким нарядом ни один сектор Банкрот не страшен!»',
        description: 'Кованая стальная кольчуга и островерхий богатырский шлем с бармицей. Защищает от нулей и банкротов.'
    },
    {
        id: 'outfit_boyar',
        name: 'Боярский кафтан и соболья шапка',
        rarity: 'rare',
        icon: '👑',
        unlockConditionText: 'Собрать 4 экспоната в Музее',
        unlockType: 'museum_count',
        unlockThreshold: 4,
        avatarSrc: 'assets/avatar_yakvadratish_boyar.svg',
        quote: '«Чувствую себя настоящим главой Посольского приказа!»',
        description: 'Тяжелый парчовый кафтан с золотым шитьем, жемчужными пуговицами и высокой собольей горлатной шапкой.'
    },
    {
        id: 'outfit_folk_robe',
        name: 'Расшитый халат и тюбетейка',
        rarity: 'epic',
        icon: '🪔',
        unlockConditionText: 'Набрать 7500 очков за историю',
        unlockType: 'total_points',
        unlockThreshold: 7500,
        avatarSrc: 'assets/avatar_yakvadratish_folk.svg',
        quote: '«Чай, сладости и восточное гостеприимство прямо в нашей студии!»',
        description: 'Шелковый халат ручной работы с затейливыми узорами и бархатная тюбетейка. Подарок от заморских купцов.'
    },
    {
        id: 'outfit_cosmonaut',
        name: 'Шлем космонавта',
        rarity: 'legendary',
        icon: '🧑‍🚀',
        unlockConditionText: 'Победить в Супер-игре',
        unlockType: 'super_game_win',
        unlockThreshold: 1,
        avatarSrc: 'assets/avatar_yakvadratish_cosmonaut.svg',
        quote: '«Поехали! Капитал-шоу выходит на космическую орбиту!»',
        description: 'Легендарный гермошлем и герметичный скафандр для покорения космических просторов и сложнейших супер-игр.'
    }
];

export class WardrobeManager {
    constructor() {
        this.catalog = YAKVADRATISH_WARDROBE;
        this.storageKey = 'pole_chudes_wardrobe';
    }

    getWardrobeState() {
        const defaultState = {
            equippedOutfit: 'outfit_tuxedo',
            unlockedOutfits: ['outfit_tuxedo']
        };

        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return defaultState;
            const parsed = JSON.parse(raw);
            
            const validOutfitIds = this.catalog.map(o => o.id);
            let equipped = parsed.equippedOutfit;
            if (!validOutfitIds.includes(equipped)) {
                equipped = 'outfit_tuxedo';
            }
            
            let unlocked = Array.isArray(parsed.unlockedOutfits)
                ? parsed.unlockedOutfits.filter(id => validOutfitIds.includes(id))
                : ['outfit_tuxedo'];
                
            if (!unlocked.includes('outfit_tuxedo')) {
                unlocked.push('outfit_tuxedo');
            }
            
            const cleanState = {
                equippedOutfit: equipped,
                unlockedOutfits: unlocked
            };
            
            if (raw !== JSON.stringify(cleanState)) {
                this._saveState(cleanState);
            }
            
            return cleanState;
        } catch (e) {
            console.error('Failed to parse wardrobe state from localStorage:', e);
            return defaultState;
        }
    }

    _saveState(state) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save wardrobe state to localStorage:', e);
        }
    }

    getEquippedOutfit() {
        const state = this.getWardrobeState();
        const found = this.catalog.find(o => o.id === state.equippedOutfit);
        return found || this.catalog[0];
    }

    getUnlockedOutfits() {
        const state = this.getWardrobeState();
        return this.catalog.filter(o => state.unlockedOutfits.includes(o.id));
    }

    isUnlocked(outfitId) {
        const state = this.getWardrobeState();
        return state.unlockedOutfits.includes(outfitId);
    }

    unlockOutfit(outfitId) {
        const outfit = this.catalog.find(o => o.id === outfitId);
        if (!outfit) return false;

        const state = this.getWardrobeState();
        if (!state.unlockedOutfits.includes(outfitId)) {
            state.unlockedOutfits.push(outfitId);
            this._saveState(state);
            return true;
        }
        return false;
    }

    equipOutfit(outfitId) {
        const outfit = this.catalog.find(o => o.id === outfitId);
        if (!outfit) {
            return { success: false, error: 'Костюм не найден в каталоге' };
        }

        if (!this.isUnlocked(outfitId)) {
            return { success: false, error: 'Костюм еще не разблокирован' };
        }

        const state = this.getWardrobeState();
        state.equippedOutfit = outfitId;
        this._saveState(state);

        return { success: true, outfit };
    }

    checkAutoUnlocks(stats = {}, collection = [], isSuperGameWin = false) {
        const newlyUnlocked = [];
        const state = this.getWardrobeState();

        const roundsWon = stats.roundsWon || 0;
        const museumCount = collection.length > 0 ? collection.length : (stats.prizesCollected || 0);
        const totalPoints = stats.totalPointsEarned || 0;
        const superGameWins = (stats.superGameWins || 0) + (isSuperGameWin ? 1 : 0);

        this.catalog.forEach(item => {
            if (state.unlockedOutfits.includes(item.id)) return;

            let conditionMet = false;
            switch (item.unlockType) {
                case 'default':
                    conditionMet = true;
                    break;
                case 'round_win':
                    conditionMet = roundsWon >= item.unlockThreshold;
                    break;
                case 'museum_count':
                    conditionMet = museumCount >= item.unlockThreshold;
                    break;
                case 'total_points':
                    conditionMet = totalPoints >= item.unlockThreshold;
                    break;
                case 'super_game_win':
                    conditionMet = superGameWins >= item.unlockThreshold;
                    break;
            }

            if (conditionMet) {
                state.unlockedOutfits.push(item.id);
                newlyUnlocked.push(item.id);
            }
        });

        if (newlyUnlocked.length > 0) {
            this._saveState(state);
        }

        return newlyUnlocked;
    }

    resetWardrobe() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.error('Failed to reset wardrobe state:', e);
        }
    }
}
