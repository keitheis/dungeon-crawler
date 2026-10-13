// The map (index.html in the selected language): the rooms as cards, and the detail level picker.
import { lang, t } from './deck.js';
import { DECKS, LEVELS, THEME_NAMES, THEME_NAMES_DE, THEME_NAMES_ZH_HANT, local, iconUrl } from './decks.js';

const seen = new Set(JSON.parse(localStorage.getItem('kids.visited') || '[]'));
const themes = lang === 'de' ? THEME_NAMES_DE : lang === 'zh-Hant' ? THEME_NAMES_ZH_HANT : THEME_NAMES;
document.getElementById('map').innerHTML = DECKS.map((deck, i) => {
  const d = local(deck, lang);
  return `<a class="room ${seen.has(d.file) ? 'visited' : ''}" data-theme="${d.theme}" href="${d.file}">
    <span class="seen"></span><img src="${iconUrl(d)}" alt="">
    <span class="d">${t('ROOM', 'RAUM', '房間')} ${i + 1} \u00B7 ${t('DEPTH', 'TIEFE', '深度')} ${d.depth} \u00B7 ${themes[d.theme].toUpperCase()}</span>
    <h3>${d.title}</h3><p>${d.teaser}</p></a>`;
}).join('');

const blurb = [null,
  t('Just the big ideas, with pictures and things to try. Start here if this is all new to you.',
    'Nur die großen Ideen, mit Bildern und Sachen zum Ausprobieren. Fang hier an, wenn alles neu für dich ist.', '用圖片和動手試玩的示範，介紹基本概念。如果你是第一次接觸，就從這裡開始。'),
  t('How the parts really work, step by step, with more demos and numbers from the game.',
    'Wie die Teile wirklich funktionieren, Schritt für Schritt, mit mehr Demos und Zahlen aus dem Spiel.', '一步步了解各個部分如何運作，搭配更多示範與遊戲中的數值。'),
  t('The real code from the game, explained. For when you want to know exactly how it works.',
    'Der echte Code des Spiels, erklärt. Für wenn du genau wissen willst, wie es funktioniert.', '解說遊戲的實際程式碼。想深入了解運作方式時，就看這一層。')];
const box = document.getElementById('levels');
const draw = () => {
  const lv = +(localStorage.getItem('kids.lv') || 3);
  box.innerHTML = [1, 2, 3].map(l => `<button class="card${l === lv ? ' on' : ''}" data-lv="${l}" style="text-align:left;border-color:${l <= lv ? LEVELS[l].color : ''}">
    <span style="color:${LEVELS[l].color}">${LEVELS[l].short} \u00B7 ${LEVELS[l][lang] ?? LEVELS[l].name}</span><br><span style="font-family:var(--read);font-size:15px;color:var(--muted)">${blurb[l]}</span></button>`).join('');
  box.querySelectorAll('button').forEach(b => b.onclick = () => { localStorage.setItem('kids.lv', b.dataset.lv); draw(); });
};
draw();
