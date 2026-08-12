const fs = require('fs');
const path = require('path');

const baseWords = [
    { word: 'КОТ', hint: 'Домашнее животное', category: 'Животные' },
    { word: 'ПЕС', hint: 'Домашнее животное', category: 'Животные' },
    { word: 'ВОЛК', hint: 'Лесной хищник', category: 'Животные' },
    { word: 'ЛИСА', hint: 'Рыжая хищница', category: 'Животные' },
    { word: 'МЕДВЕДЬ', hint: 'Хозяин тайги', category: 'Животные' },
    { word: 'СЛОН', hint: 'Крупное млекопитающее с хоботом', category: 'Животные' },
    { word: 'ТИГР', hint: 'Полосатая кошка', category: 'Животные' },
    { word: 'ЛЕВ', hint: 'Царь зверей', category: 'Животные' },
    { word: 'ЖИРАФ', hint: 'Длинношеее животное', category: 'Животные' },
    { word: 'ЗЕБРА', hint: 'Полосатая лошадь', category: 'Животные' },
    { word: 'КРОКОДИЛ', hint: 'Зеленая рептилия', category: 'Животные' },
    { word: 'ОБЕЗЬЯНА', hint: 'Примат', category: 'Животные' },
    { word: 'НОСОРОГ', hint: 'С рогом на носу', category: 'Животные' },
    { word: 'БЕГЕМОТ', hint: 'Гиппопотам', category: 'Животные' },
    { word: 'ПАНТЕРА', hint: 'Черная кошка', category: 'Животные' },
    { word: 'ДЕРЕВО', hint: 'Растение со стволом', category: 'Природа' },
    { word: 'ТРАВА', hint: 'Зеленый покров земли', category: 'Природа' },
    { word: 'ЦВЕТОК', hint: 'Растение с бутоном', category: 'Природа' },
    { word: 'КАМЕНЬ', hint: 'Твердая порода', category: 'Природа' },
    { word: 'РЕКА', hint: 'Водный поток', category: 'Природа' },
    { word: 'ОЗЕРО', hint: 'Водоем', category: 'Природа' },
    { word: 'ОКЕАН', hint: 'Огромный водоем', category: 'Природа' },
    { word: 'МОРЕ', hint: 'Соленый водоем', category: 'Природа' },
    { word: 'ВУЛКАН', hint: 'Огнедышащая гора', category: 'Природа' },
    { word: 'ГОРА', hint: 'Возвышенность', category: 'Природа' },
    { word: 'ОБЛАКО', hint: 'Скопление пара на небе', category: 'Природа' },
    { word: 'ВЕТЕР', hint: 'Движение воздуха', category: 'Природа' },
    { word: 'ГРОЗА', hint: 'Ненастье с молнией', category: 'Природа' },
    { word: 'ДОЖДЬ', hint: 'Осадки', category: 'Природа' },
    { word: 'СНЕГ', hint: 'Белые осадки', category: 'Природа' },
    { word: 'ГЕРОЙ', hint: 'Храбрый персонаж', category: 'Сказки' },
    { word: 'ПРИНЦЕССА', hint: 'Дочь короля', category: 'Сказки' },
    { word: 'ЗАМОК', hint: 'Дворец', category: 'Сказки' },
    { word: 'ДРАКОН', hint: 'Огнедышащий ящер', category: 'Сказки' },
    { word: 'КОРОЛЬ', hint: 'Правитель', category: 'Сказки' },
    { word: 'ВЕДЬМА', hint: 'Колдунья', category: 'Сказки' },
    { word: 'КОЛДУН', hint: 'Маг', category: 'Сказки' },
    { word: 'БАШНЯ', hint: 'Высокое строение', category: 'Сказки' },
    { word: 'МЕЧ', hint: 'Оружие', category: 'Сказки' },
    { word: 'КАРЕТА', hint: 'Повозка', category: 'Сказки' },
    { word: 'СУНДУК', hint: 'Вместилище для сокровищ', category: 'Сказки' },
    { word: 'ЗОЛУШКА', hint: 'Девушка, потерявшая туфельку', category: 'Сказки' },
    { word: 'РУСАЛКА', hint: 'Девушка с рыбьим хвостом', category: 'Сказки' },
    { word: 'БОГАТЫРЬ', hint: 'Сильный воин', category: 'Сказки' },
    { word: 'ЗМЕЙ', hint: 'Сказочная рептилия', category: 'Сказки' },
    { word: 'ЛЮДОЕД', hint: 'Злой персонаж', category: 'Сказки' },
    { word: 'ГНОМ', hint: 'Маленький человечек', category: 'Сказки' },
    { word: 'ЭЛЬФ', hint: 'Сказочный лесной житель', category: 'Сказки' },
    { word: 'ТРОЛЛЬ', hint: 'Злой дух', category: 'Сказки' },
    { word: 'ФЕЯ', hint: 'Добрая волшебница', category: 'Сказки' }
];

const prefixes = [
    '', 'СУПЕР', 'МЕГА', 'МИКРО', 'ПСЕВДО', 
    'АНТИ', 'ПОЛУ', 'НЕДО', 'АВТО', 'МОТО',
    'ЭКО', 'БИО', 'КРИПТО', 'КИБЕР', 'НАНО'
];

let generatedDict = [];

for (let prefix of prefixes) {
    for (let base of baseWords) {
        let isSuper = Math.random() < 0.15;
        generatedDict.push({
            word: prefix + base.word,
            hint: prefix === '' ? base.hint : `Вариация (${prefix}): ` + base.hint,
            category: base.category,
            difficulty: prefix === '' ? 1 : 2,
            superGame: isSuper
        });
    }
}

generatedDict = generatedDict.slice(0, 500);

const outputPath = path.join(__dirname, '..', 'src', 'assets', 'dictionary.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(generatedDict, null, 4), 'utf-8');
console.log(`Generated ${generatedDict.length} words in ${outputPath}`);
