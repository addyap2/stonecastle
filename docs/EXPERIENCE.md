# Jan Stenborg – Experience Design

The blueprint for Jan Stenborg's author site: what a visitor sees, feels and does from the first screen to the last click.
Written 23 October 2026, 29 days before the *Kungablod* signing.

---

## 1. The idea in one line

**The site is a saga told in chapters.** A visitor arrives at dawn on the shore (the *Kungablod* cover), walks back through fire (*Stridslarm*) and the hunt (*Jagad*), meets the storyteller, and is invited to the gathering: the signing, and then the next book.

Every section is one chapter. Each one opens with a question the previous one raised, so scrolling feels like turning a page.

### What "premium" means here

- **Restraint.** The site is dark, quiet and slow. Gold is used as light, never as decoration. If an effect doesn't serve the story, it goes.
- **Weight.** Motion feels like tide and firelight: slow arrivals, no bounce, no snap.
- **Respect.** Native scrolling that is never hijacked. No autoplay sound, no pop-ups, no cookie wall, no countdown pressure.

---

## 2. Who arrives, and what they need

| Visitor | How they arrive | Their question | What success looks like |
| --- | --- | --- | --- |
| **The local fan** (largest group before 21 Nov) | Facebook post of the signing poster, on a phone, in Swedish | "When and where is it?" | Adds the signing to their calendar or opens the map |
| **The listener** | Finished *Jagad* on Storytel, searches the author's name | "Is there more?" | Clicks through to *Kungablod* (or its pre-order) |
| **The newcomer** | Google, a friend, a bookshop | "What are these books, and where do I start?" | Starts *Stridslarm*: buys it or presses play on Storytel |
| **The professional** (bookshop, library, local press, events) | Direct link or search | "How do I reach him?" | Sends an email |
| **The English-speaking reader** | Shared link or search | "Can I read this?" | Understands the books are in Swedish, follows for news |

Mobile is the default. The first wave of traffic is phones arriving from Facebook, so every decision is checked at 375px first.

---

## 3. Conversion goals

In order of priority. Each one is measured as a tracked click (see §10).

