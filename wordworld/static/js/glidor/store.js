window.glidorStore = {
    _GAME_NAME: 'game.name',
    getGameName: function getGameName() { return localStorage.getItem(this._GAME_NAME) ?? 'debug-run' },
    setGameName: function setGameName(name) { localStorage.setItem(this._GAME_NAME, name); },
    
    _CURRENT: 'current',
    getCurrent: function getCurrent() { return JSON.parse(localStorage.getItem(this._CURRENT) ?? '[[]]') ?? [[]]; },
    setCurrent: function setCurrent(current) { localStorage.setItem(this._CURRENT, JSON.stringify(current)); },

    _CURRENT_TARGET: 'current.target',
    getCurrentTarget: function getCurrentTarget() { return localStorage.getItem(this._CURRENT_TARGET); },
    setCurrentTarget: function setCurrentTarget(target) { localStorage.setItem(this._CURRENT_TARGET, target); },
}
