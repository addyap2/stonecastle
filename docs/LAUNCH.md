# Launch Audit and Checklist

Full audit of the site: visual quality, storytelling, usability, navigation, motion, scrolling, responsiveness, accessibility, SEO, speed, browser compatibility, security and conversion. Every fix below was verified by the automated test suite in `tests/qa.mjs` and by Lighthouse.

Audited 23 October 2026, 29 days before the *Kungablod* signing.

---

## 1. Where it stands

| | Before the audit | After |
| --- | --- | --- |
| Lighthouse, phone (speed / accessibility / best practices / SEO) | 97 / 100 / 96 / 100 | **97 / 100 / 100 / 100** |
| Lighthouse, desktop | 100 / 100 / 96 / 100 | **100 / 100 / 100 / 100** |
| Largest image on screen (phone, throttled 4G) | 2.0s | **1.7–1.9s with compression**, as Vercel serves the site (speed score 99–100). A test server without compression shows 2.6s, so always measure the live site or a compressing server. Re-measure before adding more to the hero |
| Layout shift | 0 | 0 |
| Page weight, first load (phone) | 205 KB | 217 KB |
| Browser console errors | 1 (missing tab icon) | **0** |
| axe accessibility violations (both languages, phone + desktop) | 11 serious | **0** |
| Keyboard stops focused while invisible or off screen | 6 of 22 | **0 of 22** |
| Gold button on the first screen of a phone | Missed by 18px (after the hero's new spacing) | **Visible on all 5 sizes tested**, iPhone SE to Pro Max |
| Security-policy violations | No policy | **0** under a strict policy |

**Verdict:** the site is ready for real users once the items under *Before launch* in §4 are done. Most of them are content (the *Kungablod* description and shop link) and the domain.

---

## 2. Findings

Severity:
- **Critical:** blocks launch.
- **High:** hurts conversion or excludes users.
- **Medium:** visible quality or reach problem.
- **Low:** polish.

| # | Area | Issue | Impact | Severity | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Conversion | ***Kungablod* has no description and nowhere to buy it** ("kommer snart") | The book the whole site promotes can't be bought or even understood. Every visitor who wants it leaves empty-handed. | **High** | Add a one-line hook under the hero title, a blurb in the books section, and retailer links (or a pre-order link) as soon as they exist. The hero button then switches to *Köp Kungablod*. | ⏳ Needs Jan |
| 2 | Mobile, conversion | The gold **"Kom på signeringen" button had dropped below the first screen** on phones after the hero's spacing grew | The main action of the page was invisible without scrolling, on the device most visitors use. | **High** | Phone spacing tightened, with the horizon moved to match. Shorter phones get a smaller book. | ✅ Fixed. Verified at 375×812, 390×844, 430×932, 360×780 and 375×667 |
| 3 | Accessibility | **Chapter headings could be read as nothing**: the line-reveal effect named them with `aria-label` on plain `<span>`s, which screen readers may ignore | Blind visitors lose the page structure. | **High** | Each heading keeps its full text in a visually hidden copy; the animated lines are hidden from screen readers. The effect now also applies after switching language. | ✅ Fixed. Verified by axe and the accessibility tree in both languages |
| 4 | Accessibility | **Keyboard focus landed on invisible or half-faded links** (shop links, calendar, email) and sometimes off screen during smooth scrolling | Keyboard users couldn't see where they were. | **High** | Focusing anything finishes its reveal instantly and brings it on screen at once. Focusing a book makes it the active one in the saga. | ✅ Fixed. All 22 tab stops visible, outlined and on screen |
| 5 | Accessibility | **The dimmed books on desktop failed contrast** (11 cases) | Faint text was unreadable for people with low vision. | **High** | Book text stays at full strength. The covers and glow carry the "active book" effect. | ✅ Fixed. axe: 0 violations |
| 6 | SEO, polish | **No tab icon**, which also caused a 404 error in the console on every visit | Blank tab icon; a console error on every page view. | Medium | SVG, PNG, ICO and Apple home-screen icons (a gold diamond on night). | ✅ Fixed. 0 console errors, 0 failed requests |
| 7 | Sharing, conversion | **The share image was the cluttered flyer**, and the share text was a mix of Swedish and English | Links shared on Facebook (the main traffic source) looked amateur and didn't say what or when. | Medium | New 1200×630 share image rendered from the hero scene. Swedish title and description that give the signing date. Image size, alt text, locale and large-card tags added. | ✅ Fixed |
| 8 | SEO | **No canonical address or full share-image address** | Facebook and Google need full addresses. | Medium | Ready-made tags in `<head>`, commented out until the domain is known. | ⏳ At launch (§4) |
| 9 | Error handling | **No 404 page** | Mistyped or old links ended on the host's default error page. | Medium | Branded 404 page in both languages, with a way home. | ✅ Fixed |
| 10 | Security | **No security headers**, and the inline start-up script made a strict policy impossible | Open to clickjacking and content injection if a third-party script were ever compromised. | Medium | Start-up script moved to `boot.js`. `vercel.json` sends a strict Content-Security-Policy (only the site's own scripts, plus Plausible), nosniff, no framing, a referrer policy and a permissions policy. | ✅ Fixed. 0 violations in Chromium and WebKit |
| 11 | Speed | **No cache instructions** | Returning visitors downloaded every font and image again. | Medium | Images, fonts and icons are cached for 7 days. The page, CSS and JS are always revalidated, so updates show immediately. | ✅ Fixed (applies on Vercel) |
| 12 | Browser support | **The frosted header and action bar lacked Safari's prefix** | On Safari 17 and older (many iPhones), the blur was missing. | Medium | `-webkit-backdrop-filter` added. | ✅ Fixed |
| 13 | Measurement | **No analytics at all** | No way to know whether Facebook posts, the poster or the calendar button work. | Medium | Cookie-free event hooks on every key action (see §4, *Analytics*). | ✅ Hooks done and verified · ⏳ Connect the service |
| 14 | Conversion | **The *Jagad* "Bokus" link goes to Jan's author page**, not the book | One more click before buying. | Low | Replace with the book's own Bokus page once its URL is confirmed. | ⏳ Needs the link |
| 15 | Speed | The scroll code **measured the hero's height every frame** | Small jank on low-end phones. | Low | Measured once, and again only when it changes size. | ✅ Fixed |
| 16 | Visual | **Two longships sailed behind the hero subheadline** on desktop | Distracting behind text. | Low | The fleet moved to the right half of the horizon. | ✅ Fixed |
| 17 | SEO | **English shares the Swedish address** | Google can't list the English version separately. | Low | Separate `/en/` page with `hreflang` (EXPERIENCE.md Phase 3). | Later |
| 18 | Speed | CSS and JS aren't minified (8 KB and 3 KB of savings) | Negligible once the host compresses files (Vercel does). | Low | Kept readable on purpose, so the site can be edited without a build step. | Accepted |
| 19 | Content | The **event end time (15.00)**, the **contact email** and ***Kungablod*'s year (2026)** are assumptions | Wrong details on a launch page cost trust. | Low | Confirm with Jan and Twang. | ⏳ Confirm |
| 20 | Privacy | The email address is visible to spam harvesters | Some spam. | Low | Acceptable for an author. A contact form would need a backend. | Accepted |
| 21 | Process | **Two tools edited the same files at once**, and one silently overwrote another's fixes (all found and restored in this audit) | Fixes can vanish without anyone noticing. | Medium | One editor at a time on this repo. Commit after each piece of work, and run `tests/qa.mjs` before pushing. | ⚠️ Practice |

---

## 3. How it was verified

| Check | Method | Result |
| --- | --- | --- |
| Rendering, errors, failed files, sideways scroll | Chromium (Chrome, Edge) and WebKit (Safari) at 375×812 and 1440×900, scrolling the full page | All clean |
| Firefox | The local Firefox test build doesn't run on this macOS version | ⚠️ **Check by hand** (§4) |
| Accessibility rules | axe-core 4.14 (WCAG 2.0, 2.1 and 2.2 AA plus best practice), both languages, both sizes | 0 violations |
| Screen-reader names | Accessibility tree of every heading, before and after switching language | All headings named correctly |
| Keyboard | Tabbed through all 22 stops, checking focus ring, visibility and position | All pass |
| Reduced motion | Browser set to *reduce motion*: no intro, no running animations, everything visible | Pass |
| No JavaScript | JavaScript off: all books, calendar link and email visible, nothing hidden | Pass |
| Security policy | Every response served with the `vercel.json` policy, then watched for violations | 0 in Chromium and WebKit |
| Analytics hooks | Clicked hero button, calendar, a shop link, email and share, and captured the events | All 5 events fire, with book and shop names |
| Links | Internal anchors resolved, external links requested | All anchors OK. Adlibris and Bokus refuse automated checks (429), so **check by hand** |
| Speed, SEO, best practices | Lighthouse 13.5, phone and desktop | §1 |
| Phone first screen | Gold button position on 5 phone sizes | Visible on all |

Run it again any time (this needs Node 18+):

```bash
npm install --no-save playwright axe-core && npx playwright install chromium webkit firefox
```

```bash
python3 -m http.server 8765
```

Then, in a second terminal:

```bash
node tests/qa.mjs
```

The report lands in `tests/results/report.json`, with screenshots alongside it.

---

## 4. Launch checklist

### Before launch: content
- [ ] ***Kungablod*:** one-line hook (hero), blurb (books section), shop or pre-order links. Then switch the hero button to *Köp Kungablod*.
- [ ] Confirm the **signing time** with Twang (end time 15.00 is assumed) in all three places: `data-event-end` in `index.html`, the `Event` block in `<head>`, and `events/kungablod-signering.ics`.
- [ ] Confirm **info@stonecastle.se** still reaches Jan, or replace it (finale and structured data).
- [ ] Correct **Bokus link for *Jagad*** (currently the author page).
- [ ] Jan reads both languages once, end to end.

### Domain and deployment (Vercel)
- [x] Vercel project `stonecastle` (team `addyap2`), deploying automatically from GitHub `main`
- [x] Domain **janstenborg.com** (GoDaddy, Vercel nameservers) added to the project on 24 October 2026; `www` redirects to it; HTTPS certificate issued
- [x] Canonical, `og:url` and full share-image address on every page
- [x] Full addresses in the structured data
- [x] `sitemap.xml` (7 pages) and the `Sitemap:` line in `robots.txt`
- [x] Live headers checked: `content-security-policy`, `x-frame-options`, `strict-transport-security`
- [x] `https://janstenborg.com/not-a-page` shows the branded 404

### SEO and sharing
- [ ] Paste the address into the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/): the dawn image and "Kungablod – den nya vikingaromanen av Jan Stenborg" appear.
- [ ] [Rich Results Test](https://search.google.com/test/rich-results): the *Event* (signing) and *Book* entries are detected.
- [ ] Add the site to Google Search Console and Bing Webmaster Tools, and submit the sitemap.
- [ ] Put the address on the printed poster as a QR code, linking to `https://janstenborg.com/?utm_source=poster`.

### Analytics
- [ ] Create the site in [Plausible](https://plausible.io) (cookie-free, so no consent banner is needed).
- [ ] Add to `<head>` (the security policy already allows it):
  ```html
  <script defer data-domain="janstenborg.com" src="https://plausible.io/js/script.js"></script>
  ```
- [ ] In Plausible, create these goals (custom events). The site already sends them:
  - Hero: signing
  - Action bar: signing
  - Calendar
  - Map
  - Share
  - Shop (with `book` and `site` details)
  - Email
- [ ] Use `?utm_source=facebook` on every link Jan posts, so the traffic can be compared.

### Assets
- [x] Images in AVIF and WebP with JPG fallback, several sizes each
- [x] Fonts hosted with the site, Latin set including å ä ö
- [x] Tab icons, home-screen icon, share image 1200×630
- [ ] Replace the interim diamond icon with Jan's monogram when one is designed (AUDIT.md #11)

### Performance
- [x] Lighthouse phone ≥ 95 for speed, desktop 100
- [x] No layout shift; the hero cover loads first; looping effects pause off screen
- [ ] After deploy, run [PageSpeed Insights](https://pagespeed.web.dev) on the live address (it includes real compression and caching)

### Accessibility
- [x] axe: 0 violations, both languages
- [x] Keyboard: every stop visible and on screen, skip link works
- [x] Reduced motion and no-JavaScript versions complete
- [ ] One pass with VoiceOver on an iPhone: swipe through the page and check each chapter heading is read once, in the right language

### Cross-browser (by hand, on real devices)
- [ ] **iPhone Safari:**
  - the ☰ menu opens, each chapter link closes it and lands on its section, and the page doesn't move underneath it;
  - the hero entrance plays;
  - the action bar appears after scrolling;
  - *Lägg till i kalendern* opens the Calendar app;
  - *Dela* opens the share sheet.
- [ ] **Android Chrome:** the same four checks.
- [ ] **Desktop Firefox (not covered by the automated tests):**
  - the pinned book sequence works;
  - the book tilt follows the mouse;
  - no layout problems.
- [ ] Desktop Safari and Chrome: the pinned book sequence and the book tilt.
- [ ] Click every shop link by hand (the shops block automated checks).

### Mobile fallbacks
- [x] Button on the first screen from iPhone SE to Pro Max
- [x] No pinning on phones: books are plain blocks with their own covers
- [x] No hover effects on touch screens; the book floats instead of tilting
- [x] Share falls back to copying the link, or to showing it when copying is blocked

### Calls to action
- [x] One gold action per screen: *Kom på signeringen* (hero), *Lägg till i kalendern* (event), the email (finale)
- [x] The action bar on phones repeats the main action once the hero has scrolled away
- [x] After 21 November the page switches to the thank-you and book state by itself (preview with `?event=past`)
- [ ] When *Kungablod* is on sale, make *Köp Kungablod* the hero's and action bar's main action

### Error handling
- [x] The page works fully if the scripts fail (content shows after at most 3 seconds) or are blocked
- [x] Browser storage, clipboard and share all fail safely
- [x] 404 page
- [ ] After launch, check Vercel's logs once for repeated 404s (old links to redirect)

### After launch
- [ ] Day 1: check analytics are arriving; check the share preview on Facebook again
- [ ] Before 21 November: post the link with the countdown ("Om N dagar") on Facebook
- [ ] 22 November: add a photo from the signing to the thank-you state
- [ ] Monthly: rerun `tests/qa.mjs` and Lighthouse after any change
