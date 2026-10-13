// The real layout of a depth (src/world/layout.js): which cubes exist, the route through them,
// side rooms, guardians and reward sites. Seen from above, centred on the world's axis.
import { makeLayouts } from '../../src/world/layout.js';
import { parse } from '../../src/world/coords.js';
import { themeAt, MAX_DEPTH } from '../../src/themes/depth.js';
import { canvas, html, t as tr, themeLabel } from '../deck.js';

const AXES = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export default function mount(el) {
  const W = 640, H = 470, { g } = canvas(el, W, H);
  const row = html(el, `<div class="row"><label>Seed <input type="number" class="seed" value="123"></label>
    <label>${tr('depth', 'Tiefe', '深度')} <input type="range" class="depth" min="0" max="${MAX_DEPTH}" value="1"> <b class="dn"></b></label>
    <button class="dice">${tr('New seed', 'Neuer Seed', '換一個種子')}</button></div>`);
  const out = html(el, '<div class="out"></div>');
  const seedIn = row.querySelector('.seed'), depthIn = row.querySelector('.depth');
  let layouts = null, seed = null;

  function draw() {
    const s = +seedIn.value >>> 0, d = +depthIn.value;
    if (s !== seed) { seed = s; layouts = makeLayouts(seed); }
    const L = layouts(d);
    row.querySelector('.dn').textContent = `${d} \u00B7 ${themeLabel(themeAt(d))}`;
    const S = 50, ox = 30, oy = 10, R = 4;
    const cx = x => ox + (x + R) * S, cz = z => oy + (z + R) * S;
    g.clearRect(0, 0, W, H);
    // the grid of possible cubes; the ring the route may use is a little brighter
    for (let z = -R; z <= R; z++) for (let x = -R; x <= R; x++) {
      g.fillStyle = '#141922'; g.fillRect(cx(x) + 2, cz(z) + 2, S - 4, S - 4);
    }
    const pos = k => { const [X, , Z] = parse(k); return [X, Z]; };
    const center = k => { const [x, z] = pos(k); return [cx(x) + S / 2, cz(z) + S / 2]; };
    const spine = L.route, cells = [...L.exists];
    // links: along the route, and from each side room back to its room
    g.lineWidth = 5; g.lineCap = 'round';
    for (let i = 0; i + 1 < spine.length; i++) {
      g.strokeStyle = '#ffc94a'; g.beginPath(); g.moveTo(...center(spine[i])); g.lineTo(...center(spine[i + 1])); g.stroke();
    }
    for (const k of cells) if (!spine.includes(k)) {
      const [x, z] = pos(k), [dx, dz] = AXES[L.exit.get(k)];
      g.strokeStyle = '#70d6aa'; g.setLineDash([6, 6]);
      g.beginPath(); g.moveTo(...center(k)); g.lineTo(cx(x + dx) + S / 2, cz(z + dz) + S / 2); g.stroke(); g.setLineDash([]);
    }
    // the rooms
    g.font = 'bold 13px ui-monospace, monospace'; g.textAlign = 'center';
    for (const k of cells) {
      const [x, z] = pos(k), i = spine.indexOf(k), role = L.roles.get(k) || '';
      const guard = L.guardians.get(k);
      g.fillStyle = guard ? (guard.role === 'descent' ? '#7a5a10' : '#6a1f4a') : i >= 0 ? '#2c3a48' : '#1f3a30';
      g.fillRect(cx(x) + 5, cz(z) + 5, S - 10, S - 10);
      g.strokeStyle = guard ? (guard.role === 'descent' ? '#ffb000' : '#ff5ab4') : '#5a6678'; g.lineWidth = 2;
      g.strokeRect(cx(x) + 5, cz(z) + 5, S - 10, S - 10);
      g.fillStyle = '#fff';
      g.fillText(i >= 0 ? String(i + 1) : '+', cx(x) + S / 2, cz(z) + S / 2 + 5);
      if (L.sitePlans.get(k)?.length) { g.fillStyle = '#ffcf7a'; g.fillRect(cx(x) + S - 16, cz(z) + 8, 8, 7); }
      if (role === 'town' || (d === 0 && i === 0)) { g.fillStyle = '#76ad50'; g.fillText(tr('town', 'Stadt', '城鎮'), cx(x) + S / 2, cz(z) + S - 9); }
    }
    // the way in (ring up) and the way down (well)
    const ring = k => { const [a, b] = center(k); g.strokeStyle = '#5fd3ff'; g.lineWidth = 3; g.beginPath(); g.arc(a - 13, b - 12, 6, 0, 7); g.stroke(); };
    if (L.up) ring(L.up);
    if (L.down) { const [a, b] = center(L.down); g.fillStyle = '#05070a'; g.beginPath(); g.arc(a + 13, b - 12, 6, 0, 7); g.fill(); g.strokeStyle = '#ffc94a'; g.lineWidth = 2; g.stroke(); }
    // legend
    g.textAlign = 'left'; g.font = '12px ui-monospace, monospace';
    const lx = ox + (2 * R + 1) * S + 14;
    [['#ffc94a', tr('the route', 'die Route', '主要路線')], ['#70d6aa', tr('side room (+)', 'Nebenraum (+)', '側邊房間（+）')], ['#ff5ab4', tr('side guardian', 'Torwächter', '側邊守衛')], ['#ffb000', tr('descent guardian', 'Brunnenwächter', '下層守衛')], ['#5fd3ff', tr('way in (ring up)', 'Eingang (Ring)', '入口（往上的環形門）')], ['#ffc94a', tr('well down', 'Brunnen runter', '往下的井')], ['#ffcf7a', tr('treasure site', 'Schatzplatz', '寶物地點')]]
      .forEach(([c, t], j) => { g.fillStyle = c; g.fillRect(lx, 20 + j * 22, 12, 12); g.fillStyle = '#aab3c2'; g.fillText(t, lx + 18, 31 + j * 22); });
    const sides = [...L.guardians.values()].filter(x => x.role === 'side').length;
    out.innerHTML = tr(`depth ${d}: <b>${spine.length}</b> rooms on the route, <b>${cells.length - spine.length}</b> side rooms, `
      + (d < MAX_DEPTH ? `<b>${sides}</b> side guardian${sides === 1 ? '' : 's'} and a descent guardian at the well` : 'the core: no way further down'),
      `Tiefe ${d}: <b>${spine.length}</b> Räume auf der Route, <b>${cells.length - spine.length}</b> Nebenräume, `
      + (d < MAX_DEPTH ? `<b>${sides}</b> Torwächter und ein Brunnenwächter am Brunnen` : 'der Kern: kein Weg weiter nach unten'),
      `第 ${d} 層：主要路線上有 <b>${spine.length}</b> 個房間、旁邊還有 <b>${cells.length - spine.length}</b> 個房間，` + (d < MAX_DEPTH ? `有 <b>${sides}</b> 個側邊守衛，井邊還有一個通往下層的守衛` : '核心：沒有更深的地方了'));
  }
  seedIn.oninput = draw; depthIn.oninput = draw;
  row.querySelector('.dice').onclick = () => { seedIn.value = Math.floor(Math.random() * 99999); draw(); };
  draw();
}
