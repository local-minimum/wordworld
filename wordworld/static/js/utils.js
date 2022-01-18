const DAY = 1000 * 60 * 60 * 24;

function getDOY() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / DAY);
}

function generateGameName() {
    const now = new Date();
    return `${now.getFullYear()}: ${getDOY()}`;
}

