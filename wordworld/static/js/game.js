const _STATUS = {
    gameOver: false,
    communicating: false,
};


const buttonize = (content, callback) => `<span class="nav-btn" onclick="${callback}">${content}</span>`;

const showBoard = (foci = null) => {
    const board = document.getElementById('world');
    const size = wordzStore.getGameSize();
    const cursor = wordzStore.getCursor(); 
    const game = wordzStore.getGame();
    const placedPositions = wordzStore.getPlacedTilePositions();
    const playing = !_STATUS.gameOver;
    let data = '';
    for (let y=0; y<size; y++) {
        for (let x=0; x<size; x++) {
            position = game[y]?.[x] ?? '.'; 
            isCurrent = position  !== '.' && placedPositions.some((pos) => pos.x === x && pos.y === y);
            if (foci == null ? cursor.x === x && cursor.y === y : foci.some(pos => pos.x === x && pos.y === y)) {
                position = `<span id="selection" class=${isCurrent ? '"current-round-letter"' : '"other-round-letter"'}>${position}</span>`;
            } else if (isCurrent) {
                position = `<span class="current-round-letter">${position}</span>`
            } else {
                position = `<span class="other-round-letter">${position}</span>`
            }
            position = playing ? buttonize(position, `moveCursor(${x}, ${y});showBoard();`) : position;
            data += position;
        }
        data += '<br>';
    }
    board.innerHTML = data;
};

const wordsToLines = (msg) => {
    const words = msg.split(' ');    
    const size = wordzStore.getGameSize();
    let lines = [];
    let line  = 0;
    let cols = 0;
    for (let i = 0; i<words.length; i++) {
        const word = words[i];        
        if (word.length === 0) {
            if (cols > size) {
                lines.push([]);
                line += 1;
                cols = 0;
            } else {
                cols = size + 1;
            }
        } else if (cols == 0) {
            if (word.length <= size) {
                lines.push([word]);
                cols = word.length
            } else {
                left = word.slice(0, size - 1);
                words[i] = word.slice(size - 1);
                lines.push([left, '-']);
                line += 1;
                cols = 0;
                i -= 1;
            }
        } else if (cols + word.length < size + 1) {
            lines[line].push(' ');
            lines[line].push(word)
            cols += 1 +  word.length;
        } else {
            cols = 0;
            i -= 1;
            line += 1;
        }
    }
    return lines.map(l => l.join(''));
}

const showMessageOnBoard = (msg) => {
    const size = wordzStore.getGameSize();
    const lines = wordsToLines(msg);    
    const yOff = Math.floor((size - lines.length) / 2);
    let data = '';
    for (let y=0; y<size; y++) {
        const line = lines[y - yOff];
        const xOff = Math.floor((size - (line?.length ?? 0)) / 2);
        for (let x=0; x<size; x++) {
            let ch = line?.[x - xOff];
            if (ch == null || ch === ' ') {
                ch = '.';
            }
            data += `<span class="other-round-letter">${ch}</span>`;
        }
        data += '<br>';
    }
    const board = document.getElementById('world');
    board.innerHTML = data;
};

const showRecords = () => {
    if (_STATUS.communicating) return;
    _STATUS.communicating = true;
    const bestScore = wordzStore.getHighscore(); 
    const bestPercent = wordzStore.getBestCompletion()
    const longestRecord = wordzStore.getLongestWord(false);
    const wins = wordzStore.getWins();
    const superWins = wordzStore.getSuperWins();
    const bestRound = wordzStore.getBestRound();
    const showTime = 4000;
    showMessageOnBoard(
        `Highscore  ${bestScore}pts    Round  ${bestRound}pts    Coverage  ${bestPercent}%`,
    );
    setTimeout(() => {
        showMessageOnBoard(
            `Longest  ${longestRecord}    Wins  ${wins}    Super Win  ${superWins}`,
        );
        setTimeout(() => {
            showBoard();
            _STATUS.communicating = false;
        }, showTime);
    }, showTime);
};

