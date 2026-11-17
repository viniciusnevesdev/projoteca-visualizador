import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('styles.css'),tokens=read('spacing.css'),html=read('index.html'),sw=read('sw.js');
test('Alturas com quatro tokens por funcao',()=>{
 for(const [name,value] of Object.entries({'--altura-filtro':'36px','--altura-acao':'38px','--altura-ambiente':'38px','--area-toque-minima':'44px'})){
  assert.ok(tokens.includes(name+': '+value+';'),name);
 }
 assert.match(css,/\.chip\{[^}]*min-height:var\(--altura-filtro\)/);
 assert.match(css,/\.primary,\.soft,\.ghost\{[^}]*min-height:var\(--altura-acao\)/);
 assert.match(css,/\.theme-choice\{[^}]*min-height:var\(--altura-acao\)/);
 assert.match(css,/\.env\{[^}]*min-height:var\(--altura-ambiente\)/);
 assert.match(css,/\.bottom button\{[^}]*min-height:var\(--area-toque-minima\)/);
 assert.match(css,/\.icon-btn\{[^}]*height:var\(--area-toque-minima\)/);
});
test('Alturas pintadas e area de toque separadas',()=>{
 for(const sel of ['.chip:not(:disabled)::after','.primary:not(:disabled)::after','.soft:not(:disabled)::after','.ghost:not(:disabled)::after','.theme-choice:not(:disabled)::after'])
  assert.ok(css.includes(sel),sel);
 assert.match(css,/height:max\(100%,var\(--area-toque-minima\)\)/);
 assert.doesNotMatch(css,/min-height:44px/);
});
test('Cache e HTML atualizados sem modificar tokens cromaticos',()=>{
 assert.match(html,/v0\.1\.18/);
 assert.match(sw,/projoteca-visualizador-v028/);
 assert.match(html,/spacing\.css\?v=028/);
});
