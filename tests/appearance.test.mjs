import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const tokens=read('tokens.css'),style=read('styles.css'),editor=read('token-editor.js');
const html=read('index.html'),sw=read('sw.js'),app=read('app.js');
const declared=[...tokens.matchAll(/(^|\s)(--[a-z0-9-]+):/gm)].map(x=>x[2]);
const groups=JSON.parse(editor.match(/const SECTIONS=(\[[\s\S]*?\]);/)[1]);
const keys=groups.flatMap(g=>g.keys);
test('Compactação real: 74 → 31 declarações físicas no tokens.css',()=>{
 assert.equal(declared.length,31);
 assert.equal(new Set(declared).size,31);
 assert.deepEqual(new Set(keys),new Set(declared));
 assert.equal(keys.length,31);
 for(const removed of ['--priority-principal-fill','--priority-principal-ink','--priority-alta-bg','--type-idea-card-bg','--type-project-card-bg','--type-idea-ink','--status-warning-card-bg','--stat-card-bg']){
  assert.ok(!declared.includes(removed),'still declared '+removed);
 }
 assert.doesNotMatch(style, /#[0-9a-fA-F]{3,8}\b/);
});
test('MMU semânticas canônicas e famílias independentes',()=>{
 for(const [token,color] of [
 ['--color-danger','#E22400'],['--color-success','#34C759'],['--color-warning','#FFB501'],['--color-info','#0189FB'],['--action-add','#30BCFF']
 ]){
  assert.match(tokens,new RegExp(token+': '+color));
 }
 assert.deepEqual(groups.find(g=>g.id==='priority').keys,['--priority-principal','--priority-alta']);
 assert.equal(groups.find(g=>g.id==='types').keys.length,6);
});
test('Styles CSS have no orphan token references and derive repeated usages from shared hues',()=>{
 const all=new Set([...declared,...[...style.matchAll(/(^|[\s;{])(--[a-z0-9-]+)\s*:/gm)].map(x=>x[2])]);
 const refs=[...style.matchAll(/var\((--[a-z0-9-]+)/g)].map(x=>x[1]);
 assert.deepEqual([...new Set(refs.filter(x=>!all.has(x)&&x!=='--sample'))],[]);
 assert.match(style,/\.project-entry\.type-idea\{--entry-accent:var\(--type-idea\)\}/);
 assert.match(style,/\.stats \.stat-principal\{--stat-accent:var\(--priority-principal\)\}/);
 assert.match(style,/color-mix\(in srgb/);
 assert.match(style,/\.token-copy-footer\{position:static/);
});
test('Editor keeps existing source and legacy backup while no longer presenting 43 removed tokens',()=>{
 assert.match(editor,/LEGACY_STORAGE/);
 assert.match(editor,/function collectLegacy/);
 assert.match(editor,/function migrateStored/);
 assert.match(editor,/legacy:clone\(legacyOverrides\)/);
 assert.match(app,/function settingsPage\(\)/);
 assert.match(app,/renderTokenEditor\(\)/);
 assert.match(editor,/Copiar alterações/);
});
test('Cache version and automatic light/dark themes remain integrated',()=>{
 assert.match(html,/v0\.1\.10/);
 assert.match(html,/tokens\.css\?v=020/);
 assert.match(sw,/projoteca-visualizador-v020/);
 assert.match(sw,/token-editor\.js/);
 assert.match(tokens,/color-scheme: light dark/);
 assert.match(style,/--stat-accent-width:4px/);
 assert.match(style,/data-theme="dark"/);
});