const boardFlasher = (foci) => {
    if (_STATUS.flash === undefined) {
        _STATUS.flash = 0;
    } else if (_STATUS.flash > 6) {
        showBoard();
        delete _STATUS['flash'];
        return;
    } else {
        _STATUS.flash += 1;
    }
    showBoard(_STATUS.flash % 2 === 1 ? foci : []);
    window.setTimeout(() => boardFlasher(foci), 250);
}

const getInvalidPlacements = () => {
    const placed = wordzStore.getPlacedTilePositions();
    const game = wordzStore.getGame();
    if (placed.length > 0 && placed.length == wordzStore.getCountPlayedCharacters()) {
        placed.splice(0, 1);
    }
    let truncated = true;
    while (truncated && placed.length > 0) {
        truncated = false;
        for (let i=placed.length-1; i>=0; i--) {
            const pos = placed[i];
            const neighbors = getNeighborPositions(game, pos.x, pos.y);
            for (let j=0; j < neighbors.length; j++) {
                const npos = neighbors[j];
                if (!placed.some(p => p.x === npos.x && p.y === npos.y)) {
                    placed.splice(i, 1);
                    truncated = true;                    
                }
            }
        }
    }
    return placed;
}

const playTile = (handPosition) => {
    if (_STATUS.gameOver || _STATUS.communicating) return;
    const handSize = wordzStore.getHandSize();
    if (handPosition >= handSize) return;
    const hand = wordzStore.getHandPosition(handPosition);
    const game = wordzStore.getGame();    
    const cursor = wordzStore.getCursor();
    if (
        !hand.empty
        && game[cursor.y]?.[cursor.x] == null
    ) {
        if (game[cursor.y] == null) {
            game[cursor.y] = [];
        }
        game[cursor.y][cursor.x] = hand.character;
        wordzStore.setHandPosition(handPosition, hand.character, true, hand.age, cursor);
        wordzStore.setGame(game);
    } else if (hand.position != null){
        game[hand.position.y][hand.position.x] = null;
        wordzStore.setHandPosition(handPosition, hand.character, false, hand.age);
        wordzStore.setGame(game);
    }
    showHand();
    showCoverage();
};

const returnTiles = () => {
    const handSize = wordzStore.getHandSize();
    const game = wordzStore.getGame();
    for (let i = 0; i<handSize; i++) {
        const hand = wordzStore.getHandPosition(i);
        if (hand.empty) {
            game[hand.position.y][hand.position.x] = null;
            wordzStore.setHandPosition(i, hand.character, false, hand.age);
        }
    }
    wordzStore.setGame(game);
    showHand();
    showBoard();
}

const showCoverage = () => {
    const coverage = wordzStore.getCoverage();
    const coverageText = `${coverage}%`;
    const tOff = Math.floor((10 - coverageText.length) / 2);
    let text = '' ;
    for (let i = 0; i<10; i++) {
        const ch = coverageText[i - tOff] ?? '&nbsp;';
        const cls = (i + 1) * 10 <= coverage ? 'has-coverage' : '';
        text += `<span class=${cls}>${ch}</span>`;
    }
    document.getElementById('coverage').innerHTML = text;
}

