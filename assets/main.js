/* Pergamenre hányt szavak — shared interactive behaviour */

(function () {
  'use strict';

  /* ================================================================
     Single rAF-throttled scroll controller.
     Every scroll-driven handler registers a callback; they all run
     in ONE rAF tick, avoiding duplicated passive listeners.
     ================================================================ */
  const scrollCallbacks = [];
  let scrollScheduled = false;
  function runScroll() {
    const y = window.scrollY;
    for (let i = 0; i < scrollCallbacks.length; i++) {
      try { scrollCallbacks[i](y); } catch {}
    }
    scrollScheduled = false;
  }
  function onRawScroll() {
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(runScroll);
    }
  }
  window.addEventListener('scroll', onRawScroll, { passive: true });

  function registerScroll(cb) { scrollCallbacks.push(cb); cb(window.scrollY); }

  /* --- Mobile navigation ---
     Built at runtime from the existing nav links, so every page that loads
     this script gets a working <900px menu without per-page markup. */
  (function mobileNav() {
    const nav = document.getElementById('topnav');
    if (!nav || document.querySelector('.nav-toggle')) return;

    const items = [];
    nav.querySelectorAll('.nav-left a, .nav-right a').forEach((a) => {
      items.push({ href: a.getAttribute('href'), text: a.textContent.trim(), current: a.classList.contains('current') });
    });
    if (!items.length) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Menü megnyitása');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'mobileMenu');
    toggle.innerHTML = '<span></span><span></span><span></span>';

    const menu = document.createElement('nav');
    menu.className = 'mobile-menu';
    menu.id = 'mobileMenu';
    menu.setAttribute('aria-label', 'Mobil menü');
    items.forEach((l) => {
      const a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.text;
      if (l.current) a.setAttribute('aria-current', 'page');
      menu.appendChild(a);
    });

    function setOpen(open) {
      nav.classList.toggle('menu-open', open);
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
      document.body.style.overflow = open ? 'hidden' : '';
    }

    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); }, { passive: true });

    const right = nav.querySelector('.nav-right');
    if (right) right.insertBefore(toggle, right.firstChild);
    else nav.appendChild(toggle);
    document.body.appendChild(menu);
  })();

  /* --- Brand mark in the nav — injected so every page shows the logo
         next to the "Pergamen" wordmark. Text stays as the accessible name. --- */
  (function navLogo() {
    const mark = document.querySelector('.nav-mark');
    if (!mark || mark.querySelector('svg')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('class', 'nav-mark-logo');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      '<circle cx="32" cy="32" r="32" fill="#fbcb6e"/>' +
      '<path d="M40 8 C 22 19, 17 38, 25 51 C 41 45, 52 23, 40 8 Z" fill="#0e0e0e"/>' +
      '<path d="M40 8 C 31 23, 27 38, 24.5 52" stroke="#fbcb6e" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M24.5 52 L 20 58" stroke="#0e0e0e" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="38" cy="55" r="1.7" fill="#0e0e0e"/><circle cx="44" cy="58" r="1.1" fill="#0e0e0e"/>';
    mark.insertBefore(svg, mark.firstChild);
  })();

  /* --- scroll progress + topnav hide/show + glass-deepen --- */
  const progress = document.getElementById('readProgress');
  const topnav = document.getElementById('topnav');
  let lastScroll = 0;

  registerScroll((current) => {
    if (progress) {
      const h = document.documentElement;
      const pct = current / (h.scrollHeight - h.clientHeight);
      progress.style.width = (pct * 100) + '%';
    }
    if (topnav) {
      if (current > lastScroll && current > 240) {
        topnav.classList.add('hidden');
      } else {
        topnav.classList.remove('hidden');
      }
      if (current > 120) topnav.classList.add('scrolled');
      else topnav.classList.remove('scrolled');
      lastScroll = current;
    }
  });

  /* --- scroll reveals (IntersectionObserver) ---
     Only fires if Motion One did NOT load (fallback path).
     motion.js sets window.__motionLoaded === true once it runs. */
  setTimeout(() => {
    if (window.__motionLoaded) return;
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });
      reveals.forEach((el) => io.observe(el));
    }
  }, 250);

  /* --- parallax ink splatters — piggybacks on the single rAF tick --- */
  const splatters = document.querySelectorAll('.ink-splatter');
  const heroEl = document.querySelector('.hero');
  let heroBottom = 0;
  function measureHero() {
    if (heroEl) {
      heroBottom = heroEl.getBoundingClientRect().bottom + window.scrollY + 300;
    }
  }
  measureHero();
  /* Re-measure after fonts settle + on resize */
  window.addEventListener('load', measureHero, { once: true });
  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(measureHero, 150);
  }, { passive: true });

  if (splatters.length) {
    registerScroll((y) => {
      if (y > heroBottom) return;  /* bail once hero is off-screen */
      splatters.forEach((s, i) => {
        const speed = (i % 2 === 0) ? 0.12 : -0.08;
        const rot = s.dataset.rot || 0;
        s.style.transform = `translateY(${y * speed}px) rotate(${rot}deg)`;
      });
    });
  }

  /* --- magnetic buttons (subtle) --- */
  document.querySelectorAll('.btn-primary, .btn-ghost, .nl-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.14}px, ${y * 0.14}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* --- newsletter form --- */
  const form = document.querySelector('.nl-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.nl-btn');
      const input = form.querySelector('.nl-input');
      if (!input.value) return;
      btn.textContent = '✓ köszönöm';
      btn.style.background = 'var(--sage)';
      input.value = '';
    });
  }

  /* --- video placeholder --- */
  document.querySelectorAll('.video-frame').forEach((v) => {
    v.addEventListener('click', () => {
      const url = v.dataset.youtube;
      if (url) window.open(url, '_blank', 'noopener');
    });
  });

  /* --- Click-to-copy quotes (pull-quote, drawer cards, author pantheon) --- */
  const flash = document.getElementById('copyFlash');
  let flashTimer = null;
  function showFlash(msg) {
    if (!flash) return;
    flash.textContent = msg || 'Másolva a vágólapra';
    flash.classList.add('is-visible');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => flash.classList.remove('is-visible'), 2200);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      /* fallback — only works inside a user gesture */
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand && document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch {
      return false;
    }
  }

  /* derive the quote text + attribution from various element shapes */
  function extractQuote(el) {
    /* pull-quote: whole text + data-copy-attr */
    if (el.matches('.pull-quote')) {
      const txt = el.textContent.trim().replace(/\s+/g, ' ');
      const author = el.dataset.copyAttr || '';
      return author ? `„${txt}" — ${author}` : `„${txt}"`;
    }
    /* qd-card: blockquote + figcaption (already "— Szerző · Mű") */
    if (el.matches('.qd-card')) {
      const bq = el.querySelector('blockquote');
      const fc = el.querySelector('figcaption');
      const txt = bq ? bq.textContent.trim() : '';
      const by = fc ? fc.textContent.trim() : '';
      return by ? `„${txt}" ${by}` : `„${txt}"`;
    }
    return el.textContent.trim();
  }

  document.querySelectorAll('.copyable').forEach((el) => {
    const doCopy = async () => {
      const text = extractQuote(el);
      const ok = await copyText(text);
      if (ok) {
        el.classList.add('is-copied');
        showFlash('Másolva a vágólapra');
        setTimeout(() => el.classList.remove('is-copied'), 1800);
      } else {
        showFlash('Nem sikerült másolni');
      }
    };
    el.addEventListener('click', doCopy);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doCopy(); }
    });
  });

  /* --- Quote drawer — shuffle three random literary quotes --- */
  const QUOTES = [
    { q: 'Az ember belül úgy élhet, mint egy templomban.', a: 'Kosztolányi Dezső', s: 'Novellák' },
    { q: 'A kevés szavú ember csak annyit mond, amennyiben biztos.', a: 'Pilinszky János', s: '' },
    { q: 'A könyv nem ad — csak visszaadja, ami benned volt.', a: 'Márai Sándor', s: 'Füveskönyv' },
    { q: 'A csend a legőszintébb beszéd.', a: 'Pilinszky János', s: '' },
    { q: 'Az ember sorsa egyetlen mondat.', a: 'Márai Sándor', s: 'Napló' },
    { q: 'Az az igazán mély, ami egyszerű.', a: 'Kosztolányi Dezső', s: '' },
    { q: 'Az olvasó az, aki nincs egyedül.', a: 'Szerb Antal', s: '' },
    { q: 'Ne a választ várd — a kérdést olvasd.', a: 'Nemes Nagy Ágnes', s: '' },
    { q: 'Csak azt olvasd, amiért képes vagy térdre ereszkedni.', a: 'Pilinszky János', s: '' },
    { q: 'Írás közben az ember néha megérinti azt, amit amúgy elkerül.', a: 'Esterházy Péter', s: 'Bevezetés a szépirodalomba' },
    { q: 'A jó könyv olyan, mint egy ajtó: nem beenged, kienged.', a: 'Márai Sándor', s: '' },
    { q: 'Minden szó két oldalú — az egyiket mondjuk, a másikat viseljük.', a: 'Pilinszky János', s: '' }
  ];

  function shuffleQuotes() {
    const pool = [...QUOTES];
    /* Fisher–Yates, pick 3 */
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 3);
  }

  function renderQuotes() {
    const body = document.querySelector('.quote-drawer-body');
    if (!body) return;
    const cards = body.querySelectorAll('.qd-card');
    const picks = shuffleQuotes();
    cards.forEach((card, i) => {
      if (!picks[i]) return;
      const { q, a, s } = picks[i];
      const bq = card.querySelector('blockquote');
      const fc = card.querySelector('figcaption');
      if (bq) bq.textContent = q;
      if (fc) {
        /* build safely — no innerHTML, escapes via textContent */
        fc.textContent = '';
        fc.appendChild(document.createTextNode('— ' + a));
        if (s) {
          fc.appendChild(document.createTextNode(' · '));
          const cite = document.createElement('cite');
          cite.textContent = s;
          fc.appendChild(cite);
        }
      }
      card.setAttribute('data-author', a);
      /* restart CSS animation */
      card.style.animation = 'none';
      void card.offsetWidth;
      card.style.animation = '';
    });
  }

  const shuffleBtn = document.querySelector('.qd-shuffle');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', renderQuotes);
  }

  /* --- Audio companion — each row IS a single button (aria-pressed) --- */
  const tracks = document.querySelectorAll('.audio-track');
  let currentlyPlaying = null;

  tracks.forEach((btn) => {
    btn.addEventListener('click', () => {
      const wasActive = btn.getAttribute('aria-pressed') === 'true';

      /* de-activate ALL (including this one) */
      tracks.forEach((x) => {
        x.setAttribute('aria-pressed', 'false');
        x.setAttribute('aria-label', x.dataset.labelPlay);
      });

      if (!wasActive) {
        /* activate this one */
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', btn.dataset.labelPause);
        currentlyPlaying = btn;
        /* placeholder — real audio wiring goes here when Evelin uploads files */
      } else {
        currentlyPlaying = null;
      }
    });
  });

  /* --- Editio Prima numbered copy (localStorage) --- */
  /* First-visit: pick a random 4-digit number 1000–9999, persist forever. */
  function getEditioData() {
    try {
      let n = localStorage.getItem('pergamen.editio.num');
      let first = localStorage.getItem('pergamen.editio.first');
      if (!n) {
        n = String(Math.floor(Math.random() * 9000) + 1000);
        first = new Date().toISOString();
        localStorage.setItem('pergamen.editio.num', n);
        localStorage.setItem('pergamen.editio.first', first);
      }
      return { num: n, first };
    } catch (e) {
      return { num: '0000', first: null };  /* private mode / blocked storage */
    }
  }
  /* Hungarian thousand-separator only from 5 digits up (Akadémiai helyesírás) */
  function formatEditio(n) {
    const s = String(n);
    if (s.length <= 4) return s;
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  function formatActivated(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      const months = ['január','február','március','április','május','június',
                      'július','augusztus','szeptember','október','november','december'];
      return `${d.getFullYear()}. ${months[d.getMonth()]} ${d.getDate()}.`;
    } catch { return '—'; }
  }

  const editio = getEditioData();
  const editioNumStr = formatEditio(editio.num);
  const ed1 = document.getElementById('editioNum');
  const ed2 = document.getElementById('editioNumFoot');
  const ed3 = document.getElementById('editioActivated');
  if (ed1) ed1.textContent = editioNumStr;
  if (ed2) ed2.textContent = editioNumStr;
  if (ed3) ed3.textContent = formatActivated(editio.first);

  /* --- Visit counter — per-session increment (not per-reload within same tab) --- */
  function bumpVisits() {
    try {
      /* Only count once per browser-session to avoid reload-spam. */
      const sessionFlag = sessionStorage.getItem('pergamen.visit.counted');
      let count = parseInt(localStorage.getItem('pergamen.visits') || '0', 10);
      if (isNaN(count) || count < 0) count = 0;
      if (!sessionFlag) {
        count = count + 1;
        localStorage.setItem('pergamen.visits', String(count));
        sessionStorage.setItem('pergamen.visit.counted', '1');
      }
      return count || 1;
    } catch {
      return 1;
    }
  }
  /* Hungarian -szor/-szer/-ször adverbial ordinals */
  const ORDINALS = {
    1: 'először', 2: 'másodszor', 3: 'harmadszor', 4: 'negyedszer',
    5: 'ötödször', 6: 'hatodszor', 7: 'hetedszer', 8: 'nyolcadszor',
    9: 'kilencedszer', 10: 'tizedszer'
  };
  function formatVisits(n) {
    return ORDINALS[n] || `${n}. alkalommal`;
  }
  const vc = document.getElementById('visitCount');
  if (vc) vc.textContent = formatVisits(bumpVisits());

  /* Badge shows after scroll > 400. Once shown, the check is a no-op. */
  const badge = document.getElementById('editioBadge');
  if (badge) {
    badge.removeAttribute('hidden');
    let badgeShown = false;
    registerScroll((y) => {
      if (badgeShown) return;
      if (y > 400) {
        badge.classList.add('in-view');
        badgeShown = true;
      }
    });
  }
})();
