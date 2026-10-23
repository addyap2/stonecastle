# Creative Audit

Reviewed 23 October 2026 at 1440×900 and 375×812, with every section revealed.

## Verdict

**The first screen is a film, the rest is a template.** The hero has a world: light, depth, one idea. Below it, the site turns into a standard dark landing page. Every section opens with the same label, the same short gold rule and the same flat band divided by 1px borders. The story stops being told just as it should deepen: the books, the man, the meeting.

The fix isn't more effects. It's carrying the hero's language (dawn light, inscription, chapters of a saga) through every section, and removing what looks like a default.

---

## Findings, ranked

Impact: how much the change improves the impression. Effort: S (under an hour), M (a few hours), L (a day or more).

| # | Finding | Why it hurts | Change | Impact | Effort | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Every section header is the same generic pattern**: an all-caps gold label ("BÖCKER", "EVENEMANG", "OM JAN", "KONTAKT") with a 64px rule | Navigation words used as headlines say nothing, and the repetition reads as a template. The site has a saga to tell and labels it like a form. | **Chapter system:** a roman numeral and small label (*I · Böckerna*) above an evocative headline in parchment (*En värld av kungar och bärsärkar*). The plain rule becomes an inscription rule with a diamond, like the knotwork on the covers. | Very high | S | ✅ Done |
| 2 | **The signing poster is the event's centrepiece** | It's a busy flyer with small text that is unreadable on a phone, and it repeats everything written beside it. The sunglasses selfie clashes with the studio portrait used elsewhere. It's the most amateur element on the page. | **A typographic invitation card:** a huge "21" in lit gold, *november*, time and place set like an engraved card in a double hairline frame, with the *Kungablod* cover tucked into its corner. The poster itself is shown framed below it: tap for full size, or download it (JPG) to share or print. It hides itself after the signing. | Very high | M | ✅ Done |
| 3 | **Sections are boxes**: alternating flat bands with hard 1px borders | Hard edges break the cinematic continuity the hero sets up. The page feels stacked, not flowing. | Borders removed. Bands fade in and out of the night with soft gradient seams, so the page reads as one continuous scene. | High | S | ✅ Done |
| 4 | **Weak ending**: a small "KONTAKT" heading, one line, and an e-mail address in ALL CAPS inside a gold button | An e-mail in capitals looks like an error. The last screen is the emptiest and least considered one, but it should be the closing chord. | **A finale that answers the opening:** a thin dawn horizon glows across the screen again, *IV · Kontakt* above *Sagan fortsätter*, and the address set large in lowercase italic as an elegant link. The footer gets an ornament and a way back to the top. | High | S | ✅ Done |
| 5 | **The portrait sits in a hard gold-bordered box** beside narrow, small text | A framed photo next to a paragraph is the most generic "about" layout there is. The warm black background of the photo is fighting the frame. | The frame is removed. The portrait dissolves into the night through a soft mask, larger, with the text alongside under the headline *Från pedalboards till långskepp*. | High | S | ✅ Done |
| 6 | **Gold is used for everything**: headings, rules, labels, buttons, badges, links, book titles | When everything is gold, nothing is. Hierarchy flattens and it starts to look like a theme. | Headings move to parchment. Gold is kept for light: numerals, rules, the primary button, the active state. | High | S | ✅ Done |
| 7 | **Only the hero has texture**; everything below is flat digital black | The jump from grain to flat black at the hero's edge is visible, and it makes the lower page feel cheaper. | A faint film grain across the whole page (one fixed layer, opacity only, no blend modes, so it costs nothing to scroll). | Medium | S | ✅ Done |
| 8 | **Ragged lines and widows**: "…Stridslarm och / *Jagad*." in the hero, single words left alone on headings | Small, but it's exactly what separates typeset from typed. | `text-wrap: balance` on headings and `pretty` on paragraphs. | Medium | S | ✅ Done |
| 9 | **The event's buttons wrap badly**: three equal outline buttons, with "Dela" dropping alone to a new line | Equal weight means no hierarchy, and the wrap looks broken. | One gold action (calendar), one outline (map), and share as a quiet text link. | Medium | S | ✅ Done |
| 10 | **Book body text is small for its space** on desktop, inside a very roomy pinned layout | Lots of space and small type reads as empty, not luxurious. | Book titles larger and in parchment, blurbs bigger, meta lines set as small tracked caps. | Medium | S | ✅ Done |
| 11 | **No brand mark.** "JAN STENBORG" in the header is plain set type | Fine, but anonymous. A mark would carry across share images, favicons and printed posters. | A simple monogram (rune-like *JS* in a diamond) for the header, favicon and posters. Best drawn by a designer with Jan, not improvised. | Medium | M | Recommended |
| 12 | **There's no story for *Kungablod* yet**: "Mer om boken kommer snart" | The new book is the hero and the main conversion, but it has no hook. It's the biggest gap in content. | Jan to supply a one-line hook and a blurb (EXPERIENCE.md §11). Put the hook under the hero headline. | Very high | Content | Needs Jan |
| 13 | **Two different photographic worlds**: the studio portrait and the selfie on the poster | Mixed photo quality reads as amateur. | Use only the studio portrait on the site (done, by removing the poster from view). For future posters, use the same portrait or a new shoot in the same light. | Medium | — | ✅ Partly done |
| 14 | **The English site shares one address** with the Swedish one | Google can't index the English version separately. | Separate `/en/` pages with `hreflang` (EXPERIENCE.md Phase 3). | Low (visual) | M | Recommended |
| 15 | **No favicon or tab icon**, and the share image is the poster | The browser tab shows a blank page icon, and shared links show the cluttered flyer. | A favicon from the monogram (#11), and a share image made from the hero scene. | Medium | S | Recommended |

---

## The identity, in one paragraph

**Night turning to dawn, told in chapters, inscribed in gold.** The page is the night, and light (gold) is used sparingly, only where something matters. Headings are inscriptions: a roman numeral, a hairline with a diamond, words in carved capitals. Edges are never hard; everything fades into the dark. The story runs I → IV, the book world, meeting Jan, the man, and *the saga continues*, and the last screen echoes the first one's horizon.
