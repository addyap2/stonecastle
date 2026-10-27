# Private book readers

Translations of *Stridslarm* can be read in the browser, like a book, by anyone who has the link:
*Erik of Birka: The Clash of Arms* (English, `/read/…`), *Fracas des armes* (French, `/lire/…`),
and *Schlachtenlärm* (German, `/lesen/…`).
They are not linked from the site, not in the sitemap, and every response tells search engines not to index it.

## Where things are

| | |
| --- | --- |
| Reader page | `reader/book.html`, `reader/reader.css`, `reader/reader.js` (served for `/read/<slug>`, `/lire/<slug>` and `/lesen/<slug>` by `vercel.json`) |
| Book data | `books/*.bin`: each book encrypted (AES-256-GCM); the file name is a hash of its link, so the repo never reveals the links |
| Decryption | `api/book.js`, one chapter per request. The key is the Vercel setting `READER_KEY` (Production and Preview) |
| Links and key | `../stonecastle-private/reader.json`, **outside this repository**, which is public. Keep a copy somewhere safe |
| Build | `python3 tools/build_reader.py` (needs node and macOS `sips`) |

## Changing a book

Replace the EPUB at the path in `reader.json`, run `python3 tools/build_reader.py`, commit `books/` and push.
The build drops a shop's purchase watermark (`wm_text`) found in the French source and shrinks the images.

## Turning a link off or changing it

Change that book's `slug` in `reader.json`, rebuild, commit and push: the old link stops working.
To shut all readers off at once, change `key` in `reader.json` and `READER_KEY` on Vercel to the same new value, then rebuild.

## What "not downloadable" means here

There is no EPUB or file to download: the text arrives a chapter at a time and is drawn as pages. Right-click,
selecting, copying, saving and printing are blocked. Someone determined could still photograph the screen or read
the page's network traffic, so share the links only with people you trust.
