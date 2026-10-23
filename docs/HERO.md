# Hero – Art Direction

The first screen of Jan Stenborg's site. Goal: in three seconds a visitor feels the saga, knows a new book exists, and sees how to meet the author.

---

## Concept: *Gryning över flottan* — Dawn over the fleet

The *Kungablod* cover shows a warrior on the shore watching the sun rise over the sea, with longships on the horizon. The hero **steps inside that picture**: the whole screen becomes the same shore at dawn, and the book itself rises out of the sea like the sun.

- **The sun stands directly behind the book**, so the cover is backlit with a halo of rim light. Light is the idea: a new chapter rising.
- **The fleet** from the cover sails slowly along the horizon. It's the one moving thing in the background, and it's small, quiet and almost subliminal.
- **The sea** reflects both the sun (a shimmering path of light) and the book (a faint mirror image under it).

It's original because the hero doesn't *show* the cover, it *continues* it. The screen and the book share one horizon and one light source.

---

## Composition

**Desktop (≥ 821px)**
```
┌──────────────────────────────────────────────────────────┐
│  JAN STENBORG                         Böcker … [SV|EN]   │
│                                                          │
│  JAN STENBORG · NY ROMAN                ┌───────┐        │
│                                     ░░░ │       │ ░░░    │ ← halo (sun behind book)
│  KUNGABLOD                         ░░░░ │ cover │ ░░░░   │
│                                         │  3D   │        │
│  Den nya vikingaromanen från …   ⛵ ⛵ ══╪═══════╪══ ⛵ ══ │ ← horizon at 62%
│                                         └───────┘        │
│  [Kom på signeringen]  Utforska böckerna  ▒reflection▒   │
│  ─ Boksignering · lör 21 nov · 13.00 · Twang          ║  │ ← light path on water
│                         ˅ scrolla                     ║  │
└──────────────────────────────────────────────────────────┘
```
- Text on the left five columns, book on the right. The horizon crosses the full width at 62% of the height, behind the lower third of the book.
- Height: the full screen, capped at 920px so it never feels empty on tall monitors.

**Phone**
- The book is centred at the top (220px wide) with the sun and horizon behind it, and its reflection fading into the sea.
- Title, line and buttons follow below. The primary button sits in the thumb zone within the first screen.

---

## Typography

| Element | Treatment |
| --- | --- |
| Eyebrow | `JAN STENBORG · NY ROMAN`, Cinzel 500, 0.28em tracking, gold, small. The author's name comes first, because readers buy authors. |
| Headline | `KUNGABLOD`, Cinzel 700, `clamp(2.4rem, 8.5vw, 4.9rem)`, 0.05em tracking. Filled with a **lit-gold gradient** (dark bronze → pale gold → bronze), as if the sunrise is catching carved metal. The light sweeps across it once on entrance. Falls back to plain gold where gradient text isn't supported. |
| Subheadline | EB Garamond, 1.45rem: *"Den nya vikingaromanen från författaren bakom Stridslarm och Jagad."* Factual and short. A tagline will join it once Jan writes one (see EXPERIENCE.md §5). |
| Inscription | `Boksignering · lör 21 nov · 13.00 · Twang, Katarina bangata 25`, set after a short gold rule, like an inscription. It replaces the boxed card: the same information, more elegant. |

---

## Imagery, lighting and atmosphere

All of the scene is drawn with code. **No new image is downloaded**; the only picture is the cover, which already loads first.

| Layer (back → front) | How it's made | Purpose |
| --- | --- | --- |
| Sky | Gradient: night at the top → deep blue → warm amber at the horizon | Night giving way to day |
| Horizon glow | Wide warm radial gradient centred on the sun | The light source |
| Sun | Soft disc, half below the horizon, breathing gently (8s cycle) | Sits right behind the book, so the book is backlit |
| Fleet | 5 inline SVG longship silhouettes, about 1KB | Echoes the ships on the cover, drifting very slowly |
| Sea | Gradient from blue-black to the page colour | Grounds the scene and blends into the next section |
| Light path | Vertical band of gold with a fine moving shimmer | The sun's reflection, and the one sparkle of motion |
| Book | The cover with a CSS spine, page edges, rim light and a pointer-following glare | The hero object |
| Reflection | A mirrored, fading copy of the book on the water (Chrome and Safari) | Ties the book into the scene |
| Grain | SVG noise at 6% | Removes the "digital flat" look and adds film |
| Vignette | Darkened corners | Pulls the eye to the book and the title |

