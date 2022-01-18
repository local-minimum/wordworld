const _SIZE = 'settings.boardSize';
const _SIZE_DEFAULT = '9';
const _HAND_SIZE = 'settings.handSize';
const _HAND_SIZE_DEFAULT = '6';
const _CURSOR = 'game.cursor';
const _CURSOR_DEFAULT = '{ "x": 4, "y": 4 }';
const _HAND_POSITION = 'hand.';
const _CURRENT_GAME = 'game.current';

const _ACHIVEMENT_LONGEST_CURRENT = 'achivement.longest.current';
const _ACHIVEMENT_LONGEST = 'achivement.longest';
const _ACHIVEMENT_ROUND_CURRENT = 'achivement.round.current';
const _ACHIVEMENT_ROUND = 'achivement.round';
const _ACHIVEMENT_COMPLETION = 'achivement.completion';

const _SCORE = "game.score";
const _HIGHSCORE = "highscore";
const _LETTER_FREQUENCIES = {
 e: 11.1607,
 a: 8.4966,
 r: 7.5809,
 i: 7.5448,
 o: 7.1635,
 t: 6.9509,
 n: 6.6544,
 s: 5.7375,
 l: 5.4893,
 c: 4.5488,
 u: 3.6308,
 d: 3.3844,
 p: 3.1671,
 m: 3.0129,
 h: 3.0034,
 g: 2.4705,
 b: 2.0720,
 f: 1.8121,
 y: 1.7779,
 w: 1.2899,
 k: 1.1016,
 v: 1.0074,
 x: 0.2902,
 z: 0.2722,
 j: 0.1965,
 q: 0.1962,
};
const _STATUS = {
    gameOver: false,
    communicating: false,
};

const getGame = () => JSON.parse(window.localStorage.getItem(_CURRENT_GAME) ?? '[]');
const setGame = (game) => window.localStorage.setItem(_CURRENT_GAME, JSON.stringify(game));
const getGameSize = () => JSON.parse(window.localStorage.getItem(_SIZE) ?? _SIZE_DEFAULT);
const getCursor = () =>  JSON.parse(window.localStorage.getItem(_CURSOR) ?? _CURSOR_DEFAULT);
const getCountPlayedCharacters = () => {
    const game = getGame();
    return game.reduce(
        (total, row) => total + (row == null ? 0 : row.reduce((sum, item) => sum + (item == null ? 0 : 1), 0)),
        0,
    );
}
const getHighscore = () => JSON.parse(window.localStorage.getItem(_HIGHSCORE) ?? '[]');
const setHighscore = (scores) => window.localStorage.setItem(_HIGHSCORE, JSON.stringify(scores));
const getScore = () => JSON.parse(window.localStorage.getItem(_SCORE) ?? '0');
const setScore = (total) => window.localStorage.setItem(_SCORE, JSON.stringify(total));
const getHandSize = () => JSON
    .parse(window.localStorage.getItem(_HAND_SIZE) ?? _HAND_SIZE_DEFAULT);
const getLongestWord = (current) => window
    .localStorage.getItem(current ? _ACHIVEMENT_LONGEST_CURRENT : _ACHIVEMENT_LONGEST) ?? '';
const setLongestWord = (current, word) => window
    .localStorage.setItem(current ? _ACHIVEMENT_LONGEST_CURRENT : _ACHIVEMENT_LONGEST, word);
const getBestRound = (current) => JSON.parse(window
    .localStorage.getItem(current ? _ACHIVEMENT_ROUND_CURRENT : _ACHIVEMENT_ROUND)) ?? 0;
const setBestRound = (current, score) => window
    .localStorage.setItem(current ? _ACHIVEMENT_ROUND_CURRENT: _ACHIVEMENT_ROUND, JSON.stringify(score));
const getBestCompletion = () => JSON.parse(window.localStorage.getItem(_ACHIVEMENT_COMPLETION)) ?? 0;
const setBestCompletion = (percent) => window.localStorage.setItem(_ACHIVEMENT_COMPLETION, JSON.stringify(percent));



const showBoard = () => {
    const board = document.getElementById('world');
    const size = getGameSize();
    const cursor = getCursor(); 
    const game = getGame();
    let data = '';
    for (let y=0; y<size; y++) {
        for (let x=0; x<size; x++) {
            position = game[y]?.[x] ?? '.'; 
            if (cursor.x === x && cursor.y === y) {
                position = `<span id="selection">${position}</span>`;
            }
            data += position;
        }
        data += '<br>'
    }
    board.innerHTML = data;
};

