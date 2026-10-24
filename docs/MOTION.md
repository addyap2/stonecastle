# Motion System

How everything on Jan Stenborg's site moves, and why. It's implemented in `styles.css` (the *Motion* sections) and `script.js` (the *Motion* block). The opening scene's own choreography is in [HERO.md](HERO.md).

---

## 1. Principles

1. **Light rises.** The site's story is dawn: the *Kungablod* sunrise. Things arrive *upward*, out of darkness, the way light comes over a horizon. Nothing slides in sideways, spins or bounces.
2. **Motion is the story's punctuation, not its voice.** An animation either shows that something arrived, connects two things, or answers an action. If it does none of these, it's removed.
3. **Once.** A reveal plays the first time something comes into view, and never again on the way back up. Re-animating content the reader has already seen is noise.
4. **The reader is in charge.** Scrolling is never hijacked, slowed or snapped. Nothing moves by itself as the reader scrolls past, except the hero's depth.
5. **Cheap to run.** Only `transform`, `opacity` and `clip-path` are animated. No layout properties are touched, and there are no scroll handlers except one shared, throttled one.
6. **Still is a first-class version.** With reduced motion turned on, the site is complete and beautiful, just still.

---

## 2. Tokens

Defined once on `:root` in `styles.css`. Every animation uses these and nothing else.

### Durations
| Token | Value | Use |
| --- | --- | --- |
| `--dur-instant` | 90ms | Press feedback |
| `--dur-quick` | 160ms | Colour and hover changes |
| `--dur-ui` | 240ms | Header, indicators, small UI |
| `--dur-reveal` | 800ms | Content arriving on scroll |
| `--dur-scene` | 1100ms | Large images and scene changes |

### Easing
| Token | Curve | Character |
| --- | --- | --- |
| `--ease-rise` | `cubic-bezier(.16, .84, .24, 1)` | The house curve. Long, soft landing, like light settling. Used for every arrival. |
| `--ease-ui` | `cubic-bezier(.3, .7, .2, 1)` | Snappier, for interface responses. |
| `--ease-out` | `cubic-bezier(.4, 0, 1, 1)` | Leaving (rare): accelerates away so exits never linger. |

### Distance and stagger
| Token | Value | Use |
| --- | --- | --- |
| `--rise` | 18px | How far content travels as it appears |
| `--stagger` | 70ms | Delay between siblings in a group (max 6 steps, about 0.4s) |

---

## 3. Loading sequence

| Moment | What happens |
| --- | --- |
| **First paint** | The header, layout and real text are drawn at once. Fonts swap in when ready (`font-display: swap`). Nothing waits on JavaScript. |
| **Every page load** | The hero's sunrise entrance (HERO.md), followed by its slow ambient loops. Sections below stay at rest until scrolled to. |
| **Fallback** | Content is hidden for a reveal only after the script has marked the page `motion-ready`. If the script fails, everything is simply visible. |

---

## 4. Reveal vocabulary

Four kinds of reveal, chosen by `data-reveal` in the HTML. Siblings with the same parent stagger automatically.

| `data-reveal` | Motion | Use for |
| --- | --- | --- |
| `up` (default) | Fade in and rise `--rise`, `--dur-reveal`, `--ease-rise` | Text, buttons, cards |
| `title` | Rise, then the gold rule beneath draws left to right (`scaleX` 0→1, 600ms, starts 250ms in) | Section headings |
| `wipe` | The image is uncovered from the bottom up (`clip-path: inset(100% 0 0 0)` → `inset(0)`) while it settles from 1.06 to 1.0 scale, `--dur-scene` | Covers, the poster: light rising over them |
| `light` | Fade in while brightness rises from 55% to 100% | The portrait: Jan turning toward the firelight |

**Trigger:** when 15% of the element is on screen, measured 8% above the bottom edge, so it arrives where the eye already is, not at the very bottom.

```css
.motion-ready [data-reveal] {
  opacity: 0; transform: translateY(var(--rise));
  transition: opacity var(--dur-reveal) var(--ease-rise),
              transform var(--dur-reveal) var(--ease-rise);
  transition-delay: calc(var(--i, 0) * var(--stagger));
}
.motion-ready [data-reveal].is-in { opacity: 1; transform: none; }
```

---

## 5. Section by section

| Section | Arrival | While scrolling | Leaving |
| --- | --- | --- | --- |
| **Hero** | Sunrise sequence (HERO.md) | Layers separate in depth: sky slow, book fast, text fades (desktop) | Fades into the books as the sea darkens to the page colour |
| **Books: the trilogy shelf** | Title draws, intro rises, the shelf rises | Choosing a book (§6): it lifts into its own light, the others step into shadow, the details crossfade | — |
| **Events** | Poster wipes up, details rise in order: date → title → text → place → buttons | — | — |
| **About** | Portrait brightens (`light`), text rises | — | — |
| **Contact** | Title draws, line and button rise | — | — |

