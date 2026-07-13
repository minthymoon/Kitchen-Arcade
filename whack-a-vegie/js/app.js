const plot = document.getElementById('plot');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time-left');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const closeEndBtn = document.getElementById('close-end-btn');
const endOverlay = document.getElementById('end-overlay');
const finalScoreDisplay = document.getElementById('final-score');

const bestDisplay = document.getElementById('best-score');
let best = parseInt(localStorage.getItem('whackBest')) || 0;
bestDisplay.textContent = best;

const HOLE_COUNT = 9;
const SPEED_SETTINGS = {
  easy:   { spawnInterval: 950, upMin: 800, upRange: 350 },
  medium: { spawnInterval: 700, upMin: 650, upRange: 350 },
  hard:   { spawnInterval: 450, upMin: 450, upRange: 200 },
};

let selectedSpeed = 'medium';
let selectedTime = 30;

// Veggie types live here so adding a rotten one later is just
// adding an entry with bad: true — whack() already has the hook for it.
const VEGGIE_TYPES = [
  { emoji: '🥕', points: 1, bad: false },
  { emoji: '🥦', points: 1, bad: false },
  { emoji: '🍅', points: 1, bad: false },
  { emoji: '🌽', points: 1, bad: false },
  { emoji: '🍆', points: 1, bad: false },
];

let holes = [];
let score = 0;
let timeLeft = selectedTime;
let spawnTimer = null;
let countdownTimer = null;
let running = false;

function buildHoles() {
  plot.innerHTML = '';
  holes = [];
  for (let i = 0; i < HOLE_COUNT; i++) {
    const hole = document.createElement('div');
    hole.className = 'hole';

    const veggie = document.createElement('span');
    veggie.className = 'hole-veggie';
    hole.appendChild(veggie);

    hole.addEventListener('click', () => whack(i));
    plot.appendChild(hole);

    holes.push({ el: hole, veggieEl: veggie, up: false, hideTimeout: null, type: null });
  }
}

function randomEmptyHoleIndex() {
  const empty = holes
    .map((h, i) => (h.up ? -1 : i))
    .filter((i) => i !== -1);
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

function pickVeggieType() {
  return VEGGIE_TYPES[Math.floor(Math.random() * VEGGIE_TYPES.length)];
}

function popUp() {
  if (!running) return;
  const idx = randomEmptyHoleIndex();
  if (idx === null) return;

  const hole = holes[idx];
  const type = pickVeggieType();
  hole.type = type;
  hole.veggieEl.textContent = type.emoji;
  hole.up = true;
  hole.el.classList.remove('whacked');
  hole.el.classList.add('up');

  const settings = SPEED_SETTINGS[selectedSpeed];
  const upDuration = settings.upMin + Math.random() * settings.upRange;
  hole.hideTimeout = setTimeout(() => hideHole(idx), upDuration);
}

function hideHole(idx) {
  const hole = holes[idx];
  hole.up = false;
  hole.el.classList.remove('up', 'whacked');
  clearTimeout(hole.hideTimeout);
}

function whack(idx) {
  if (!running) return;
  const hole = holes[idx];
  if (!hole.up) return;

  const type = hole.type;
  // Extension point for later: if (type.bad) { penalize instead of scoring }
  score += type.points;
  scoreDisplay.textContent = score;

  hole.el.classList.add('whacked');
  clearTimeout(hole.hideTimeout);
  setTimeout(() => hideHole(idx), 200);
}

function tickCountdown() {
  timeLeft -= 1;
  timeDisplay.textContent = timeLeft;
  if (timeLeft <= 0) endGame();
}

function startGame() {
  running = true;
  score = 0;
  timeLeft = selectedTime;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  startBtn.hidden = true;
  stopBtn.hidden = false;
  document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
  endOverlay.hidden = true;

  buildHoles();

  spawnTimer = setInterval(popUp, SPEED_SETTINGS[selectedSpeed].spawnInterval);
  countdownTimer = setInterval(tickCountdown, 1000);
}

function endGame() {
  running = false;
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  holes.forEach((_, i) => hideHole(i));

  if (score > best) {
    best = score;
    bestDisplay.textContent = best;
    localStorage.setItem('whackBest', best);

    const bestSign = document.getElementById('best-sign');
    bestSign.classList.add('new-best');
    setTimeout(() => bestSign.classList.remove('new-best'), 900);
  }

  finalScoreDisplay.textContent = score;
  endOverlay.hidden = false;
  startBtn.hidden = false;
  document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = false);
  stopBtn.hidden = true;
}

buildHoles();

startBtn.addEventListener('click', startGame);
closeEndBtn.addEventListener('click', () => {
  endOverlay.hidden = true;
});

stopBtn.addEventListener('click', () => {
  if (running) endGame();
});

function syncOptionButtons(attr, value) {
  document.querySelectorAll(`[${attr}]`).forEach(btn => {
    btn.classList.toggle('selected', btn.getAttribute(attr) === String(value));
  });
}

document.querySelectorAll('.option-btn[data-speed]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (running) return;
    selectedSpeed = btn.dataset.speed;
    syncOptionButtons('data-speed', selectedSpeed);
  });
});

document.querySelectorAll('.option-btn[data-time]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (running) return;
    selectedTime = parseInt(btn.dataset.time);
    syncOptionButtons('data-time', selectedTime);
    timeDisplay.textContent = selectedTime;
  });
});

const menuToggleBtn = document.getElementById('menu-toggle-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileOverlay = document.getElementById('mobile-options-overlay');

menuToggleBtn.addEventListener('click', () => {
  mobileOverlay.hidden = false;
});

closeMenuBtn.addEventListener('click', () => {
  mobileOverlay.hidden = true;
});

mobileOverlay.addEventListener('click', (e) => {
  if (e.target === mobileOverlay) mobileOverlay.hidden = true;
});