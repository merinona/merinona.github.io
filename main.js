const landing = document.getElementById('landing');
const wish = document.getElementById('wish');
const letter = document.getElementById('letter');
const openBtn = document.getElementById('open');
const candlesEl = document.getElementById('candles');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const FADE_MS = 350;        // keep in sync with --fade in web.css
const CANDLE_COUNT = 20;
const AFTER_LAST_MS = 1000; // pause after the last flame goes out

const pages = { '#wish': wish, '#letter': letter };

/* ---------- Hearts ---------- */

// Every page gets the same faint hearts. They only sit in the top and bottom
// bands (the page padding) and, on wide screens, the side gutters, so they
// never end up behind the text.
// [x position (%), edge, distance from that edge, size (rem), tilt (deg)]
const HEARTS = [
  [5,  'top',    '0.8rem', 2.0, -18],
  [20, 'top',    '2.2rem', 1.2,  12],
  [36, 'top',    '0.6rem', 1.5,  -8],
  [52, 'top',    '2.4rem', 1.1,  16],
  [66, 'top',    '0.9rem', 2.2, -14],
  [82, 'top',    '2.0rem', 1.3,  10],
  [93, 'top',    '0.5rem', 1.8, -20],
  [8,  'bottom', '0.6rem', 1.6,  14],
  [24, 'bottom', '2.2rem', 2.0, -10],
  [40, 'bottom', '0.8rem', 1.2,  18],
  [58, 'bottom', '2.0rem', 1.5, -12],
  [72, 'bottom', '0.5rem', 2.4,   8],
  [86, 'bottom', '2.2rem', 1.2, -16],
  // Side gutters (shown on wide screens only)
  [4,  'side', '30%', 2.0, -12],
  [9,  'side', '55%', 1.3,  14],
  [6,  'side', '75%', 1.6,   8],
  [91, 'side', '28%', 1.4,  10],
  [96, 'side', '52%', 2.2, -18],
  [92, 'side', '74%', 1.7,  12],
];

function addHearts(page) {
  const layer = document.createElement('div');
  layer.className = 'hearts';
  layer.setAttribute('aria-hidden', 'true');

  HEARTS.forEach(([x, edge, offset, size, tilt]) => {
    const heart = document.createElement('span');
    heart.className = edge === 'side' ? 'heart heart--side' : 'heart';
    heart.style.setProperty('--x', `${x}%`);
    heart.style.setProperty(edge === 'bottom' ? '--bottom' : '--top', offset);
    heart.style.setProperty('--s', `${size}rem`);
    heart.style.setProperty('--r', `${tilt}deg`);
    layer.appendChild(heart);
  });

  page.prepend(layer);
}

let current = landing;
let litCount = 0;
let advanceTimer;

/* ---------- Candles ---------- */

function buildCandles() {
  for (let i = 1; i <= CANDLE_COUNT; i++) {
    const candle = document.createElement('button');
    candle.type = 'button';
    candle.className = 'candle';
    candle.setAttribute('aria-label', `Blow out candle ${i} of ${CANDLE_COUNT}`);
    // Negative delay so the flames don't all flicker in sync
    candle.style.setProperty('--d', `${-(Math.random() * 1.4).toFixed(2)}s`);
    candle.innerHTML =
      '<span class="flame"></span><span class="smoke"></span>' +
      '<span class="wick"></span><span class="body"></span>';
    candle.addEventListener('click', () => blowOut(candle));
    candlesEl.appendChild(candle);
  }
}

function relightCandles() {
  clearTimeout(advanceTimer);
  litCount = CANDLE_COUNT;
  candlesEl.querySelectorAll('.candle').forEach((candle) => {
    candle.classList.remove('is-out');
    candle.disabled = false;
  });
}

function blowOut(candle) {
  if (candle.classList.contains('is-out')) return;
  candle.classList.add('is-out');
  candle.disabled = true;
  litCount -= 1;

  if (litCount === 0) {
    advanceTimer = setTimeout(() => {
      location.hash = 'letter';
    }, AFTER_LAST_MS);
  }
}

/* ---------- Page transitions ---------- */

function swap(prev, next) {
  prev.classList.remove('is-visible');
  prev.hidden = true;
  next.hidden = false;
  if (next === wish) relightCandles(); // fresh candles every visit
  void next.offsetHeight;              // lets the fade-in start from opacity 0
  next.classList.add('is-visible');
  next.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function show(next) {
  if (next === current) return;
  const prev = current;
  current = next;
  if (prev === wish) clearTimeout(advanceTimer);
  prev.classList.remove('is-visible');

  if (reduceMotion.matches) {
    swap(prev, next);
  } else {
    setTimeout(() => swap(prev, next), FADE_MS);
  }
}

function pageForHash() {
  return pages[location.hash] || landing;
}

// "I'm 20!" opens the candles; blowing out all 20 opens the paragraph.
// The browser's back button steps back through the pages.
openBtn.addEventListener('click', () => {
  location.hash = 'wish';
});

window.addEventListener('hashchange', () => show(pageForHash()));

[landing, wish, letter].forEach(addHearts);
buildCandles();

// If the page is opened directly at #wish or #letter, start there.
if (pageForHash() !== landing) {
  const start = pageForHash();
  swap(landing, start);
  current = start;
}
