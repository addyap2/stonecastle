// Serves the private book readers one chapter at a time (see tools/build_reader.py).
// The books are stored encrypted in books/; the key is only in Vercel's READER_KEY setting,
// so the public repository never holds readable text. Nothing here is indexed or cached.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const books = new Map();   // decrypted books stay in memory while the function is warm

function load(slug) {
  if (books.has(slug)) return books.get(slug);
  const name = crypto.createHash('sha256').update(slug).digest('hex').slice(0, 32);
  const file = path.join(process.cwd(), 'books', name + '.bin');
  if (!fs.existsSync(file)) return null;
  const data = fs.readFileSync(file);
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(process.env.READER_KEY || '', 'base64'), data.subarray(0, 12));
  decipher.setAuthTag(data.subarray(data.length - 16));
  const book = JSON.parse(Buffer.concat([decipher.update(data.subarray(12, data.length - 16)), decipher.final()]).toString('utf8'));
  books.set(slug, book);
  return book;
}

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  const query = new URL(req.url, 'http://local').searchParams;
  const slug = query.get('book') || '';
  let book = null;
  try {
    if (/^[a-z0-9-]{8,80}$/.test(slug)) book = load(slug);
  } catch (e) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'unavailable' }));
  }
  if (!book) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'not-found' }));
  }
  if (!query.has('s')) {
    return res.end(JSON.stringify({
      lang: book.lang, title: book.title, author: book.author, edition: book.edition,
      sections: book.sections.map((s) => ({ title: s.title, kind: s.kind, chapter: s.chapter }))
    }));
  }
  const section = book.sections[Number(query.get('s'))];
  if (!section) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'not-found' }));
  }
  res.end(JSON.stringify({ html: section.html }));
};
