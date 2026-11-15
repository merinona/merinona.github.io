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

buildCandles();

// If the page is opened directly at #wish or #letter, start there.
if (pageForHash() !== landing) {
  const start = pageForHash();
  swap(landing, start);
  current = start;
}
