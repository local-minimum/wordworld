const DAY = 1000 * 60 * 60 * 24;
const START = new Date(2022, 0, 18);

function getGameID() {
    const now = new Date();
    return Math.floor((now - START) / DAY);
}

function generateGameName() {
    return `GAME: ${getGameID()}`;
}

function gameNameToNumber(name) {
    return Number.parseInt(name.split(':')[1].trim());
}

function isInStreak(current, previous) {
    if (previous.length === 0) return null;
    return (gameNameToNumber(current) - gameNameToNumber(previous)) === 1;
}


function formatScore(value) {
    if (value < 0) {
        return `-${String(value).padStart(3, '0')}`;
    }
    return String(value).padStart(4, '0');
}