**Between sections:** no wipes or curtains. The transition is the light itself: each section's atmosphere (the hero's dawn, the saga's book-coloured glow, the events' darker band) meets the next one in a soft gradient, so the page reads as one continuous night turning to day.

---

## 6. The trilogy shelf (all devices)

The three books stand side by side in reading order, *Stridslarm* → *Jagad* → *Kungablod*, as 3D books on a line of dawn light. Each has its own colour of light behind it: ember, moss and dawn.

| Moment | Motion |
| --- | --- |
| A book is chosen (tap, click, or arrow keys) | It rises 20px, turns towards the reader (22° → 8°) and grows to 1.04, `--ease-rise`, 750ms. Its glow brightens to full over 900ms, and its numeral turns gold with a diamond beneath |
| The other two | Turn back to 22°, settle to 0.9 scale and step into shadow behind a 50% dark veil |
| The details below | Crossfade: the old panel fades out, and the new one rises 10px and fades in 120ms later, over 420ms |
| Hover (mouse only) | A book in shadow lifts 8px and half-lights, as an invitation |

All three detail panels share one grid cell, so the area is always as tall as the longest, and nothing below the shelf moves when switching. It's built as tabs: one Tab stop, arrow keys, Home and End, with screen readers announcing "Stridslarm, bok 1 av 3".
---

## 7. Hover states and micro-interactions

All in `--dur-quick` with `--ease-ui`, unless noted. Hover effects only apply to devices with a real pointer (`@media (hover: hover)`), so phones never get "sticky" hover states.

| Element | Hover | Press | Focus (keyboard) |
| --- | --- | --- | --- |
| **Gold button** | Brightens; a narrow band of light sweeps across once (600ms) | Sinks to 98% scale, `--dur-instant` | 2px gold ring, 3px offset |
| **Outline button** | Gold wash at 12% | 98% scale | Same ring |
| **Text link →** | Arrow moves 4px right | — | Same ring |
| **Nav link** | Gold underline grows from the left, `--dur-ui` | — | Same ring, underline shown |
| **Shop chip** | Border turns gold, faint wash | 98% scale | Same ring |
| **Language switch** | — | A gold pill slides between SV and EN, `--dur-ui`, `--ease-rise` | Same ring |
| **Book cover** (desktop) | Lifts 4px with a deeper shadow | — | — |
| **Hero book** | Turns toward the pointer, glare follows (HERO.md) | — | — |
| **Share** | — | — | The "Länken är kopierad" message fades in and is announced to screen readers |

### Header
Hides upward when the reader scrolls down past the hero (`--dur-ui`) and returns the moment they scroll up even slightly. It always shows at the top of the page, when anything inside it has keyboard focus, and when a menu link is used.

### Phone action bar
Rises from the bottom edge when the hero's button leaves the screen (280ms, `--ease-rise`), and sinks when the events or contact sections arrive.

---

## 8. Reduced motion

When the device asks for less motion (`prefers-reduced-motion: reduce`):

| Off | Kept |
| --- | --- |
| Hero entrance, tilt, parallax, sun, fleet and water loops | The finished scene |
| Reveals (content is simply there) | — |
| Shelf movement | The chosen book and its details still **change**, instantly, so the shelf still works |
| Button sheen, press scale, arrow nudge | Colour changes on hover and focus |
| Header slide | Header still hides and shows, instantly |
| Smooth scrolling for menu links | Jump links |

---

## 9. Performance rules

- Animate `transform`, `opacity` and `clip-path` only. `filter` is used once (the portrait's brightness), as a one-time transition.
- `will-change` is never set permanently. The browser promotes layers while transitions run.
- One passive scroll listener for the whole page (hero depth and header direction), throttled to one update per frame with `requestAnimationFrame`, and doing nothing while the hero is off screen except reading the direction.
- Everything else is `IntersectionObserver`, which costs nothing while idle. Each reveal observer stops watching an element once it has appeared.
- Looping effects pause when off screen.
- Target: 60fps on a mid-range Android phone, and no layout shift from any animation.

---

## 10. Adding motion to new content

- A new paragraph or card: add `data-reveal`.
- A new section heading: `class="section-title" data-reveal="title"`.
- A new image: `data-reveal="wipe"` on its `<picture>`.
- Anything else that moves must use the tokens in §2 and have a still version in §8. If it doesn't fit the vocabulary, it probably shouldn't move.
