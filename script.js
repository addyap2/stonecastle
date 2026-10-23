// Language switch: shows Swedish or English text and remembers the choice.
(function () {
  var titles = {
    sv: 'Jan Stenborg – Författare',
    en: 'Jan Stenborg – Author'
  };

  function setLang(lang, remember) {
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.title = titles[lang];
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-set-lang') === lang));
    });
    if (remember) { try { localStorage.setItem('lang', lang); } catch (e) {} }
  }

  document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-set-lang'), true); });
  });

  setLang(document.documentElement.getAttribute('data-lang') || 'sv');

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
