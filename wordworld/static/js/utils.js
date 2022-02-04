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
        return String(value).padStart(4, ' ');
    }
    return String(value).padStart(4, '0');
}

const buttonize = (content, callback) => `<span class="nav-btn" onclick="${callback}">${content}</span>`;

const checkboxify = (checked, togglCallback, content, disabled) => `<div><span class="chk-box${disabled ? '-disabled' : ''}" onclick="${togglCallback}">[${checked ? 'X' : '\u00A0'}]</span>&npsp;${content}</div>`;
