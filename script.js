// Small scripts for the page: language, signing dates, sharing, and the phone action bar.
(function () {
  var root = document.documentElement;

  /* ---------- Language ---------- */
  var titles = { sv: 'Jan Stenborg – Författare', en: 'Jan Stenborg – Author' };

  // Remember each image's Swedish description so we can switch back to it.
  document.querySelectorAll('img[data-alt-en]').forEach(function (img) {
    img.setAttribute('data-alt-sv', img.getAttribute('alt'));
  });

  function setLang(lang, remember) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    document.title = titles[lang];
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-set-lang') === lang));
    });
    document.querySelectorAll('img[data-alt-en]').forEach(function (img) {
      img.setAttribute('alt', img.getAttribute('data-alt-' + lang));
    });
    if (typeof splitChapterLines === 'function') requestAnimationFrame(splitChapterLines);
    if (remember) { try { localStorage.setItem('lang', lang); } catch (e) {} }
  }

  document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-set-lang'), true); });
  });
  setLang(root.getAttribute('data-lang') || 'sv');

  /* ---------- Signing: before, on, or after the day ---------- */
  var event = document.querySelector('[data-event-start]');
  if (event) {
    var start = new Date(event.getAttribute('data-event-start'));
    var end = new Date(event.getAttribute('data-event-end'));
    var now = new Date();
    // ?event=today or ?event=past previews the other states.
    var preview = null;
    try { preview = new URLSearchParams(location.search).get('event'); } catch (e) {}

    // Compare calendar days in Stockholm, so "today" means the whole day of the signing.
    function stockholmDay(d) {
      return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(d);
    }
    var state = 'upcoming';
    if (now > end) state = 'past';
    if (stockholmDay(now) === stockholmDay(start)) state = now > end ? 'past' : 'today';
    if (preview === 'upcoming' || preview === 'today' || preview === 'past') state = preview;
    root.setAttribute('data-event-state', state);

    // "In 29 days" line
    var countdown = event.querySelector('[data-countdown]');
    if (countdown && state === 'upcoming') {
      var dayMs = 86400000;
      var days = Math.round((Date.parse(stockholmDay(start)) - Date.parse(stockholmDay(now))) / dayMs);
      if (days >= 1) {
        countdown.querySelector('[lang="sv"]').textContent = days === 1 ? 'I morgon' : 'Om ' + days + ' dagar';
        countdown.querySelector('[lang="en"]').textContent = days === 1 ? 'Tomorrow' : 'In ' + days + ' days';
        countdown.hidden = false;
      }
    }
  }

  /* ---------- Share button ---------- */
  var shareBtn = document.querySelector('[data-share]');
  var shareStatus = document.querySelector('.share-status');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var sv = root.getAttribute('data-lang') === 'sv';
      var url = location.origin + location.pathname + '#evenemang';
      var data = {
        title: sv ? 'Boksignering: Kungablod med Jan Stenborg' : 'Book signing: Kungablod with Jan Stenborg',
        text: sv ? 'Lördag 21 november kl. 13.00 på Twang, Katarina bangata 25, Stockholm.'
                 : 'Saturday 21 November at 1 pm at Twang, Katarina bangata 25, Stockholm.',
        url: url
      };
      function say(msg) {
        shareStatus.textContent = msg;
        setTimeout(function () { shareStatus.textContent = ''; }, 4000);
      }
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(
          function () { say(sv ? 'Länken är kopierad.' : 'Link copied.'); },
          function () { say(url); }
        );
      } else {
        say(url);
      }
    });
  }

  /* ---------- Phone action bar ---------- */
  // Shows once the hero's buttons have scrolled away; hides again when the
  // events or contact sections are on screen, since they have their own buttons.
  var bar = document.querySelector('[data-action-bar]');
  var heroActions = document.getElementById('hero-actions');
  if (bar && heroActions && 'IntersectionObserver' in window) {
    var heroGone = false;
    var ownButtonsVisible = {};
    function update() {
      var hide = Object.keys(ownButtonsVisible).some(function (k) { return ownButtonsVisible[k]; });
      bar.classList.toggle('is-visible', heroGone && !hide);
    }
    new IntersectionObserver(function (entries) {
      heroGone = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      update();
    }).observe(heroActions);
    ['evenemang', 'kontakt'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      new IntersectionObserver(function (entries) {
        ownButtonsVisible[id] = entries[0].isIntersecting;
        update();
      }, { rootMargin: '0px 0px -30% 0px' }).observe(el);
    });
  }

  /* ---------- Motion (see docs/MOTION.md) ---------- */
  window.motionStarted = true;
  var heroRender = null;   // set below when the hero's scroll depth is active

  // Reveals: each [data-reveal] appears once, the first time it comes into view.
  // Siblings stagger automatically (up to 6 steps).
  var reveals = document.querySelectorAll('[data-reveal]');
  reveals.forEach(function (el) {
    if (el.style.getPropertyValue('--i')) return;
    var i = 0, prev = el.previousElementSibling;
    while (prev) { if (prev.hasAttribute('data-reveal')) i++; prev = prev.previousElementSibling; }
    el.style.setProperty('--i', Math.min(i, 6));
  });
  if ('IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); revealer.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px 8% 0px' });
    reveals.forEach(function (el) { revealer.observe(el); });

    // Saga: the book crossing the middle of the screen becomes the active one.
    var saga = document.querySelector('[data-saga]');
    if (saga) {
      var picker = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) saga.setAttribute('data-active', e.target.getAttribute('data-book')); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      saga.querySelectorAll('.saga-list .book').forEach(function (b) { picker.observe(b); });
    }
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Header: hides on the way down (past the hero), returns on the way up.
  var lastY = window.scrollY;
  var holdHeader = 0;
  var heroEl = document.querySelector('.hero');
  document.querySelectorAll('.nav a, .brand').forEach(function (a) {
    a.addEventListener('click', function () { holdHeader = Date.now() + 1200; root.classList.remove('header-hidden'); });
  });
  function headerUpdate() {
    var y = window.scrollY;
    var pastHero = heroEl ? y > heroEl.offsetHeight * 0.8 : y > 400;
    if (Date.now() < holdHeader || y < 80) root.classList.remove('header-hidden');
    else if (y > lastY + 6 && pastHero) root.classList.add('header-hidden');
    else if (y < lastY - 6) root.classList.remove('header-hidden');
    lastY = y;
  }

  // One scroll listener for the whole page, at most one update per frame.
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      headerUpdate();
      if (heroRender) heroRender();
    });
  }, { passive: true });

  /* ---------- Hero: book tilt and scroll depth ---------- */
  var hero = document.querySelector('.hero');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hero && !calm) {
    var bookBody = hero.querySelector('.book3d-body');
    var layers = {
      sky: hero.querySelectorAll('[data-depth="sky"]'),
      fleet: hero.querySelectorAll('[data-depth="fleet"]'),
      book: hero.querySelectorAll('[data-depth="book"]'),
      text: hero.querySelectorAll('[data-depth="text"]')
    };
    var cue = hero.querySelector('.scroll-cue');

    // The book turns toward the pointer (mouse or trackpad only).
    if (bookBody && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      hero.addEventListener('pointermove', function (e) {
        var r = bookBody.getBoundingClientRect();
        var dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
        var dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
        bookBody.style.setProperty('--tilt-y', (dx * 8).toFixed(2) + 'deg');
        bookBody.style.setProperty('--tilt-x', (-dy * 8).toFixed(2) + 'deg');
        bookBody.style.setProperty('--gx', (70 - dx * 40).toFixed(1) + '%');
        bookBody.style.setProperty('--gy', (18 - dy * 20).toFixed(1) + '%');
      });
      hero.addEventListener('pointerleave', function () {
        ['--tilt-y', '--tilt-x', '--gx', '--gy'].forEach(function (p) { bookBody.style.removeProperty(p); });
      });
    }

    // Layers separate in depth as the hero scrolls away. Runs only while it's on screen.
    var onScreen = true;
    var wide = window.matchMedia('(min-width: 821px)');
    function move(list, y) {
      list.forEach(function (el) { el.style.translate = '0 ' + y.toFixed(1) + 'px'; });
    }
    function render() {
      var h = hero.offsetHeight;
      var p = Math.max(0, Math.min(1, window.scrollY / h));
      move(layers.sky, p * h * 0.25);
      move(layers.fleet, p * h * 0.15);
      move(layers.book, wide.matches ? -p * h * 0.15 : 0);
      if (wide.matches) {          // on phones the text stays put and fully visible
        move(layers.text, -p * 30);
        layers.text.forEach(function (el) { el.style.opacity = String(Math.max(0, 1 - p * 1.4)); });
      } else {
        move(layers.text, 0);
        layers.text.forEach(function (el) { el.style.removeProperty('opacity'); });
      }
      if (bookBody) bookBody.style.setProperty('--turn', (p * 6).toFixed(2) + 'deg');
      if (cue) cue.style.opacity = String(Math.max(0, 1 - p * 8));
    }
    heroRender = function () { if (onScreen) render(); };
    wide.addEventListener('change', render);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        hero.classList.toggle('is-offscreen', !onScreen);
      }).observe(hero);
    }
    render();
  }

  /* Mask heading lines without changing their accessible names or translations. */
  var chapterLabels = Array.from(document.querySelectorAll('.chapter-title > span[lang]'));
  chapterLabels.forEach(function (label) { label.dataset.originalText = label.textContent; });
  function splitChapterLines() {
    if (!chapterLabels) return;
    chapterLabels.forEach(function (label) {
      if (!label.getClientRects().length) return;
      var original = label.dataset.originalText;
      label.textContent = '';
      var words = original.trim().split(/\s+/).map(function (word) {
        var span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        label.appendChild(span);
        label.appendChild(document.createTextNode(' '));
        return span;
      });
      var lines = [], top = null;
      words.forEach(function (word) {
        var y = Math.round(word.getBoundingClientRect().top);
        if (y !== top) { lines.push([]); top = y; }
        lines[lines.length - 1].push(word.textContent);
      });
      label.textContent = '';
      label.setAttribute('aria-label', original);
      lines.forEach(function (words, i) {
        var line = document.createElement('span');
        line.className = 'motion-line';
        line.setAttribute('aria-hidden', 'true');
        line.style.setProperty('--line-index', i);
        var inner = document.createElement('span');
        inner.className = 'motion-line-inner';
        inner.textContent = words.join(' ');
        line.appendChild(inner);
        label.appendChild(line);
      });
    });
  }
  if (document.fonts) document.fonts.ready.then(splitChapterLines);
  else splitChapterLines();
  var headingResize;
  window.addEventListener('resize', function () {
    clearTimeout(headingResize);
    headingResize = setTimeout(splitChapterLines, 120);
  });

  /* ---------- Measuring what works (no cookies) ----------
     Every important click is named here. Nothing is sent until an analytics service is added
     (Plausible is recommended: see docs/LAUNCH.md). Shop links are counted per shop and book;
     the calendar file, the map, the share button and the e-mail address are counted too. */
  function track(name, props) {
    try {
      if (window.plausible) window.plausible(name, { props: props });
      if (window.dataLayer) window.dataLayer.push({ event: name, props: props });
      document.dispatchEvent(new CustomEvent('site:track', { detail: { name: name, props: props } }));
    } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a, button');
    if (!el) return;
    var href = el.getAttribute('href') || '';
    var area = el.closest('section, header, footer, .action-bar');
    var props = { lang: root.getAttribute('data-lang'), area: area ? (area.id || area.className.split(' ')[0]) : '' };
    if (el.hasAttribute('data-track')) return track(el.getAttribute('data-track'), props);
    if (/\.ics$/.test(href)) return track('Calendar', props);
    if (href.indexOf('mailto:') === 0) return track('Email', props);
    if (/^https?:/.test(href) && el.hostname !== location.hostname) {
      var book = el.closest('[data-book]');
      props.site = el.hostname.replace(/^www\./, '');
      if (book) props.book = book.getAttribute('data-book');
      return track(/google\.[a-z.]+\/maps/.test(href) ? 'Map' : 'Shop', props);
    }
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
