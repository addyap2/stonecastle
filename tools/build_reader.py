# Builds the private book readers: turns each EPUB into encrypted chapter data in books/.
#
# The reading links and the key are NOT in this repository (it is public). They live in
#   ../stonecastle-private/reader.json   (or the path in READER_CONFIG)
# and the same key must be set on Vercel as READER_KEY. api/book.js decrypts one chapter
# at a time for the reader at /read/<slug> (English) or /lire/<slug> (French).
#
# Run:  python3 tools/build_reader.py
# Needs: node (for the encryption) and sips (macOS, to shrink the images).

import base64
import hashlib
import html
import json
import os
import posixpath
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.environ.get("READER_CONFIG", os.path.join(os.path.dirname(ROOT), "stonecastle-private", "reader.json"))

ALLOWED = {"p", "h1", "h2", "h3", "div", "span", "img", "a", "br", "strong", "em", "i", "b", "small"}
DROP_CLASSES = {"wm_text"}          # a shop's purchase watermark left in the French source
COVER_LABEL = {"en": "Cover", "fr": "Couverture", "de": "Umschlag"}
BACK_LABEL = {"en": "Back cover", "fr": "Quatrième de couverture", "de": "Rückseite"}
# Front and back matter, named by the EPUB file they come from (their own first line makes a poor label)
MATTER = [("Half", {"en": "Half title", "fr": "Faux-titre", "de": "Schmutztitel"}), ("Copy", {"en": "Copyright", "fr": "Mentions légales", "de": "Impressum"}),
          ("Thanks", {"en": "Acknowledgements", "fr": "Remerciements", "de": "Danksagung"}), ("Fm1", {"en": "Acknowledgements", "fr": "Remerciements", "de": "Danksagung"}),
          ("Title", {"en": "Title page", "fr": "Page de titre", "de": "Titelseite"}), ("Dedication", {"en": "Epigraph", "fr": "Épigraphe", "de": "Motto"}),
          ("Fm2", {"en": "Epigraph", "fr": "Épigraphe", "de": "Motto"}), ("Contents", {"en": "Contents", "fr": "Sommaire", "de": "Inhalt"}),
          ("Author", {"en": "About the author", "fr": "L’auteur", "de": "Über den Autor"})]


def label(heading):
    """FOREWORD -> Foreword; chapter headings are kept as written."""
    return heading[:1] + heading[1:].lower() if heading.isupper() else heading


def local(tag):
    return tag.rsplit("}", 1)[-1]


def shrink(data, name):
    """Re-encode an EPUB image as a modest JPEG data URI (covers are 1-2 MB in the EPUBs)."""
    with tempfile.TemporaryDirectory() as td:
        src = os.path.join(td, os.path.basename(name))
        out = os.path.join(td, "out.jpg")
        open(src, "wb").write(data)
        subprocess.run(["sips", "-Z", "1100", "-s", "format", "jpeg", "-s", "formatOptions", "72", src, "--out", out],
                       check=True, capture_output=True)
        return "data:image/jpeg;base64," + base64.b64encode(open(out, "rb").read()).decode()


def render(node, z, source, section_of, images):
    tag = local(node.tag)
    if node.get("class") in DROP_CLASSES:
        return ""
    inner = html.escape(node.text or "")
    for child in node:
        inner += render(child, z, source, section_of, images) + html.escape(child.tail or "")
    if tag not in ALLOWED:
        return inner
    attrs = []
    if node.get("class"):
        attrs.append(f'class="{html.escape(node.get("class"), quote=True)}"')
    if tag == "img":
        asset = posixpath.normpath(posixpath.join(posixpath.dirname(source), node.get("src", "")))
        if asset not in images:
            images[asset] = shrink(z.read(asset), asset)
        attrs += [f'src="{images[asset]}"', f'alt="{html.escape(node.get("alt", ""), quote=True)}"']
        return f"<img {' '.join(attrs)}>"
    if tag == "br":
        return "<br>"
    if tag == "a":
        target = posixpath.normpath(posixpath.join(posixpath.dirname(source), node.get("href", "").split("#", 1)[0]))
        if target in section_of:
            attrs.append(f'data-section="{section_of[target]}"')
        tag = "span" if target not in section_of else "a"
    return f"<{tag}{' ' + ' '.join(attrs) if attrs else ''}>{inner}</{tag}>"


def extract(book):
    with zipfile.ZipFile(book["epub"]) as z:
        container = ET.fromstring(z.read("META-INF/container.xml"))
        opf_path = next(el.get("full-path") for el in container.iter() if local(el.tag) == "rootfile")
        opf = ET.fromstring(z.read(opf_path))
        base = posixpath.dirname(opf_path)
        items = {el.get("id"): posixpath.normpath(posixpath.join(base, el.get("href")))
                 for el in opf.iter() if local(el.tag) == "item"}
        spine = [items[el.get("idref")] for el in opf.iter() if local(el.tag) == "itemref"]
        section_of = {name: i for i, name in enumerate(spine)}
        images, sections = {}, []
        for i, name in enumerate(spine):
            body = next(el for el in ET.fromstring(z.read(name)).iter() if local(el.tag) == "body")
            markup = "".join(render(child, z, name, section_of, images) + html.escape(child.tail or "") for child in body)
            texts = "".join(body.itertext()).strip()
            only_image = (not texts and "<img" in markup) or (i == 0 and book["lang"] == "de")
            heading = next(("".join(el.itertext()).strip() for el in body.iter() if local(el.tag) in {"h1", "h2", "h3"}), "")
            stem = posixpath.basename(name)
            matter = next((names[book["lang"]] for key, names in MATTER if key in stem), None)
            if only_image:
                title = COVER_LABEL[book["lang"]] if i == 0 else BACK_LABEL[book["lang"]]
            elif matter:
                title, heading = matter, ""
            else:
                title = label(heading) or next((t.strip() for t in body.itertext() if t.strip()), f"{i + 1}")
            sections.append({"title": " ".join(title.split())[:90], "kind": "image" if only_image else "text",
                             "chapter": bool(heading), "html": markup})
    return {"lang": book["lang"], "title": book["title"], "author": "Jan Stenborg",
            "edition": book["edition"], "sections": sections}


ENCRYPT = r"""
const crypto = require('crypto'); const fs = require('fs');
const [key, src, out] = process.argv.slice(-3);
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'base64'), iv);
const body = Buffer.concat([c.update(fs.readFileSync(src)), c.final()]);
fs.writeFileSync(out, Buffer.concat([iv, body, c.getAuthTag()]));
"""


def main():
    cfg = json.load(open(CONFIG))
    os.makedirs(os.path.join(ROOT, "books"), exist_ok=True)
    for book in cfg["books"]:
        data = extract(book)
        name = hashlib.sha256(book["slug"].encode()).hexdigest()[:32]   # the file name never reveals the link
        out = os.path.join(ROOT, "books", name + ".bin")
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as tmp:
            json.dump(data, tmp, ensure_ascii=False, separators=(",", ":"))
        try:
            subprocess.run(["node", "-e", ENCRYPT, "--", cfg["key"], tmp.name, out], check=True)
        finally:
            os.unlink(tmp.name)
        print(f"{book['lang']}: {len(data['sections'])} sections, {os.path.getsize(out) // 1024} KB -> books/{name}.bin")
        print(f"    https://janstenborg.com/{book['path']}/{book['slug']}")


if __name__ == "__main__":
    sys.exit(main())