const getHandPosition = (handPosition) => JSON
    .parse(window.localStorage.getItem(_HAND_POSITION + handPosition) ?? '{"character": ".", "empty": true, "age": 0}');

const setHandPosition = (handPosition, character, empty, age, position) => window.localStorage.setItem(
    _HAND_POSITION + handPosition,
    JSON.stringify({ empty, character, position, age }),
);

const playTile = (handPosition) => {
    if (_STATUS.gameOver || _STATUS.communicating) return;
    const handSize = getHandSize();
    if (handPosition >= handSize) return;
    const hand = getHandPosition(handPosition);
    const game = getGame();    
    const cursor = getCursor();
    if (
        !hand.empty
        && game[cursor.y]?.[cursor.x] == null
        && (getCountPlayedCharacters() === 0 || hasNeighbors(game, cursor.x, cursor.y))
    ) {
        if (game[cursor.y] == null) {
            game[cursor.y] = [];
        }
        game[cursor.y][cursor.x] = hand.character;
        setHandPosition(handPosition, hand.character, true, hand.age, cursor);
        setGame(game);
    }
    showHand();
};

const returnTiles = () => {
    const handSize = getHandSize();
    const game = getGame();
    for (let i = 0; i<handSize; i++) {
        const hand = getHandPosition(i);
        if (hand.empty) {
            game[hand.position.y][hand.position.x] = null;
            setHandPosition(i, hand.character, false, hand.age);
        }
    }
    setGame(game);
    showHand();
    showBoard();
}

const increaseScore = (value) => {
    const total = getScore() + value;
    setScore(total);
    const score = document.getElementById('score');
    score.innerHTML = String(total).padStart(4, '0');
}

const horizontalWord = (game, origin) => {
    const row = game[origin.y];
    let minX = origin.x;
    let word = row[minX];
    minX -= 1;
    while (minX >= 0 && row[minX] != null) {
        word = row[minX] + word;
        minX -= 1;
    };
    let maxX = origin.x + 1;
    while (row[maxX] != null) {
        word += row[maxX];
        maxX += 1;
    };
    return { word, min: minX + 1, max: maxX - 1, y: origin.y };
}

const verticalWord =  (game, origin) => {
    const x = origin.x;
    let minY = origin.y;
    let word = game[minY][x];
    minY -= 1;
    while (minY >= 0 && game[minY]?.[x] != null) {
        word = game[minY][x] + word;
        minY -= 1;
    }
    let maxY = origin.y + 1;
    while (game[maxY]?.[x] != null) {
        word += game[maxY][x];
        maxY += 1;
    }
    return { word, min: minY + 1, max: maxY - 1, x: origin.x };
}

const wordsFromPlaced = () => {
    const game = getGame();
    const handSize = getHandSize();
    let placed = [];
    for (let i = 0; i < handSize; i++) {
        const h = getHandPosition(i);
        if (h.empty && !!h.position) {
            placed.push(h.position);
        }
    }
    const words = [];
    let i = 0;
    while (i < placed.length) {
        const position = placed[i];
        const hor = horizontalWord(game, position);
        if (hor.word.length > 1 && !words.some(w => w.word === hor.word && w.min === hor.min && w.max === hor.max && w.y === hor.y)) {
            words.push(hor);
        }
        const ver = verticalWord(game, position);
        if (ver.word.length > 1 && !words.some(w => w.word === ver.word && w.min === ver.min && w.max === ver.max && w.y === ver.y)) {
            words.push(ver);
        }
        i += 1;
    }
    return words
        .map(w => w.word);
}

const hasNeighbors = (game, x, y) => {
    if (y > 0 && game[y - 1]?.[x] != null) return true;
    if (game[y + 1]?.[x] != null) return true;
    const row = game[y] ?? [];
    if (x > 0 && row[x - 1] != null) return true;
    if (row[x + 1] != null) return true;
    return false;
}

const placeWithoutNeighbors = (char) => {
    const size = getGameSize();
    const game = getGame();
    const canditates = []
    for (let y = 0; y<size; y++) {
        for (let x = 0; x<size; x++) {
            if (game[y]?.[x] == null && !hasNeighbors(game, x, y)) {
                canditates.push({x, y});
            }
        }
    }
    if (canditates.length === 0) {
        return false;
    }
    const position = canditates[Math.floor(Math.random() * canditates.length)];
    if (game[position.y] == null) {
        game[position.y] = [];
    }
    game[position.y][position.x] = char;
    setGame(game);
    return true;
}

