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
