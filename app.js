const TOTAL = document.querySelectorAll('.page').length;
const indicator = document.getElementById('pageIndicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function getPageFromHash() {
  const m = window.location.hash.match(/page=(\d+)/);
  const n = m ? parseInt(m[1], 10) : 1;
  return clamp(n, 1, TOTAL);
}

function setHashPage(n) {
  const clamped = clamp(n, 1, TOTAL);
  // If hash is already correct, manually trigger render (no hashchange fires)
  if (window.location.hash === `#page=${clamped}`) {
    render();
  } else {
    window.location.hash = `#page=${clamped}`;
  }
}

function render() {
  const n = getPageFromHash();
  document.querySelectorAll('.page').forEach((el) => {
    el.classList.toggle('active', parseInt(el.dataset.page, 10) === n);
  });
  indicator.textContent = `Page ${n} of ${TOTAL}`;
  prevBtn.disabled = (n === 1);
  nextBtn.disabled = (n === TOTAL);
}

prevBtn.addEventListener('click', () => setHashPage(getPageFromHash() - 1));
nextBtn.addEventListener('click', () => setHashPage(getPageFromHash() + 1));
window.addEventListener('hashchange', render);

// FIX: Always render on load — setHashPage then immediately render
// so the correct page shows even on a direct URL with #page=N
setHashPage(getPageFromHash());
render();

// ── Lightbox ──────────────────────────────────────────────
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
const lbCap = document.getElementById('lightboxCaption');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');

let currentIndex = -1;
let clickableImgs = [];

function refreshClickable() {
  // FIX: query after a microtask tick so .active is fully painted
  clickableImgs = Array.from(document.querySelectorAll('.page.active img.clickable'));
}

function openLightboxByIndex(idx) {
  refreshClickable();
  if (!clickableImgs.length) return;
  currentIndex = clamp(idx, 0, clickableImgs.length - 1);
  const img = clickableImgs[currentIndex];
  lbImg.src = img.dataset.full || img.src;
  lbCap.textContent = img.getAttribute('alt') || '';
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');   // FIX: accessibility
  document.body.style.overflow = 'hidden';
  // FIX: show/hide prev/next arrows based on position
  lbPrev.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
  lbNext.style.visibility = currentIndex === clickableImgs.length - 1 ? 'hidden' : 'visible';
}

function closeLightbox() {
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  lbImg.src = '';
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  if (e.target && e.target.matches('img.clickable')) {
    refreshClickable();
    const idx = clickableImgs.indexOf(e.target);
    openLightboxByIndex(idx);
  }
});

lbClose.addEventListener('click', closeLightbox);
lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

document.addEventListener('keydown', (e) => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') openLightboxByIndex(currentIndex - 1);
  if (e.key === 'ArrowRight') openLightboxByIndex(currentIndex + 1);
});

lbPrev.addEventListener('click', () => openLightboxByIndex(currentIndex - 1));
lbNext.addEventListener('click', () => openLightboxByIndex(currentIndex + 1));

window.addEventListener('hashchange', () => {
  if (lb.classList.contains('open')) closeLightbox();
});
