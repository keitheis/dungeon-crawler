// The race between you and the monsters, depth by depth, from the game's own tables: a monster's
// health and damage at its level (src/core/enemies.js), your sword's damage (src/core/gear/stats.js
// itemStats, with your level's bonus from src/core/progression.js) and your health. The game is
// tuned for a player two levels above the depth with a sword found on the way (docs/balance.md);
// the boxes show what happens without new swords or without levels.
import { SPIDER, SNAKE, STUNDER, OCTONAUT, enemyProfile, depthLevel } from '../../src/core/enemies.js';
import { maxHealth, levelDamage } from '../../src/core/progression.js';
import { itemStats } from '../../src/core/gear/stats.js';
import { OLD_SWORD } from '../../src/core/items.js';
import { MAX_DEPTH } from '../../src/themes/depth.js';
import { canvas, html, t as tr } from '../deck.js';

const KINDS = [SPIDER, SNAKE, OCTONAUT, STUNDER];

export default function mount(el) {
  const row = html(el, `<div class="row"><select class="kind">${KINDS.map((k, i) => `<option value="${i}">${k.label}</option>`).join('')}</select>
    <label><input type="checkbox" class="old"> ${tr('keep the Old Sword', 'beim Alten Schwert bleiben', '繼續使用舊劍')}</label>
    <label><input type="checkbox" class="nolv"> ${tr('never level up', 'nie aufsteigen', '永遠不升級')}</label></div>`);
  const W = 620, H = 230, { c, g, at } = canvas(el, W, H);
  html(el, `<div class="legend"><span><i style="background:#51a9ff"></i>${tr('your slashes to beat it', 'deine Hiebe, um es zu besiegen', '你打倒它需要的揮劍次數')}</span><span><i style="background:#ff6a5a"></i>${tr('its blows to beat you', 'seine Schläge, um dich zu besiegen', '它打倒你需要的攻擊次數')}</span></div>`);
  const out = html(el, '<div class="out"></div>');
  const $ = s => row.querySelector(s);
  const L = 30, B = 26, bw = (W - L - 8) / MAX_DEPTH;
  let pick = 10;

  function fight(d) {
    const kind = KINDS[+$('.kind').value], mlv = depthLevel(d), m = enemyProfile(kind, mlv);
    const plv = $('.nolv').checked ? 1 : mlv + 2;
    // a Rare Medium Sword found at this depth, or the Old Sword you started with
    const sword = $('.old').checked ? { itemId: OLD_SWORD.id } : { itemId: 'weapon_sword_medium', gen: { ilvl: d, rarity: 'rare', affixes: [] } };
    const hit = Math.round(itemStats(sword).damage * levelDamage(plv)), hp = maxHealth(plv);
    return { kind, mlv, plv, m, hit, hp, slashes: Math.ceil(m.hp / hit), blows: Math.ceil(hp / m.damage) };
  }
  function draw() {
    g.clearRect(0, 0, W, H);
    const rows = Array.from({ length: MAX_DEPTH }, (_, i) => fight(i + 1));
    const top = Math.max(10, ...rows.map(r => Math.max(r.slashes, r.blows)));
    const y = v => H - B - Math.min(v, top) / top * (H - B - 10);
    g.font = '10px ui-monospace, monospace'; g.fillStyle = '#8a96a8'; g.textAlign = 'right';
    for (let v = 0; v <= top; v += Math.ceil(top / 5)) { g.fillText(v, L - 4, y(v) + 3); g.fillStyle = '#ffffff10'; g.fillRect(L, y(v), W - L - 8, 1); g.fillStyle = '#8a96a8'; }
    rows.forEach((r, i) => {
      const x = L + i * bw;
      if (i + 1 === pick) { g.fillStyle = '#ffffff10'; g.fillRect(x, 6, bw, H - B - 6); }
      g.fillStyle = '#51a9ff'; g.fillRect(x + 2, y(r.slashes), bw / 2 - 2, H - B - y(r.slashes));
      g.fillStyle = '#ff6a5a'; g.fillRect(x + bw / 2, y(r.blows), bw / 2 - 2, H - B - y(r.blows));
      g.fillStyle = '#8a96a8'; g.textAlign = 'center'; g.fillText(i + 1, x + bw / 2, H - B + 13);
    });
    g.textAlign = 'center'; g.fillText(tr('depth', 'Tiefe', '深度'), (W + L) / 2, H - 2);
    const r = rows[pick - 1];
    out.innerHTML = tr(`Depth ${pick}: a level-${r.mlv} ${r.kind.label} has <b>${r.m.hp}</b> health and hits for <b>${r.m.damage}</b>.\nYou, level ${r.plv}: your sword hits for <b>${r.hit}</b>, you have <b>${r.hp}</b> health.\nYou need <b>${r.slashes}</b> slash${r.slashes === 1 ? '' : 'es'}, it needs <b>${r.blows}</b> blow${r.blows === 1 ? '' : 's'}.`,
      `Tiefe ${pick}: ${r.kind.label} auf Stufe ${r.mlv} hat <b>${r.m.hp}</b> Gesundheit und trifft mit <b>${r.m.damage}</b>.\nDu, Stufe ${r.plv}: Dein Schwert trifft mit <b>${r.hit}</b>, du hast <b>${r.hp}</b> Gesundheit.\nDu brauchst <b>${r.slashes}</b> ${r.slashes === 1 ? 'Hieb' : 'Hiebe'}, es braucht <b>${r.blows}</b> ${r.blows === 1 ? 'Schlag' : 'Schläge'}.`,
      `第 ${pick} 層：等級 ${r.mlv} 的${r.kind.label}有 <b>${r.m.hp}</b> 點生命值，攻擊會造成 <b>${r.m.damage}</b> 點傷害。\n你目前是等級 ${r.plv}：劍會造成 <b>${r.hit}</b> 點傷害，你有 <b>${r.hp}</b> 點生命值。\n你需要揮劍 <b>${r.slashes}</b> 次才能打倒牠；牠需要攻擊 <b>${r.blows}</b> 次才能打倒你。`);
  }
  const move = e => { const [x] = at(e); pick = Math.max(1, Math.min(MAX_DEPTH, Math.floor((x - L) / bw) + 1)); draw(); };
  c.addEventListener('pointermove', move);
  c.addEventListener('pointerdown', move);
  for (const s of ['.kind', '.old', '.nolv']) $(s).onchange = draw;
  draw();
}