const increaseScore = (value) => {
    const total = Math.max(0, wordzStore.getScore() + value);
    wordzStore.setScore(total);
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
    const game = wordzStore.getGame();
    const handSize = wordzStore.getHandSize();
    let placed = [];
    for (let i = 0; i < handSize; i++) {
        const h = wordzStore.getHandPosition(i);
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

const getNeighborPositions = (game, x, y) => {
    const neighbours = [];
    if (y > 0 && game[y - 1]?.[x] != null) { neighbours.push({ x, y: y - 1 }); }
    if (game[y + 1]?.[x] != null) { neighbours.push({ x, y: y + 1 }); }
    const row = game[y] ?? [];
    if (x > 0 && row[x - 1] != null) { neighbours.push({ x: x - 1, y }); }
    if (row[x + 1] != null) { neighbours.push({ x: x + 1, y }); };
    return neighbours;
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
    const size = wordzStore.getGameSize();
    const game = wordzStore.getGame();
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
    wordzStore.setGame(game);
    return true;
}

const share = () => {
    const game = wordzStore.getGame();
    const score = wordzStore.getScore();
    const percent = wordzStore.getCoverage();
    let data = `Score: ${score}\nPercent: ${percent}\n`;
    for (let y=0; y<size; y++) {
        for (let x=0; x<size; x++) {
            if (game[y]?.[x] == null) {
                data += '⚫';
            } else {
                data += '🟧';
            }
        }
        data += '\n';
    }
    navigator.clipboard.writeText(data);
};

const gameOver = () => {    
    _STATUS.gameOver = true;
    wordzStore.setGameOver(true);
    increaseScore(0);
    // Streak
    // inStreak null means have not played just refreshing
    const inStreak = isInStreak(wordzStore.getGameName(), wordzStore.getPrevGameName());
    const streakDays = inStreak === null ? wordzStore.getStreakDays() : (inStreak ? wordzStore.getStreakDays() + 1 : 1);
    if (inStreak !== null) {
        wordzStore.setStreakDays(streakDays);
    }
    // Ensure refresh doesn't spoil stats
    wordzStore.setPrevGameName('');
    // Score
    const bestScore = wordzStore.getHighscore(); 
    const score = wordzStore.getScore();
    let highScore = '';
    if (score >= bestScore) {
        wordzStore.setHighscore(score);
        highScore = '<span class="record">HIGHSCORE!</p>';
    }
    // Coverage
    const percent = wordzStore.getCoverage();
    const bestPercent = wordzStore.getBestCompletion()
    let recordPercent = '';
    if (percent >= bestPercent) {
        wordzStore.setBestCompletion(percent);
        recordPercent = '<span class="record">RECORD</span>';
    }
    // Wins
    const win = score >= 50;
    const superWin = score >= 100;
    const streakWins = win ? (inStreak === null ? wordzStore.getStreakWins() : wordzStore.getStreakWins() + 1) : 0;
    if (inStreak !== null) wordzStore.setStreakWins(streakWins);
    const wins = wordzStore.getWins() + (inStreak === null ?  0 : (win ? 1 : 0));
    const superWins = wordzStore.getSuperWins() + (inStreak === null ?  0 : (superWin ? 1 : 0));
    if (inStreak !== null) wordzStore.setWins(wins);
    if (inStreak !== null) wordzStore.setSuperWins(superWins);
    // Achievments
    const currentLongest = wordzStore.getLongestWord(true);
    const longestRecord = wordzStore.getLongestWord(false) === currentLongest ? '<span class="record">RECORD</span>' : '';
    const currentRound = wordzStore.getBestRound(true);
    const roundRecord = wordzStore.getBestRound(false) === currentRound ? '<span class="record">RECORD</span>' : '';
    // Produce content
    const div = document.getElementById('game-over');
    let content = "<h3>Game Over / Summary</h3>"
    content += '<ul>'
    content += `<li>${score} points${highScore}</li>`;
    content += `<li>${percent} percent of board completed${recordPercent}</li>`;
    if (currentLongest.length === 0) {
        content += `<li>No valid words!</li>`;
    } else {
        content += `<li>'${currentLongest}' was the longest word${longestRecord}</li>`;
    }
    content += `<li>${currentRound} was the best round score${roundRecord}</li>`;
    content += `<li>Played ${streakDays} days in a row</li>`;
    if (superWin) {
        content += `<li>Scored a SUPEREB WIN! ${streakWins} win${streakWins != 1 ? 's' : ''} in a row</li>`
    } else if (win) {
        content += `<li>Scored a WIN! ${streakWins} win${streakWins > 1 ? 's' : ''} in a row</li>`
    } else {
        content += '<li>No win today, unfortunately</li>'
    }
    content += `<li>A total of ${superWins} superb and ${wins - superWins} normal win${wins !== 1 ? 's': ''} scored</li>`;
    content += `</ul>`;

    div.innerHTML = content;
}

const handleAge = () => {
    const handSize = wordzStore.getHandSize();
    for (let i = 0; i<handSize; i++) {
        const h = wordzStore.getHandPosition(i);
        if (h.empty) continue;
        if (h.age === 1) {
            wordzStore.setHandPosition(i, h.character, false, 2);
        } else {
            if (placeWithoutNeighbors(h.character)) {
                wordzStore.setHandPosition(i, '.', true);
            } else {
                gameOver();
                showBoard();
            }
        }
    }
};

const reportGuesses = (candidates, valid, score) => {
    const guesses = document.getElementById('guesses');
    const longest = valid 
        .sort((a, b) => b.length - a.length)[0];
    let lengthRecord = false;
    if (longest != null) {
        const currentLongest = wordzStore.getLongestWord(true);
        const totalLongest = wordzStore.getLongestWord(false);
        if (longest.length > currentLongest.length) {
            wordzStore.setLongestWord(true, longest);
        }
        if (longest.length > totalLongest.length) {
            wordzStore.setLongestWord(false, longest);
            lengthRecord = true;
        }
    }
    let report = '';
    candidates.forEach(candidate => {
        const isAWord = valid.some(w => w === candidate);
        if (report.length > 0) {
            report += '<br>';
        }
        const pts = isAWord ? candidate.length : -candidate.length;
        const wordRecord = isAWord && lengthRecord && longest === candidate ? '<span class="record">RECORD</span>' : '';
        report += `<div><span class="${isAWord ? 'ok' : 'nok'}">${candidate}</span>&nbsp;(${pts})${wordRecord}</div>`;
    });
    if (score != null) {
        const currentBest = wordzStore.getBestRound(true);
        const totalBest = wordzStore.getBestRound(false);
        if (score > currentBest) { wordzStore.setBestRound(true, score); }
        let record = '';
        if (score > totalBest) {
            record = '<span class="record">RECORD</span>'
            wordzStore.setBestRound(false, score);
        }
        report += `<br><div>${score}pt${score === 1 ? '' : 's'}${record}</div>`;
    }
    guesses.innerHTML = report;
};

const checkForValid = (canditates) => {
    const mode = wordzStore.getMode();
    axios
        .post(mode.indexOf('SWE') === 0 ? '/wordz/kolla' : '/wordz/check', canditates)
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
            } else {
                handleAge();
                drawHand();
                showBoard();
            }
            endThink();
        })
        .catch(function (error) {
            console.error(error);
            endThink();
        });
};

