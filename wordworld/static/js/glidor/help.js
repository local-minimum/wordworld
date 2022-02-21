const HELP_TEXT = {
    EN: [
        'This is not like wordle, this is really quite hard.',
        'Each day scrambled letters of a true word are selected. They can never be a word.',
        'You try inputing guesses that are not words, but are scrambled letters of real words too.',
        'If a letter has been revealed not to belong in the solution, you may not use it in future guesses.',
        'You may however skip using green or yellow letters in future guesses to maximize information gleaned.',
        'Green = Correct placement, Yellow = In the word, but wrong place, Red = Not in the word.',
    ],
    SWE: [
        'Detta är inte Ordlig eller Wordle, utan ett riktigt svårt spel.',
        'Varje dag väljs en omstuvning av bokstäverna i ett faktiskt ord. Det kan aldrig vara ett ord som söks.',
        'Ditt jobb är att mata in gissningar som inte heller är ord, men som är omstuvningar av faktiska ord.',        
        'Om en bokstav har uteslutits får den inte längre användas i framtida gissningar.',
        'Men du får hoppa över att använda gröna eller gula bokstäver i framtida gissningar för att maximera vinstmöjligheterna.',
        'Grön = Rätt plats, Gul = I ordet, men fel plats, Röd = Inte i ordet.',
    ],
};

const showHelp = (lang) => {
    let html = HELP_TEXT[lang].map(t => `<p>${t}<p>`).join('');
    html += '<button onclick="hidePopper();">Close</button>';
    showPopper(html)
}

const injectHelpBtn = (lang) => {
    const btn = document.createElement('button');
    btn.onclick = () => showHelp(lang);
    btn.innerText = 'i';
    btn.className = 'header-button';
    document.getElementById('header').appendChild(btn);
}

const getGuessCount = () => {
    const current = glidorStore.getCurrent();
    let count = current.reduce((acc, g) => acc + (g.length > 0 ? 1 : 0), 0);
    return count;
};

const getShareText = (lang) => {
    const n = glidorStore.getGameName().split('-')[1];
    const current = glidorStore.getCurrent();
    const guesses = getGuessCount();
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
        text += '\n';
    }
    return text;
};

const SHARE_TEXT = { EN: 'Share', SWE: 'Dela' };
const COPIED_TEXT = { EN: 'Copied!', SWE: 'Kopierad!' };

const copyShare = (lang) => {
    const text = getShareText(lang);
    navigator.clipboard.writeText(text);
    const shareBtn = document.getElementById('share-button');
    if (shareBtn == null) return;
    shareBtn.innerHTML = COPIED_TEXT[lang];
    setTimeout(() => {
        shareBtn.innerHTML = SHARE_TEXT[lang];
    }, 1000);
};

const FAIL_TEXT = {
    EN: `You didn't make it today, but perhaps you'll have better luck tomorrow.`,
    SWE: `Du lyckades inte idag, men förhoppningsvis går det bättre imorgon.`,
};

const MADE_IT_PT1_TEXT = { EN: 'You made it in', SWE: 'Du hittade det på' };
const MADE_IT_PT2_TEXT = { EN: 'guesses', SWE: 'gissningar' };
const CLOSE_TEXT = { EN: 'Close', SWE: 'Stäng' };
const THE_TARGET_TEXT = { EN: 'The target word was', SWE: 'Det sökta ordet var' };
const ANGAGRAM_TEXT = { EN: 'This was an anagram of', SWE: 'Detta var ett anagram av' };

const showGameOver = (lang) => {
    const current = glidorStore.getCurrent();
    const won = current
        .reduce((acc, row) => acc || (row.length === WORD_LENGTH && row.every(w => w.correct)), false);
    const guesses = getGuessCount();
    const target =  glidorStore.getCurrentTarget();
    const failed = guesses > ATTEMPTS;
    let payload = '';
    if (!won) {
        payload = `<p class="intro">${FAIL_TEXT[lang]}</p>`;
    } else {
        payload = `<p class="intro">${MADE_IT_PT1_TEXT[lang]} ${guesses} ${MADE_IT_PT2_TEXT[lang]}!</p>`;
    }
    const btns = [
        `<button id="share-button" onclick="copyShare('${lang}');">${SHARE_TEXT[lang]}</button>`,
        `<button onClick="hidePopper()">${CLOSE_TEXT[lang]}</button>`,
    ].join('');
    let targetText = `<p>${THE_TARGET_TEXT[lang]} <span class="target">${target}</span></p>`;
    axios
        .post(`${WORD_URL[lang]}/reverse`, { 'anagram': target })
        .then((response) => {
            if (response?.data == null) {
                showPopper(`${payload}${targetText}${btns}`);
                return;
            }
            const words =  response.data.map(w => w.toUpperCase()).join(', ');
            showPopper(`${payload}${targetText}<p>${ANGAGRAM_TEXT[lang]}: ${words}</p>${btns}`)
        })
        .catch(() => {
            showPopper(`${payload}${targetText}${btns}`);
        });
}

const isGameOver = () => {
    const current = glidorStore.getCurrent();
    if (current.length > ATTEMPTS) return true;
    return current[current.length - 1].filter(p => p.correct) === WORD_LENGTH;
}
