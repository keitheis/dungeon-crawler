// The game's parts (the folders of src/) and who borrows from whom, read from the real code by
// ../crawl.js: an arrow from A to B means files in A import files in B, thicker for more
// imports. Click a part to see what it does and its files. A slide with an <ol class="journey">
// whose items carry data-at="part" can follow a journey: the demo walks through the steps and
// lights up the part of each one.
import { crawl, purpose } from '../crawl.js';
import { html, loop, t as tr } from '../deck.js';

// where each known part sits; new folders get a place in an extra row
const POS = {
  main: [365, 40], vendor: [100, 140], game: [365, 140], world: [720, 140],
  physics: [85, 250], render: [250, 250], audio: [480, 250], cubegen: [650, 250], themes: [810, 250],
  core: [450, 360],
};
const W = 150, H = 50, CORE_W = 840;
const MINOR = 3;   // arrows for fewer imports only show when one of their parts is picked
const size = p => p === 'core' ? [CORE_W, H] : [W, H];

const ABOUT = {
  main: [tr('the conductor', 'der Dirigent', '指揮者'), tr(
    'One short file that starts everything. Then, 60 times a second, it asks every part to do its job, in the right order.',
    'Eine kurze Datei, die alles startet. Dann bittet sie 60-mal pro Sekunde jeden Teil, seine Arbeit zu machen, in der richtigen Reihenfolge.', '一個短短的檔案負責啟動整個遊戲。接著每秒 60 次，它會按照順序請各個部分做好自己的工作。')],
  game: [tr('the play', 'das Spiel', '遊戲流程'), tr(
    'What happens while you play: the hero, the monsters, portals, the inventory, the camera. It asks almost every other part for help.',
    'Was beim Spielen passiert: der Held, die Monster, Portale, das Inventar, die Kamera. Er bittet fast jeden anderen Teil um Hilfe.', '管理遊戲進行中的事情：英雄、怪物、傳送門、背包和攝影機。它幾乎會請其他每個部分幫忙。')],
  physics: [tr('the body', 'der Körper', '身體'), tr(
    'Walking, jumping, falling, swimming, bumping into walls. It moves things, but it never draws them.',
    'Gehen, Springen, Fallen, Schwimmen, gegen Wände stoßen. Er bewegt Dinge, aber er malt sie nie.', '處理走路、跳躍、墜落、游泳和撞牆。它會移動東西，但不會把東西畫出來。')],
  render: [tr('the painter', 'der Maler', '繪圖師'), tr(
    'Draws everything in 3D. It looks at what the other parts decided, and paints it. It does not decide what happens in the game.',
    'Malt alles in 3D. Er schaut, was die anderen Teile entschieden haben, und malt es. Was im Spiel passiert, entscheidet er nicht.', '把所有東西畫成立體畫面。它會照著其他部分的決定來繪製，但不會決定遊戲裡發生什麼事。')],
  audio: [tr('the band', 'die Band', '音樂組'), tr(
    'Sound effects and music, made from math while you play.',
    'Geräusche und Musik, die beim Spielen aus Mathe entstehen.', '遊戲進行時即時計算並製作音效和音樂。')],
  core: [tr('the rule book', 'das Regelbuch', '規則手冊'), tr(
    'Plain rules and numbers: how hard a sword hits, how strong a spider is, what an item is. It borrows from almost nobody, so every other part can use it, and tests can check it in a split second.',
    'Einfache Regeln und Zahlen: wie hart ein Schwert trifft, wie stark eine Spinne ist, was ein Gegenstand ist. Es leiht sich fast nichts, darum können alle anderen Teile es benutzen, und Tests können es in einem Sekundenbruchteil prüfen.', '放著簡單的規則和數字：劍的攻擊力、蜘蛛有多強、道具是什麼。它幾乎不依賴其他部分，所以大家都能使用它，測試也能立刻檢查它。')],
  world: [tr('the planner', 'der Planer', '規劃器'), tr(
    'Which cubes exist, how they connect, and what kind of land each one is. Most of it runs in the worker. One file stays with the game and asks the worker for cubes.',
    'Welche Würfel es gibt, wie sie verbunden sind und welche Art Land jeder ist. Das meiste davon läuft im Worker. Eine Datei bleibt beim Spiel und fragt den Worker nach Würfeln.', '決定有哪些方塊、方塊如何連接，以及每個方塊是哪種地形。大部分程式在工作執行緒裡執行，另一個檔案會向它索取方塊。')],
  cubegen: [tr('the cube factory', 'die Würfelfabrik', '方塊工廠'), tr(
    'Turns the planner\'s order into one cube: hills, rivers, floors, stairs, bridges, fences. Then it checks that you can get through, and starts again if not.',
    'Macht aus dem Auftrag des Planers einen Würfel: Hügel, Flüsse, Stockwerke, Treppen, Brücken, Zäune. Dann prüft sie, ob man durchkommt, und fängt sonst von vorne an.', '照著規劃器的指示做出一個方塊，裡面有山丘、河流、地板、樓梯、橋和柵欄。接著確認你能不能通過；如果不行，就重新製作。')],
  themes: [tr('the looks', 'das Aussehen', '外觀'), tr(
    'For every depth: its colours, light and fog, its song, and settings for the cube factory.',
    'Für jede Tiefe: ihre Farben, Licht und Nebel, ihr Lied und Einstellungen für die Würfelfabrik.', '每一層都有自己的顏色、光線、霧氣和音樂，也有方塊工廠的設定。')],
  vendor: [tr('borrowed helpers', 'geliehene Helfer', '借來的幫手'), tr(
    'Code other people wrote: three.js draws 3D, Scrimshaw plays the music. The game uses it, but does not change it.',
    'Code, den andere geschrieben haben: three.js malt 3D, Scrimshaw spielt die Musik. Das Spiel benutzt ihn, ändert ihn aber nicht.', '其他人寫好的程式碼：three.js 負責繪製 3D 畫面，Scrimshaw 負責播放音樂。遊戲會使用它們，但不會修改它們。')],
};
const label = p => p === 'main' ? 'main.js' : p === 'vendor' ? 'vendor/' : p + '/';

