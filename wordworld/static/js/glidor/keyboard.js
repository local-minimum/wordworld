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
            if (item.correct) {
                correct.push(item.value);
            } else if (item.partial) {
                partial.push(item.value);
            } else if (item.incorrect) {
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
            if (keyStatus.incorrect.some(k => k === key.innerText)) {
                key.onclick = undefined;
            }
            key.className = keyStatusClass(key.innerText, keyStatus);
        }
    }
}
