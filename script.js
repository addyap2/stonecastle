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
    var ticking = false;
    var onScreen = true;
    var wide = window.matchMedia('(min-width: 821px)');
    function move(list, y) {
      list.forEach(function (el) { el.style.translate = '0 ' + y.toFixed(1) + 'px'; });
    }
    function render() {
      ticking = false;
      var h = hero.offsetHeight;
      var p = Math.max(0, Math.min(1, window.scrollY / h));
      move(layers.sky, p * h * 0.25);
      move(layers.fleet, p * h * 0.15);
      move(layers.book, -p * h * 0.15);
      if (wide.matches) {          // on phones the text stays put and fully visible
        move(layers.text, -p * 30);
        layers.text.forEach(function (el) { el.style.opacity = String(Math.max(0, 1 - p * 1.4)); });
      }
      if (bookBody) bookBody.style.setProperty('--turn', (p * 6).toFixed(2) + 'deg');
      if (cue) cue.style.opacity = String(Math.max(0, 1 - p * 8));
    }
    window.addEventListener('scroll', function () {
      if (onScreen && !ticking) { ticking = true; requestAnimationFrame(render); }
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        hero.classList.toggle('is-offscreen', !onScreen);
      }).observe(hero);
    }
    render();
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
