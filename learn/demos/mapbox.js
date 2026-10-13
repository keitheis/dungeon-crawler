// A real cube's map, opened up: the cube factory (src/cubegen/, through src/world/world.js) builds
// one cube in the page, and the demo lists what is in the box it hands over. Click a thing to see
// it on the cube (from above), and which parts of the game use it: the parts are found by
// reading the game's code (../crawl.js) for ".floors", ".portals" ...
import { World } from '../../src/world/world.js';
import { themeAt, MAX_DEPTH } from '../../src/themes/depth.js';
import { N } from '../../src/core/constants.js';
import { crawl } from '../crawl.js';
import { canvas, html, t as tr, themeLabel } from '../deck.js';

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const rgb = (c, k = 1) => `rgb(${c.map(v => Math.round(Math.min(255, v * k))).join(',')})`;
function stop(stops, level) {
  let i = 0;
  while (i + 1 < stops.length && stops[i + 1][0] <= level) i++;
  const a = stops[i], b = stops[i + 1] || a;
  return mix(hex(a[1]), hex(b[1]), b === a ? 0 : Math.min(1, Math.max(0, (level - a[0]) / (b[0] - a[0]))));
}
const FLUID = { 1: [46, 134, 222], 2: [255, 90, 0], 3: [125, 255, 58] };

// the things in the box we explain (others are listed by name); grep: look for it in the code
const THINGS = [
  { key: 'floors', grep: true, about: () => tr('Every piece of ground you can stand on: which square, how high, and whether it is water, lava or acid. Gold squares have floors stacked on top of each other.',
    'Jedes Stück Boden, auf dem man stehen kann: welches Feld, wie hoch und ob es Wasser, Lava oder Säure ist. Goldene Felder haben mehrere Böden übereinander.', '你可以站立的每塊地面：它在哪一格、高度是多少，以及它是水、熔岩還是酸液。金色格子表示有好幾層地板疊在一起。') },
  { key: 'portals', grep: true, about: () => tr('The ways in and out: which side of the cube, which square, how high.',
    'Die Wege hinein und hinaus: welche Seite des Würfels, welches Feld, wie hoch.', '出入口的位置：方塊的哪一面、哪一格，以及高度。') },
  { key: 'ladders', grep: true, about: () => tr('Ladders up a cliff: where they stand and from which height to which.',
    'Leitern eine Klippe hinauf: wo sie stehen und von welcher Höhe zu welcher.', '爬上懸崖的梯子：梯子在哪裡，以及連接哪些高度。') },
  { key: 'fenceList', grep: true, about: () => tr('Fences along cliff edges, so you don\'t fall off by accident.',
    'Zäune an Klippenrändern, damit du nicht aus Versehen hinunterfällst.', '懸崖邊的柵欄，免得你不小心掉下去。') },
  { key: 'routes', grep: true, about: () => tr('The ways the inspector walked, to check that every entrance leads to the exit (P in the game shows them).',
    'Die Wege, die der Prüfer gegangen ist, um zu prüfen, dass jeder Eingang zum Ausgang führt (P im Spiel zeigt sie).', '檢查器走過的路線，用來確認每個入口都能通往出口（在遊戲裡按 P 可以顯示）。') },
  { key: 'rewardSites', grep: true, about: () => tr('Special places for treasure or a fight.',
    'Besondere Plätze für einen Schatz oder einen Kampf.', '放寶物或安排戰鬥的特別地點。') },
  { key: 'stats', about: m => tr('A little report about the cube, for people who look at it: ', 'Ein kleiner Bericht über den Würfel, für Leute, die ihn sich anschauen: ', '給檢查方塊的人看的簡短報告：') + Object.entries(m.stats).filter(([, v]) => typeof v === 'number').map(([k, v]) => `${k} ${v}`).join(', ') },
];