export default async function mount(el) {
  el.classList.add('parts');
  const box = html(el, `<div class="loading">${tr('reading the game\'s code\u2026', 'lese den Code des Spiels\u2026', '正在讀取遊戲程式碼……')}</div>`);
  let data;
  try { data = await crawl(); } catch (err) {
    box.className = 'err';
    box.textContent = tr('The game\'s code could not be read: ', 'Der Code des Spiels ließ sich nicht lesen: ', '無法讀取遊戲的程式碼：') + err.message;
    return;
  }
  box.remove();
  const { edges, parts, files } = data;
  const pos = { ...POS };
  let extra = 0;
  for (const p of parts.keys()) if (!pos[p]) pos[p] = [90 + (extra++ % 5) * 180, 450 + Math.floor(extra / 5.01) * 80];
  const VH = extra ? 500 + Math.floor((extra - 1) / 5) * 80 : 400;

  // ---- drawing ------------------------------------------------------------------------------
  const svgNS = 'http://www.w3.org/2000/svg';
  const edgeList = [...edges].map(([k, n]) => { const [a, b] = k.split('>'); return { a, b, n }; }).filter(e => pos[e.a] && pos[e.b]);
  const border = (p, dx, dy) => { const [w, h] = size(p), l = Math.hypot(dx, dy) || 1; return Math.min(w / 2 / Math.abs(dx / l || 1e-9), h / 2 / Math.abs(dy / l || 1e-9)) + 4; };
  const paths = new Map();
  const path = (a, b) => paths.get(a + '>' + b) ?? paths.set(a + '>' + b, route(a, b)).get(a + '>' + b);
  function route(a, b) {
    // a curve from box to box, bent a little so A -> B and B -> A stay apart
    function curve(ax, ay, bx, by, bend) {
      const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
      const s = border(a, dx, dy), e = border(b, dx, dy);
      const x1 = ax + ux * s, y1 = ay + uy * s, x2 = bx - ux * e, y2 = by - uy * e;
      const cx = (x1 + x2) / 2 - uy * bend, cy = (y1 + y2) / 2 + ux * bend;
      const at = t => [(1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2];
      return { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, at };
    }
    const blocked = c => [...parts.keys()].some(p => {
      if (p === a || p === b || !pos[p]) return false;
      const [px, py] = pos[p], [w, h] = size(p);
      for (let t = 0.08; t < 0.95; t += 0.04) { const [x, y] = c.at(t); if (Math.abs(x - px) < w / 2 + 3 && Math.abs(y - py) < h / 2 + 3) return true; }
      return false;
    });
    // the wide core box can be reached anywhere along its top: under the other end, or beside
    const [ax0, ay] = pos[a], [bx0, by] = pos[b], lo = pos.core[0] - CORE_W / 2 + 40, hi = pos.core[0] + CORE_W / 2 - 40;
    const clamp = x => Math.max(lo, Math.min(hi, x));
    const shifts = a === 'core' || b === 'core' ? [0, -95, 95, -150, 150] : [0];
    let first = null;
    for (const shift of shifts) for (const bend of [14, 50, -50]) {
      const ax = a === 'core' ? clamp(bx0 + shift) : ax0, bx = b === 'core' ? clamp(ax0 + shift) : bx0;
      const c = curve(ax, ay, bx, by, bend);
      first ??= c;
      if (!blocked(c)) return c;
    }
    return first;
  }
  const wrap = html(el, `<div class="partsvg"></div>`);
  wrap.innerHTML = `<svg viewBox="0 0 900 ${VH}" role="img" aria-label="${tr('The parts of the game and who uses whom', 'Die Teile des Spiels und wer wen benutzt', '遊戲有哪些部分，以及它們如何互相使用')}">
    <defs>${['base', 'out', 'in', 'walk'].map(k => `<marker id="ah-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah ${k}"/></marker>`).join('')}</defs>
    <rect class="zone main" x="10" y="8" width="555" height="290" rx="10"/><text class="zlabel" x="22" y="26">${tr('MAIN THREAD: play and draw', 'HAUPT-THREAD: spielen und malen', '主執行緒：遊戲與繪圖')}</text>
    <rect class="zone worker" x="575" y="78" width="315" height="220" rx="10"/><text class="zlabel" x="587" y="96">${tr('WORKER: builds cubes', 'WORKER: baut Würfel', '工作執行緒：建造方塊')}</text>
    <g class="edges">${edgeList.map((e, i) => `<path data-i="${i}" d="${path(e.a, e.b).d}" class="${e.n < MINOR ? 'minor' : ''}" stroke-width="${(0.8 + Math.log2(e.n) * 0.6).toFixed(2)}" marker-end="url(#ah-base)"/>`).join('')}</g>
    <g class="nodes">${[...parts.keys()].filter(p => pos[p]).map(p => {
      const [x, y] = pos[p], [w, h] = size(p), P = parts.get(p);
      return `<g class="node" data-part="${p}" tabindex="0" transform="translate(${x - w / 2},${y - h / 2})"><rect width="${w}" height="${h}" rx="6"/>
        <text x="${w / 2}" y="21" class="n">${label(p)}</text><text x="${w / 2}" y="38" class="nick">${ABOUT[p]?.[0] ?? ''}</text>
        ${P.threads.has('main') ? `<circle cx="${w - 14}" cy="10" r="4" class="t main"><title>${tr('runs in the main thread', 'läuft im Haupt-Thread', '在主執行緒中執行')}</title></circle>` : ''}
        ${P.threads.has('worker') ? `<circle cx="${w - 24 + (P.threads.has('main') ? 0 : 10)}" cy="10" r="4" class="t worker"><title>${tr('runs in the worker', 'läuft im Worker', '在工作執行緒中執行')}</title></circle>` : ''}</g>`;
    }).join('')}</g>
    <circle class="walker" r="7" cx="-20" cy="-20"/>
  </svg>`;
  const svg = wrap.querySelector('svg'), edgeEls = [...svg.querySelectorAll('.edges path')], walker = svg.querySelector('.walker');
  const info = html(el, `<div class="out"></div>`);
  const legend = html(el, `<div class="legend"><span><i style="background:var(--cyan);border-radius:50%"></i>${tr('runs in the main thread', 'läuft im Haupt-Thread', '在主執行緒中執行')}</span>
    <span><i style="background:var(--violet);border-radius:50%"></i>${tr('runs in the worker', 'läuft im Worker', '在工作執行緒中執行')}</span>
    <span>${tr('arrow A \u2192 B: A borrows code from B (thicker: more often; click a part for all its arrows)', 'Pfeil A \u2192 B: A leiht sich Code von B (dicker: öfter; klick auf einen Teil für alle seine Pfeile)', '箭頭 A \u2192 B：A 使用了 B 的程式碼（線越粗代表使用越多；點選部分可看見所有箭頭）')}</span>
    <span>${files.size} ${tr('files', 'Dateien', '個檔案')}, ${[...files.values()].reduce((s, f) => s + f.lines, 0).toLocaleString(tr('en-US', 'de-DE', 'zh-TW'))} ${tr('lines', 'Zeilen', '行')}</span></div>`);

  // ---- picking a part -------------------------------------------------------------------------
  let picked = null;
  const named = p => `<b>${label(p)}</b>`;
  const list = (ps, dir) => ps.length ? ps.map(e => `${named(dir === 'out' ? e.b : e.a)} \u00D7${e.n}`).join(', ') : tr('nobody', 'niemand', '沒有人');
  function pick(p, brief = false) {
    picked = p;
    svg.querySelectorAll('.node').forEach(n => n.classList.toggle('on', n.dataset.part === p));
    edgeList.forEach((e, i) => {
      const k = !p ? e.n < MINOR ? 'minor' : '' : e.a === p ? 'out' : e.b === p ? 'in' : 'dim';
      edgeEls[i].setAttribute('class', k);
      edgeEls[i].setAttribute('marker-end', `url(#ah-${k === 'out' || k === 'in' ? k : 'base'})`);
    });
    if (!p) { info.innerHTML = tr('Click a part to see what it does.', 'Klick auf einen Teil, um zu sehen, was er macht.', '點選遊戲的一個部分，看看它負責什麼。'); return; }
    if (brief) { info.innerHTML = `${named(p)} \u00B7 ${ABOUT[p]?.[0] ?? ''}\n${ABOUT[p]?.[1] ?? ''}`; return; }
    const P = parts.get(p), out = edgeList.filter(e => e.a === p).sort((x, y) => y.n - x.n), inn = edgeList.filter(e => e.b === p).sort((x, y) => y.n - x.n);
    const threads = [...P.threads].map(t => t === 'main' ? tr('the main thread', 'dem Haupt-Thread', '主執行緒') : tr('the worker', 'dem Worker', '工作執行緒')).join(tr(' and ', ' und ', '和'));
    const shown = P.files.slice().sort((a, b) => files.get(b).lines - files.get(a).lines).slice(0, 6);
    info.innerHTML = `${named(p)} \u00B7 ${ABOUT[p]?.[0] ?? ''}\n${ABOUT[p]?.[1] ?? ''}\n\n` +
      (p === 'vendor' ? '' : `${P.files.length} ${tr('files', 'Dateien', '個檔案')}, ${P.lines.toLocaleString(tr('en-US', 'de-DE', 'zh-TW'))} ${tr('lines', 'Zeilen', '行')} \u00B7 ${tr('runs in', 'läuft in', '執行於')} ${threads}\n`) +
      `<span style="color:var(--gold)">${tr('borrows from', 'leiht sich von', '使用了')}</span>: ${list(out, 'out')}\n<span style="color:var(--cyan)">${tr('is used by', 'wird benutzt von', '被使用於')}</span>: ${list(inn, 'in')}` +
      (shown.length ? `\n\n${tr('Its biggest files', 'Seine größten Dateien', '它最大的幾個檔案')}:\n` + shown.map(f => `  <b>${f.split('/').pop()}</b> ${escape(purpose(files.get(f).text))}`).join('\n') : '');
  }
  const escape = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  svg.addEventListener('click', e => { const n = e.target.closest('.node'); pick(n && n.dataset.part !== picked ? n.dataset.part : null); });
  svg.addEventListener('keydown', e => { const n = e.target.closest('.node'); if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(n.dataset.part); } });
  pick(null);

  // ---- a journey through the parts ------------------------------------------------------------
  const ol = el.closest('.slide')?.querySelector('ol.journey');
  if (!ol) return;
  legend.remove();
  const L = document.documentElement.dataset.lang || 'en';
  const steps = [...ol.querySelectorAll('li[data-at]')].filter(li => (li.getAttribute('lang') ?? L) === L);
  const ctl = html(el, `<div class="row"><button class="prev">\u25C2</button><button class="play">${tr('Follow it', 'Folgen', '跟著看')}</button><button class="next">\u25B8</button><span class="mono small muted step"></span></div>`);
  let cur = -1, from = null, to = null, t = 1, playing = false, wait = 0, restX = 0;
  const center = p => pos[p];
  function go(i) {
    i = Math.max(0, Math.min(steps.length - 1, i));
    const prev = cur >= 0 ? steps[cur].dataset.at : null;
    cur = i;
    const at = steps[i].dataset.at;
    steps.forEach((li, j) => li.classList.toggle('on', j === i));
    from = prev && prev !== at ? prev : null; to = at; t = from ? 0 : 1;
    // on the wide core box, rest under where we came from
    const into = from && edgeList.find(e => e.a === from && e.b === at) ? path(from, at).at(1)[0] : from && edgeList.find(e => e.a === at && e.b === from) ? path(at, from).at(0)[0] : null;
    restX = at === 'core' ? into ?? Math.max(90, Math.min(810, center(from ?? prev ?? 'core')[0])) : center(at)[0];
    pick(at, true);
    // only the arrow travelled along stays lit
    edgeList.forEach((e, k) => {
      const lit = from && ((e.a === from && e.b === at) || (e.b === from && e.a === at));
      edgeEls[k].setAttribute('class', lit ? 'walk' : 'dim');
      edgeEls[k].setAttribute('marker-end', `url(#ah-${lit ? 'walk' : 'base'})`);
    });
    ctl.querySelector('.step').textContent = `${i + 1} / ${steps.length}`;
  }
  steps.forEach((li, i) => { li.onclick = () => { playing = false; go(i); }; });
  ctl.querySelector('.prev').onclick = () => { playing = false; go(cur - 1); };
  ctl.querySelector('.next').onclick = () => { playing = false; go(cur + 1); };
  ctl.querySelector('.play').onclick = () => { playing = true; wait = 1.6; go(cur < 0 || cur >= steps.length - 1 ? 0 : cur + 1); };
  loop(el, dt => {
    if (!to) return;
    t = Math.min(1, t + dt * 1.6);
    let x, y;
    const e = from && edgeList.find(e => (e.a === from && e.b === to) || (e.a === to && e.b === from));
    if (from && e) { const pth = path(e.a, e.b); [x, y] = pth.at(e.a === from ? t : 1 - t); }
    else if (from) { const [ax, ay] = center(from), [bx, by] = center(to); x = ax + (bx - ax) * t; y = ay + (by - ay) * t; }
    else [x, y] = center(to);
    if (t >= 1) [x, y] = [restX, center(to)[1] - H / 2 - 2];
    walker.setAttribute('cx', x); walker.setAttribute('cy', y);
    if (playing && t >= 1 && (wait -= dt) <= 0) { if (cur >= steps.length - 1) playing = false; else { go(cur + 1); wait = 1.6; } }
  });
  go(0);
}