**Palette:** night `#07080c`, deep sea blue `#14263b`, horizon amber `#d79a52`, sun `#ffe3a6`, gold `#c9a45c`. They all come from the cover, and the scene fades into the site's page colour `#0f0d0b` at the bottom.

---

## The 3D book

- A real three-dimensional object built from the cover, a spine 30px deep, and pale page edges. It's turned 24° so the spine catches the light.
- **Pointer tilt (desktop):** the book turns up to ±8° toward the cursor, and a soft glare slides across the cover opposite the light. It eases back when the pointer leaves.
- **Touch:** no tilt (it can't be done well with a finger). The book holds a slow, faint float of 6px over 7 seconds.
- The halo behind it pulses with the sun.

---

## Entrance (plays on every page load)

| Time | Movement |
| --- | --- |
| 0.0s | Night. The header and the text area already exist (no blank screen, no layout jump). |
| 0.0–1.4s | **Sunrise:** the horizon glow brightens and the sun rises 40px into place. |
| 0.3–1.5s | The light path opens on the water and the fleet fades in. |
| 0.5–1.6s | **The book rises** 60px out of the sea, from slightly turned away, settling at its 24° angle. |
| 0.9–1.8s | Eyebrow, then headline: letter-spacing closes from 0.35em to 0.05em while the gold sweep passes across. |
| 1.3–2.2s | Subheadline, buttons and inscription fade up, 100ms apart. |

Motion curve: `cubic-bezier(.16, .84, .24, 1)`. Long, decelerating, no bounce.
A visitor who has already seen it this visit (or who reloads) gets the finished scene instantly.

**Ambient motion after the entrance** (it loops, pauses when the hero is scrolled off screen, and is off for reduced motion):
- **Mist:** two layers drift slowly across the horizon (14s and 19s).
- **Water:** glints on the light path pulse gently (6s).
- **The book:** floats and sways slightly (8s, ±10px, ±0.6°). On computers it also tilts toward the mouse.
- **Light on the book:** a band of light crosses the cover every 10 seconds.
- **The title:** a glint passes along the letters of *Kungablod* every 11 seconds.

**Desktop height:** the hero takes 88% of the screen height (capped at 810px), so the first chapter peeks into view. It fades into the page at the bottom.

---

## Scroll behaviour

Native scroll, never hijacked. As the hero scrolls away, the layers separate in depth (parallax, transform only):

| Layer | Moves with scroll |
| --- | --- |
| Sky and sun | 25% slower than the page (feels far away) |
| Fleet | 15% slower |
| Book | 15% faster, and turns a further 6° (feels near) |
| Text | Fades out and drifts up 30px |

A small *"Scrolla"* cue with a falling line sits at the bottom centre on desktop. It fades as soon as scrolling starts.

---

## Calls to action

| | Swedish | English | Goes to |
| --- | --- | --- | --- |
| Primary (gold) | Kom på signeringen | Come to the signing | Events section (calendar, map) |
| Secondary (text link with arrow) | Utforska böckerna → | Explore the books → | Books section |
| After 21 Nov | Läs om Kungablod | About Kungablod | Books section |
| Once on sale | Köp Kungablod | Buy Kungablod | Retailer |

There's one gold button only. The secondary action is a quiet text link, so nothing competes with the primary choice.

---

## Usability and speed guardrails

- **Nothing important is animated in or hidden behind motion.** The headline is real text, readable by Google and screen readers from the first moment.
- **Reduced motion:** no entrance, tilt, parallax, shimmer, fleet drift or sun breathing. The scene is shown still and complete.
- All decoration is marked as decorative, so screen readers skip it.
- **Weight added:** about 6KB of CSS and JS, and 0 images. The largest content is still the 38KB cover.
- Motion uses only `transform` and `opacity`. Scroll and tilt work pause when the hero is off screen.
- Text contrast on the darkest part of the scene: subheadline 14:1, gold eyebrow 8:1.
