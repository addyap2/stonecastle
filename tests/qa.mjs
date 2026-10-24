// Site QA: Chromium, Firefox and WebKit at phone and desktop sizes, plus an axe accessibility
// scan in both languages, reduced motion, no JavaScript, keyboard focus, links, the security
// policy from vercel.json, and the analytics events. See docs/LAUNCH.md for how to run it.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium, firefox, webkit } = require(process.env.PW_DIR ? process.env.PW_DIR + '/node_modules/playwright' : 'playwright');
const axeSource = fs.readFileSync(process.env.AXE_DIR ? process.env.AXE_DIR + '/node_modules/axe-core/axe.min.js' : require.resolve('axe-core/axe.min.js'), 'utf8');
process.env.OUT = process.env.OUT || path.resolve('tests/results');
process.env.SITE_DIR = process.env.SITE_DIR || path.resolve('.');
fs.mkdirSync(process.env.OUT, { recursive: true });
const URL = process.env.SITE || 'http://127.0.0.1:8765/';
const sizes = { phone: { width: 375, height: 812, isMobile: true, hasTouch: true }, desktop: { width: 1440, height: 900 } };
const out = { engines: {}, axe: null, reduced: null, nojs: null, keyboard: null, links: null };

async function visit(browserType, name) {
  const browser = await browserType.launch();
  out.engines[name] = {};
  for (const [label, vp] of Object.entries(sizes)) {
    const opts = { viewport: { width: vp.width, height: vp.height } };
    if (vp.isMobile && name !== 'firefox') { opts.isMobile = true; opts.hasTouch = true; }
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const errors = [], failed = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
    page.on('requestfailed', r => failed.push('failed ' + r.url()));
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(2600);
    // scroll the whole page so every reveal, lazy image and observer fires
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= H; y += 400) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const hidden = [...document.querySelectorAll('[data-reveal]')].filter(e => e.offsetParent && !e.classList.contains('is-in')).length;
      const brokenImgs = [...document.images].filter(i => i.complete && i.offsetParent && i.naturalWidth === 0).map(i => i.currentSrc || i.src);
      return { overflowX: de.scrollWidth - innerWidth, unrevealed: hidden, brokenImgs, lang: de.lang, eventState: de.dataset.eventState };
    });
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400);
    const cta = await page.evaluate(() => {
      const b = [...document.querySelectorAll('#hero-actions .btn-gold')].find(e => e.offsetParent);
      const rc = b && b.getBoundingClientRect();
      return rc ? { bottom: Math.round(rc.bottom), fold: innerHeight, visible: rc.bottom <= innerHeight } : null;
    });
    await page.screenshot({ path: `${process.env.OUT}/${name}-${label}.png` });
    out.engines[name][label] = { ...r, heroCta: cta, errors, failed };
    await ctx.close();
  }
  await browser.close();
}

await visit(chromium, 'chromium');
try { await visit(firefox, 'firefox'); } catch (e) { out.engines.firefox = { error: e.message.split('\n')[0] }; }
await visit(webkit, 'webkit');

// axe accessibility scan (both languages, after all reveals)
{
  const b = await chromium.launch(); const results = {};
  for (const lang of ['sv', 'en']) {
    for (const [label, vp] of Object.entries(sizes)) {
      const p = await b.newPage({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce', bypassCSP: true });   // the live security policy blocks the injected tester
      await p.goto(URL + '?lang=' + lang); await p.waitForTimeout(800);
      await p.addScriptTag({ content: axeSource });
      const res = await p.evaluate(async () => {
        const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] });
        return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, targets: v.nodes.slice(0, 4).map(n => n.target.join(' ')) }));
      });
      results[lang + '-' + label] = res; await p.close();
    }
  }
  out.axe = results; await b.close();
}

// Reduced motion: nothing should be mid-animation, all content visible at once
{
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await p.goto(URL); await p.waitForTimeout(300);
  out.reduced = await p.evaluate(() => ({
    introClass: document.documentElement.classList.contains('hero-intro'),
    runningAnimations: document.getAnimations().filter(a => a.playState === 'running').map(a => a.animationName || a.constructor.name),
    titleOpacity: getComputedStyle(document.querySelector('.hero-title')).opacity,
    belowFoldOpacity: getComputedStyle(document.querySelector('#kontakt .finale-email')).opacity,
    heroBookTranslate: document.querySelector('.hero-book').style.translate || 'none'
  }));
  await p.screenshot({ path: `${process.env.OUT}/reduced-motion.png`, fullPage: true });
  await b.close();
}

