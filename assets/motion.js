/*
  Motion One — spring physics layer for Pergamen
  Loaded as ES module from jsdelivr; gracefully degrades to CSS fallbacks.
*/

import { animate, inView } from 'https://cdn.jsdelivr.net/npm/motion@10.18.0/+esm';

/* Mark that motion.js loaded — main.js will skip its IO reveal fallback */
window.__motionLoaded = true;

/* Live prefers-reduced-motion — updates across OS toggle mid-session */
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduced = mq.matches;
mq.addEventListener && mq.addEventListener('change', (e) => { reduced = e.matches; });

if (reduced) {
  document.querySelectorAll('.reveal').forEach((el) => {
    el.classList.add('in-view');
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.filter = 'none';
  });
} else {
  /* ONE spring-y reveal per element. Parent carries .reveal → children animate via CSS stagger. */
  inView('.reveal', (element) => {
    if (reduced) {
      element.classList.add('in-view');
      return () => {};
    }
    const ctrl = animate(
      element,
      { opacity: [0, 1], transform: ['translateY(28px)', 'translateY(0px)'], filter: ['blur(5px)', 'blur(0px)'] },
      { duration: 0.85, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
    /* Clean up inline styles after finish so CSS hover can reassert control */
    ctrl.finished.then(() => {
      element.classList.add('in-view');
      element.style.opacity = '';
      element.style.transform = '';
      element.style.filter = '';
    }).catch(() => {});
    return () => {};
  }, { margin: '0px 0px -80px 0px' });
}
