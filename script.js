const display = document.getElementById('display');
const historyList = document.getElementById('historyList');
const historyClearBtn = document.getElementById('historyClear');

const HISTORY_MAX = 5;
let current = '0';
let previous = null;
let operator = null;
let resetNext = false;
let history = [];

function render() {
  display.textContent = current;
}

function renderHistory() {
  historyList.innerHTML = '';
  if (history.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No calculations yet';
    historyList.appendChild(li);
    return;
  }
  for (const entry of history) {
    const li = document.createElement('li');
    li.textContent = entry;
    historyList.appendChild(li);
  }
}

function pushHistory(expression) {
  history.unshift(expression);
  if (history.length > HISTORY_MAX) history.length = HISTORY_MAX;
  renderHistory();
}

function opSymbol(op) {
  return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || op;
}

function inputDigit(d) {
  if (resetNext) {
    current = d;
    resetNext = false;
  } else {
    current = current === '0' ? d : current + d;
  }
  render();
}

function inputDecimal() {
  if (resetNext) {
    current = '0.';
    resetNext = false;
  } else if (!current.includes('.')) {
    current += '.';
  }
  render();
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  resetNext = false;
  render();
}

function toggleSign() {
  current = String(parseFloat(current) * -1);
  render();
}

function percent() {
  current = String(parseFloat(current) / 100);
  render();
}

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
  }
}

function setOperator(op) {
  const value = parseFloat(current);
  if (previous !== null && operator && !resetNext) {
    const result = compute(previous, value, operator);
    current = formatResult(result);
    previous = result;
  } else {
    previous = value;
  }
  operator = op;
  resetNext = true;
  render();
}

function equals() {
  if (operator === null || previous === null) return;
  const rhs = parseFloat(current);
  const result = compute(previous, rhs, operator);
  const formatted = formatResult(result);
  pushHistory(`${previous} ${opSymbol(operator)} ${rhs} = ${formatted}`);
  current = formatted;
  previous = null;
  operator = null;
  resetNext = true;
  render();
}

function formatResult(n) {
  if (!isFinite(n)) return 'Error';
  return String(parseFloat(n.toFixed(10)));
}

document.querySelectorAll('.key').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.digit) return inputDigit(btn.dataset.digit);
    if (btn.dataset.op) return setOperator(btn.dataset.op);
    switch (btn.dataset.action) {
      case 'clear': return clearAll();
      case 'sign': return toggleSign();
      case 'percent': return percent();
      case 'decimal': return inputDecimal();
      case 'equals': return equals();
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (/^[0-9]$/.test(e.key)) return inputDigit(e.key);
  if (e.key === '.') return inputDecimal();
  if (['+', '-', '*', '/'].includes(e.key)) return setOperator(e.key);
  if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); return equals(); }
  if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') return clearAll();
  if (e.key === '%') return percent();
});

historyClearBtn.addEventListener('click', () => {
  history = [];
  renderHistory();
});

render();
renderHistory();