const processScores = () => {
    const scores = getHighscore(); 
    const score = getScore();
    // TODO: Find position and update highscores
}

const gameOver = () => {    
    _STATUS.gameOver = true;
    showBoard();
    processScores();    
    const percent = Math.round(100 * getCountPlayedCharacters() / Math.pow(getGameSize(), 2));
    const bestPercent = getBestCompletion()
    if (bestPercent === percent) {
        setBestCompletion(percent);
    }
    const recordPercent = bestPercent === percent ? '&nbsp;<sub>RECORD</sub>' : '';
    const currentLongest = getLongestWord(true);
    const longestRecord = getLongestWord(false) === currentLongest ? '&nbsp;<sub>RECORD</sub>' : '';
    const currentRound = getBestRound(true);
    const roundRecord = getBestRound(false) === currentRound ? '&nbsp;<sub>RECORD</sub>' : '';
    const div = document.getElementById('game-over');
    let content = "<h2>Game Over<h2><h3>Summary<h3>"
    content += '<ul>'
    content += `<li>${getScore()} points</li>`;
    content += `<li>${percent} percent of board completed${recordPercent}</li>`;
    if (currentLongest.length === 0) {
        content += `<li>No valid words!</li>`;
    } else {
        content += `<li>'${currentLongest}' was the longest word${longestRecord}</li>`;
    }
    content += `<li>${currentRound} was the best round score${roundRecord}</li>`;
    content += `</ul>`;

    div.innerHTML = content;
}

const handleAge = () => {
    const handSize = getHandSize();
    for (let i = 0; i<handSize; i++) {
        const h = getHandPosition(i);
        if (h.empty) continue;
        if (h.age === 1) {
            setHandPosition(i, h.character, false, 2);
        } else {
            if (placeWithoutNeighbors(h.character)) {
                setHandPosition(i, '.', true);
            } else {
                gameOver();
            }
        }
    }
};

const reportGuesses = (candidates, valid, score) => {
    const guesses = document.getElementById('guesses');
    const longest = candidates
        .filter((_, idx) => valid[idx])
        .sort((a, b) => b.length - a.length)[0];
    let lenthRecord = false;
    if (longest != null) {
        const currentLongest = getLongestWord(true);
        const totalLongest = getLongestWord(false);
        if (longest.length > currentLongest.length) {
            setLongestWord(true, longest);
        }
        if (longest.length > totalLongest.length) {
            setLongestWord(false, longest);
        }
        lenthRecord = true;
    }
    let report = '';
    candidates.forEach(candidate => {
        const isAWord = valid.some(w => w === candidate);
        if (report.length > 0) {
            report += '<br>';
        }
        const pts = isAWord ? candidate.length : -candidate.length;
        const wordRecord = isAWord && lenthRecord && longest === candidate ? '&nbsp;<sub>RECORD</sub>' : '';
        report += `<div><span class="${isAWord ? 'ok' : 'nok'}">${candidate}</span>&nbsp;(${pts})${wordRecord}</div>`;
    });
    if (score != null) {
        const currentBest = getBestRound(true);
        const totalBest = getBestRound(false);
        if (score > currentBest) { setBestRound(true, score); }
        let record = '';
        if (score > totalBest) {
            record = '&nbsp;<sub>RECORD</sub>'
            setBestRound(false, score);
        }
        report += `<br><div>${score}pt${score === 1 ? '' : 's'}${record}</div>`;
    }
    guesses.innerHTML = report;
};

const checkForValid = (canditates) => {
    _STATUS.communicating = true;
    axios
        .post('/wordz/check', canditates)
        .then(function (response) {
            const valid = canditates.filter((_, idx) => response.data[idx]);
            const invalid = canditates.filter((_, idx) => !response.data[idx]);
            let score = valid.reduce((score, word) => score + word.length, 0);
            const invalidScore = invalid.reduce((score, word) => score + word.length, 0);
            score -= invalidScore;
            reportGuesses(canditates, valid, score);
            increaseScore(score);

            if (score < 0) {
                gameOver();
                return;
            }
            handleAge();
            drawHand();
            showBoard();
            // Allow input again
            _STATUS.communicating = false;
        })
        .catch(function (error) {
            console.error(error);

            // Allow input again
            _STATUS.communicating = false;
        });
};

const submitTiles = () => {
    const canditates = wordsFromPlaced();
    if (canditates.length === 0) {
        handleAge();
        drawHand();
        showBoard();
    } else {
        checkForValid(canditates);
    }
};

