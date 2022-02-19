const WORD_LENGTH = 5;
const ATTEMPTS = 9;

function shuffleArray(arr) {
  arr.sort(() => Math.random() - 0.5);
}

const shuffleName = () => {
    let parts = document.title.split(' - ');
    const name = parts[0].split('');
    shuffleArray(name);
    let newName = name.join('');
    newName = newName.charAt(0).toUpperCase() + newName.slice(1).toLowerCase();
    if (GAME_MODE[newName] === undefined) {
        parts[0] = newName;
        newTitle = parts.join(' - ');
        document.title = newTitle;
        const head = document.getElementById('header-name');
        parts = head.innerText.split(' - ');
        parts[0] = newName;
        head.innerText = parts.join(' - ');
    }
};

const removeChildren = (parent) => {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
};

const tileStatusClass = (pos) => {
    if (pos.correct) {
        return 'tile correct';
    } else if (pos.partial) {
        return 'tile partial';
    } else if (pos.incorrect) {
        return 'tile incorrect';
    }
    return 'tile empty';
}

const drawTiles = () => {
    const current = glidorStore.getCurrent();
    const tilesDiv = document.getElementById('tiles');
    removeChildren(tilesDiv);
    for (let r = 0; r<ATTEMPTS; r++) {
        const row = current[r] ?? [];
        for (let idx=0; idx<WORD_LENGTH; idx++) {
            const pos = row[idx];
            const tileSpan = document.createElement('span');
            if (pos == null) {
                tileSpan.innerHTML = '&nbsp;';
                tileSpan.className = 'tile empty';
            } else {
                tileSpan.innerText = pos.value;
                tileSpan.className = tileStatusClass(pos);
            }
            tilesDiv.appendChild(tileSpan);
        }
    }
};

const scoreCurrentWord = (lang, current) => {
    const targetWord = glidorStore.getCurrentTarget().split('').map(v => ({ value: v }));
    const activeRow = current[current.length - 1];
    let correct = 0;
    // Check correct
    for (let i = 0; i < activeRow.length; i++) {
        const chr = activeRow[i];
        if (chr.value === targetWord[i].value) {
            chr.correct = true; 
            targetWord[i].used = true;
            correct += 1;
        }
    }
    if (correct === WORD_LENGTH) {        
        showPopper(
            `You made it in ${current.length} guesses.<br><button id="share-button" onclick="copyShare(${lang});">Share</button>`
        );
        while (current.length <= ATTEMPTS) {
            current.push([]);
        }
    }
    // Check partial 
    for (let i = 0; i< activeRow.length; i++) {
        const chr = activeRow[i];
        if (chr.correct) continue;

        for (let j = 0; j < targetWord.length; j++){
            const target = targetWord[j];
            if (target.used || chr.value !== target.value) continue;
            target.used = true;
            chr.partial = true;
        }
    }
    // incorrect
    for (let i = 0; i< activeRow.length; i++) {
        const chr = activeRow[i];
        if (chr.correct || chr.partial) continue;
        chr.incorrect = true;
    }
    // next line
    current.push([]);
}

const ERRORS = {
    invalidCharacters: {
        EN: 'No known word contains the suggested combination of characters.',
        SWE: 'Inget känt ord innehåller de föreslagna bokstäverna.',
    },
    existsWord: {
        EN: 'There\'s a word spelled as the suggestion.',
        SWE: 'Det finns ett ord med den föreslagna stavningen.'
    },
}

const showPopper = (innerHtml, popperId = 'popper') => {
    const popper = document.getElementById(popperId);
    popper.innerHTML = innerHtml;
    popper.className = '';
};

const hidePopper = (popperId = 'popper') => {
    const popper = document.getElementById(popperId);
    popper.className = 'hidden';
};

const displayError = (lang, errType) => {
    showPopper(ERRORS[errType][lang], 'error-popper');
    setTimeout(() => hidePopper('error-popper'), 3.5 * 1000);
};

const handleInput = (lang, chr) => {
    const current = glidorStore.getCurrent();
    const activeRow = current[current.length - 1];
    if (current.length > ATTEMPTS) {
        console.warn('Tries to cheat gameover');
        return;
    }
    if (chr === '⌫') {
        activeRow.splice(activeRow.length - 1, 1);
    } else if (chr === '⏎') {
        if (activeRow.length !== WORD_LENGTH) return;
        axios
            .post(WORD_URL[lang], { word: activeRow.map(c => c.value).join('') })
            .then(() => {
                scoreCurrentWord(lang, current);
                glidorStore.setCurrent(current);
                drawTiles();
                redrawKeyboard();
                shuffleName();
            })
            .catch((reason) => {
                const status = reason?.response?.status;
                if (status == 404) {
                    displayError(lang, 'invalidCharacters');
                } else if (status == 403) {
                    displayError(lang, 'existsWord');
                }
            });
    } else if (activeRow.length >= WORD_LENGTH) {
        return;
    } else {
        activeRow.push({ value: chr });
    }
    glidorStore.setCurrent(current);
    drawTiles();
    redrawKeyboard();
}

const DAY = 1000 * 60 * 60 * 24;
const START = new Date(2022, 1, 19);

function getGameID() {
    const now = new Date();
    return `GAME-${Math.floor((now - START) / DAY)}`;
}

const WORD_URL = {
    EN: 'check/drewol',
    SWE: 'kolla/glidor',
};

const GAME_MODE = {
    EN: 'Drewol',
    SWE: 'Glidor',
};

const getShareText = (lang) => {
    const n = glidorStore.getGameName().split('-')[1];
    const current = glidorStore.getCurrent();
    const guesses = current.reduce((acc, g) => acc + (g.length > 0 ? 1 : 0), 0);
    let text = `${GAME_MODE[lang]} ${n}: ${guesses}/${ATTEMPTS}\n`;
    for (let y=0; y<guesses; y++) {
        const row = current[y];
        for (let x=0; x<WORD_LENGTH; x++) {
            const pos = row[x];
            if (pos.correct) {
                text += '🟩';
            } else if (pos.partial) {
                text += '🟧';
            } else {
                text += '⬛';
            }
        }
        data += '\n';
    }
    return text;
};

const copyShare = (lang) => {
    const text = getShareText(lang);
    navigator.clipboard.writeText(text);
    const shareBtn = document.getElementById('share-button');
    if (shareBtn == null) return;
    shareBtn.innerHTML = "Copied!"
    setTimeout(() => {
        shareBtn.innerHTML = 'Share';
    }, 1000);
}

const setup = (lang) => {
    injectHelpBtn(lang);
    if (!glidorStore.getSeenHelp()) {
        glidorStore.setSeenHelp();
        showHelp(lang);
    }
    glidorStore.setGameMode(GAME_MODE[lang]);
    const gameId = getGameID();
    if (gameId !== glidorStore.getGameName()) {
        glidorStore.setCurrent(null);
        console.log('Starting', gameId);
        axios
            .get([WORD_URL[lang], gameId].join('/'))
            .then((response) => {
                if (response?.data == null) return;
                glidorStore.setGameName(gameId);
                glidorStore.setCurrentTarget(response.data.word.toUpperCase());
                constructKeyboard(KEYBOARDS[lang], (e) => handleInput(lang, e.target.innerText));
                drawTiles();
            });
    } else {
        constructKeyboard(KEYBOARDS[lang], (e) => handleInput(lang, e.target.innerText));
        drawTiles();
    }    
}
