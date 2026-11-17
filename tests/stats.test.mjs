import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('styles.css'),space=read('spacing.css'),app=read('app.js'),sw=read('sw.js');
test('Estatisticas 2x2 com numero e legenda alinhados horizontalmente',()=>{
 assert.match(app,/class="grid2 stats"/);
 for(const label of ['Projetos','Principais','Só ideias','A verificar'])assert.ok(app.includes(label));
 assert.match(css,/\.stats \.card\{display:flex;align-items:center;gap:var\(--espaco-pequeno\);padding:var\(--espaco-dentro-estatistica\)/);
 assert.match(css,/\.stats strong\{[^}]*font-size:var\(--fonte-destaque\);[^}]*margin-bottom:0/);
 assert.match(css,/\.stats span\{[^}]*line-height:1\.25/);
 assert.match(css,/\.grid2\.stats\{gap:var\(--espaco-pequeno\)/);
 assert.doesNotMatch(css,/\.stats \.card\{padding:var\(--espaco-grande\)/);
});
test('Cor e tamanho da estatistica conservados, espaco centralizado',()=>{
 assert.match(space,/--espaco-dentro-estatistica: var\(--espaco-pequeno\)/);
 assert.match(css,/\.stats \.stat-principal\{--stat-accent:var\(--priority-principal\)/);
 assert.match(css,/\.stats \.stat-idea\{--stat-accent:var\(--type-idea\)/);
 assert.match(css,/\.stats \.stat-review\{--stat-accent:var\(--color-warning\)/);
 assert.match(sw,/projoteca-visualizador-v031/);
});