const submitTiles = () => {
    if (_STATUS.communicating) return;
    startThink();
    const invalids = getInvalidPlacements();
    if (invalids.length > 0) {
        boardFlasher(invalids);
        endThink();
        return        
    }
    const canditates = wordsFromPlaced();
    if (canditates.length === 0) {
        handleAge();
        drawHand();
        showBoard();
        endThink();
    } else {
        checkForValid(canditates);
    }
};

const startThink = () => {
    _STATUS.communicating = true;
    const world = document.getElementById('world');
    world.className = "active-animation";
};

const endThink = () => {
    _STATUS.communicating = false;
    const world = document.getElementById('world');
    world.className = "paused-animation";
};


const returnToHand = () => {
    const game = wordzStore.getGame();
    const handSize = wordzStore.getHandSize();
    for (let i=0; i<handSize; i++) {
        const h = wordzStore.getHandPosition(i);
        if (h.empty && !!h.position) {
            game[h.position.y][h.position.x] = undefined;
            wordzStore.setHandPosition(i, h.character, false, h.age);
        }
    }
    wordzStore.setGame(game);
    showHand();
    showBoard();
};

const drawHand = () => {
    const handSize = wordzStore.getHandSize();
    const mode = wordzStore.getMode();
    for (let i=0; i<handSize; i++) {
        const h = wordzStore.getHandPosition(i);
        if (h.empty) {
            const character = drawFromBag(mode);
            wordzStore.setHandPosition(i, character, false, 1);
        }
    }
    showHand();
};

