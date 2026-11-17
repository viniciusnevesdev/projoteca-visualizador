import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const tokens=read('tokens.css');
const style=read('styles.css');
const app=read('app.js');
const html=read('index.html');
test('One color source with three independent families',()=>{
 assert.match(html,/href="\.\/tokens\.css"/);
 assert.match(tokens,/color-scheme:light dark/);
 for(const name of ['--status-success','--status-warning','--status-danger','--priority-principal','--priority-alta','--priority-normal','--type-project','--type-idea','--type-decision','--type-file','--type-pending','--type-rule']){
  assert.ok(tokens.includes(name+':'),name);
 }
 assert.doesNotMatch(style,/#[0-9a-fA-F]{3,8}\b/);
});
test('Settings control, persist theme locally, isolate from catalog ZIP',()=>{
 assert.match(html,/id="btn-settings"/);
 assert.match(app,/projoteca\.theme\.v1/);
 assert.match(app,/function selectTheme\(value\)/);
 assert.match(app,/function settingsPage\(\)/);
 assert.match(app,/const safePriority=/);
 assert.match(style,/\.priority-principal/);
 assert.match(style,/\.status-aprovado_nao_implementado/);
});

test('Light theme vibrancy isolated from dark theme',()=>{
 for(const token of ['--priority-principal-bg','--priority-principal-ink','--status-warning-bg','--status-warning-ink','--type-project-bg','--type-idea-bg']){
  assert.match(tokens,new RegExp(token.replaceAll('-','\\-')+':light-dark\\('));
 }
 assert.match(style,/\.stats \.stat-principal\{background:var\(--priority-principal-bg\)/);
 assert.match(style,/\.status-aguardando_decisao\{[^}]*background:var\(--status-warning-card-bg\)/);
 assert.doesNotMatch(style,/#[a-fA-F0-9]{3,8}\b/);
});
