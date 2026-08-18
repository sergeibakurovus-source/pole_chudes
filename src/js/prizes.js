export const PRIZES_CATALOG = [
    {
        id: 'prize_postcard',
        name: 'Фирменная открытка от Яквадратиша',
        rarity: 'common',
        price: 0,
        icon: '✉️',
        description: 'Красочная открытка с теплой дарственной надписью и улыбкой Леонида Яквадратиша.',
        category: 'Памятное',
        sourcePool: ['shop']
    },
    {
        id: 'prize_pickles',
        name: 'Банка соленых рыжиков',
        rarity: 'common',
        price: 100,
        icon: '🍄',
        description: 'Хрустящие лесные рыжики в пряном рассоле с укропом и чесночком по старинному рецепту.',
        category: 'Угощения',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_tea',
        name: 'Пачка душистого иван-чая',
        rarity: 'common',
        price: 250,
        icon: '🫖',
        description: 'Отборный ферментированный кипрей с таежными ягодами. Богатырское здоровье в каждой чашке!',
        category: 'Угощения',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_pryanik',
        name: 'Тульский пряник-великан',
        rarity: 'common',
        price: 500,
        icon: '🥮',
        description: 'Печатный медовый пряник с яблочным повидлом весом в целый пуд!',
        category: 'Угощения',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_glasses',
        name: 'Набор хрустальных кубков',
        rarity: 'rare',
        price: 750,
        icon: '🥂',
        description: 'Звонкие граненые кубки для ключевой воды и праздничного кваса.',
        category: 'Посуда',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_samovar',
        name: 'Расписной электросамовар',
        rarity: 'rare',
        price: 1000,
        icon: '🫖',
        description: 'Золоченый тульский самовар с хохломской росписью. Душа любой богатырской беседы.',
        category: 'Традиции',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_gusli',
        name: 'Гусли-самогуды',
        rarity: 'rare',
        price: 1500,
        icon: '🪕',
        description: 'Звончатые яровчатые гусли: сами играют, сами плясать заставляют!',
        category: 'Музыка',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_carpet',
        name: 'Настенный ковер со сказочными оленями',
        rarity: 'rare',
        price: 2000,
        icon: '🧶',
        description: 'Теплый шерстяной ковер с пушистым ворсом для богатырской опочивальни.',
        category: 'Уют',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_boots',
        name: 'Сапоги-скороходы сафьяновые',
        rarity: 'epic',
        price: 2500,
        icon: '👢',
        description: 'Сафьяновые сапоги на мягком ходу: шаг шагнул — семь верст отмерил!',
        category: 'Артефакты',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_feather',
        name: 'Перо Жар-птицы сияющее',
        rarity: 'epic',
        price: 3500,
        icon: '🪶',
        description: 'Волшебное перо, освещающее даже самую темную ночь ярче тысячи свечей.',
        category: 'Артефакты',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_tablecloth',
        name: 'Скатерть-самобранка шелковая',
        rarity: 'epic',
        price: 5000,
        icon: '📜',
        description: 'Стоит расстелить — и на столе яства сахарные, пироги пышные да напитки медвяные!',
        category: 'Артефакты',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_sword',
        name: 'Меч-кладенец булатный',
        rarity: 'epic',
        price: 7000,
        icon: '⚔️',
        description: 'Кованый булатный клинок работы древних мастеров, сокрушающий любые преграды.',
        category: 'Вооружение',
        sourcePool: ['shop']
    },
    {
        id: 'prize_fur_coat',
        name: 'Соболья шуба до пят',
        rarity: 'epic',
        price: 9000,
        icon: '🧥',
        description: 'Бархатная шуба на отборных сибирских соболях. Подарок достойный великих князей!',
        category: 'Престиж',
        sourcePool: ['shop']
    },
    {
        id: 'prize_horse',
        name: 'Богатырский конь Бурушка',
        rarity: 'legendary',
        price: 15000,
        icon: '🐎',
        description: 'Верный былинный скакун: из копыт искры сыплются, ветру в поле не угнаться!',
        category: 'Транспорт',
        sourcePool: ['shop', 'super_game']
    },
    {
        id: 'prize_carpet_plane',
        name: 'Сказочный Ковер-самолет',
        rarity: 'legendary',
        price: 25000,
        icon: '🛸',
        description: 'Роскошный ковер ручной вязки для беспосадочных полетов над тридевятым царством.',
        category: 'Транспорт',
        sourcePool: ['shop']
    },
    {
        id: 'prize_gold_cup',
        name: 'Золотая Медаль Леонида Яквадратиша',
        rarity: 'legendary',
        price: 30000,
        icon: '🏅',
        description: 'Высшая награда Капитал-шоу из чистого золота для истинных чемпионов народной эрудиции.',
        category: 'Зал Славы',
        sourcePool: ['shop']
    }
];

