window.wordzStore = {
    // Mode
    _MODE: '',
    _LAST_MODE: 'settings.mode',
    getMode: function() { return `${this._MODE}${this.getRush() ? 'RUSH-' : ''}`; },
    setMode: function(mode) {
        this._MODE = mode;
        window.localStorage.setItem(this._LAST_MODE, mode);
    },
    restoreMode: function(rushed) {
        this._MODE = window.localStorage.getItem(this._LAST_MODE) ?? '';
        this.setRush(rushed);
    },
    _RUSHED: 'settings.rushed',
    getRush: function() { return JSON.parse(window.localStorage.getItem(this._RUSHED) ?? 'false'); },
    setRush: function(value) { window.localStorage.getItem(this._RUSHED, JSON.stringify(value)); },

    // Rules
    _RULES_SCORE_ROUND: 'rules.score.round',
    getRuleRoundScoreActive: function() { return JSON.parse(window.localStorage.getItem(this._RULES_SCORE_ROUND) ?? 'true'); },
    setRuleRoundScoreActive: function(value) { window.localStorage.setItem(this._RULES_SCORE_ROUND, JSON.parse(value)); },
    _RULES_SCORE_TOTAL: 'rules.score.total',
    getRuleTotalScoreActive: function() { return JSON.parse(window.localStorage.getItem(this._RULES_SCORE_TOTAL) ?? 'true'); },
    setRuleTotalScoreActive: function(value) { window.localStorage.setItem(this._RULES_SCORE_TOTAL, JSON.parse(value)); },

    // Game
    _CURRENT_GAME: 'game.current',
    getGame: function() { return JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._CURRENT_GAME}`) ?? '[]'); },
    setGame: function(game) { return window.localStorage.setItem(`${this.getMode()}${this._CURRENT_GAME}`, JSON.stringify(game)); },
    _CURRENT_GAME_OVER: 'game.current.over',
    setGameOver: function(go) { return window.localStorage.setItem(`${this.getMode()}${this._CURRENT_GAME_OVER}`, JSON.stringify(go)); },
    getGameOver: function() { return  JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._CURRENT_GAME_OVER}`) ?? 'false'); },
    _CURRENT_NAME: 'game.current.name',
    getGameName: function() { return window.localStorage.getItem(`${this.getMode()}${this._CURRENT_NAME}`) ?? ''; },
    setGameName: function(name) { return window.localStorage.setItem(`${this.getMode()}${this._CURRENT_NAME}`, name); },
    _PREVIOUS_NAME: 'game.previous.name',
    getPrevGameName: function() { return window.localStorage.getItem(`${this.getMode()}${this._PREVIOUS_NAME}`) ?? ''; },
    setPrevGameName: function(name) { return window.localStorage.setItem(`${this.getMode()}${this._PREVIOUS_NAME}`, name); },
    _SIZE: 'settings.boardSize',
    getGameSize: function() { return JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._SIZE}`) ?? '9'); },
    _GAME_START: 'game.current.rushStart',
    getTimeSinceGameStart: function() {
        const start = window.localStorage.getItem(`${this.getMode()}${this._GAME_START}`);
        if (start == null || start.length === 0) return null;
        return new Date(start);
    },
    setGameStart: function() {
        window.localStorage.setItem(`${this.getMode()}${this._GAME_START}`, (new Date()).toISOString());
    },

    // Progress
    resetProgress: function() {
        window.localStorage.removeItem(`${this.getMode()}${this._GAME_START}`);
        window.localStorage.removeItem(`${this.getMode()}${this._CURRENT_GAME}`);
        window.localStorage.removeItem(`${this.getMode()}${this._CURSOR}`);
        window.localStorage.removeItem(`${this.getMode()}${this._SCORE}`);
    },
    getCountPlayedCharacters: function() {
        const game = this.getGame();
        return game.reduce(
            (total, row) => total + (row == null ? 0 : row.reduce((sum, item) => sum + (item == null ? 0 : 1), 0)),
            0,
        );
    },
    getCoverage: function() {
        return Math.round(100 * this.getCountPlayedCharacters() / Math.pow(this.getGameSize(), 2));
    },
   
    // Cursor
    _CURSOR: 'game.cursor',
    getCursorStart: function() {
        const size = this.getGameSize();
        const pos = Math.floor((size - 1) / 2);
        return { x: pos, y: pos };
    },
    getCursor: function() { return JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._CURSOR}`) ?? 'null') ?? this.getCursorStart(); },
    moveCursor: function(x, y) {
        const size = this.getGameSize();
        window.localStorage.setItem(
            `${this.getMode()}${this._CURSOR}`,
            JSON.stringify({
                x: Math.max(0, Math.min(size - 1, x)),
                y: Math.max(0, Math.min(size - 1, y)),
            }),
        )
    },

    // Hand
    _HAND_SIZE: 'settings.handSize',
    getHandSize: function() {
        return JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._HAND_SIZE}`) ?? '6');
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
    _HAND_POSITION: 'hand.',
    getHandPosition: function(handPosition) { return JSON
        .parse(window.localStorage.getItem(`${this.getMode()}${this._HAND_POSITION}${handPosition}`) ?? '{"character": ".", "empty": true, "age": 0}');
    },
    setHandPosition: function(handPosition, character, empty, age, position) {
        return window.localStorage.setItem(
            `${this.getMode()}${this._HAND_POSITION}${handPosition}`,
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
    _SCORE: "game.score",
    getScore: function() { return JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._SCORE}`) ?? '0'); },
    setScore: function(total) { return window.localStorage.setItem(`${this.getMode()}${this._SCORE}`, JSON.stringify(total)); },

    // Stats
    _HIGHSCORE: "highscore",
    getHighscore: function() { return JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._HIGHSCORE}`) ?? '0'); },
    setHighscore: function(score) { return window.localStorage.setItem(`${this.getMode()}${this._HIGHSCORE}`, JSON.stringify(score)); },
    _ACHIVEMENT_LONGEST_CURRENT: 'achivement.longest.current',
    _ACHIVEMENT_LONGEST: 'achivement.longest',
    getLongestWord: function(current) { return window.localStorage.getItem(`${this.getMode()}${current ? this._ACHIVEMENT_LONGEST_CURRENT : this._ACHIVEMENT_LONGEST}`) ?? ''; },
    setLongestWord: function(current, word) { return window.localStorage.setItem(`${this.getMode()}${current ? this._ACHIVEMENT_LONGEST_CURRENT : this._ACHIVEMENT_LONGEST}`, word); },
    _ACHIVEMENT_ROUND_CURRENT: 'achivement.round.current',
    _ACHIVEMENT_ROUND: 'achivement.round',
    getBestRound: function(current) { return JSON.parse(window.localStorage.getItem(`${this.getMode()}${current ? this._ACHIVEMENT_ROUND_CURRENT : this._ACHIVEMENT_ROUND}`)) ?? 0; },
    setBestRound: function(current, score) { return window.localStorage.setItem(`${this.getMode()}${current ? this._ACHIVEMENT_ROUND_CURRENT: this._ACHIVEMENT_ROUND}`, JSON.stringify(score)); },
    _ACHIVEMENT_COMPLETION: 'achivement.completion',
    getBestCompletion: function() { return JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._ACHIVEMENT_COMPLETION}`)) ?? 0; },
    setBestCompletion: function(percent) { return window.localStorage.setItem(`${this.getMode()}${this._ACHIVEMENT_COMPLETION}`, JSON.stringify(percent)); },
    _STREAK_DAYS_IN_A_ROW: 'streak.days',
    getStreakDays: function() { return JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._STREAK_DAYS_IN_A_ROW}`)); },
    setStreakDays: function(days) { return window.localStorage.setItem(`${this.getMode()}${this._STREAK_DAYS_IN_A_ROW}`, JSON.stringify(days)); },
    _STREAK_WINS: 'streak.wins',
    getStreakWins: function() { return JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._STREAK_WINS}`)); },
    setStreakWins: function(days) { return window.localStorage.setItem(`${this.getMode()}${this._STREAK_WINS}`, JSON.stringify(days)); },
    _WINS: 'wins',
    getWins: function() { return JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._WINS}`) ?? '0'); },
    setWins: function(count) { return window.localStorage.setItem(`${this.getMode()}${this._WINS}`, JSON.stringify(count)); },
    _SUPER_WINS: 'wins.super',
    getSuperWins: function() { return JSON.parse(window.localStorage.getItem(`${this.getMode()}${this._SUPER_WINS}`) ?? '0'); },
    setSuperWins: function(count) { return window.localStorage.setItem(`${this.getMode()}${this._SUPER_WINS}`, JSON.stringify(count)); },
}