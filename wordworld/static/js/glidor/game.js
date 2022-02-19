const WORD_LENGTH = 5;
const ATTEMPTS = 8;

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

const scoreCurrentWord = (current) => {
    const targetWord = glidorStore.getCurrentTarget().split('').map(v => ({ value: v }));
    const activeRow = current[current.length - 1];
    // Check correct
    for (let i = 0; i < activeRow.length; i++) {
        const chr = activeRow[i];
        if (chr.value === targetWord[i].value) {
            chr.correct = true; 
            targetWord[i].used = true;
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

const handleInput = (chr) => {
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
        // Todo: validate allowed 
        console.log('Submit');
        scoreCurrentWord(current);
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
const START = new Date(2022, 1, 6);

function getGameID() {
    const now = new Date();
    return `GAME-${Math.floor((now - START) / DAY)}`;
}

const WORD_URL = {
    EN: 'check/drewol',
    SWE: 'kolla/glidor',
};

const setup = (lang) => {
    const gameId = getGameID();
    if (gameId !== glidorStore.getGameName()) {
        glidorStore.setCurrent(null);
        glidorStore.setGameName(gameId);
        axios
            .get([WORD_URL[lang], gameId].join('/'))
            .then(function (response) {
                if (response.data != null);
                console.log(reponse.data);
                constructKeyboard(KEYBOARDS[lang], (e) => handleInput(e.target.innerText));
                drawTiles();
            });
    } else {
        constructKeyboard(KEYBOARDS[lang], (e) => handleInput(e.target.innerText));
        drawTiles();
    }    
}
