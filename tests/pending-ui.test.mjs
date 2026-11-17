import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('styles.css'),space=read('spacing.css'),app=read('app.js'),sw=read('sw.js');
test('Pendencias usam hierarquia e tokens de espaco especificos',()=>{
 for(const name of ['--espaco-ambiente-pagina','--espaco-titulo-subtitulo-pagina','--espaco-blocos-pagina','--espaco-filtros-secao-pagina'])assert.ok(space.includes(name+': var('),name);
 assert.match(css,/\.environment\.antes-pagina\{margin-bottom:var\(--espaco-ambiente-pagina\)/);
 assert.match(css,/\.pagina-catalogo \.page\{gap:var\(--espaco-blocos-pagina\)/);
 assert.match(css,/\.pagina-catalogo \.page-title \.kicker\{margin-top:var\(--espaco-titulo-subtitulo-pagina\)/);
 assert.match(app,/classList\.toggle\('pagina-pendencias',compactPending\)/);
});
test('Aviso tem raio de cartao, pendencias nao usam o azul dos projetos',()=>{
 assert.match(css,/\.tip\{[^}]*border-radius:var\(--raio-cartao\)/);
 assert.match(css,/\.pagina-pendencias \.pending-card\{background:var\(--surface\)/);
 assert.match(css,/status-sem_opiniao_usuario[^}]*border-left:3px solid var\(--type-decision\);background:var\(--surface\)/);
});
test('Aprovar e reprovar usam as cores oficiais para regras e tarefas',()=>{
 assert.match(app,/action\.startsWith\('approve-'\)\?'acao-aprovar'/);
 assert.match(app,/action\.startsWith\('reject-'\)\?'acao-reprovar'/);
 assert.match(css,/\.acao-aprovar\{[^}]*var\(--color-success\)/);
 assert.match(css,/\.acao-reprovar\{[^}]*var\(--color-danger\)/);
 assert.match(sw,/projoteca-visualizador-v029/);
});
