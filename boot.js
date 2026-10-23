// Runs in <head> before the page draws: picks the language and prepares the entrance.
// Kept as a file (not inline) so the site can use a strict security policy (see vercel.json).
(function () {
  var root = document.documentElement;

  // Swedish is the main language. English shows only if the visitor picked it,
  // or the address ends in ?lang=en.
  var lang = 'sv';
  try {
    var fromUrl = new URLSearchParams(location.search).get('lang');
    var saved = localStorage.getItem('lang');
    lang = fromUrl || saved || 'sv';
  } catch (e) {}
  if (lang !== 'en') lang = 'sv';
  root.setAttribute('data-lang', lang);
  root.setAttribute('lang', lang);

  // Reveals: content is hidden for its entrance only while the motion script is working.
  // If script.js hasn't started within 3 seconds, everything is shown as normal.
  root.classList.add('motion-ready');
  setTimeout(function () {
    if (!window.motionStarted) root.classList.remove('motion-ready');
  }, 3000);

  // The hero's sunrise plays once per visit, and never for visitors who prefer less motion.
  try {
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!calm && !sessionStorage.getItem('heroSeen')) {
      root.classList.add('hero-intro');
      sessionStorage.setItem('heroSeen', '1');
    }
  } catch (e) {}
})();
