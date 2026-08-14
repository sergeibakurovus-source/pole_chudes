export const PRIZES_CATALOG = [
    {
        id: 'prize_postcard',
        name: 'Открытка с автографом Якубовича',
        rarity: 'common',
        price: 0,
        icon: '✉️',
        description: 'Фирменная открытка телекомпании ВИD с теплой подписью Леонида Аркадьевича.',
        category: 'Памятное',
        sourcePool: ['shop']
    },
    {
        id: 'prize_pickles',
        name: 'Банка соленых огурцов',
        rarity: 'common',
        price: 100,
        icon: '🥒',
        description: 'Хрустящие домашние огурчики по секретному рецепту из деревни под Воронежем.',
        category: 'Продукты',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_tea',
        name: 'Пачка чая "Со слоном"',
        rarity: 'common',
        price: 250,
        icon: '🫖',
        description: 'Тот самый легендарный цейлонский чай первого сорта. Заваривать кипятком!',
        category: 'Продукты',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_iron',
        name: 'Утюг с отпаривателем "Малютка"',
        rarity: 'common',
        price: 500,
        icon: '👔',
        description: 'Надежный помощник в хозяйстве. Разгладит даже самые упрямые складки.',
        category: 'Бытовая техника',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_glasses',
        name: 'Набор хрустальных бокалов',
        rarity: 'rare',
        price: 750,
        icon: '🥂',
        description: 'Чешский хрусталь для торжественных застолий. Звенит как хрустальная мечта!',
        category: 'Посуда',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_samovar',
        name: 'Расписной электросамовар',
        rarity: 'rare',
        price: 1000,
        icon: '🫖',
        description: 'Тульский самовар с золотой росписью. Центр любого душевного чаепития.',
        category: 'Традиции',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_vacuum',
        name: 'Пылесос "Тайфун-М"',
        rarity: 'rare',
        price: 1500,
        icon: '🧹',
        description: 'Мощность урагана прямо в вашей квартире. Шумит благородно и солидно.',
        category: 'Бытовая техника',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_carpet',
        name: 'Настенный ковёр с оленями',
        rarity: 'rare',
        price: 2000,
        icon: '🧶',
        description: 'Классический шерстяной ковер для теплоизоляции стен и эстетического наслаждения.',
        category: 'Уют',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_dendy',
        name: 'Игровая приставка Dendy 8-bit',
        rarity: 'epic',
        price: 2500,
        icon: '🎮',
        description: 'Слонёнок Dendy зовет в мир танчиков и Марио. Два джойстика и световой пистолет!',
        category: 'Развлечения',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_videotv',
        name: 'Видеодвойка Funai',
        rarity: 'epic',
        price: 3500,
        icon: '📼',
        description: 'Мечта каждой семьи: цветной телевизор и встроенный видеомагнитофон VHS в одном корпусе!',
        category: 'Электроника',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_tv_rubin',
        name: 'Телевизор "Рубин Ц-208"',
        rarity: 'epic',
        price: 5000,
        icon: '📺',
        description: 'Сочные цвета, деревянный лакированный корпус и гордая надпись «Сделано в СССР».',
        category: 'Электроника',
        sourcePool: ['shop', 'prize_sector']
    },
    {
        id: 'prize_computer',
        name: 'Персональный компьютер "БК-0010"',
        rarity: 'epic',
        price: 7000,
        icon: '💻',
        description: 'Шедевр отечественной микроэлектроники. Язык Фокал и бейсик на магнитофонной ленте.',
        category: 'Технологии',
        sourcePool: ['shop']
    },
    {
        id: 'prize_fur_coat',
        name: 'Норковая шуба в пол',
        rarity: 'epic',
        price: 9000,
        icon: '🧥',
        description: 'Роскошный мех для сибирских морозов и выхода в свет. Зависть всех соседей.',
        category: 'Престиж',
        sourcePool: ['shop']
    },
    {
        id: 'prize_car',
        name: 'А-А-АВТОМОБИЛЬ "Жигули" (ВАЗ-2109)',
        rarity: 'legendary',
        price: 15000,
        icon: '🚗',
        description: 'Вишневая «девятка» прямо с конвейера! Главный приз Капитал-шоу Поле Чудес.',
        category: 'Транспорт',
        sourcePool: ['shop', 'super_game']
    },
    {
        id: 'prize_flat',
        name: 'Ключи от квартиры в Москве',
        rarity: 'legendary',
        price: 25000,
        icon: '🏢',
        description: 'Просторная двухкомнатная квартира с видом на Останкинскую телебашню!',
        category: 'Недвижимость',
        sourcePool: ['shop']
    },
    {
        id: 'prize_gold_cup',
        name: 'Золотой кубок победителя Капитал-шоу',
        rarity: 'legendary',
        price: 30000,
        icon: '🏆',
        description: 'Высшая награда телеигры для истинных эрудитов и чемпионов супер-игры.',
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
            playerName: playerName || 'Игрок'
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