// No JavaScript: the page must still be complete and readable
{
  const b = await chromium.launch(); const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const p = await ctx.newPage(); await p.goto(URL); await p.waitForTimeout(500);
  out.nojs = await p.evaluate(() => {
    const vis = s => [...document.querySelectorAll(s)].filter(e => e.offsetParent && getComputedStyle(e).opacity !== '0').length;
    return { motionReady: document.documentElement.classList.contains('motion-ready'), books: vis('.shelf-panel h3'), calendar: vis('a[href$=".ics"]'), email: vis('.finale-email'), invisibleReveals: [...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).opacity === '0').length };
  });
  await p.screenshot({ path: `${process.env.OUT}/no-js.png`, fullPage: true });
  await b.close();
}

// Keyboard: tab through the page, record focus order and whether focus is visible and on screen
{
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL); await p.waitForTimeout(2600);
  const steps = [];
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press('Tab'); await p.waitForTimeout(260);
    const s = await p.evaluate(() => {
      const a = document.activeElement; if (!a || a === document.body) return null;
      const r = a.getBoundingClientRect(); const cs = getComputedStyle(a);
      let el = a, op = 1; while (el) { op *= parseFloat(getComputedStyle(el).opacity); el = el.parentElement; }
      const header = document.querySelector('.site-header').getBoundingClientRect();
      return { text: (a.innerText || a.getAttribute('aria-label') || a.tagName).trim().replace(/\s+/g, ' ').slice(0, 32), outline: [a, ...a.querySelectorAll('*')].some(el => getComputedStyle(el).outlineStyle !== 'none'),  // the shelf draws its ring on the cover
        onScreen: r.bottom > 0 && r.top < innerHeight, effectiveOpacity: +op.toFixed(2), underHeader: r.top < header.bottom && header.bottom > 0 && !a.closest('.site-header') };
    });
    if (!s) break; steps.push(s);
  }
  out.keyboard = steps; await b.close();
}

// Links: internal targets exist; external links answer
{
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto(URL);
  const links = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')))]);
  const res = [];
  for (const h of links) {
    if (h.startsWith('#')) { const ok = await p.evaluate(id => !!document.getElementById(id), h.slice(1)); res.push([h, ok ? 'ok' : 'MISSING']); continue; }
    if (h.startsWith('mailto:')) { res.push([h, 'mailto']); continue; }
    try { const r = await p.request.get(new globalThis.URL(h, URL).href, { timeout: 15000, maxRedirects: 5 }); res.push([h, r.status()]); } catch (e) { res.push([h, 'ERR ' + e.message.slice(0, 60)]); }
  }
  out.links = res; await b.close();
}

fs.writeFileSync(process.env.OUT + '/report.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));

// Security policy: serve every response with the CSP from vercel.json and record any violations
{
  const csp = JSON.parse(fs.readFileSync(process.env.SITE_DIR + '/vercel.json', 'utf8')).headers[0].headers.find(h => h.key === 'Content-Security-Policy').value.replace('; upgrade-insecure-requests', '');
  const extra = {};
  for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
    const b = await type.launch(); const p = await b.newPage();
    const violations = [];
    await p.route('**/*', async route => { const r = await route.fetch(); await route.fulfill({ response: r, headers: { ...r.headers(), 'content-security-policy': csp } }); });
    p.on('console', m => { if (/Content.Security.Policy|Refused/i.test(m.text())) violations.push(m.text().slice(0, 160)); });
    await p.goto(URL); await p.waitForTimeout(1500);
    const ok = await p.evaluate(() => ({ motionStarted: !!window.motionStarted, lang: document.documentElement.lang, intro: document.documentElement.className }));
    extra[name] = { violations, ...ok }; await b.close();
  }
  out.csp = extra;
}

// Analytics hooks: clicking key actions produces named events
{
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL); await p.waitForTimeout(800);
  await p.evaluate(() => { window.__ev = []; document.addEventListener('site:track', e => window.__ev.push(e.detail)); document.addEventListener('click', e => e.preventDefault(), true); });
  for (const sel of ['#hero-actions .btn-gold', 'a[href$=".ics"]', '.book[data-book="stridslarm"] .buy a', '.finale-email', '[data-share]']) {
    await p.evaluate(s => { const el = [...document.querySelectorAll(s)][0]; el.click(); }, sel);
  }
  out.analytics = await p.evaluate(() => window.__ev);
  await b.close();
}

fs.writeFileSync(process.env.OUT + '/report.json', JSON.stringify(out, null, 2));
