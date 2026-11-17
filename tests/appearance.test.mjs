import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const tokens=read('tokens.css'),css=read('styles.css'),editor=read('token-editor.js');
const html=read('index.html'),sw=read('sw.js'),app=read('app.js');
const declared=[...tokens.matchAll(/(^|\s)(--[a-z0-9-]+):/gm)].map(x=>x[2]);
const groups=JSON.parse(editor.match(/const SECTIONS=(\[[\s\S]*?\]);/)[1]);
const keys=groups.flatMap(g=>g.keys);

test('31 → 20 tokens cromáticos reais em tokens.css',()=>{
 assert.equal(declared.length,20);
 assert.equal(new Set(declared).size,20);
 assert.deepEqual(new Set(keys),new Set(declared));
 assert.equal(keys.length,20);
 assert.deepEqual(groups.map(g=>[g.id,g.keys.length]),[['structure',7],['priority',2],['types',6],['actions',5]]);
 for(const removed of ['--surface2','--surface3','--on-brand','--nav-bg','--shadow-subtle','--shadow-toast','--dialog-backdrop','--on-action-add','--status-warning-ink','--status-success-ink','--status-info-ink']){
   assert.ok(!declared.includes(removed),removed+' still declared');
 }
 assert.ok(declared.includes('--shadow'));
 assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/);
});
test('Five exact official MMU color values remain fixed',()=>{
 for(const [token,color] of [
 ['--color-danger','#E22400'],['--color-success','#34C759'],
 ['--color-warning','#FFB501'],['--color-info','#0189FB'],['--action-add','#30BCFF']
 ])assert.match(tokens,new RegExp(token+': '+color));
});
test('Derived structural colors and statuses have no orphan global references',()=>{
 const locals=[...css.matchAll(/(^|[\s;{])(--[a-z0-9-]+)\s*:/gm)].map(x=>x[2]);
 const fonts=[...read('typography.css').matchAll(/(--fonte-[a-z-]+):/g)].map(m=>m[1]);
 const all=new Set([...declared,...fonts,...locals,'--sample']);
 const refs=[...css.matchAll(/var\((--[a-z0-9-]+)/g)].map(x=>x[1]);
 assert.deepEqual([...new Set(refs.filter(x=>!all.has(x)))],[]);
 for(const removed of ['--surface2','--surface3','--on-brand','--nav-bg','--shadow-toast','--dialog-backdrop','--status-warning-ink']){
  assert.doesNotMatch(css,new RegExp('var\\('+removed+'\\)'));
 }
 assert.match(css,/color-mix\(in srgb,var\(--line\) 30%,var\(--surface\)\)/);
 assert.match(css,/\.project-entry\.type-idea\{--entry-accent:var\(--type-idea\)\}/);
 assert.match(css,/\.stats \.stat-principal\{--stat-accent:var\(--priority-principal\)\}/);
 assert.match(css,/\.token-copy-footer\{position:static/);
});
test('Single shadow color with different blur, buttons derive contrast',()=>{
 assert.match(css,/var\(--shadow\)/);
 assert.match(css,/box-shadow:0 5px 20px var\(--shadow\)/);
 assert.match(css,/light-dark\(var\(--surface\),var\(--bg\)\)/);
 assert.match(css,/light-dark\(var\(--ink\),var\(--bg\)\)/);
});
test('Old local choices kept in migration backup, and copy output persists them',()=>{
 assert.match(editor,/LEGACY_STORAGE/);
 assert.match(editor,/function collectLegacy/);
 assert.match(editor,/function migrateStored/);
 assert.match(editor,/\['--shadow-subtle','--shadow'\]/);
 assert.match(editor,/legacy:clone\(legacyOverrides\)/);
 assert.match(app,/renderTokenEditor\(\)/);
 assert.match(editor,/Copiar alterações/);
});
test('Theme and offline version 0.1.11 correct',()=>{
 assert.match(html,/v0\.1\.13/);
 assert.match(html,/tokens\.css\?v=023/);
 assert.match(html,/styles\.css\?v=023/);
 assert.match(sw,/projoteca-visualizador-v023/);
 assert.match(sw,/token-editor\.js\?v=023/);
 assert.match(app,/token-editor\.js\?v=023/);
 assert.match(tokens,/color-scheme: light dark/);
 assert.match(css,/--stat-accent-width:4px/);
 assert.match(css,/data-theme="dark"/);
});

test('Paleta personalizada em cinco escolhas, vinte tokens oficiais',()=>{
 assert.match(tokens,/--priority-principal:\s*light-dark\(#9429FF,#C675FF\)/);
 assert.match(tokens,/--priority-alta:\s*light-dark\(#FF86E9,#F780FF\)/);
 assert.match(tokens,/--type-idea:\s*light-dark\(#9AB7B7,#7CE1D8\)/);
 assert.equal(declared.length,20);
});