1. **Get to the signing** (until 21 Nov): *Add to calendar*, *Show on map*.
2. **Get *Kungablod*** (once it's on sale): click through to a retailer, or pre-order.
3. **Start the saga**: a *Stridslarm* click to Adlibris, Bokus or Storytel. For newcomers this is the real first purchase.
4. **Keep in touch**: newsletter sign-up, or following on Facebook.
5. **Book Jan**: email for signings, talks, interviews.

One primary action per screen. Supporting actions are visually quieter (outline, never a second gold button side by side).

---

## 4. Page structure at a glance

```
 ┌───────────────────────────────────────────┐
 │  Header (sticky, hides on scroll down)    │
 ├───────────────────────────────────────────┤
 │  0  ARRIVAL ........ Kungablod at dawn    │  → "Where does this come from?"
 │  1  THE SAGA ....... three books, one arc │  → "Who tells it?"
 │  2  HEAR IT ........ the audiobooks       │  ↘ (proof the saga is loved)
 │  3  THE STORYTELLER  Jan                  │  → "Can I meet him?"
 │  4  THE GATHERING .. the signing          │  → "How do I stay close?"
 │  5  FOLLOW THE SAGA  newsletter, contact  │
 ├───────────────────────────────────────────┤
 │  Footer                                   │
 └───────────────────────────────────────────┘
   Mobile: action bar fixed to the bottom after chapter 0
   Desktop: chapter marks on the right edge
```

The current site already has every piece except chapters 2 and 5's newsletter. The work is mostly recomposing, not adding.

---

## 5. Chapter by chapter

Copy is given in Swedish (primary) and English. Lines in **[brackets]** need Jan's input; don't invent plot.

### Chapter 0 — Arrival: *Kungablod*

**Job:** in three seconds, say *new Viking novel, by this author, and you can meet him on 21 November.*

**Composition**
- Desktop: text left (5/12 columns), cover right (5/12), shown as a physical book with a spine and soft shadow, tilted 4° toward the reader. A low horizon line of warm light crosses the full width behind the cover, matching the sunrise in the art.
- Mobile: cover first at 62% of the screen width, title below, the signing card, then one gold button that sits in the thumb zone.
- Full viewport height on desktop (`min-height: 100svh`), but never taller than the content needs on phones. The next chapter's top edge must peek above the fold so people know to scroll.

**Messaging**
| | Swedish | English |
| --- | --- | --- |
| Eyebrow | Ny roman | New novel |
| Title | KUNGABLOD | KUNGABLOD |
| Line | Den nya vikingaromanen från Jan Stenborg. | The new Viking-age novel from Jan Stenborg. |
| Tagline | **[En mening från Jan om bokens kärna]** Draft to react to: *"Blod gör dig till kung. Blod kan kosta dig kronan."* | **[One line from Jan]** Draft: *"Blood makes you king. Blood can cost you the crown."* |
| Signing card | Boksignering · Lör 21 nov · 13.00 · Twang, Katarina bangata 25 | Book signing · Sat 21 Nov · 1 pm · Twang, Katarina bangata 25 |
| Primary button | *Before sale:* Kom på signeringen · *On sale:* Köp Kungablod | Come to the signing · Buy Kungablod |
| Secondary link | Läs om sagan ↓ | Discover the saga ↓ |

**Opening sequence** (plays once per visit; repeat views and reduced-motion users see the final state at once)

| Time | What happens |
| --- | --- |
| 0 ms | Page is near-black. Header is already visible, so nothing feels broken. |
| 0–900 ms | The horizon glow rises from 0 to full brightness, like sunrise. |
| 300–1100 ms | The cover fades in and rises 24px into place. |
| 700–1300 ms | Title fades in while its letter-spacing closes from 0.3em to 0.06em. |
| 1100–1500 ms | Line, signing card and button fade in, 80ms apart. |

Total 1.5s. The cover image must already be loaded (preloaded, §9) so the sequence never waits on the network. Nothing is hidden from search engines or screen readers; it's an opacity effect only.

**While scrolling out:** the cover drifts up a little slower than the page (parallax 0.9×, max 40px) and the horizon glow dims. This is the only parallax on the site.

**Hands off to:** a single line at the bottom edge: *"Kungablod är tredje kapitlet. Sagan börjar i Birka."* / *"Kungablod is the latest chapter. The saga begins in Birka."* **[Confirm with Jan that Kungablod continues Erik's story; if not, this becomes "Fler sagor av Jan Stenborg".]**

---

### Chapter 1 — The saga

**Job:** show that this is a body of work with an arc, and tell newcomers exactly where to start.

**Composition.** The three books as a journey, oldest first, each with its own light:

| Book | Accent | Atmosphere |
| --- | --- | --- |
| *Stridslarm* (2017) | Ember `#b8431f` | Fire on the water |
| *Jagad* (2021) | Moss `#5b6b3f` | Stone, forest, pursuit |
| *Kungablod* (2026) | Dawn `#2f6fa8` | Sea at sunrise |

- **Desktop (≥1024px):** a pinned section. The left half holds the covers stacked like a pile of books; the right half holds the text. As the visitor scrolls, the next book slides up to the front, the text crossfades, and the background tint moves from ember to moss to dawn. Three scroll "beats", about 70% of a screen each. Scroll position always maps directly to progress (no snapping, no auto-advance), so it can't feel hijacked.
- **Tablet and phone:** a horizontal row with scroll snapping, the next cover peeking 15% from the right edge. Swipe, or use arrow buttons. A rune-dot indicator shows 1/3, 2/3, 3/3.
- **No JavaScript / reduced motion:** a plain vertical list of three books (what the site has today).

**Each book shows:** cover, year, one-line hook, the formats (Bok · Ljudbok · E-bok) as small chips, and the shop links as buttons. *Stridslarm* carries a gold **Börja här / Start here** badge.

**Messaging**
| | Swedish | English |
| --- | --- | --- |
| Heading | Sagan om Erik | The saga of Erik |
| Intro | En värld av kungar, hirdmän, bärsärkar och völvor. Tre böcker, en väg. | A world of kings, warriors, berserkers and seeresses. Three books, one road. |
| Stridslarm hook | Erik växer upp i Birka. Styrbjörn blir hans fiende, Gyrid hans kärlek. | Erik grows up in Birka. Styrbjörn becomes his enemy, Gyrid his love. |
| Jagad hook | Dömd på tinget. Jagad av Kåre. Kan han rentvå sitt namn? | Condemned at the Thing. Hunted by Kåre. Can he clear his name? |
| Kungablod hook | **[En mening från Jan]** | **[One line from Jan]** |

**Interaction**
- Covers tilt up to 6° toward the pointer on desktop, with a soft gold edge-light. No tilt on touch.
- Tapping a cover opens a details sheet (bottom sheet on phones, side panel on desktop) with the full blurb and every shop link. Focus moves into the sheet, Esc or swipe-down closes it, focus returns to the cover.
- *Stridslarm* only: about 30 slow ember particles drift up behind the cover while it's on screen. Canvas, paused when off screen, off entirely with reduced motion.

**Hands off to:** *"Över 19 timmar i öronen. Lyssnarna har talat."* / *"Nineteen hours in your ears. Listeners have spoken."*

---

### Chapter 2 — Hear it

**Job:** proof that the books are loved, and an easy door in for people who listen rather than read.

**Composition.** A short, wide band. Not a full chapter, a breath between two.
- The *Jagad* rating as the hero number: **4,3 / 5 · 197 betyg på Storytel** (update this number as it changes).
- Narrated by Sebastian Karlsson · 19 h 35 min.
- One button: *Lyssna på Storytel / Listen on Storytel*.
- **[If the publisher allows: a 60-second sample with a single play button. Never autoplay. The player shows elapsed time, and space or enter toggles it.]**

**Motion:** the rating number counts up once, quickly (600ms), when it first comes into view. Reduced motion shows it immediately.

**Hands off to:** a quiet line, *"Bakom sagan finns en berättare."* / *"Behind the saga is a storyteller."*

---

### Chapter 3 — The storyteller

**Job:** turn "an author" into a person you'd like to meet, which is what makes the signing feel worth the trip.

**Composition**
- The black-background portrait, large and warm, with a faint vignette that dissolves into the page. Text sits beside it on desktop and below it on phones.
- A pull quote in large italic Garamond. **[Needs Jan's own words: why the Viking age, why Erik.]**
- The Stonecastle turn as the human story: fifteen years building pedalboards for musicians in Stockholm, then closing the company to write books. Told in two short paragraphs, not a CV.

**Messaging**
| | Swedish | English |
| --- | --- | --- |
| Heading | Berättaren | The storyteller |
| Subhead | Från pedalboards till långskepp. | From pedalboards to longships. |

**Motion:** the portrait brightens from 70% to 100% as it reaches the middle of the screen, as if someone has turned toward the firelight. Text lines fade up 12px, 60ms apart. Nothing else.

**Hands off to:** *"Vill du träffa honom? Han signerar Kungablod i november."* / *"Want to meet him? He's signing Kungablod in November."*

---

### Chapter 4 — The gathering

**Job:** turn interest into a plan: calendar, route, arrival. This is the main conversion until 21 November.

**Composition**
- The signing poster as an image, framed with the knotwork border used across the site.
- Beside it, the facts in a clear order: **date → time → place → what happens**.
- A small note on how near it is: *"Om 29 dagar"* / *"In 29 days"*. Calm, not a ticking countdown.
- Buttons, in order of importance:
  1. **Lägg till i kalendern / Add to calendar.** Downloads a `.ics` file that opens in Apple, Google and Outlook calendars, with the address and a link back to the site.
  2. *Visa på karta / Show on map.*
  3. *Dela med en vän / Share with a friend* (the phone's own share sheet where available, otherwise copy link).

**The page changes with the date** (handled in the page by comparing today's date with the event date):

| When | What chapter 4 shows |
| --- | --- |
| Until 20 Nov | The invitation as above |
| 21 Nov | "Idag kl. 13.00" / "Today at 1 pm", map first |
| After 21 Nov | A thank-you, a photo from the day **[Jan to supply]**, and where to buy signed copies if any remain. The hero switches from the signing to *Köp Kungablod*. |
| New events added | A simple list, nearest first, with past ones removed automatically |

**Hands off to:** *"Sagan fortsätter. Var först att höra om nästa kapitel."* / *"The saga continues. Be the first to hear about the next chapter."*

---

### Chapter 5 — Follow the saga (final conversion)

**Job:** capture everyone who didn't buy or plan today, so the next book has an audience on day one.

**Composition.** A calm closing scene: the darkest section on the page with one band of dawn light, mirroring the opening.
- **Newsletter:** one email field and one button, *Skicka mig nyheter / Send me news*. One line on what they'll get: *"Bara när det finns något att berätta: nya böcker och signeringar."* / *"Only when there's news: new books and signings."* **[Needs an email service; see §11.]**
- **Follow:** Facebook link **[URL from Jan]**.
- **For bookshops, libraries and press:** *Boka Jan för signering, föredrag eller intervju* → email button. **[Confirm the address; currently info@stonecastle.se.]**
- **English readers:** one honest line: *"The books are currently published in Swedish."*

**After sign-up:** the form is replaced in place by a short confirmation: *"Tack. Vi hörs när sagan fortsätter."* / *"Thank you. We'll be in touch when the saga continues."* No redirect, no pop-up.

---

## 6. Navigation and wayfinding

- **Header:** brand, chapter links, SV/EN switch. It hides when scrolling down past chapter 0 and slides back as soon as the visitor scrolls up (220ms). It always shows when a link inside it has keyboard focus.
- **Chapter marks (desktop):** five small rune-like dots on the right edge, the current one gold. Hover shows the chapter name; click jumps there.
- **Mobile action bar:** appears once the hero's button scrolls out of view, and slides away when chapter 4 or 5 is on screen (those have their own buttons). It holds the single most important action at that moment: *Kom på signeringen* until the event, *Köp Kungablod* after. Height 56px plus the phone's safe-area inset, so it never covers the home bar.
- **Language switch:** keeps the visitor's position on the page. The choice is remembered.
- **Anchor links** scroll smoothly, landing below the header. Smooth scrolling is turned off under reduced motion.

---

## 7. Visual system

**Colour**
| Token | Value | Use |
| --- | --- | --- |
| Night | `#0f0d0b` | Page background |
| Night raised | `#17130f` | Alternating sections, cards |
| Parchment | `#ece3d0` | Body text (contrast 15:1 on Night) |
| Parchment muted | `#b5aa95` | Secondary text (8:1) |
| Gold | `#c9a45c` | Headings, primary buttons, focus rings (8:1) |
| Ember / Moss / Dawn | see chapter 1 | Each book's chapter tint, used as low-opacity light, never as text colour |

**Type**
- *Cinzel* for headings and labels: inscriptional, like letters cut in stone.
- *EB Garamond* for reading: literary, warm, made for long text.
- Body 20px on desktop, 19px on phones, line height 1.6, line length 60–68 characters.
- Two families, three weights in total.

**Ornament.** The knotwork from the poster and the *Kungablod* cover is redrawn once as a thin SVG line. It's used in two places only: as a divider between chapters, and as a frame around the event poster. Too much of it would look like a theme park.

**Texture.** A very faint film-grain layer over the whole page (2–3% opacity, a single tiny tiled image) and a soft vignette on the hero. Together they stop the dark from feeling like an empty screen.

**Books as objects.** Covers are shown as physical books: a thin spine edge, a shadow that grounds them, and a slight sheen. This is CSS only, with no extra images.

---

## 8. Motion language

**Principles**
1. Motion explains, it doesn't decorate. Every animation either shows that something arrived or links two things together.
2. Slow in, slow out. The standard curve is `cubic-bezier(.2, .7, .1, 1)`. Reveals take 600–900ms, interface responses (buttons, menus) 160–220ms.
3. Each element moves once. Reveals play the first time something comes into view and never repeat.
4. Only `transform` and `opacity` change, so motion stays smooth on cheap phones.

**Inventory**
| Moment | Motion | Duration |
| --- | --- | --- |
| Opening sequence | Sunrise glow, cover rise, title tracking (§5.0) | 1.5s, once per visit |
| Section reveal | Fade up 16px, children staggered 60ms | 700ms |
| Chapter divider | Knotwork line draws itself left to right | 1.2s |
| Saga beats (desktop) | Book slides forward, text crossfade, background tint shift | Follows the scroll |
| Cover hover | Tilt up to 6°, edge light | 220ms |
| Ember particles | Slow drift upward | Continuous while visible |
| Rating count-up | 0 to 4,3 | 600ms |
| Buttons | Gold brightens, 1px lift | 160ms |
| Details sheet | Slides up (phone) / in (desktop), page dims to 60% | 320ms in, 220ms out |
| Header hide/show | Slides up/down | 220ms |

**Reduced motion.** When the visitor's device asks for less motion, all of the above becomes either nothing or a plain 150ms fade. There is no parallax, no particles, no pinned saga (it becomes the vertical list) and no smooth scrolling.

---

## 9. Responsive, accessible, fast

### Breakpoints
| Width | Layout |
| --- | --- |
| < 640 | One column. Saga as a swipe row. Bottom action bar. |
| 640–1023 | Two-column book details and event. Saga still a swipe row. |
| ≥ 1024 | Full composition: pinned saga, chapter marks, hover effects. |
| ≥ 1440 | Content capped at 1200px. Atmosphere (glow, grain) extends to the edges. |

### Accessibility (target: WCAG 2.2 AA)
- **Alt text in both languages.** Today the image descriptions are in Swedish only, even in English mode. Each image needs both, swapped by the language switch.
- **Touch targets at least 44×44px.** The current shop-link buttons are about 38px tall.
- Every animated part has a still equivalent. Nothing important is hidden behind motion or hover.
- The saga row works with the keyboard (arrow keys move between books) and announces "Bok 2 av 3".
- The details sheet traps focus while open and returns it when closed.
- Visible gold focus ring on every interactive element.
- The page language changes with the switch (already in place), so screen readers pronounce each language correctly.
- The newsletter form has a visible label, and its error message is announced.

### Performance budget
| Measure | Target | How |
| --- | --- | --- |
| Largest image on screen shown (LCP) | < 2.0s on 4G | Hero cover in AVIF/WebP at 3 sizes (~40KB on phones, from 136KB today), preloaded |
| Layout shift (CLS) | 0 | Width and height on every image (already done) |
| First load | < 500KB | The 376KB poster and later covers load only when near the screen, in modern formats |
| JavaScript | < 15KB, no framework | Small modules: language, reveals, saga, sheet, event dates |
| Fonts | 2 files preloaded, Latin subset only | Self-hosted, `font-display: swap` |
| Animation | 60fps on a mid-range phone | `transform`/`opacity` only; particles paused off screen |

---

## 10. Search, sharing and measurement

- **One address per language.** Today Swedish and English share one URL, so Google only ever sees one. Serve English at `/en/`, linked with `hreflang`. The switch then moves between the two addresses.
- **Structured data** so Google can show rich results:
  - `Person` for Jan, with `sameAs` links to Bokus, Storytel and Facebook.
  - `Book` for each title, with ISBNs where known (*Stridslarm* 9789163748806; *Jagad* audiobook 9789189736337).
  - `Event` for the signing, so it can appear in Google's event listings for "boksignering Stockholm".
- **Share previews** per language, using the poster crop already in `images/share.jpg`.
- **Measurement** with a cookie-free analytics service (for example Plausible), so no consent banner is needed. Tracked events: *calendar added, map opened, retailer clicked (per book and shop), Storytel clicked, newsletter joined, email clicked, language switched*.
- **Poster QR code.** Any printed poster at Twang links to the site with a tag (`?utm_source=poster`), so its effect can be counted.

---

## 11. What's needed from Jan

1. A one-line hook for *Kungablod*, plus a short blurb.
2. Whether *Kungablod* continues Erik's story (this decides the saga framing).
3. Release date, publisher, price, and where it's sold or can be pre-ordered.
4. A personal quote or two for chapter 3.
5. His Facebook URL and the email address to use.
6. Whether he wants a newsletter (if yes: a free tier of Buttondown or MailerLite is enough).
7. Photos from the signing, afterwards.
8. If possible, permission to use a short audiobook sample.

---

## 12. Build order

**Phase 1 — before the signing (high value, small effort)**
- Add-to-calendar file, share button, date-aware event chapter
- Mobile bottom action bar
- `Event`, `Book` and `Person` structured data
- Image compression and modern formats, hero preload, self-hosted fonts
- Alt text in both languages, larger touch targets

**Phase 2 — the cinematic layer**
- Opening sequence and hero parallax
- The saga chapter: pinned on desktop, swipe row on phones, per-book light
- Knotwork dividers, grain, books-as-objects styling, details sheet
- The listening band (chapter 2)

**Phase 3 — growth**
- Separate `/en/` pages with `hreflang`
- Newsletter and the closing chapter
- Cookie-free analytics and the poster QR tag
- Post-launch: swap the hero to *Köp Kungablod* once shop links exist
