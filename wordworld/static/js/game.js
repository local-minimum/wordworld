const _SIZE = 'settings.boardSize';
const _SIZE_DEFAULT = '13';
const _HAND_SIZE = 'settings.handSize';
const _HAND_SIZE_DEFAULT = '5';
const _CURSOR = 'game.cursor';
const _CURSOR_DEFAULT = '{ "x": 6, "y": 6 }';
const _HAND_POSITION = 'hand.';
const _CURRENT_GAME = 'game.current';
const _SCORE = "game.score";
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
    const hand = getHandPosition(handPosition);
    const game = getGame();    
    const cursor = getCursor();
    if (hand.empty) {
        game[hand.position.y][hand.position.x] = null;
        setHandPosition(handPosition, hand.character, false, hand.age);
        setGame(game);
    } else if (
        game[cursor.y]?.[cursor.x] == null
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

const increaseScore = (value) => {
    const total = JSON.parse(window.localStorage.getItem(_SCORE) ?? '0') + value;
    window.localStorage.setItem(_SCORE, JSON.stringify(total));
    const score = document.getElementById('score');
    score.innerHTML = String(total).padStart(4, '0');
}

const horizontalWord = (game, origin) => {
    const row = game[origin.y];
    let x = origin.x;
    let word = row[x];
    x -= 1;
    while (x >= 0 && row[x] != null) {
        word = row[x] + word;
        x -= 1;
    };
    x = origin.x + 1;
    while (row[x] != null) {
        word += row[x];
        x += 1;
    };
    return word;
}

const verticalWord =  (game, origin) => {
    const x = origin.x;
    let y = origin.y;
    let word = game[y][x];
    y -= 1;
    while (y >= 0 && game[y]?.[x] != null) {
        word = game[y][x] + word;
        y -= 1;
    }
    y = origin.y + 1;
    while (game[y]?.[x] != null) {
        word += game[y][x];
        y += 1;
    }
    return word;
}

const wordsFromPlaced = () => {
    const game = getGame();
    const handSize = getHandSize();
    const placed = [];
    for (let i = 0; i < handSize; i++) {
        const h = getHandPosition(i);
        if (h.empty && !!h.position) {
            placed.push(h.position);
        }
    }
    const words = [];
    placed.forEach(position => {
        let word = horizontalWord(game, position);
        if (word.length > 1 && !words.some(w => w === word)) {
            words.push(word);
        }
        word = verticalWord(game, position);
        if (word.length > 1 && !words.some(w => w === word)) {
            words.push(word);
        }
    });
    return words;
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

const gameOver = () => {    
    _STATUS.gameOver = true;
    
    // TODO: Highscore
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

const reportGuesses = (candidates, valid) => {
    const guesses = document.getElementById('guesses');
    let report = '';
    candidates.forEach(candidate => {
        const isAWord = valid.some(w => w === candidate);
        if (report.length > 0) {
            report += '<br>';
        }
        report += `<div>(${isAWord ? candidate.length : 0})&nbsp;<span class="${isAWord ? 'ok' : 'nok'}">${candidate}</span></div>`;
    });
    guesses.innerHTML = report;
};

const checkForValid = (canditates) => {
    _STATUS.communicating = true;
    axios
        .post('check', canditates)
        .then(function (response) {
            // Validate words 
            const valid = canditates.filter((_, idx) => response.data[idx]);

            reportGuesses(canditates, valid);
            // Score 
            score = valid.reduce((score, word) => score + word.length, 0);
            increaseScore(score);

            // Handle age 
            handleAge();

            // Draw Hand
            drawHand();

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
    checkForValid(canditates);
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

const getHandSize = () => JSON
    .parse(window.localStorage.getItem(_HAND_SIZE) ?? _HAND_SIZE_DEFAULT);

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
    for (let i=0; i<handSize; i++) {
        const h = getHandPosition(i);        
        const character = h.age > 1 ? `<span class="hand-old">${h.character}</span>` : h.character;
        handContents += `<span id="hand-${i}">${i+1}: ${h.empty ? '.' : character}</span>`
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
            playTile(0);
            break;
        case 50: // 2
            playTile(1);
            break;
        case 51: // 3
            playTile(2);
            break;
        case 52: // 4
            playTile(3);
            break;
        case 53: // 5
            playTile(4);
            break;
        case 32: // SPACE
            submitTiles();
            break;
        case 82: // R
            newGame();
            return;
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
    // Construct bag
    drawHand();
    showBoard();
};

const setup = () => {
    showHand();
    showBoard();
    document.onkeydown = handleKeyPress;
};