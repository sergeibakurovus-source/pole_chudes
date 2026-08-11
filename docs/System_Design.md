# System Design: Капитал-шоу "Поле Чудес: Premium Edition"

## 1. Implementation Approach
Проект реализуется в формате **Compact Mode (Hot-Seat Multiplayer)**. Поскольку игра предназначена для игры за одним экраном (локальный мультиплеер, передача хода), бэкенд не требуется.
Вся бизнес-логика и управление состоянием реализуются на **Pure HTML5, CSS3, JS ES6+ (Vanilla JS)**.
Для обеспечения Premium Visual Experience (Glassmorphism, микро-анимации) используются современные возможности CSS (backdrop-filter, CSS-переменные, transitions, keyframes).
Управление стейтом построено на базе строгого **конечного автомата (State Machine)**, что гарантирует защиту от гонки состояний (Race Conditions) и невалидных переходов. Компоненты UI взаимодействуют с логикой через событийную модель (CustomEvent), изолируя отображение от ядра игры.

## 2. Data Structures & Interface Definitions

```typescript
// Основные типы данных (Концептуальные)

enum GameState {
    INIT = 'INIT',
    NEXT_PLAYER_ANNOUNCE = 'NEXT_PLAYER_ANNOUNCE',
    WAITING_FOR_SPIN = 'WAITING_FOR_SPIN',
    SPINNING = 'SPINNING',
    EVALUATE_SECTOR = 'EVALUATE_SECTOR',
    WAITING_FOR_LETTER = 'WAITING_FOR_LETTER',
    WAITING_FOR_CELL = 'WAITING_FOR_CELL',
    PRIZE_BARGAIN = 'PRIZE_BARGAIN',
    GUESSING_WORD = 'GUESSING_WORD',
    PASSING_TURN = 'PASSING_TURN',
    CHECK_WIN = 'CHECK_WIN',
    ROUND_WIN = 'ROUND_WIN',
    GAME_OVER = 'GAME_OVER'
}

enum SectorType {
    POINTS = 'POINTS',
    BANKRUPT = 'BANKRUPT',
    ZERO = 'ZERO',
    PLUS = 'PLUS',
    PRIZE = 'PRIZE'
}

interface Player {
    id: number;
    name: string;
    score: number;
    isEliminated: boolean;
}

interface GameContext {
    players: Player[];
    activePlayerIndex: number;
    secretWord: string;
    revealedLetters: Set<string>;
    consecutiveGuesses: number; // Для мини-игры "две шкатулки"
    currentSector: SectorType | null;
}
```

## 3. State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> INIT
    INIT --> NEXT_PLAYER_ANNOUNCE : Start Game
    
    NEXT_PLAYER_ANNOUNCE --> WAITING_FOR_SPIN : NEXT_TURN_CLICK (Подтверждение)
    
    WAITING_FOR_SPIN --> SPINNING : SPIN_CLICK
    WAITING_FOR_SPIN --> GUESSING_WORD : GUESS_WORD_CLICK
    
    SPINNING --> EVALUATE_SECTOR : SPIN_END
    
    EVALUATE_SECTOR --> WAITING_FOR_LETTER : Sector = POINTS
    EVALUATE_SECTOR --> WAITING_FOR_CELL : Sector = PLUS
    EVALUATE_SECTOR --> PRIZE_BARGAIN : Sector = PRIZE
    EVALUATE_SECTOR --> PASSING_TURN : Sector = ZERO / BANKRUPT
    
    WAITING_FOR_LETTER --> CHECK_MATCH : LETTER_SELECTED
    CHECK_MATCH --> CHECK_WIN : Успех (буква есть)
    CHECK_MATCH --> PASSING_TURN : Ошибка (буквы нет)
    
    WAITING_FOR_CELL --> CHECK_WIN : CELL_SELECTED
    
    PRIZE_BARGAIN --> WAITING_FOR_SPIN : PRIZE_DECLINED (Взял очки)
    PRIZE_BARGAIN --> ELIMINATE_PLAYER : PRIZE_ACCEPTED (Взял приз)
    
    GUESSING_WORD --> CHECK_WIN : WORD_SUBMITTED (Верно)
    GUESSING_WORD --> ELIMINATE_PLAYER : WORD_SUBMITTED (Неверно)
    
    CHECK_WIN --> WAITING_FOR_SPIN : Слово не открыто (Игрок сохраняет ход)
    CHECK_WIN --> ROUND_WIN : Слово полностью открыто
    
    ELIMINATE_PLAYER --> PASSING_TURN
    
    PASSING_TURN --> NEXT_PLAYER_ANNOUNCE : Есть активные игроки
    PASSING_TURN --> GAME_OVER : Все игроки выбыли
    
    ROUND_WIN --> [*]
    GAME_OVER --> [*]
```

## 4. Program Call Flow / Component Interaction

```mermaid
sequenceDiagram
    participant UI as UI Layer (DOM)
    participant SM as State Machine (Core)
    participant Audio as Audio Engine
    participant Logic as Game Logic Context

    UI->>SM: dispatch('SPIN_CLICK')
    SM->>SM: Validate State (WAITING_FOR_SPIN)
    SM->>UI: lockControls()
    SM->>Logic: determineRandomSector()
    SM->>UI: playSpinAnimation(sector)
    SM->>Audio: play('spin_sound')
    
    Note over UI,SM: Waiting for spin animation to end
    
    UI->>SM: dispatch('SPIN_END')
    SM->>SM: Transition to EVALUATE_SECTOR
    
    alt Sector is Points
        SM->>UI: promptLetterSelection()
        SM->>SM: Transition to WAITING_FOR_LETTER
    else Sector is Bankrupt
        SM->>Logic: setPlayerScore(0)
        SM->>Audio: play('bankrupt_sound')
        SM->>SM: Transition to PASSING_TURN
    end
```

## 5. Strict File List

*Вся директория исходников:* `src/` и `tests/`
Никакие другие файлы не должны создаваться.

- `src/index.html` - Главная разметка, подключение стилей и скриптов.
- `src/style.css` - Стили с использованием CSS-переменных, Glassmorphism, Animations.
- `src/js/main.js` - Точка входа, инициализация игры и привязка событий.
- `src/js/state.js` - Реализация строгой стейт-машины (Конечный автомат).
- `src/js/game.js` - Управление контекстом (Игроки, Очки, Табло слов).
- `src/js/ui.js` - Управление DOM, анимациями, модалками и рендером.
- `src/js/audio.js` - Менеджер звуков и эффектов.
- `tests/game.test.js` - Юнит-тесты логики контекста и стейт-машины (Node Test Runner).
- `package.json` - Описание скриптов запуска `npm start` (через `serve`) и `npm test`.