const drawFromBag = () => {
    const sum = Object.values(_LETTER_FREQUENCIES)
        .reduce((acc, value) => acc + value, 0);
    let value = Math.random() * sum;
    return Object
        .keys(_LETTER_FREQUENCIES)
        .find(k => {
            value -= _LETTER_FREQUENCIES[k];
            if (value <= 0) return true;
            return false;
        });
    
};

const returnToHand = () => {
    const game = getGame();
    const handSize = getHandSize();
    for (let i=0; i<handSize; i++) {
        const h = getHandPosition(i);
        if (h.empty && !!h.position) {
            game[h.position.y][h.position.x] = undefined;
            setHandPosition(i, h.character, false, h.age);
        }
    }
    setGame(game);
    showHand();
    showBoard();
};

const drawHand = () => {
    const handSize = getHandSize();
    for (let i=0; i<handSize; i++) {
        const h = getHandPosition(i);
        if (h.empty) {
            const character = drawFromBag();
            setHandPosition(i, character, false, 1);
        }
    }
    showHand();
};

const showHand = () => {
    const hand = document.getElementById('hand');
    let handContents = '';
    const handSize = getHandSize();
    const lineAt = 2;
    for (let i=0; i<handSize; i++) {
        const h = getHandPosition(i);        
        const spannClass = h.empty ? 'hand-played' : (h.age > 1 ? 'hand-old' : '');
        const character = `<span class="${spannClass}">${h.character}</span>`;
        handContents += `<span id="hand-${i}"><sub>(${i+1})</sub> ${character}</span>`
        if (i == 2) {
            handContents += '<br>';
        }
    }
    hand.innerHTML = handContents;
};

const handleKeyPress = (evt) => {
    const size = getGameSize();
    const cursor = getCursor();
    switch (evt.which ?? evt.keyCode) {
        case 38: // UP
            if (_STATUS.gameOver) return;
            window.localStorage.setItem(
                _CURSOR,
                JSON.stringify({ x: cursor.x, y: Math.max(0, cursor.y - 1)}),
            );
            evt.preventDefault();
            break;
        case 40: // DOWN
            if (_STATUS.gameOver) return;
            window.localStorage.setItem(
                _CURSOR,
                JSON.stringify({ x: cursor.x, y: Math.min(size - 1, cursor.y + 1)}),
            );
            evt.preventDefault();
            break;
        case 37: // LEFT
            if (_STATUS.gameOver) return;
            window.localStorage.setItem(
                _CURSOR,
                JSON.stringify({ x: Math.max(0, cursor.x - 1), y: cursor.y}),
            );
            evt.preventDefault();
            break;
        case 39: // RIGHT
            if (_STATUS.gameOver) return;
            window.localStorage.setItem(
                _CURSOR,
                JSON.stringify({ x: Math.min(size - 1, cursor.x + 1), y: cursor.y}),
            );
            evt.preventDefault();
            break;
        case 49: // 1
            evt.preventDefault();
            playTile(0);
            break;
        case 50: // 2
            evt.preventDefault();
            playTile(1);
            break;
        case 51: // 3
            evt.preventDefault();
            playTile(2);
            break;
        case 52: // 4
            evt.preventDefault();
            playTile(3);
            break;
        case 53: // 5
            evt.preventDefault();
            playTile(4);
            break;
        case 54: // 6
            evt.preventDefault();
            playTile(5);
            break;
        case 55: // 7
            evt.preventDefault();
            playTile(6);
            break;
        case 32: // SPACE
            evt.preventDefault();
            submitTiles();
            break;
        case 82: // R
            evt.preventDefault();
            newGame();
            return;
        case 67: // C
            evt.preventDefault();
            returnTiles();
            break;
        default:
            console.log(evt);
            return;
    };
    showBoard();
};

const newGame = () => {
    window.localStorage.removeItem(_CURRENT_GAME);
    window.localStorage.removeItem(_CURSOR);
    window.localStorage.removeItem(_SCORE);
    const handSize = getHandSize();
    for (let i=0; i<handSize; i++) {
        setHandPosition(i, '.', true, 0);
    }
    reportGuesses([], []);
    drawHand();
    showBoard();
    increaseScore(0);
    setBestRound(true, 0);
    setLongestWord(true, '');
    _STATUS.gameOver = false;
    _STATUS.communicating = false;
    document.getElementById('game-over').innerHTML = "";
};

const setup = () => {
    showHand();
    showBoard();
    document.onkeydown = handleKeyPress;
};