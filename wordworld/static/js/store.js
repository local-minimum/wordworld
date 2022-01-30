window.wordzStore = {
    _MODE: '',
    _LAST_MODE: 'settings.mode',
    _SIZE: 'settings.boardSize',
    _HAND_SIZE: 'settings.handSize',
    _CURSOR: 'game.cursor',
    _HAND_POSITION: 'hand.',
    _CURRENT_GAME: 'game.current',
    _CURRENT_NAME: 'game.current.name',
    _CURRENT_GAME_OVER: 'game.current.over',
    _PREVIOUS_NAME: 'game.previous.name',
    _ACHIVEMENT_LONGEST_CURRENT: 'achivement.longest.current',
    _ACHIVEMENT_LONGEST: 'achivement.longest',
    _ACHIVEMENT_ROUND_CURRENT: 'achivement.round.current',
    _ACHIVEMENT_ROUND: 'achivement.round',
    _ACHIVEMENT_COMPLETION: 'achivement.completion',
    _STREAK_DAYS_IN_A_ROW: 'streak.days',
    _STREAK_WINS: 'streak.wins',
    _WINS: 'wins',
    _SUPER_WINS: 'wins.super',
    _SCORE: "game.score",
    _HIGHSCORE: "highscore",

    // Mode
    getMode: function() { return this._MODE; },
    setMode: function(mode) {
        this._MODE = mode;
        window.localStorage.setItem(_LAST_MODE, mode);
    },
    restoreMode: function() {
        this._MODE = window.localStorage.getItem(_LAST_MODE) ?? ''
    },

    // Game
    getGame: function() { return JSON.parse(window.localStorage.getItem(`${this._MODE}${this._CURRENT_GAME}`) ?? '[]'); },
    setGame: function(game) { return window.localStorage.setItem(`${this._MODE}${this._CURRENT_GAME}`, JSON.stringify(game)); },
    setGameOver: function(go) { return window.localStorage.setItem(`${this._MODE}${this._CURRENT_GAME_OVER}`, JSON.stringify(go)); },
    getGameOver: function() { return  JSON.parse(window.localStorage.getItem(`${this._MODE}${this._CURRENT_GAME_OVER}`) ?? 'false'); },
    getGameName: function() { return window.localStorage.getItem(`${this._MODE}${this._CURRENT_NAME}`) ?? ''; },
    setGameName: function(name) { return window.localStorage.setItem(`${this._MODE}${this._CURRENT_NAME}`, name); },
    getPrevGameName: function() { return window.localStorage.getItem(`${this._MODE}${this._PREVIOUS_NAME}`) ?? ''; },
    setPrevGameName: function(name) { return window.localStorage.setItem(`${this._MODE}${this._PREVIOUS_NAME}`, name); },
    getGameSize: function() { return JSON.parse(window.localStorage.getItem(`${this._MODE}${this._SIZE}`) ?? '9'); },

    // Progress
    resetProgress: function() {
        window.localStorage.removeItem(`${this._MODE}${this._CURRENT_GAME}`);
        window.localStorage.removeItem(`${this._MODE}${this._CURSOR}`);
        window.localStorage.removeItem(`${this._MODE}${this._SCORE}`);
    },
    getCountPlayedCharacters: function() {
        const game = this.getGame();
        return game.reduce(
            (total, row) => total + (row == null ? 0 : row.reduce((sum, item) => sum + (item == null ? 0 : 1), 0)),
            0,
        );
    },
   
    // Cursor
    getCursorStart: function() {
        const size = this.getGameSize();
        const pos = Math.floor((size - 1) / 2);
        return { x: pos, y: pos };
    },
    getCursor: function() { return JSON.parse(window.localStorage.getItem(`${this._MODE}${this._CURSOR}`) ?? 'null') ?? this.getCursorStart(); },
    moveCursor: function(x, y) {
        const size = this.getGameSize();
        window.localStorage.setItem(
            `${this._MODE}${this._CURSOR}`,
            JSON.stringify({
                x: Math.max(0, Math.min(size - 1, x)),
                y: Math.max(0, Math.min(size - 1, y)),
            }),
        )
    },

    // Hand
    getHandSize: function() {
        return JSON.parse(window.localStorage.getItem(`${this._MODE}${this._HAND_SIZE}`) ?? '6');
    },
    getPlacedTilePositions: function() {
        const handSize = this.getHandSize();
        const positions = [];
        for (let i=0;i<handSize; i++) {
            const hand = this.getHandPosition(i);
            if (hand.empty && hand.position != null) {
                positions.push(hand.position);
            }
        }
        return positions;
    },
    getHandPosition: function(handPosition) { return JSON
        .parse(window.localStorage.getItem(`${this._MODE}${this._HAND_POSITION}${handPosition}`) ?? '{"character": ".", "empty": true, "age": 0}');
    },
    setHandPosition: function(handPosition, character, empty, age, position) {
        return window.localStorage.setItem(
            `${this._MODE}${this._HAND_POSITION}${handPosition}`,
            JSON.stringify({ empty, character, position, age }),
        );
    },
    getTilesInHand: function() {
        const handSize = this.getHandSize();
        let tiles = 0;
        for (let i=0; i<handSize; i++) {
            const hand = this.getHandPosition(i);
            if (!hand.empty) {
                tiles += 1;
            }
        }
        return tiles;
    },
    clearHand: function() {
        const handSize = this.getHandSize();
        for (let i=0; i<handSize; i++) {
            this.setHandPosition(i, '.', true, 0);
        }
    },

    // Score
    getScore: function() { return JSON.parse(window.localStorage.getItem(`${this._MODE}${this._SCORE}`) ?? '0'); },
    setScore: function(total) { return window.localStorage.setItem(`${this._MODE}${this._SCORE}`, JSON.stringify(total)); },

    // Stats
    getHighscore: function() { return JSON.parse(window.localStorage.getItem(`${this._MODE}${this._HIGHSCORE}`) ?? '0'); },
    setHighscore: function(score) { return window.localStorage.setItem(`${this._MODE}${this._HIGHSCORE}`, JSON.stringify(score)); },
    getLongestWord: function(current) { return window.localStorage.getItem(`${this._MODE}${current ? this._ACHIVEMENT_LONGEST_CURRENT : this._ACHIVEMENT_LONGEST}`) ?? ''; },
    setLongestWord: function(current, word) { return window.localStorage.setItem(`${this._MODE}${current ? this._ACHIVEMENT_LONGEST_CURRENT : this._ACHIVEMENT_LONGEST}`, word); },
    getBestRound: function(current) { return JSON.parse(window.localStorage.getItem(`${this._MODE}${current ? this._ACHIVEMENT_ROUND_CURRENT : this._ACHIVEMENT_ROUND}`)) ?? 0; },
    setBestRound: function(current, score) { return window.localStorage.setItem(`${this._MODE}${current ? this._ACHIVEMENT_ROUND_CURRENT: this._ACHIVEMENT_ROUND}`, JSON.stringify(score)); },
    getBestCompletion: function() { return JSON.parse(window.localStorage.getItem(`${this._MODE}${this._ACHIVEMENT_COMPLETION}`)) ?? 0; },
    setBestCompletion: function(percent) { return window.localStorage.setItem(`${this._MODE}${this._ACHIVEMENT_COMPLETION}`, JSON.stringify(percent)); },
    getStreakDays: function() { return JSON.parse(window.localStorage.getItem(`${this._MODE}${this._STREAK_DAYS_IN_A_ROW}`)); },
    setStreakDays: function(days) { return window.localStorage.setItem(`${this._MODE}${this._STREAK_DAYS_IN_A_ROW}`, JSON.stringify(days)); },
    getStreakWins: function() { return JSON.parse(window.localStorage.getItem(`${this._MODE}${this._STREAK_WINS}`)); },
    setStreakWins: function(days) { return window.localStorage.setItem(`${this._MODE}${this._STREAK_WINS}`, JSON.stringify(days)); },
    getWins: function() { return JSON.parse(window.localStorage.getItem(`${this._MODE}${this._WINS}`) ?? '0'); },
    setWins: function(count) { return window.localStorage.setItem(`${this._MODE}${this._WINS}`, JSON.stringify(count)); },
    getSuperWins: function() { return JSON.parse(window.localStorage.getItem(`${this._MODE}${this._SUPER_WINS}`) ?? '0'); },
    setSuperWins: function(count) { return window.localStorage.setItem(`${this._MODE}${this._SUPER_WINS}`, JSON.stringify(count)); },
}