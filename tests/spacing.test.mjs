import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('styles.css'),space=read('spacing.css'),app=read('app.js'),html=read('index.html'),sw=read('sw.js');
test('Espaços compartilhados e nenhum valor solto em margin padding gap',()=>{
 const all=[...space.matchAll(/(--(?:espaco|reserva)-[a-z0-9-]+):/g)].map(m=>m[1]);
 assert.ok(all.length>=19);
 for(const name of ['--espaco-dentro-cartao','--espaco-entre-elementos-cartao','--espaco-entre-cartoes','--espaco-etiqueta-vertical','--espaco-etiqueta-horizontal'])assert.ok(all.includes(name),name);
 const orphan=[...css.matchAll(/(?:padding(?:-[a-z-]+)?|margin(?:-[a-z-]+)?|gap)\s*:\s*([^;}]+)/g)].filter(m=>/\b\d+px\b/.test(m[1]));
 assert.equal(orphan.length,0,orphan.map(x=>x[0]).join('; '));
 assert.match(css,/\.card\.project-entry\s*\{\s*padding:var\(--espaco-dentro-cartao\)/);
 assert.match(css,/\.project-card\s*\{\s*gap:var\(--espaco-entre-elementos-cartao\)/);
 assert.match(css,/\.stack\{display:grid;gap:var\(--espaco-entre-cartoes\)/);
 assert.match(css,/padding:var\(--espaco-etiqueta-vertical\) var\(--espaco-etiqueta-horizontal\)/);
});
test('Prioridades dos ajustes e cartões usam o mesmo componente',()=>{
 assert.match(app,/settings-legend[\s\S]*?priority-principal[^;]*?pill priority-pill/);
 assert.match(app,/settings-legend[\s\S]*?priority-alta[^;]*?pill priority-pill/);
 assert.doesNotMatch(css,/\.legend-principal\{/);
});
test('Fundo de projeto mais suave, descrição curta e engrenagem',()=>{
 assert.match(css,/--intensidade-fundo-projeto:5%/);
 assert.match(css,/var\(--entry-accent\) var\(--intensidade-fundo-projeto\)/);
 assert.match(css,/-webkit-line-clamp:2/);
 assert.match(html,/id="btn-settings"[^\n]*<path d="M10 2h4/);
 assert.doesNotMatch(html,/M12 2v2m0 16v2/);
});
test('Folha de espaços e cache versão 024',()=>{
 assert.match(html,/spacing\.css\?v=024/);
 assert.match(sw,/spacing\.css\?v=024/);
 assert.match(sw,/projoteca-visualizador-v024/);
});