export class MuseumManager {
    constructor() {
        this.catalog = PRIZES_CATALOG;
        this.storageKeyMuseum = 'pole_chudes_museum';
        this.storageKeyStats = 'pole_chudes_stats';
    }

    getCollection() {
        try {
            const raw = localStorage.getItem(this.storageKeyMuseum);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Failed to parse museum collection from localStorage:', e);
            return [];
        }
    }

    _saveCollection(collection) {
        try {
            localStorage.setItem(this.storageKeyMuseum, JSON.stringify(collection));
            this._updatePrizesCollectedStat(collection);
        } catch (e) {
            console.error('Failed to save museum collection to localStorage:', e);
        }
    }

    getStats() {
        const defaultStats = {
            gamesPlayed: 0,
            roundsWon: 0,
            superGameWins: 0,
            totalPointsEarned: 0,
            prizesCollected: this._getUniquePrizesCount()
        };

        try {
            const raw = localStorage.getItem(this.storageKeyStats);
            if (!raw) return defaultStats;
            const parsed = JSON.parse(raw);
            return {
                ...defaultStats,
                ...parsed,
                prizesCollected: this._getUniquePrizesCount()
            };
        } catch (e) {
            console.error('Failed to parse museum stats from localStorage:', e);
            return defaultStats;
        }
    }

    _saveStats(stats) {
        try {
            localStorage.setItem(this.storageKeyStats, JSON.stringify(stats));
        } catch (e) {
            console.error('Failed to save museum stats to localStorage:', e);
        }
    }

    _getUniquePrizesCount() {
        const collection = this.getCollection();
        const uniqueIds = new Set(collection.map(t => t.prizeId));
        return uniqueIds.size;
    }

    _updatePrizesCollectedStat(collection) {
        const stats = this.getStats();
        const uniqueIds = new Set(collection.map(t => t.prizeId));
        stats.prizesCollected = uniqueIds.size;
        this._saveStats(stats);
    }

    isPrizeOwned(prizeId) {
        const collection = this.getCollection();
        return collection.some(t => t.prizeId === prizeId);
    }

    buyPrize(prizeId, player) {
        const prize = this.catalog.find(p => p.id === prizeId);
        if (!prize) {
            return { success: false, error: 'Приз не найден' };
        }

        if (this.isPrizeOwned(prizeId)) {
            return { success: false, error: 'Приз уже есть в коллекции' };
        }

        if (player.score < prize.price) {
            return { success: false, error: 'Недостаточно очков для покупки' };
        }

        // Deduct player score
        player.score -= prize.price;

        const trophy = {
            id: `${prize.id}_${Date.now()}`,
            prizeId: prize.id,
            unlockedAt: new Date().toISOString(),
            costPaid: prize.price,
            source: 'shop',
            playerName: player.name
        };

        const collection = this.getCollection();
        collection.push(trophy);
        this._saveCollection(collection);

        return { success: true, trophy };
    }

    grantPrize(prizeId, source, playerName, costPaid = 0) {
        const prize = this.catalog.find(p => p.id === prizeId);
        if (!prize) return null;

        const trophy = {
            id: `${prize.id}_${Date.now()}`,
            prizeId: prize.id,
            unlockedAt: new Date().toISOString(),
            costPaid: costPaid,
            source: source,
            playerName: playerName || 'Богатырь'
        };

        const collection = this.getCollection();
        collection.push(trophy);
        this._saveCollection(collection);

        return trophy;
    }

    grantRandomPrize(source, playerName) {
        // Pool of prizes eligible for prize_sector
        const eligible = this.catalog.filter(p => p.sourcePool.includes(source));
        const unowned = eligible.filter(p => !this.isPrizeOwned(p.id));
        const pool = unowned.length > 0 ? unowned : eligible;

        const randomPrize = pool[Math.floor(Math.random() * pool.length)] || this.catalog[0];
        return this.grantPrize(randomPrize.id, source, playerName, 0);
    }

    recordGamePlayed() {
        const stats = this.getStats();
        stats.gamesPlayed += 1;
        this._saveStats(stats);
    }

    recordRoundWin(points = 0) {
        const stats = this.getStats();
        stats.roundsWon += 1;
        stats.totalPointsEarned += points;
        this._saveStats(stats);
    }

    recordSuperGameWin() {
        const stats = this.getStats();
        stats.superGameWins += 1;
        this._saveStats(stats);
    }

    resetProgress() {
        try {
            localStorage.removeItem(this.storageKeyMuseum);
            localStorage.removeItem(this.storageKeyStats);
        } catch (e) {
            console.error('Failed to reset museum progress:', e);
        }
    }
}
