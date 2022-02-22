const SWE_KEYBOARD = [
    'QWERTYUIOPÅ',
    'ASDFGHJKLÖÄ',
    '-ZXCVBNM⌫⏎-',
];

const EN_KEYBOARD = [
    'QWERTYUIOP',
    '-ASDFGHJKL-',
    '-ZXCVBNM⌫⏎-',
];

const KEYBOARDS = {
    EN: EN_KEYBOARD,
    SWE: SWE_KEYBOARD,
};

const getKeyStatus = () => {
    const correct = [];
    const partial = [];
    const incorrect = [];
    glidorStore.getCurrent()
        .forEach(row => row.forEach(item => {
            if (item.correct && !correct.some(v => v === item.value)) {
                correct.push(item.value);
            } else if (
                item.partial
                && !correct.some(v => v === item.value)
                && !partial.some(v => v === item.value)
            ) {
                partial.push(item.value);
            } else if (
                item.incorrect
                && !correct.some(v => v === item.value)
                && !correct.some(v => v === item.value)
                && !incorrect.some(v => v === item.value)
            ) {
                incorrect.push(item.value);
            }
        }));        
    return { correct, partial, incorrect };
};

const keyStatusClass = (key, keyStatus) => {
    if (keyStatus.correct.some(k => k === key)) {
        return 'keyboard-key correct';
    } else if (keyStatus.partial.some(k => k === key)) {
        return 'keyboard-key partial';
    } else if (keyStatus.incorrect.some(k => k === key)) {
        return 'keyboard-key incorrect';
    }
    return 'keyboard-key empty';
}

const constructKeyboard = (layout, clickCallback) => {
    const keyStatus = getKeyStatus();
    keyboardDiv = document.getElementById('keyboard');
    layout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        keyboardDiv.appendChild(rowDiv);
        row.split('').forEach(chr => {
            const btnSpan = document.createElement('span');
            if (chr === '-') {
                btnSpan.className = 'empty-key';
            } else {
                btnSpan.className = keyStatusClass(chr, keyStatus);
                btnSpan.innerText = chr;
                btnSpan.onclick = clickCallback;
            }
            rowDiv.appendChild(btnSpan);
        });
    });
}

const redrawKeyboard = () => {
    const keyStatus = getKeyStatus();
    keyboardDiv = document.getElementById('keyboard');
    for (let i = 0; i < keyboardDiv.children.length; i++) {
        const keyboardRow = keyboardDiv.children[i];
        for (let j = 0; j<keyboardRow.children.length; j++) {
            const key = keyboardRow.children[j];
            if (key.className === 'empty-key') continue;
            if (
                !keyStatus.correct.some(k => k === key.innerText)
                && !keyStatus.partial.some(k => k === key.innerText)
                && keyStatus.incorrect.some(k => k === key.innerText)
            ) {
                key.onclick = undefined;
            }
            key.className = keyStatusClass(key.innerText, keyStatus);
        }
    }
}

const isValidKey = (lang, key) => {
    if ('⌫⏎-'.split('').some(v => v === key)) return false;
    const keyb = KEYBOARDS[lang];
    let found = false;
    for (let i=0; i<keyb.length; i++) {
        if (keyb[i].split('').some(v => v === key)) {
            found = true;
            break;
        }
    }
    if (!found) return false;
    const keyStatus = getKeyStatus();
    return !keyStatus.incorrect.some(v => v === key);
}

const handleKeyPress = (lang, evt) => {
    if (isGameOver()) return;
    const key = evt.key.toUpperCase();
    const current = glidorStore.getCurrent();
    const activeRow = current[current.length - 1];
    if (key === 'BACKSPACE') {
        activeRow.splice(activeRow.length - 1, 1);
    } else if (key === 'ENTER') {
        if (activeRow.length !== WORD_LENGTH) return;
        return checkWord(lang, current, activeRow);
    } else if (key.length === 1) {
        if (activeRow.length >= WORD_LENGTH) return;
        if (isValidKey(lang, key)) activeRow.push({ value: key });
    }
    glidorStore.setCurrent(current);
    drawTiles();
    redrawKeyboard();
}
