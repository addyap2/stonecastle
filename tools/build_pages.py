"""Builds the blog and FAQ pages from tools/content.py.

The site has no build step: the generated HTML is committed like every other page.
Run this only after changing the articles or questions in content.py:

    python3 tools/build_pages.py
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(__file__))
from content import ARTICLES, FAQ, EXCERPT_FOREWORD, EXCERPT_CHAPTER_TITLE, EXCERPT_CHAPTER  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATE_ISO, DATE_SV, DATE_EN = "2026-10-24", "24 oktober 2026", "24 October 2026"
SITE = "https://janstenborg.com"


def esc(s):
    return html.escape(s, quote=True)


def plain(s):
    """Text without tags, for meta descriptions and structured data."""
    out, skip = [], False
    for ch in s:
        if ch == "<": skip = True
        elif ch == ">": skip = False
        elif not skip: out.append(ch)
    return "".join(out)


def bi(sv, en, tag="span"):
    # English stays for visitors who switch, but data-nosnippet keeps it out of Google's results
    return f'<{tag} lang="sv">{sv}</{tag}><{tag} lang="en" data-nosnippet>{en}</{tag}>'


def head(title_sv, title_en, desc, og_type, image, jsonld, path):
    return f'''<!doctype html>
<html lang="sv" data-lang="sv" data-title-sv="{esc(title_sv)}" data-title-en="{esc(title_en)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{esc(title_sv)}</title>
  <meta name="description" content="{esc(desc)}">
  <meta name="theme-color" content="#0f0d0b">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta property="og:type" content="{og_type}">
  <meta property="og:site_name" content="Jan Stenborg">
  <meta property="og:locale" content="sv_SE">
  <meta property="og:title" content="{esc(title_sv)}">
  <meta property="og:description" content="{esc(desc)}">
  <link rel="canonical" href="{SITE}{path}">
  <link rel="alternate" hreflang="sv" href="{SITE}{path}">
  <link rel="alternate" hreflang="x-default" href="{SITE}{path}">
  <meta property="og:url" content="{SITE}{path}">
  <meta property="og:image" content="{SITE}{image}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preload" href="/fonts/cinzel.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/eb-garamond.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/styles.css">
  <script src="/boot.js?v=2"></script>
  <script type="application/ld+json">
{json.dumps(jsonld, ensure_ascii=False, indent=2)}
  </script>
</head>
<body class="subpage">
'''


def header(current):
    def link(href, sv, en, key):
        cur = ' aria-current="page"' if key == current else ""
        return f'      <a href="{href}"{cur}>{bi(sv, en)}</a>'
    def mlink(href, sv, en, key, i, num=None):
        cur = ' aria-current="page"' if key == current else ""
        n = f'<span class="menu-num">{num}</span>' if num else '<span class="menu-num" aria-hidden="true">·</span>'
        return f'      <li style="--i:{i}"><a href="{href}"{cur}>{n}{bi(sv, en)}</a></li>'
    return f'''<a class="skip" href="#main">{bi("Hoppa till innehållet", "Skip to content")}</a>

<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/">Jan Stenborg</a>
    <nav class="nav" aria-label="Meny" data-label-en="Menu">
{link("/#bocker", "Böcker", "Books", "books")}
{link("/#evenemang", "Evenemang", "Events", "events")}
{link("/#om", "Om Jan", "About", "about")}
{link("/blogg/", "Blogg", "Blog", "blog")}
{link("/fragor/", "Frågor", "FAQ", "faq")}
{link("/#kontakt", "Kontakt", "Contact", "contact")}
    </nav>
    <div class="lang-switch" role="group" aria-label="Språk / Language">
      <button type="button" data-set-lang="sv" aria-pressed="true">SV</button>
      <button type="button" data-set-lang="en" aria-pressed="false">EN</button>
    </div>
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-menu" data-menu-toggle>
      <span class="menu-icon" aria-hidden="true"></span>
      <span class="visually-hidden">{bi("Meny", "Menu")}</span>
    </button>
  </div>
</header>

<div class="menu-panel" id="site-menu" data-menu>
  <div class="menu-glow" aria-hidden="true"></div>
  <nav class="wrap menu-inner" aria-label="Meny" data-label-en="Menu">
    <ol class="menu-list">
{mlink("/#bocker", "Böckerna", "The books", "books", 0, "I")}
{mlink("/#evenemang", "Evenemang", "Events", "events", 1, "II")}
{mlink("/#om", "Om Jan", "About Jan", "about", 2, "III")}
{mlink("/#kontakt", "Kontakt", "Contact", "contact", 3, "IV")}
    </ol>
    <ul class="menu-list menu-more">
{mlink("/blogg/", "Blogg", "Blog", "blog", 4)}
{mlink("/fragor/", "Vanliga frågor", "FAQ", "faq", 5)}
    </ul>
    <div class="menu-foot" style="--i:6">
      <a class="btn btn-gold" href="/#evenemang" data-track="Menu: signing">{bi("Kom på signeringen", "Come to the signing")}</a>
      <div class="lang-switch" role="group" aria-label="Språk / Language">
        <button type="button" data-set-lang="sv" aria-pressed="true">SV</button>
        <button type="button" data-set-lang="en" aria-pressed="false">EN</button>
      </div>
    </div>
  </nav>
</div>
'''


FOOTER = f'''
<footer class="site-footer">
  <div class="wrap footer-inner">
    <span class="footer-mark" aria-hidden="true"></span>
    <p>© <span id="year">2026</span> Jan Stenborg</p>
    <nav class="footer-links" aria-label="Mer" data-label-en="More">
      <a href="/blogg/">{bi("Blogg", "Blog")}</a>
      <a href="/fragor/">{bi("Vanliga frågor", "FAQ")}</a>
      <a href="https://www.facebook.com/Stridslarm.Bok" target="_blank" rel="noopener" data-track="Facebook">Facebook</a>
    </nav>
  </div>
</footer>

<script src="/script.js"></script>
</body>
</html>
'''


def picture(base, sizes, w, h, alt_sv="", alt_en="", cls=""):
    alt = f' alt="{esc(alt_sv)}"' + (f' data-alt-en="{esc(alt_en)}"' if alt_en else "")
    srcset = lambda ext: ", ".join(f"/images/{base}-{s}.{ext} {s}w" for s in sizes)
    c = f' class="{cls}"' if cls else ""
    return (f'<picture{c}><source type="image/avif" srcset="{srcset("avif")}" sizes="(max-width: 700px) 92vw, 680px">'
            f'<source type="image/webp" srcset="{srcset("webp")}" sizes="(max-width: 700px) 92vw, 680px">'
            f'<img src="/images/{base}.jpg" width="{w}" height="{h}" loading="lazy"{alt}></picture>')


def visual(kind, small=False):
    """The picture that heads an article (and its card). Drawn in code where no photo exists yet."""
    if kind == "covers":
        covers = [("stridslarm", "360", 919, 1400), ("jagad", "240", 362, 552), ("kungablod", "320", 628, 938)]
        imgs = "".join(
            f'<picture><source type="image/avif" srcset="/images/{b}-{s}.avif"><source type="image/webp" srcset="/images/{b}-{s}.webp">'
            f'<img src="/images/{b}.jpg" width="{w}" height="{h}" loading="lazy" alt=""></picture>' for b, s, w, h in covers)
        return f'<div class="post-visual post-covers" role="img" aria-label="Omslagen till Stridslarm, Jagad och Kungablod" data-label-en="The covers of Stridslarm, Jagad and Kungablod">{imgs}</div>'
    if kind == "portrait":
        return (f'<div class="post-visual post-portrait">'
                f'{picture("jan-stenborg", ["388"], 388, 515, "Porträtt av Jan Stenborg", "Portrait of Jan Stenborg")}</div>')
    if kind == "sea":
        return ('<div class="post-visual post-scene post-sea" aria-hidden="true"><span class="ps-sky"></span><span class="ps-sun"></span>'
                '<span class="ps-sea"></span><span class="ps-path"></span></div>')
    if kind == "emblem":   # the carved-stone knotwork from Stridslarm
        size = "96" if small else "240"
        return ('<div class="post-visual post-scene post-plate" aria-hidden="true">'
                f'<picture class="plate-emblem"><source type="image/avif" srcset="/images/emblem-stone-{size}.avif 1x, /images/emblem-stone-480.avif 2x">'
                f'<source type="image/webp" srcset="/images/emblem-stone-{size}.webp 1x, /images/emblem-stone-480.webp 2x">'
                '<img src="/images/emblem-stone.jpg" width="480" height="659" loading="lazy" alt=""></picture>'
                '<span class="plate-name">Stonecastle</span><span class="plate-sub"><span lang="sv">Pedalboards · Böcker</span><span lang="en" data-nosnippet>Pedalboards · Books</span></span></div>')
    if kind == "knife":
        return ('<div class="post-visual post-knife">'
                '<picture><source type="image/avif" srcset="/images/stridslarm-kniven-770.avif"><source type="image/webp" srcset="/images/stridslarm-kniven-770.webp">'
                '<img src="/images/stridslarm-kniven.jpg" width="770" height="285" loading="lazy" alt="En dolk i förgrunden och ett långskepp i solnedgången över havet" '
                'data-alt-en="A dagger in the foreground and a longship at sunset over the sea"></picture></div>')
    return ""


def person():
    return {"@type": "Person", "name": "Jan Stenborg", "jobTitle": "Författare", "url": SITE + "/"}


def write(path, text):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(text)
    print("wrote", path)


def article_page(a, others):
    t_sv, t_en = a["title"]
    l_sv, l_en = a["lead"]
    tag_sv, tag_en = a["tag"]
    desc = plain(l_sv)
    image = {"covers": "/images/share.jpg", "portrait": "/images/jan-stenborg.jpg"}.get(a["image"], "/images/share.jpg")
    ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": t_sv, "description": desc,
          "datePublished": DATE_ISO, "inLanguage": "sv", "author": person(), "image": SITE + image,
          "url": f"{SITE}/blogg/{a['slug']}/", "mainEntityOfPage": f"{SITE}/blogg/{a['slug']}/"}
    body = []
    for block in a["body"]:
        kind = block[0]
        if kind == "h2":
            body.append(f'        <h2 data-reveal>{bi(block[1], block[2])}</h2>')
        elif kind == "quote":
            _, sv, en, c_sv, c_en = block
            body.append(f'        <figure class="post-quote" data-reveal><blockquote><p>{bi(sv, en)}</p></blockquote>'
                        f'<figcaption>{bi(c_sv, c_en)}</figcaption></figure>')
        elif kind == "figure":
            _, image, c_sv, c_en = block
            body.append(f'        <figure class="post-figure" data-reveal>{visual(image)}<figcaption>{bi(c_sv, c_en)}</figcaption></figure>')
        else:
            body.append(f'        <p data-reveal>{bi(block[1], block[2])}</p>')
    more = "\n".join(card(o, small=True) for o in others)
    return (head(f"{t_sv} – Jan Stenborg", f"{t_en} – Jan Stenborg", desc, "article", image, ld, f"/blogg/{a['slug']}/") + header("blog") + f'''
<main id="main">
  <article class="post">
    <div class="wrap post-wrap">
      <a class="text-link post-back" href="/blogg/"><span class="text-link-arrow" aria-hidden="true">←</span> {bi("Alla berättelser", "All stories")}</a>
      <header class="post-head" data-reveal="title">
        <p class="chapter-mark"><span class="chapter-rule" aria-hidden="true"></span>{bi(tag_sv, tag_en)}</p>
        <h1 class="post-title">{bi(t_sv, t_en)}</h1>
        <p class="post-meta">{bi(DATE_SV, DATE_EN)} · {bi(f"{a['minutes']} min läsning", f"{a['minutes']} min read")}</p>
      </header>
      <p class="post-lead" data-reveal>{bi(l_sv, l_en)}</p>
    </div>
    <div class="wrap post-visual-wrap" data-reveal>{visual(a["image"])}</div>
    <div class="wrap post-wrap post-body">
{chr(10).join(body)}
      <footer class="post-foot" data-reveal>
        <picture class="post-seal" aria-hidden="true"><source type="image/avif" srcset="/images/emblem-stone-96.avif 1x, /images/emblem-stone-240.avif 2x"><source type="image/webp" srcset="/images/emblem-stone-96.webp 1x, /images/emblem-stone-240.webp 2x"><img src="/images/emblem-stone.jpg" width="96" height="132" loading="lazy" alt=""></picture>
        <div class="actions">
          <a class="btn btn-gold" href="/#bocker">{bi("Se böckerna", "See the books")}</a>
          <a class="btn btn-ghost" href="/#evenemang">{bi("Om signeringen", "About the signing")}</a>
        </div>
      </footer>
    </div>
  </article>

  <section class="section section-dark more-stories">
    <div class="wrap">
      <header class="chapter" data-reveal="title">
        <p class="chapter-mark"><span class="chapter-rule" aria-hidden="true"></span>{bi("Bloggen", "The blog")}</p>
        <h2 class="chapter-title">{bi("Fler berättelser", "More stories")}</h2>
      </header>
      <div class="story-grid">
{more}
      </div>
    </div>
  </section>
</main>
''' + FOOTER)


def card(a, small=False, level=3):
    t_sv, t_en = a["title"]
    l_sv, l_en = a["lead"]
    tag_sv, tag_en = a["tag"]
    return f'''        <article class="story-card" data-reveal>
          <a class="story-link" href="/blogg/{a["slug"]}/">
            <div class="story-visual">{visual(a["image"], small=True)}</div>
            <div class="story-text">
              <p class="story-tag">{bi(tag_sv, tag_en)} · {bi(f"{a['minutes']} min", f"{a['minutes']} min")}</p>
              <h{level} class="story-title">{bi(t_sv, t_en)}</h{level}>
              <p>{bi(l_sv, l_en)}</p>
              <span class="text-link">{bi("Läs berättelsen", "Read the story")} <span class="text-link-arrow" aria-hidden="true">→</span></span>
            </div>
          </a>
        </article>'''


def blog_index():
    ld = {"@context": "https://schema.org", "@type": "Blog", "name": "Jan Stenborg – Blogg", "inLanguage": "sv", "author": person(),
          "blogPost": [{"@type": "BlogPosting", "headline": a["title"][0], "datePublished": DATE_ISO, "url": f"{SITE}/blogg/{a['slug']}/"} for a in ARTICLES], "url": SITE + "/blogg/"}
    cards = "\n".join(card(a, level=2) for a in ARTICLES)   # cards sit right under the page title
    return (head("Blogg – Jan Stenborg", "Blog – Jan Stenborg",
                 "Berättelser om hur Jan Stenborgs vikingaromaner kom till, om författaren, livet på Franska rivieran och åren med Stonecastle.",
                 "website", "/images/share.jpg", ld, "/blogg/") + header("blog") + f'''
<main id="main">
  <section class="section blog-index">
    <div class="wrap">
      <header class="chapter" data-reveal="title">
        <p class="chapter-mark"><span class="chapter-rule" aria-hidden="true"></span>{bi("Bloggen", "The blog")}</p>
        <h1 class="chapter-title">{bi("Berättelser bakom böckerna", "Stories behind the books")}</h1>
      </header>
      <p class="section-intro" data-reveal>{bi("Om hur sagan om Erik kom till, om mannen som skriver den, om livet på Franska rivieran och om åren då han byggde pedalboards.", "How the saga of Erik came about, the man who writes it, life on the French Riviera, and the years he spent building pedalboards.")}</p>
      <div class="story-grid">
{cards}
      </div>
    </div>
  </section>
</main>
''' + FOOTER)


def faq_page():
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": "sv",
          "mainEntity": [{"@type": "Question", "name": q_sv, "acceptedAnswer": {"@type": "Answer", "text": plain(a_sv)}} for q_sv, q_en, a_sv, a_en in FAQ]}
    mail = '<a href="mailto:info@stonecastle.se">'
    intro = bi("Om böckerna, researchen bakom dem och hur du träffar Jan. Hittar du inte svaret? " + mail + "Skriv till Jan</a>.",
               "About the books, the research behind them and how to meet Jan. Can't find your answer? " + mail + "Write to Jan</a>.")
    items = "\n".join(f'''        <details class="faq-item" data-reveal{" open" if i == 0 else ""}>
          <summary><span class="faq-q">{bi(q_sv, q_en)}</span><span class="faq-icon" aria-hidden="true"></span></summary>
          <div class="faq-a"><p>{bi(a_sv, a_en)}</p></div>
        </details>''' for i, (q_sv, q_en, a_sv, a_en) in enumerate(FAQ))
    return (head("Vanliga frågor – Jan Stenborg", "FAQ – Jan Stenborg",
                 "Svar på vanliga frågor om Jan Stenborgs vikingaromaner: var du köper dem, i vilken ordning du läser dem, researchen, faktagranskningen och signeringar.",
                 "website", "/images/share.jpg", ld, "/fragor/") + header("faq") + f'''
<main id="main">
  <section class="section faq">
    <div class="wrap faq-wrap">
      <header class="chapter" data-reveal="title">
        <p class="chapter-mark"><span class="chapter-rule" aria-hidden="true"></span>{bi("Vanliga frågor", "FAQ")}</p>
        <h1 class="chapter-title">{bi("Frågor och svar", "Questions and answers")}</h1>
      </header>
      <p class="section-intro" data-reveal>{intro}</p>
      <div class="faq-list">
{items}
      </div>
    </div>
  </section>
</main>
''' + FOOTER)


EXCERPT_SLUG = "las-borjan-pa-stridslarm"


def paragraphs(text):
    """The pasted book text, split into paragraphs at blank lines."""
    return [" ".join(block.split()) for block in text.strip().split("\n\n") if block.strip()]


def excerpt_page():
    fore, chap = paragraphs(EXCERPT_FOREWORD), paragraphs(EXCERPT_CHAPTER)
    path = f"/blogg/{EXCERPT_SLUG}/"
    desc = "Läs början av Stridslarm, den första boken om Erik från Birka av Jan Stenborg."
    ld = {"@context": "https://schema.org", "@type": "CreativeWork", "name": "Läs början av Stridslarm", "inLanguage": "sv",
          "author": person(), "isPartOf": {"@type": "Book", "name": "Stridslarm", "isbn": "9789163748806"}, "url": SITE + path}
    # lang="sv-SE": Swedish for screen readers, but shown in both languages (the switch hides only lang="sv")
    sv = lambda t: f'        <p lang="sv-SE" data-reveal>{esc(t)}</p>'
    fore_html = ("\n".join([f'        <h2 data-reveal>{bi("Företal", "Foreword")}</h2>'] + [sv(t) for t in fore])) if fore else ""
    chap_html = "\n".join([f'        <h2 lang="sv-SE" data-reveal>{esc(EXCERPT_CHAPTER_TITLE)}</h2>'] + [sv(t) for t in chap])
    return (head("Läs början av Stridslarm – Jan Stenborg", "Read the opening of Stridslarm – Jan Stenborg", desc, "article", "/images/share.jpg", ld, path)
            + header("blog") + f'''
<main id="main">
  <article class="post excerpt">
    <div class="wrap post-wrap">
      <a class="text-link post-back" href="/blogg/"><span class="text-link-arrow" aria-hidden="true">←</span> {bi("Alla berättelser", "All stories")}</a>
      <header class="post-head" data-reveal="title">
        <p class="chapter-mark"><span class="chapter-rule" aria-hidden="true"></span>{bi("Utdrag", "Excerpt")}</p>
        <h1 class="post-title">{bi("Läs början av <em>Stridslarm</em>", "Read the opening of <em>Stridslarm</em>")}</h1>
        <p class="post-meta">{bi("Den första boken om Erik från Birka", "The first book about Erik of Birka")}</p>
      </header>
      <p class="post-lead" data-reveal>{bi("Ur <em>Stridslarm</em> av Jan Stenborg, publicerat med författarens tillstånd.", "From <em>Stridslarm</em> by Jan Stenborg, published with the author's permission. The excerpt is in Swedish; the book is also available in English as <em>Erik of Birka: The Clash of Arms</em>.")}</p>
    </div>
    <div class="wrap post-wrap post-body excerpt-body">
{fore_html}
{chap_html}
        <p class="excerpt-more" data-reveal>{bi("Fortsättningen finns i boken …", "The story continues in the book …")}</p>
      <footer class="post-foot" data-reveal>
        <div class="actions">
          <a class="btn btn-gold" href="https://www.adlibris.com/sv/bok/stridslarm-9789163748806" target="_blank" rel="noopener">{bi("Köp Stridslarm", "Buy Stridslarm")}</a>
          <a class="btn btn-ghost" href="https://www.storytel.com/se/books/stridslarm-1132654" target="_blank" rel="noopener">{bi("Lyssna på Storytel", "Listen on Storytel")}</a>
        </div>
      </footer>
    </div>
  </article>
</main>
''' + FOOTER)


def set_excerpt_link(on):
    """Shows or hides the "Läs början" link on Stridslarm on the home page."""
    p = os.path.join(ROOT, "index.html")
    s = open(p).read()
    a, b = "<!-- EXCERPT-LINK -->", "<!-- /EXCERPT-LINK -->"
    i, j = s.index(a) + len(a), s.index(b)
    link = (f'<p class="book-excerpt" data-reveal><a class="text-link" href="/blogg/{EXCERPT_SLUG}/">'
            f'{bi("Läs början av boken", "Read the opening")} <span class="text-link-arrow" aria-hidden="true">→</span></a></p>') if on else ""
    s = s[:i] + link + s[j:]
    open(p, "w").write(s)


def sitemap(pages):
    rows = "\n".join(f"  <url><loc>{SITE}{u}</loc><lastmod>{DATE_ISO}</lastmod></url>" for u in pages)
    write("sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{rows}\n</urlset>\n')


if __name__ == "__main__":
    write("blogg/index.html", blog_index())
    for a in ARTICLES:
        write(f"blogg/{a['slug']}/index.html", article_page(a, [o for o in ARTICLES if o is not a][:3]))
    write("fragor/index.html", faq_page())
    pages = ["/", "/blogg/"] + [f"/blogg/{a['slug']}/" for a in ARTICLES] + ["/fragor/"]
    if paragraphs(EXCERPT_CHAPTER):
        write(f"blogg/{EXCERPT_SLUG}/index.html", excerpt_page())
        pages.insert(2, f"/blogg/{EXCERPT_SLUG}/")
        set_excerpt_link(True)
        print("excerpt page built and linked from Stridslarm")
    else:
        set_excerpt_link(False)
        print("excerpt slot is empty: no excerpt page yet (paste the text into tools/content.py)")
    sitemap(pages)
