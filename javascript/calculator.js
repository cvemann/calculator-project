// theme switch: dark is the default. the choice is saved, so the lab
// and every project open in the same theme
const themeButton = document.querySelector(".theme-toggle")
const themeLabel = document.querySelector(".theme-label")

function showTheme() {
    if (document.documentElement.dataset.theme === "light") {
        themeLabel.textContent = "dark"
        themeButton.setAttribute("aria-label", "Switch to dark mode")
    } else {
        themeLabel.textContent = "light"
        themeButton.setAttribute("aria-label", "Switch to light mode")
    }
}

themeButton.addEventListener("click", function () {
    if (document.documentElement.dataset.theme === "light") {
        delete document.documentElement.dataset.theme
        localStorage.setItem("theme", "dark")
    } else {
        document.documentElement.dataset.theme = "light"
        localStorage.setItem("theme", "light")
    }
    showTheme()
})

showTheme()

let runningTotal = 0;
let buffer = "0";
let previousOperator = null;

const screen = document.querySelector('.screen');
const expression = document.querySelector('.expression');

function buttonClick(value) {
    // before = is worked out, remember the sum for the line above, e.g. "12 × 3 ="
    let sum = '';
    if (value === '=' && previousOperator !== null) {
        sum = runningTotal + ' ' + previousOperator + ' ' + buffer + ' =';
    }

    if (isNaN(value)) {
        // this is not a number
        handleSymbol(value)
    } else {
        // this is a number
        handleNumber(value);
    };
    screen.innerText = buffer;

    // the line above the number shows what's waiting
    if (sum !== '') {
        expression.innerText = sum;
    } else if (previousOperator !== null) {
        expression.innerText = runningTotal + ' ' + previousOperator;
    } else if (value !== '=') {
        expression.innerText = '';
    }

    // smaller text for long numbers, so they still fit
    screen.classList.toggle('long', buffer.length > 9);

    // the new number rolls up into place (a result rolls further)
    screen.classList.remove('roll', 'roll-far');
    void screen.offsetWidth; // restarts the animation
    screen.classList.add(value === '=' ? 'roll-far' : 'roll');
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

// show a key as pressed for a moment (used for keyboard presses)
function flashButton(button) {
    button.classList.add('pressed');
    setTimeout(function() {
        button.classList.remove('pressed');
    }, 120);
}

// which button each key on the keyboard presses
function findButton(key) {
    if (key === '*' || key === 'x') key = '×';
    if (key === '/') key = '÷';
    if (key === '-') key = '−';
    if (key === 'Enter') key = '=';
    if (key === 'Backspace') key = '←';
    if (key === 'Escape' || key === 'c') key = 'C';

    const buttons = document.querySelectorAll('.calc-button');
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].innerText === key) {
            return buttons[i];
        }
    }
    return null;
}

function init() {
    document.querySelector('.calc-buttons').addEventListener('click', function(event) {
        if (!event.target.classList.contains('calc-button')) return;
        buttonClick(event.target.innerText);
        // after a mouse click, take focus off the button, so pressing
        // Enter afterwards means = and not "press this button again"
        if (event.detail > 0) {
            event.target.blur();
        }
    })

    document.addEventListener('keydown', function(event) {
        // Enter on a button you reached with Tab presses that button
        if (event.key === 'Enter' && document.activeElement.classList.contains('calc-button')) return;

        const button = findButton(event.key);
        if (button) {
            event.preventDefault();
            flashButton(button);
            buttonClick(button.innerText);
        }
    })
}

init();
