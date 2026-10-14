// Theme toggle: dark by default; the choice is shared with the lab.
(() => {
  const button = document.querySelector(".theme-toggle");
  if (!button) return;
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const label = () => button.setAttribute("aria-label", root.dataset.theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  function apply(theme) {
    if (theme === "light") root.dataset.theme = "light";
    else delete root.dataset.theme;
    try { localStorage.setItem("theme", theme); } catch (e) {}
    label();
  }
  button.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    if (document.startViewTransition && !reduceMotion.matches) document.startViewTransition(() => apply(next));
    else apply(next);
  });
  label();
})();

let runningTotal = 0;
let buffer = "0";
let previousOperator = null;

const screen = document.querySelector('.screen');
const valueEl = screen.querySelector('.value');
const expressionEl = screen.querySelector('.expression');
const keys = [...document.querySelectorAll('.calc-button')];
const motion = document.documentElement.classList.contains('motion');

function buttonClick(value) {
    // what the expression line shows once = is pressed: "12 × 3 ="
    const finished = value === '=' && previousOperator !== null
        ? `${runningTotal} ${previousOperator} ${buffer} =`
        : null;

    if (isNaN(value)) {
        // this is not a number
        handleSymbol(value)
    } else {
        // this is a number
        handleNumber(value);
    };
    render(value === '=' ? 'result' : 'entry', finished);
}

function handleSymbol(symbol) { 
    // if (symbol === 'C') {
    //     buffer = '0';
    //     runningTotal = 0;
    // }

    switch (symbol) {
        case 'C':
            buffer = '0';
            runningTotal = 0;
            previousOperator = null;
            break;
        case '=':
            if (previousOperator === null) {
                return;
            }
            flushOperation(parseInt(buffer));
            previousOperator = null;
            buffer = String(runningTotal);
            runningTotal = 0;
            break;
        case '←':
            if (buffer.length === 1) {
                buffer = '0';
            } else {
                buffer = buffer.slice(0, -1);
            }
            break;
        case '+':
        case '−':
        case '×':
        case '÷':
            handleMath(symbol);
            break;
    }
}

function handleMath(symbol) {
    if (buffer === '0') {
        return;
    }

    const intBuffer = parseInt(buffer);

    if (runningTotal === 0) {
        runningTotal = intBuffer;
    } else {
        flushOperation(intBuffer);
    }
    
    previousOperator = symbol;

    buffer = '0';
}

function flushOperation(intBuffer) {
    if (previousOperator === '+') {
        runningTotal += intBuffer;
    } else if (previousOperator === '−') {
        runningTotal -= intBuffer;
    } else if (previousOperator === '×') {
        runningTotal *= intBuffer;
    } else if (previousOperator === '÷') {
        runningTotal /= intBuffer;
    }
}

function handleNumber(numberString) { 
    if (buffer === "0") {
      buffer = numberString;
    } else {
        buffer += numberString;
    }
    
}

// The display: the value rolls up into place when it changes, a little
// further for a result; the line above shows what is waiting.
function render(kind, finished) {
    if (valueEl.textContent !== buffer) {
        const span = document.createElement('span');
        span.textContent = buffer;
        if (motion) span.className = kind === 'result' ? 'is-result' : 'is-entry';
        valueEl.replaceChildren(span);
    }
    valueEl.classList.toggle('is-long', buffer.length > 9);
    valueEl.classList.toggle('is-longer', buffer.length > 13);

    if (finished) expressionEl.textContent = finished;
    else if (previousOperator !== null) expressionEl.textContent = `${runningTotal} ${previousOperator}`;
    else if (kind !== 'result') expressionEl.innerHTML = '&nbsp;';

    keys.forEach((key) => {
        if (key.classList.contains('key-op')) {
            key.setAttribute('aria-pressed', String(key.innerText === previousOperator && buffer === '0'));
        }
    });
}

// a key press shows on the key, whether it came from a click or the keyboard
function pressKey(key) {
    key.classList.add('is-down');
    clearTimeout(key.timer);
    key.timer = setTimeout(() => key.classList.remove('is-down'), 120);
}

const keyMap = {
    '/': '/', '*': '*', 'x': '*', 'X': '*', '-': '-', '+': '+',
    'Enter': 'Enter', '=': 'Enter', 'Backspace': 'Backspace',
    'Escape': 'Escape', 'Delete': 'Escape', 'c': 'Escape', 'C': 'Escape',
};

// whether the focused key was last reached by pointer (click, tap) or by Tab
let pointerFocus = false;

function init() {
    document.addEventListener('pointerdown', () => { pointerFocus = true; });
    document.addEventListener('keydown', (event) => { if (event.key === 'Tab') pointerFocus = false; });

    document.querySelector('.calc-buttons').addEventListener('click', function(event) {
        const key = event.target.closest('.calc-button');
        if (!key) return;
        buttonClick(key.innerText);
    })

    document.addEventListener('keydown', function(event) {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        const name = /^[0-9]$/.test(event.key) ? event.key : keyMap[event.key];
        if (!name) return;
        const key = keys.find((k) => k.dataset.key === name);
        if (!key) return;
        // Enter on a key reached with Tab presses that key, as usual;
        // after a click it means equals
        const focused = document.activeElement;
        if (event.key === 'Enter' && focused.classList.contains('calc-button') && !pointerFocus) return;
        event.preventDefault();
        pressKey(key);
        buttonClick(key.innerText);
    })
}

init();
