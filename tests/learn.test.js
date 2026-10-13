// The kids' guide (learn/): its pages, its three languages, and its references into the game.
// "up to date with the game" fails when code the guide explains has changed; the message says
// which slides to review (learn/README.md, tools/learn.mjs).
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DECKS } from '../learn/decks.js';
import { check, describe, restamp } from '../tools/learn.mjs';
import { extract, fingerprint, MARKER } from '../learn/refs.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LEARN = join(ROOT, 'learn');
const pages = readdirSync(LEARN).filter(f => f.endsWith('.html'));
const read = f => readFileSync(join(LEARN, f), 'utf8');
const ids = f => new Set([...read(f).matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));

test('guide selects a saved language or a supported browser preference before rendering', () => {
  const source = read('lang.js');
  for (const [saved, preferences, expected] of [
    ['zh-Hant', ['de-DE'], 'zh-Hant'], ['de', ['zh-TW'], 'de'], ['en', ['zh-TW'], 'en'],
    [null, ['zh-TW', 'en-US'], 'zh-Hant'], [null, ['zh-Hant-TW'], 'zh-Hant'],
    [null, ['zh-HK'], 'zh-Hant'], [null, ['zh'], 'zh-Hant'],
    ['unknown', ['fr-FR', 'de-AT'], 'de'], [null, ['fr-FR'], 'en'],
    [null, ['zh-CN', 'en-US'], 'en'],
  ]) {
    const document = { documentElement: { dataset: {} } };
    runInNewContext(source, { document, navigator: { languages: preferences }, localStorage: { getItem: () => saved } });
    assert.equal(document.documentElement.lang, expected, `${saved}: ${preferences}`);
    assert.equal(document.documentElement.dataset.lang, expected);
  }
  const document = { documentElement: { dataset: {} } };
  runInNewContext(source, { document, navigator: { language: 'zh-TW' }, localStorage: { getItem() { throw new Error('unavailable'); } } });
  assert.equal(document.documentElement.lang, 'zh-Hant', 'works when storage is unavailable');
});

test('learn markers do not change the code fingerprints', () => {
  for (const [path, source, marker] of [
    ['example.js', '// A value the guide explains.\nexport const ANSWER = 42;', '// learn: code.html#names (see learn/README.md)'],
    ['example.py', '# A value the guide explains.\nANSWER = 42', '# learn: art.html#sdf-code (see learn/README.md)'],
  ]) {
    assert.ok(MARKER.test(marker), path);
    assert.ok(MARKER.test('  ' + marker), path + ': indented marker');
    const plain = extract(source, path, 'ANSWER');
    const marked = extract(marker + '\n' + source, path, 'ANSWER');
    assert.equal(marked.text, plain.text, path);
    assert.equal(fingerprint(marked.text), fingerprint(plain.text), path);
  }
});

test('every room in decks.js exists and every room page is in decks.js', () => {
  for (const d of DECKS) {
    assert.ok(pages.includes(d.file), `${d.file} is listed but missing`);
    for (const lang of ['de', 'zh-Hant'])
      assert.ok(d[lang]?.title && d[lang]?.teaser, `${d.file}: ${lang} title and teaser`);
    assert.ok(existsSync(resolve(LEARN, d.icon)), `${d.file}: icon ${d.icon}`);
  }
  for (const p of pages.filter(p => read(p).includes('<main class="deck">')))
    assert.ok(DECKS.some(d => d.file === p), `${p} is a room but not in decks.js`);
});

// Each translated block must have the same sibling block in every supported language.
// This guards missing or misplaced text that would disappear when readers switch languages.
test('every text comes in English, German and Taiwan Chinese', () => {
  const languages = ['en', 'de', 'zh-Hant'];
  for (const page of pages) {
    const html = read(page);
    assert.match(html, /<script src="lang.js"><\/script>/, `${page}: loads lang.js`);
    const title = html.match(/<title\b[^>]*>/)?.[0] || '';
    for (const lang of languages.slice(1))
      assert.match(title, new RegExp(`data-${lang.toLowerCase()}="[^"]+"`), `${page}: ${lang} title`);
    const root = { children: [] }, stack = [root], translated = [];
    for (const m of html.matchAll(/<(\/?)(\w+)\b([^>]*)>/g)) {
      const [, closing, tag, attrs] = m;
      if (closing) {
        while (stack.length > 1 && stack.pop().tag !== tag);
        continue;
      }
      const parent = stack.at(-1), lang = attrs.match(/\blang="([^"\s]+)"/)?.[1];
      const node = { tag, lang, at: m.index, parent, children: [] };
      parent.children.push(node);
      if (lang && tag !== 'html') translated.push(node);
      if (!VOID.has(tag)) stack.push(node);
    }
    for (const node of translated) {
      const languageIndex = languages.indexOf(node.lang);
      assert.ok(languageIndex >= 0, `${page}: unknown lang ${node.lang} at ${line(html, node.at)}`);
      const start = node.parent.children.indexOf(node) - languageIndex;
      for (const [offset, lang] of languages.entries()) {
        const sibling = node.parent.children[start + offset];
        assert.ok(sibling?.tag === node.tag && sibling.lang === lang,
          `${page}: <${node.tag} lang="${node.lang}"> at ${line(html, node.at)} needs its ${lang} sibling`);
      }
    }
    for (const m of html.matchAll(/<img\b[^>]*>/g))
      if (/\balt="[^"]+"/.test(m[0]) && !inLang(html, m.index))
        for (const lang of languages.slice(1)) assert.ok(m[0].includes(`data-${lang.toLowerCase()}-alt="`),
          `${page}: image at ${line(html, m.index)} needs ${lang} alt text`);
  }
});
const line = (s, at) => 'line ' + (s.slice(0, at).split('\n').length);
const VOID = new Set(['img', 'br', 'meta', 'link', 'input', 'hr', 'source', 'wbr']);
// whether the position is inside an element with a lang attribute (other than <html>)
function inLang(html, at) {
  const stack = [];
  for (const m of html.slice(0, at).matchAll(/<(\/?)(\w+)([^>]*)>/g)) {
    if (m[1]) { while (stack.length && stack.pop().tag !== m[2]); continue; }
    if (m[2] !== 'html' && !VOID.has(m[2])) stack.push({ tag: m[2], lang: /\blang="/.test(m[3]) });
  }
  return stack.some(s => s.lang);
}

test('links, images and anchors in the guide resolve', () => {
  for (const page of pages) {
    for (const [, url] of read(page).matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|data:)/.test(url) || url.includes('${')) continue;   // external, or built by a script
      const [path, hash] = url.split('#'), abs = path ? resolve(LEARN, path.split('?')[0]) : join(LEARN, page);
      assert.ok(existsSync(abs), `${page}: ${url} does not exist`);
      if (hash && abs.endsWith('.html') && abs.startsWith(LEARN)) assert.ok(ids(abs.slice(LEARN.length + 1)).has(hash), `${page}: ${url} has no #${hash}`);
    }
  }
});

