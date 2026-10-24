# Jan Stenborg – author website

A one-page site for author Jan Stenborg (*Stridslarm*, *Jagad*, *Kungablod*). Swedish is the main language, with an English version one click away.
It's plain HTML and CSS with no build step: open `index.html` in a browser to see it, or upload the folder to any web host (for example GitHub Pages).

The full design plan is in [docs/EXPERIENCE.md](docs/EXPERIENCE.md), the art direction for the opening screen in [docs/HERO.md](docs/HERO.md), how everything moves in [docs/MOTION.md](docs/MOTION.md), the creative audit in [docs/AUDIT.md](docs/AUDIT.md), and the launch audit with the **launch checklist** in [docs/LAUNCH.md](docs/LAUNCH.md). `tests/qa.mjs` reruns every check (instructions in LAUNCH.md §3).

**Menu:** on desktop the links sit in the top bar. On phones and small tablets (up to 900px wide), they move into a full-screen chapter menu behind the ☰ button, together with the language switch. Its links are in `index.html` just below the header; keep them in step with the desktop links.

**Books** are a trilogy shelf on every device: three 3D books side by side, each backlit in its own colour (ember, moss, dawn). Choosing one lifts it into its light and shows its details below. It works like tabs: arrow keys move between books. To add a book, add a button in `shelf-books` and a matching panel in `shelf-panels`.

**Blog and FAQ:** the blog lives at `/blogg/` (an index and one folder per article) and the FAQ at `/fragor/`. Their text is kept in `tools/content.py`. To change an article or a question, or to add one, edit that file and run `python3 tools/build_pages.py`, which rewrites the pages. The pages share the site's styles, menu and language switch.

**Section headings** are chapters: a roman numeral, a short label and a headline. Copy an existing `<header class="chapter">` block to add one.

**Motion in short:** anything with `data-reveal` fades up the first time it scrolls into view. Use `data-reveal="title"` on headings and `data-reveal="wipe"` on pictures. Visitors who turn off motion on their device get a still version.

The opening scene (sky, sun, ships, sea) is drawn entirely in code inside the `HERO` section of `index.html` and `styles.css`. The only picture in it is the *Kungablod* cover. The sunrise entrance plays on every page load. After it, the scene keeps a slow life of its own: drifting mist, glinting water, the book floating, and a glint passing over the title every few seconds. All of it stops for visitors who turn off motion on their device.

## Files

| File | What it is |
| --- | --- |
| `index.html` | All the page text and sections, plus the information for Google (in `<head>`) |
| `styles.css` | Look and layout. Colours are at the top |
| `boot.js` | Runs first: picks the language and prepares the entrance (kept as a file for the security policy) |
| `script.js` | Language switch, signing dates, Share button, phone action bar, motion, analytics events |
| `vercel.json` | Hosting settings: security headers and caching |
| `images/` | Each picture comes in three formats (`.avif`, `.webp`, `.jpg`) and several sizes. Browsers pick the smallest that works |
| `fonts/` | Cinzel and EB Garamond (free fonts under the SIL Open Font License), hosted with the site |
| `events/` | Calendar file for the *Add to calendar* button |

## Language

Every piece of text is written twice, side by side:

```html
<span lang="sv">Ny bok</span><span lang="en">New book</span>
```

Change both. Image descriptions work the same way: `alt="..."` is Swedish, `data-alt-en="..."` is English.

The site always opens in Swedish. English shows when a visitor presses **EN**, which is then remembered, or when the address ends in `?lang=en`, useful for sharing with English speakers.

## The signing and its dates

The page changes by itself around the signing:

- **Before 21 November:** the invitation, an "Om 29 dagar" countdown, and an *Add to calendar* button.
- **On the day:** "Idag!", with the map first.
- **After:** a thank-you, and the hero button switches to *Läs om Kungablod*.

To preview the other states, add `?event=today` or `?event=past` to the address.

If the time or place changes, update all three:

1. `data-event-start` / `data-event-end` on `<article class="event">` in `index.html`
2. The `Event` block in the `<script type="application/ld+json">` in `<head>`
3. `events/kungablod-signering.ics` (times are in UTC: 13.00 Stockholm time in November is `120000Z`)

The end time, 15.00, is a guess. Check it with Twang.

Parts of the page marked `data-show="upcoming"`, `"today"` or `"past"` only appear at that time. Use the same marks for future events.

## Adding images

Put the original `.jpg` in `images/`, then make the smaller versions. With Python and Pillow installed:

```bash
python3 -c "from PIL import Image; im=Image.open('images/NAME.jpg'); [im.resize((w, round(im.height*w/im.width))).save(f'images/NAME-{w}.{ext}') for w in (320, 480) for ext in ('avif','webp')]"
```

Then copy one of the existing `<picture>` blocks and change the file names.

## Before going live

- **Web address.** Once the site has a domain, put the full address (`https://...`) in front of `images/share.jpg` in the `og:image` line and in front of the image paths in the Google information block. Facebook and Google need full addresses.
- **Contact email.** Currently `info@stonecastle.se`, taken from the old Stonecastle site. Check it's still in use.
- **Kungablod.** Add the description and shop links in the `<!-- Book: Kungablod -->` block when they exist.

## Previewing

Open `index.html` directly, or run a local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.
