# Jan Stenborg – author website

A one-page site in Swedish and English for author Jan Stenborg (*Stridslarm*, *Jagad*, *Kungablod*).
It's plain HTML and CSS with no build step: open `index.html` in a browser to see it, or upload the folder to any web host (for example GitHub Pages).

## Files

| File | What it is |
| --- | --- |
| `index.html` | All the page text and sections |
| `styles.css` | Look and layout. Colours and fonts are at the top |
| `script.js` | The SV / EN language switch |
| `images/` | Book covers, portrait, signing poster, `share.jpg` (the preview image when the link is shared) |

## Editing text

Every piece of text is written twice, side by side:

```html
<span lang="sv">Ny bok</span><span lang="en">New book</span>
```

Change both versions. The page shows the language the visitor picks and remembers it. Swedish is the default, and English is shown when the visitor's browser is set to English. `?lang=en` or `?lang=sv` on the end of the address forces a language.

## Common updates

- **Kungablod description and shop links.** Find the `<!-- Book: Kungablod -->` block. Replace the "coming soon" text and add a `<ul class="buy">` list, copied from the Jagad block.
- **A new event.** In the `EVENTS` section, copy the `<article class="event">` block and change the date, place and image. Delete events once they're over, and update the signing card in the hero at the top.
- **A new book.** Copy one `<article class="book">` block, add its cover to `images/`, and put the newest book first.
- **About text.** The `ABOUT` section has two short paragraphs written from public information. Replace them with Jan's own words when you have them.
- **Contact email.** Currently `info@stonecastle.se`, taken from the old Stonecastle site. Check it's still in use.

## Previewing

Open `index.html` directly, or run a local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.
