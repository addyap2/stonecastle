const $ = (id) => document.getElementById(id);
const labels = document.documentElement.lang === 'fr'
  ? { missing: 'Ce lien de lecture est incomplet. Demandez le lien complet, avec sa clé après #k=.', failed: 'Impossible d’ouvrir ce livre. Vérifiez que le lien est complet.', empty: 'Cette section est vide.' }
  : { missing: 'This reading link is incomplete. Ask for the full link, including the key after #k=.', failed: 'Unable to open this book. Check that the full link was copied.', empty: 'This section is empty.' };

const chapters = $('chapters');
const article = $('book');
const status = $('status');
const progress = $('progress');
const previous = $('previous');
const next = $('next');
let book;
let current = 0;
let key;

function decodeKey(fragment) {
  const match = /^#k=([A-Za-z0-9_-]{43})$/.exec(fragment);
  if (!match) return null;
  const base64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64 + '='), (c) => c.charCodeAt(0));
  return bytes.length === 32 ? bytes : null;
}

function showSection(index) {
  if (!book || index < 0 || index >= book.sections.length) return;
  current = index;
  const section = book.sections[index];
  article.innerHTML = section.html || `<p>${labels.empty}</p>`;
  chapters.value = String(index);
  previous.disabled = index === 0;
  next.disabled = index === book.sections.length - 1;
  progress.textContent = `${index + 1} / ${book.sections.length}`;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

async function openBook() {
  const keyBytes = decodeKey(location.hash);
  if (!keyBytes) { status.textContent = labels.missing; return; }
  try {
    const response = await fetch('book.bin', { cache: 'no-store' });
    if (!response.ok) throw new Error('Book data unavailable');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length < 29) throw new Error('Book data invalid');
    key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, key, bytes.slice(12));
    book = JSON.parse(new TextDecoder().decode(plain));
    if (!book.sections?.length || book.lang !== document.documentElement.lang) throw new Error('Book structure invalid');
    chapters.replaceChildren(...book.sections.map((section, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = section.title;
      return option;
    }));
    chapters.disabled = false;
    $('download').disabled = false;
    status.hidden = true;
    article.hidden = false;
    showSection(0);
  } catch (error) {
    status.textContent = labels.failed;
  }
}

$('download').addEventListener('click', async () => {
  try {
    const response = await fetch('book.epub.bin', { cache: 'no-store' });
    if (!response.ok) throw new Error('EPUB unavailable');
    const bytes = new Uint8Array(await response.arrayBuffer());
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, key, bytes.slice(12));
    const url = URL.createObjectURL(new Blob([plain], { type: 'application/epub+zip' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = book.lang === 'fr' ? 'fracas-des-armes-francais.epub' : 'erik-of-birka-the-clash-of-arms.epub';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    status.hidden = false;
    status.textContent = labels.failed;
  }
});

chapters.addEventListener('change', () => showSection(Number(chapters.value)));
previous.addEventListener('click', () => showSection(current - 1));
next.addEventListener('click', () => showSection(current + 1));
article.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href^="#section-"]');
  if (!anchor) return;
  event.preventDefault();
  showSection(Number(anchor.getAttribute('href').slice(9)));
});

let fontSize = 20;
function resize(amount) {
  fontSize = Math.max(16, Math.min(28, fontSize + amount));
  document.documentElement.style.setProperty('--book-size', `${fontSize}px`);
}
$('smaller').addEventListener('click', () => resize(-2));
$('larger').addEventListener('click', () => resize(2));
openBook();