const showHand = () => {
    const isPlaying = !_STATUS.gameOver;
    const hand = document.getElementById('hand');
    let handContents = '';
    const handSize = wordzStore.getHandSize();
    for (let i=0; i<handSize; i++) {
        const h = wordzStore.getHandPosition(i);        
        const spannClass = h.empty ? 'hand-played' : (h.age > 1 ? 'hand-old' : '');
        let character = `<span class="${spannClass}">${h.character}</span>`;
        if (isPlaying) {
            character = buttonize(character, `playTile(${i});showBoard();`);
        } 
        handContents += `<span id="hand-${i}"><sub>(${i+1})</sub> ${character}</span>`
        if (i == 2) {
            handContents += '<br>';
        }
    }
    hand.innerHTML = handContents;
};

const moveCursor = (x, y) => {
    if (_STATUS.gameOver) return;
    return wordzStore.moveCursor(x, y);
}

const handleKeyPress = (evt) => {
    const cursor = wordzStore.getCursor();
    switch (evt.which ?? evt.keyCode) {
        case 38: // UP
            moveCursor(cursor.x, cursor.y - 1);
            evt.preventDefault();
            break;
        case 40: // DOWN
            moveCursor(cursor.x, cursor.y + 1);
            evt.preventDefault();
            break;
        case 37: // LEFT
            moveCursor(cursor.x - 1, cursor.y);
            evt.preventDefault();
            break;
        case 39: // RIGHT
            moveCursor(cursor.x + 1, cursor.y);
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

const newGame = (name) => {
    wordzStore.setGameName(name);
    wordzStore.setGameOver(false);
    wordzStore.resetProgress();
    _STATUS.gameOver = false;
    _STATUS.communicating = false;
    const mode = wordzStore.getMode();
    _STATUS.rng = getPRNG(`${mode}${name}`);
    wordzStore.clearHand();
    reportGuesses([], []);
    drawHand();
    showBoard();
    increaseScore(0);
    wordzStore.setBestRound(true, 0);
    wordzStore.setLongestWord(true, '');
    document.getElementById('game-over').innerHTML = "";
};

const MODE_AS_MODE_NAME = {
    '': 'English',
    'SWE-': 'Svenska',
};

const MODE_AS_GAME_NAME = {
    '': 'Word Crux',
    'SWE-': 'Ordkrux',
};

const displayModeName = () => {
    const mode = wordzStore.getMode();
    document.getElementById('game-name').innerHTML = MODE_AS_GAME_NAME[mode];
    document.title = MODE_AS_GAME_NAME[mode];

    startThink();
    // Display mode name in game
    showMessageOnBoard(MODE_AS_MODE_NAME[mode]);
    window.setTimeout(
        () => {
            endThink();
            showBoard();
        },
        2000,
    );
}

const setup = (mode) => {
    if (_STATUS.communicating) return;

    // Game mode
    if (mode != null) {
        wordzStore.setMode(mode);
    } else {
        wordzStore.restoreMode();
    }
    displayModeName();

    // Cleanup
    reportGuesses([], []);

    // New or old game
    const name = generateGameName();
    const cachedGame = wordzStore.getGameName();
    if (name !== cachedGame) {
        wordzStore.setPrevGameName(cachedGame.length === 0 ? 'GAME: -42' : cachedGame);
        newGame(name);
    } else {
        const mode = wordzStore.getMode();
        const revealed = wordzStore.getCountPlayedCharacters() + wordzStore.getTilesInHand();
        _STATUS.rng = getPRNG(`${mode}${name}`, revealed);
        _STATUS.gameOver = wordzStore.getGameOver();
        _STATUS.communicating = false;
    }

    // Show current status
    showCoverage();
    showHand();
    if (_STATUS.gameOver) {
        gameOver();
    } else {
        document.getElementById('game-over').innerHTML = "";
    }
};