/* The private book reader. Fetches the book one chapter at a time from /api/book, lays each
   chapter out in page-sized columns and turns the pages like a book: a two-page spread on
   wide screens, one page on phones. There is deliberately no download, print or copy. */
(function () {
  'use strict';

  var LABELS = {
    en: {
      contents: 'Contents', loading: 'Opening the book…', missing: 'This book isn’t available at this address.',
      failed: 'The book could not be opened. Please try again later.', prev: 'Previous page', next: 'Next page',
      smaller: 'Smaller text', larger: 'Larger text', close: 'Close',
      where: function (title, p, n) { return '· page ' + p + ' of ' + n; }
    },
    fr: {
      contents: 'Sommaire', loading: 'Ouverture du livre…', missing: 'Ce livre n’est pas disponible à cette adresse.',
      failed: 'Impossible d’ouvrir le livre. Réessayez plus tard.', prev: 'Page précédente', next: 'Page suivante',
      smaller: 'Texte plus petit', larger: 'Texte plus grand', close: 'Fermer',
      where: function (title, p, n) { return '· page ' + p + ' sur ' + n; }
    }
  };
  var path = location.pathname.split('/').filter(Boolean);       // ["read" | "lire", slug]
  var lang = path[0] === 'lire' ? 'fr' : 'en';
  var slug = (path[1] || '').toLowerCase();
  var L = LABELS[lang];
  var $ = function (id) { return document.getElementById(id); };
  var bookEl = $('book'), status = $('status');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SCALES = [0.85, 0.92, 1, 1.1, 1.2, 1.32];
  var STORE = 'reader:' + slug;

  document.documentElement.lang = lang;
  document.querySelectorAll('[data-label]').forEach(function (el) { el.textContent = L[el.getAttribute('data-label')]; });
  document.querySelectorAll('[data-label-aria]').forEach(function (el) { el.setAttribute('aria-label', L[el.getAttribute('data-label-aria')]); });
  status.textContent = L.loading;

  var meta = null;          // title, sections (titles and kinds)
  var html = {};            // section index -> its markup, once fetched
  var counts = {};          // section index -> number of pages at the current layout
  var pos = { s: 0, p: 0 }; // the section and first page on screen
  var single = false, size = {}, scaleAt = 2, busy = false;

  function read() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify({ s: pos.s, f: pos.p / (counts[pos.s] || 1), z: scaleAt })); } catch (e) {}
  }

  /* ---------- The pages ---------- */
  function makePage(cls) {
    var el = document.createElement('div');
    el.className = 'page ' + cls;
    el.innerHTML = '<span class="page-edge"></span><div class="page-head"></div><div class="window"><div class="flow"></div></div><div class="page-foot"></div><span class="shade"></span>';
    return { el: el, head: el.querySelector('.page-head'), flow: el.querySelector('.flow'), foot: el.querySelector('.page-foot'), shade: el.querySelector('.shade'), sec: -1 };
  }
  var left = makePage('page-left'), right = makePage('page-right');
  var leaf = document.createElement('div'); leaf.className = 'leaf'; leaf.hidden = true;
  var front = makePage('leaf-front'), back = makePage('leaf-back');
  leaf.append(front.el, back.el);
  var measure = makePage('page-right');
  measure.el.style.cssText = 'visibility:hidden;pointer-events:none;z-index:-2';
  var prevBtn = document.createElement('button'), nextBtn = document.createElement('button');
  prevBtn.className = 'turn turn-prev'; nextBtn.className = 'turn turn-next';
  prevBtn.type = nextBtn.type = 'button';
  prevBtn.setAttribute('aria-label', L.prev); nextBtn.setAttribute('aria-label', L.next);
  bookEl.append(measure.el, left.el, right.el, leaf, prevBtn, nextBtn);

  /* ---------- Layout: page size, margins and type size for this screen ---------- */
  function layout() {
    var W = window.innerWidth, H = window.innerHeight - 56 - 40;
    single = W < 860 || W < H * 1.1;
    var margin = single ? 10 : 26, pw, ph;
    if (single) {
      pw = Math.min(W - 2 * margin, 640);
      ph = Math.min(H - 2 * margin, pw * 1.7);
    } else {
      ph = Math.min(H - 2 * margin, 1000);
      pw = Math.min(ph * 0.7, (W - 2 * margin) / 2);
      ph = Math.min(ph, pw / 0.62);
    }
    pw = Math.floor(pw); ph = Math.floor(ph);
    var pad = single ? Math.max(20, Math.round(pw * 0.075)) : Math.round(pw * 0.105);
    var padTop = Math.round(pad + 22), padBottom = Math.round(pad + 20);
    var fs = (single ? 17.5 : Math.max(16, Math.min(20.5, pw / 25))) * SCALES[scaleAt];
    var line = fs * 1.52;
    var wh = Math.floor((ph - padTop - padBottom) / line) * line;       // whole lines on every page
    padBottom = ph - padTop - wh;
    size = { pw: pw, ph: ph, pad: pad, ww: pw - 2 * pad, wh: wh, gap: 2 * pad };
    var vars = { '--pw': pw, '--ph': ph, '--pad': pad, '--pad-top': padTop, '--pad-bottom': padBottom, '--ww': size.ww, '--wh': wh, '--gap': size.gap, '--fs': fs };
    Object.keys(vars).forEach(function (k) { bookEl.style.setProperty(k, vars[k] + 'px'); });
    bookEl.style.setProperty('--pages', single ? 1 : 2);
    bookEl.classList.toggle('single', single);
    left.el.hidden = single;
    counts = {};
  }

  /* ---------- Loading and measuring chapters ---------- */
  function api(query) {
    return fetch('/api/book?book=' + encodeURIComponent(slug) + query, { cache: 'no-store', credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error(r.status === 404 ? 'missing' : 'failed'); return r.json(); });
  }
  var pending = {};
  function fetchSection(s) {
    if (html[s] != null) return Promise.resolve(html[s]);
    if (!pending[s]) pending[s] = api('&s=' + s).then(function (d) { html[s] = d.html; return d.html; });
    return pending[s];
  }
  function ensure(s) {                                // the chapter's markup and its page count
    return fetchSection(s).then(function () {
      if (counts[s]) return counts[s];
      setFlow(measure, s);
      var imgs = [].slice.call(measure.flow.querySelectorAll('img'));
      return Promise.all(imgs.map(function (i) { return i.decode ? i.decode().catch(function () {}) : null; })).then(function () {
        counts[s] = meta.sections[s].kind === 'image' ? 1 :
          Math.max(1, Math.round((measure.flow.scrollWidth + size.gap) / (size.ww + size.gap)));
        return counts[s];
      });
    });
  }
  function setFlow(view, s) {
    if (view.sec === s) return;
    view.flow.innerHTML = html[s];
    view.flow.className = 'flow' + (meta.sections[s].kind === 'image' ? ' is-image' : '');
    view.sec = s;
  }

  /* ---------- Putting a page on screen ---------- */
  function fill(view, s, p, side) {
    var sec = meta.sections[s];
    if (!sec || html[s] == null || p >= (counts[s] || 0) || p < 0) {
      view.flow.innerHTML = ''; view.sec = -1; view.head.textContent = ''; view.foot.textContent = '';
      return;
    }
    setFlow(view, s);
    view.flow.style.setProperty('--at', p);
    var running = sec.kind === 'text' && sec.chapter && p > 0;
    view.head.textContent = running ? (side === 'left' && !single ? meta.title : sec.title) : '';
    view.foot.textContent = sec.kind === 'text' && sec.chapter ? String(p + 1) : '';
  }
  function spread(at) {                               // [left page, right page] for a spread
    if (meta.sections[at.s].kind === 'image') return [null, { s: at.s, p: 0 }];
    return [{ s: at.s, p: at.p }, { s: at.s, p: at.p + 1 }];
  }
  function put(view, page, side) { if (page) fill(view, page.s, page.p, side); else fill(view, -1, 0, side); }
  function render() {
    if (single) fill(right, pos.s, pos.p, 'right');
    else { var sp = spread(pos); put(left, sp[0], 'left'); put(right, sp[1], 'right'); }
    var n = counts[pos.s] || 1, total = meta.sections.length;
    var shown = single ? pos.p + 1 : Math.min(pos.p + 2, n);
    $('where-title').textContent = meta.sections[pos.s].title;
    $('where-page').textContent = L.where('', shown, n);
    $('fill').style.width = ((pos.s + shown / n) / total * 100).toFixed(2) + '%';
    prevBtn.disabled = pos.s === 0 && pos.p === 0;
    nextBtn.disabled = pos.s === total - 1 && pos.p + (single ? 1 : 2) >= n;
    if (pos.s + 1 < total) ensure(pos.s + 1).catch(function () {});   // have the next chapter ready
    if (pos.s > 0) ensure(pos.s - 1).catch(function () {});           // and the previous one, for swiping back
    save();
  }

  /* ---------- Turning ---------- */
  function step() { return single ? 1 : 2; }
  function lastStart(n) { return single ? n - 1 : (n - 1) - ((n - 1) % 2); }
  function nextPos() {
    return ensure(pos.s).then(function (n) {
      if (pos.p + step() < n) return { s: pos.s, p: pos.p + step() };
      if (pos.s + 1 >= meta.sections.length) return null;
      return ensure(pos.s + 1).then(function () { return { s: pos.s + 1, p: 0 }; });
    });
  }
  function prevPos() {
    if (pos.p - step() >= 0) return Promise.resolve({ s: pos.s, p: pos.p - step() });
    if (pos.s === 0) return Promise.resolve(null);
    return ensure(pos.s - 1).then(function (n) { return { s: pos.s - 1, p: lastStart(n) }; });
  }

  /* Wide screens: the page lifts over the spine in two halves, one side showing at a time.
     (Safari draws a turning page's back over its front if both sides are left to 3D.) */
  function lift(from, to, dir) {
    var half = dir > 0 ? -90 : 90, end = dir > 0 ? -180 : 180, t = 360;
    leaf.hidden = false; leaf.style.transform = '';
    if (dir > 0) {                                    // the right page goes over to the left
      leaf.style.left = size.pw + 'px'; leaf.style.transformOrigin = 'left center';
      front.el.className = 'page leaf-front page-right'; back.el.className = 'page leaf-back page-left';
      var a = spread(from), b = spread(to);
      put(front, a[1], 'right'); put(back, b[0], 'left'); put(right, b[1], 'right');
    } else {                                          // the left page comes back over to the right
      leaf.style.left = '0px'; leaf.style.transformOrigin = 'right center';
      front.el.className = 'page leaf-front page-left'; back.el.className = 'page leaf-back page-right';
      var c = spread(from), d = spread(to);
      put(front, c[0], 'left'); put(back, d[1], 'right'); put(left, d[0], 'left');
    }
    front.el.style.visibility = 'visible'; back.el.style.visibility = 'hidden';
    shade(front, [0, 0.9], t);
    var first = leaf.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(' + half + 'deg)' }],
      { duration: t, easing: 'cubic-bezier(.45,.05,.6,.55)', fill: 'forwards' });
    return first.finished.then(function () {
      front.el.style.visibility = 'hidden'; back.el.style.visibility = 'visible';
      shade(back, [0.9, 0], t);
      var second = leaf.animate([{ transform: 'rotateY(' + half + 'deg)' }, { transform: 'rotateY(' + end + 'deg)' }],
        { duration: t, easing: 'cubic-bezier(.4,.45,.3,1)', fill: 'forwards' });
      first.cancel();
      return second.finished.then(function () { leaf.hidden = true; second.cancel(); });
    });
  }
  function shade(view, values, ms) {
    view.shade.animate(values.map(function (v) { return { opacity: v }; }), { duration: ms, easing: 'ease-in-out' });
  }

  /* Phones: the page slides away under your finger, as in a reading app. Going forward the
     current page slides off to the left over the next one; going back, the previous page
     slides in from the left over the current one. */
  var slide = null;
  function slideStart(dir, to) {
    var w = size.pw + 30;
    leaf.hidden = false; leaf.style.left = '0px'; leaf.style.transformOrigin = '';
    front.el.className = 'page leaf-front page-right sliding';
    front.el.style.visibility = 'visible'; back.el.style.visibility = 'hidden';
    if (dir > 0) { fill(front, pos.s, pos.p, 'right'); fill(right, to.s, to.p, 'right'); }
    else fill(front, to.s, to.p, 'right');
    slide = { dir: dir, to: to, w: w, x: 0 };
    slideTo(dir > 0 ? 0 : -w);
  }
  function slideTo(x) { slide.x = x; leaf.style.transform = 'translateX(' + x + 'px)'; }
  function slideEnd(commit, ms) {
    var sl = slide, target = (sl.dir > 0) === commit ? -sl.w : 0;
    var anim = leaf.animate([{ transform: 'translateX(' + sl.x + 'px)' }, { transform: 'translateX(' + target + 'px)' }],
      { duration: ms, easing: 'cubic-bezier(.22,.8,.3,1)' });
    leaf.style.transform = 'translateX(' + target + 'px)';
    return anim.finished.then(function () {
      leaf.hidden = true; leaf.style.transform = ''; front.el.classList.remove('sliding'); slide = null;
      if (commit) pos = sl.to;
      render();
    });
  }
  function neighbour(dir) {                           // the next or previous page, if it is ready now
    var n = counts[pos.s];
    if (!n) return null;
    if (dir > 0) {
      if (pos.p + 1 < n) return { s: pos.s, p: pos.p + 1 };
      return pos.s + 1 < meta.sections.length && counts[pos.s + 1] ? { s: pos.s + 1, p: 0 } : null;
    }
    if (pos.p > 0) return { s: pos.s, p: pos.p - 1 };
    return pos.s > 0 && counts[pos.s - 1] ? { s: pos.s - 1, p: counts[pos.s - 1] - 1 } : null;
  }

  function turn(dir) {
    if (busy || !meta) return;
    busy = true;
    var from = { s: pos.s, p: pos.p };
    (dir > 0 ? nextPos() : prevPos()).then(function (to) {
      if (!to) return;
      if (reduced) { pos = to; render(); return; }
      if (single) { slideStart(dir, to); return slideEnd(true, 380); }
      return lift(from, to, dir).then(function () { pos = to; render(); });
    }).catch(function () {}).then(function () { busy = false; });
  }
  function go(s) {
    if (busy) return;
    busy = true;
    ensure(s).then(function () { pos = { s: s, p: 0 }; render(); }).catch(function () {}).then(function () { busy = false; });
  }

  /* ---------- Input: page edges, keys, swipes and the book's own contents links ---------- */
  var swiped = false;
  function linkAt(e) {
    var under = document.elementsFromPoint ? document.elementsFromPoint(e.clientX, e.clientY) : [];
    for (var i = 0; i < under.length; i++) {
      var a = under[i].closest && under[i].closest('a[data-section]');
      if (a) return a;
    }
    return null;
  }
  [prevBtn, nextBtn].forEach(function (btn, i) {
    btn.addEventListener('click', function (e) {
      if (swiped) { swiped = false; return; }
      var a = e.detail ? linkAt(e) : null;
      if (a) return go(Number(a.getAttribute('data-section')));
      turn(i === 0 ? -1 : 1);
    });
  });
  function afterSwipe() { swiped = true; setTimeout(function () { swiped = false; }, 400); }

  // On a phone the page follows the finger; elsewhere a swipe simply turns the page
  var startX = null, startY = 0, drag = null;
  bookEl.addEventListener('pointerdown', function (e) {
    startX = e.clientX; startY = e.clientY;
    drag = single && !busy && meta && e.pointerType !== 'mouse'
      ? { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: Date.now(), on: false } : null;
  });
  bookEl.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.on) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) { if (Math.abs(dy) > 16) drag = null; return; }
      var dir = dx < 0 ? 1 : -1, to = neighbour(dir);
      if (!to || busy) { drag = null; return; }
      busy = true; drag.on = true; drag.dir = dir;
      try { bookEl.setPointerCapture(e.pointerId); } catch (err) {}
      slideStart(dir, to);
    }
    slideTo(drag.dir > 0 ? Math.min(0, dx) : Math.min(0, -slide.w + Math.max(0, dx)));
  });
  function endDrag(e, cancelled) {
    var d = drag; drag = null; startX = null;
    afterSwipe();
    var dx = e.clientX - d.x0, speed = Math.abs(dx) / Math.max(1, Date.now() - d.t0);
    var forward = d.dir > 0 ? dx < 0 : dx > 0;
    var commit = !cancelled && forward && (Math.abs(dx) / slide.w > 0.25 || speed > 0.45);
    slideEnd(commit, commit ? 240 : 200).catch(function () {}).then(function () { busy = false; });
  }
  bookEl.addEventListener('pointercancel', function (e) { if (drag && drag.on && e.pointerId === drag.id) endDrag(e, true); else drag = null; });
  bookEl.addEventListener('pointerup', function (e) {
    if (drag && drag.on && e.pointerId === drag.id) return endDrag(e, false);
    drag = null;
    if (startX == null) return;
    var dx = e.clientX - startX, dy = e.clientY - startY;
    startX = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { afterSwipe(); turn(dx < 0 ? 1 : -1); }
  });
  document.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && ['s', 'p', 'c', 'a', 'u', 'x'].indexOf(k) !== -1) { e.preventDefault(); return; }
    if ($('contents').open) return;
    if (k === 'arrowright' || k === 'pagedown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); turn(1); }
    else if (k === 'arrowleft' || k === 'pageup' || (k === ' ' && e.shiftKey)) { e.preventDefault(); turn(-1); }
    else if (k === 'home') { e.preventDefault(); go(0); }
  });
  ['contextmenu', 'copy', 'cut', 'dragstart', 'selectstart'].forEach(function (type) {
    document.addEventListener(type, function (e) { if (!e.target.closest || !e.target.closest('dialog')) e.preventDefault(); });
  });

  /* ---------- Text size and resizing keep your place ---------- */
  function relayout() {
    if (!meta) return;
    var frac = pos.p / (counts[pos.s] || 1);
    layout();
    [left, right, front, back, measure].forEach(function (v) { v.sec = -1; });
    ensure(pos.s).then(function (n) {
      var p = Math.min(n - 1, Math.round(frac * n));
      pos.p = single ? p : p - (p % 2);
      render();
    });
  }
  $('smaller').addEventListener('click', function () { if (scaleAt > 0) { scaleAt--; relayout(); } });
  $('larger').addEventListener('click', function () { if (scaleAt < SCALES.length - 1) { scaleAt++; relayout(); } });
  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(relayout, 180); });

  /* ---------- Contents ---------- */
  var dialog = $('contents');
  $('contents-open').addEventListener('click', function () {
    [].forEach.call($('toc').querySelectorAll('a'), function (a, i) { a.setAttribute('aria-current', String(i === pos.s)); });
    dialog.showModal();
  });
  $('contents-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  function buildToc() {
    $('toc').replaceChildren.apply($('toc'), meta.sections.map(function (sec, i) {
      var li = document.createElement('li'), a = document.createElement('a');
      li.className = sec.chapter ? '' : 'minor';
      a.href = '#'; a.textContent = sec.title;
      a.addEventListener('click', function (e) { e.preventDefault(); dialog.close(); go(i); });
      li.append(a);
      return li;
    }));
  }

  /* ---------- Open the book ---------- */
  if (!/^[a-z0-9-]{8,80}$/.test(slug)) { status.textContent = L.missing; return; }
  api('').then(function (data) {
    meta = data;
    document.title = meta.title + ' — Jan Stenborg';
    $('book-title').textContent = meta.title;
    buildToc();
    var saved = read();
    if (typeof saved.z === 'number' && SCALES[saved.z]) scaleAt = saved.z;
    var s = typeof saved.s === 'number' && saved.s < meta.sections.length ? saved.s : 0;
    return (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
      bookEl.hidden = false;
      layout();
      return ensure(s);
    }).then(function (n) {
      var p = Math.min(n - 1, Math.round((saved.s === s ? saved.f || 0 : 0) * n));
      pos = { s: s, p: single ? p : p - (p % 2) };
      render();
      status.hidden = true;
      $('contents-open').hidden = false;
      $('tools').hidden = false;
    });
  }).catch(function (e) {
    bookEl.hidden = true;
    status.textContent = e && e.message === 'missing' ? L.missing : L.failed;
  });
})();