test('every demo has its module', () => {
  for (const page of pages) for (const [, name] of read(page).matchAll(/data-demo="([^"]+)"/g))
    assert.ok(existsSync(join(LEARN, 'demos', name + '.js')), `${page}: demo ${name}`);
});

test('the game modules the demos and live values import still export what they use', async () => {
  for (const demo of readdirSync(join(LEARN, 'demos'))) {
    const src = readFileSync(join(LEARN, 'demos', demo), 'utf8');
    for (const [, names, from] of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*'(\.\.\/\.\.\/[^']+)'/g)) {
      const file = resolve(LEARN, 'demos', from);
      assert.ok(existsSync(file), `${demo}: ${from} does not exist`);
      // the audio player needs a browser; check its exports by reading the source
      const text = readFileSync(file, 'utf8');
      const mod = /\bwindow\b|\blocalStorage\b|addEventListener/.test(text) ? null : await import(pathToFileURL(file));
      for (const name of names.split(',').map(n => n.trim().split(/\s+as\s+/)[0]).filter(Boolean)) {
        const ok = mod ? name in mod : new RegExp(`export\\s+(?:const|let|function|class|async function)\\s+${name}\\b`).test(text);
        assert.ok(ok, `${demo}: ${from} does not export ${name}`);
      }
    }
  }
});

test('the kids\' guide is up to date with the game', async () => {
  const problems = await check(), text = describe(problems);
  assert.ok(!text, '\n' + text);
});

test('stamping clears the notes of reviewed slides only, and deferring keeps them', () => {
  // a.html#x explains A, a.html#y explains A and B, b.html#z explains C
  const refs = hashes => new Map(Object.entries({ A: ['a.html#x', 'a.html#y'], B: ['a.html#y'], C: ['b.html#z'] })
    .map(([k, slides]) => [k, { hash: hashes[k], slides }]));
  const start = { refs: { A: '1', B: '1', C: '1' }, outdated: {} };

  // C changes and is put off: its slide is noted, the code accepted
  const deferred = restamp(start, refs({ A: '1', B: '1', C: '2' }), { defer: true, since: 'abc' });
  assert.deepEqual(deferred, { refs: { A: '1', B: '1', C: '2' }, outdated: { 'b.html#z': 'C changed (since abc)' } });
  // then A changes and is reviewed: the note on b.html#z stays (it was the bug: it went away)
  const stamped = restamp(deferred, refs({ A: '2', B: '1', C: '2' }));
  assert.deepEqual(stamped.outdated, { 'b.html#z': 'C changed (since abc)' });
  assert.equal(stamped.refs.A, '2');
  // naming the noted slide clears it
  assert.deepEqual(restamp(stamped, refs({ A: '2', B: '1', C: '2' }), { slides: ['b.html#z'] }).outdated, {});

  // only a.html#x reviewed: A is accepted, a.html#y (which also explains A) gets noted, C waits
  const some = restamp(start, refs({ A: '2', B: '1', C: '2' }), { slides: ['a.html#x'] });
  assert.deepEqual(some, { refs: { A: '2', B: '1', C: '1' }, outdated: { 'a.html#y': 'A changed' } });
  // deferring twice for the same change does not repeat the note
  const twice = restamp(restamp(start, refs({ A: '2', B: '1', C: '1' }), { defer: true }), refs({ A: '2', B: '1', C: '1' }), { defer: true });
  assert.deepEqual(twice.outdated, { 'a.html#x': 'A changed', 'a.html#y': 'A changed' });
});
