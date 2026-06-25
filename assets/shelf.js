/* =====================================================
   3D book-cover shelf renderer — &Fold edition
   Faithful vanilla-JS port of Book.tsx / BookMarquee.tsx
   from github.com/vikod3/books
   ===================================================== */
(function () {
  'use strict';

  var PAGE_STEP = 1.1;
  var PAGE_INSET = 8;
  var SKEW = '30deg';

  // Dark, warm spine/back so the cream page-edges glow against the cover.
  var SPINE = 'linear-gradient(150deg, #3b2921 0%, #1e1c1a 100%)';

  // 15 real cover images (optimised) + varied page depth for a living shelf.
  var BOOKS = [
    { cover: 'assets/books/book-1.jpg',  pages: 24 },
    { cover: 'assets/books/book-2.jpg',  pages: 18 },
    { cover: 'assets/books/book-3.jpg',  pages: 27 },
    { cover: 'assets/books/book-4.jpg',  pages: 16 },
    { cover: 'assets/books/book-5.jpg',  pages: 22 },
    { cover: 'assets/books/book-6.jpg',  pages: 20 },
    { cover: 'assets/books/book-7.jpg',  pages: 26 },
    { cover: 'assets/books/book-8.jpg',  pages: 15 },
    { cover: 'assets/books/book-9.jpg',  pages: 23 },
    { cover: 'assets/books/book-10.jpg', pages: 19 },
    { cover: 'assets/books/book-11.jpg', pages: 28 },
    { cover: 'assets/books/book-12.jpg', pages: 17 },
    { cover: 'assets/books/book-13.jpg', pages: 21 },
    { cover: 'assets/books/book-14.jpg', pages: 25 },
    { cover: 'assets/books/book-15.jpg', pages: 20 }
  ];

  function el(cls, css) {
    var d = document.createElement('div');
    if (cls) d.className = cls;
    if (css) for (var k in css) d.style[k] = css[k];
    return d;
  }

  function buildBook(book) {
    var depth = PAGE_STEP * (book.pages + 1);

    var wrap = el('bk-book');
    wrap.style.setProperty('--book-depth', depth + 'px');

    // hinge
    var hinge = el('bk-hinge', { width: (depth + 1) + 'px', background: SPINE });
    wrap.appendChild(hinge);

    // back cover
    var back = el('bk-layer bk-back', {
      background: SPINE,
      transform: 'translateX(' + depth + 'px) skewY(' + SKEW + ')'
    });
    wrap.appendChild(back);

    // pages
    for (var i = 1; i <= book.pages; i++) {
      var t = i / book.pages;
      var page = el('bk-layer bk-page', {
        transform: 'translateX(' + (PAGE_STEP * i) + 'px) skewY(' + SKEW + ')',
        zIndex: String(2 + (book.pages - i)),
        filter: 'brightness(' + (1 - t * 0.06).toFixed(3) + ')',
        top: (PAGE_INSET / 2) + 'px',
        height: 'calc(100% - ' + PAGE_INSET + 'px)'
      });
      wrap.appendChild(page);
    }

    // front cover (image)
    var front = el('bk-layer bk-front', {
      backgroundImage: 'url("' + book.cover + '")',
      transform: 'skewY(' + SKEW + ')'
    });
    wrap.appendChild(front);

    return wrap;
  }

  function render(container) {
    var list = BOOKS.concat(BOOKS); // duplicate for seamless loop
    var total = list.length;
    var frag = document.createDocumentFragment();

    list.forEach(function (book, i) {
      var w = el('bk-wrap');
      w.style.zIndex = String(total - i);
      w.appendChild(buildBook(book));
      frag.appendChild(w);
    });

    var track = el('bk-track');
    track.appendChild(frag);

    var fade = el('bk-fade');
    fade.appendChild(track);

    var mask = el('bk-mask');
    mask.appendChild(fade);

    container.innerHTML = '';
    container.appendChild(mask);

    // pace the scroll to the number of books so it stays calm
    track.style.setProperty('--bk-speed', Math.max(70, total * 5) + 's');
  }

  function init() {
    var nodes = document.querySelectorAll('[data-shelf]');
    nodes.forEach(function (n) { render(n); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
