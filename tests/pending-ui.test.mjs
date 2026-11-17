import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('styles.css'),space=read('spacing.css'),app=read('app.js'),sw=read('sw.js');
test('Pendencias usam hierarquia e tokens de espaco especificos',()=>{
 for(const name of ['--espaco-ambiente-pendencias','--espaco-titulo-subtitulo-pendencias','--espaco-blocos-pendencias','--espaco-filtros-secao-pendencias'])assert.ok(space.includes(name+': var('),name);
 assert.match(css,/\.environment\.antes-pendencias\{margin-bottom:var\(--espaco-ambiente-pendencias\)/);
 assert.match(css,/\.pagina-pendencias \.page\{gap:var\(--espaco-blocos-pendencias\)/);
 assert.match(css,/\.pagina-pendencias \.page-title \.kicker\{margin-top:var\(--espaco-titulo-subtitulo-pendencias\)/);
 assert.match(app,/classList\.toggle\('pagina-pendencias',compactPending\)/);
});
test('Aviso tem raio de cartao, pendencias nao usam o azul dos projetos',()=>{
 assert.match(css,/\.pagina-pendencias \.tip\{border-radius:var\(--radius-card\)/);
 assert.match(css,/\.pagina-pendencias \.pending-card\{background:var\(--surface\)/);
 assert.match(css,/status-sem_opiniao_usuario[^}]*border-left:3px solid var\(--type-decision\);background:var\(--surface\)/);
});
test('Aprovar e reprovar usam as cores oficiais para regras e tarefas',()=>{
 assert.match(app,/action\.startsWith\('approve-'\)\?'acao-aprovar'/);
 assert.match(app,/action\.startsWith\('reject-'\)\?'acao-reprovar'/);
 assert.match(css,/\.acao-aprovar\{[^}]*var\(--color-success\)/);
 assert.match(css,/\.acao-reprovar\{[^}]*var\(--color-danger\)/);
 assert.match(sw,/projoteca-visualizador-v027/);
});
