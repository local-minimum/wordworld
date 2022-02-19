const HELP_TEXT = {
    EN: [
        'This is not like wordle, this is really quite hard.',
        'Each day scrabled letters of a true word are selected. They can never be a word.',
        'You try inputing guesses that are not words, but are scrambled letters of real words.',
        'If a letter has been revealed not to belong in the word, you may not use it in future guesses.',
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
    return current.reduce((acc, g) => acc + (g.length > 0 ? 1 : 0), 0);
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

const showGameOver = (lang) => {
    showPopper(
        `You made it in ${getGuessCount()} guesses.<br><button id="share-button" onclick="copyShare('${lang}');">Share</button>`
    );
}

const isGameOver = () => {
    const current = glidorStore.getCurrent();
    if (current.length > ATTEMPTS) return true;
    return current[current.length - 1].filter(p => p.correct) === WORD_LENGTH;
}