export default function mount(el) {
  const W = 320, { g } = canvas(el, W, W);
  const box = el.querySelector('canvas');
  box.style.maxWidth = '330px';
  const row = html(el, `<div class="row">
    <label>Seed <input type="number" class="seed" value="${1 + Math.floor(Math.random() * 999)}"></label>
    <label>${tr('depth', 'Tiefe', '深度')} <select class="depth">${Array.from({ length: MAX_DEPTH }, (_, d) => d + 1).map(d => `<option value="${d}" ${d === 1 ? 'selected' : ''}>${d} \u00B7 ${themeLabel(themeAt(d))}</option>`).join('')}</select></label>
    <button class="dice">${tr('Another cube', 'Anderer Würfel', '另一個方塊')}</button></div>`);
  const list = html(el, '<div class="row things"></div>');
  const out = html(el, '<div class="out"></div>');
  const $ = s => row.querySelector(s);
  let map = null, theme = null, picked = 'floors', readers = null;

  crawl().then(({ files }) => {
    readers = new Map();
    for (const t of THINGS.filter(t => t.grep)) {
      const re = new RegExp(`\\.${t.key}\\b`), by = new Map();
      for (const f of files.values()) if (re.test(f.text)) by.set(f.part, (by.get(f.part) ?? 0) + 1);
      readers.set(t.key, by);
    }
    if (map) show();
  }).catch(() => {});

  function build() {
    const seed = +$('.seed').value >>> 0, d = +$('.depth').value, world = new World(seed);
    // a room with something to see: floors stacked over each other, and fences or ladders
    const route = world.layout(d).route, mid = Math.floor(route.length / 2);
    const order = route.map((k, i) => [k, Math.abs(i - mid)]).sort((a, b) => a[1] - b[1]).map(([k]) => k);
    map = null;
    for (const k of order.slice(0, 5)) {
      const m = world.cube(k).map;
      map ??= m;
      if (m.floors.length > N * N && (m.fenceList?.length || m.ladders?.length)) { map = m; break; }
    }
    theme = themeAt(d);
    list.innerHTML = THINGS.filter(t => map[t.key] != null).map(t => `<button data-k="${t.key}">${t.key}${Array.isArray(map[t.key]) ? ` <span class="muted">\u00D7${map[t.key].length}</span>` : ''}</button>`).join('');
    list.querySelectorAll('button').forEach(b => b.onclick = () => { picked = b.dataset.k; show(); });
    show();
  }

  const C = W / N, cx = x => x * C, cz = z => z * C;
  function draw() {
    g.clearRect(0, 0, W, W);
    const top = new Map(), count = new Map();
    for (const f of map.floors) {
      const c = f.z * N + f.x;
      count.set(c, (count.get(c) ?? 0) + 1);
      if (!top.has(c) || f.top > top.get(c).top) top.set(c, f);
    }
    for (const [c, f] of top) {
      g.fillStyle = f.fluid ? rgb(FLUID[f.fluid], 0.8) : rgb(stop(theme.top, f.top));
      g.fillRect(cx(c % N), cz((c / N) | 0), C, C);
    }
    g.strokeStyle = '#0005'; g.lineWidth = 0.5;
    for (let i = 0; i <= N; i++) { g.beginPath(); g.moveTo(i * C, 0); g.lineTo(i * C, W); g.moveTo(0, i * C); g.lineTo(W, i * C); g.stroke(); }
    const ring = (x, z, col, r = C * 0.38) => { g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.arc(cx(x + 0.5), cz(z + 0.5), r, 0, 7); g.stroke(); };
    const line = (pts, col, w = 2.5, dash = []) => {
      if (pts.length < 2) return;
      g.strokeStyle = col; g.lineWidth = w; g.setLineDash(dash);
      g.beginPath(); pts.forEach(([x, z], i) => i ? g.lineTo(cx(x), cz(z)) : g.moveTo(cx(x), cz(z))); g.stroke(); g.setLineDash([]);
    };
    if (picked === 'floors') for (const [c, n] of count) if (n > 1) { g.strokeStyle = '#ffcf7a'; g.lineWidth = 2; g.strokeRect(cx(c % N) + 2, cz((c / N) | 0) + 2, C - 4, C - 4); }
    if (picked === 'portals') for (const p of map.portals) ring(p.x, p.z, p.dir === 5 ? '#5fd3ff' : '#ffc94a');
    if (picked === 'ladders') for (const l of map.ladders) { g.fillStyle = '#ffcf7a'; g.fillRect(cx(l.x) + C * 0.3, cz(l.z) + C * 0.1, C * 0.4, C * 0.8); }
    if (picked === 'fenceList') for (const f of map.fenceList) line(f.pts.map(p => [p[0], p[2]]), '#fff', 2);
    if (picked === 'routes') for (const r of map.routes) line(r.map(q => [q.x, q.z]), '#ff6ad5', 2.5, [5, 3]);
    if (picked === 'rewardSites') for (const s of map.rewardSites) for (const c of s.cells) { g.fillStyle = '#ffcf7a99'; g.fillRect(cx(c % N), cz((c / N) | 0), C, C); }
  }

  function show() {
    if (!map) return;
    draw();
    list.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === picked));
    const thing = THINGS.find(t => t.key === picked), by = readers?.get(picked);
    const facts = `${tr('cube', 'Würfel', '方塊')} <b>${map.key}</b> \u00B7 ${tr('depth', 'Tiefe', '深度')} <b>${map.depth}</b> \u00B7 ${tr('land', 'Land', '地形')} <b>${map.kind}</b> \u00B7 ${tr('shape', 'Form', '形狀')} <b>${map.archetype}</b>`;
    const known = new Set([...THINGS.map(t => t.key), 'key', 'depth', 'kind', 'archetype']), rest = Object.keys(map).filter(k => !known.has(k));
    out.innerHTML = `${facts}\n\n<b>${picked}</b>: ${thing.about(map)}` +
      (thing.grep ? `\n${tr('Used by', 'Benutzt von', '使用者')}: ` + (by ? [...by].sort((a, b) => b[1] - a[1]).map(([p, n]) => `<span class="chip">${p === 'main' ? 'main.js' : p + '/'} \u00D7${n}</span>`).join(' ')
        : tr('(reading the code\u2026)', '(lese den Code\u2026)', '（正在讀取程式碼……）')) : '') +
      `\n\n<span class="muted">${tr('Also in the box', 'Außerdem in der Kiste', '盒子裡還有')}: ${rest.join(', ')}</span>`;
  }

  $('.dice').onclick = () => { $('.seed').value = 1 + Math.floor(Math.random() * 99999); build(); };
  $('.seed').onchange = build;
  $('.depth').onchange = build;
  build();
}
