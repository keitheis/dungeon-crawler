// Pick the reader's saved language, else the browser's, before the page is drawn.
(function () {
  const supported = ['en', 'de', 'zh-Hant'];
  const normalize = value => {
    const code = (value || '').toLowerCase();
    if (code === 'zh' || /^zh-(hant|tw|hk|mo)(-|$)/.test(code)) return 'zh-Hant';
    const base = code.split('-')[0];
    return supported.includes(base) ? base : null;
  };
  let lang = null;
  try { lang = localStorage.getItem('kids.lang'); } catch { /* private mode */ }
  if (!supported.includes(lang))
    lang = (navigator.languages || [navigator.language]).map(normalize).find(Boolean) || 'en';
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
})();
