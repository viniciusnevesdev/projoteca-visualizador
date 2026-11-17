import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('app.js'),css=read('styles.css'),sp=read('spacing.css'),sw=read('sw.js');
test('Quatro abas compartilham a hierarquia de espacos',()=>{
 assert.match(app,/\['painel','projetos','pendencias','arquivos'\]\.includes\(state\.tab\)/);
 assert.match(app,/classList\.toggle\('pagina-catalogo',layoutCatalogo\)/);
 assert.match(app,/classList\.toggle\('antes-pagina',layoutCatalogo\)/);
 for(const token of ['--espaco-ambiente-pagina','--espaco-titulo-subtitulo-pagina','--espaco-blocos-pagina','--espaco-filtros-secao-pagina'])assert.ok(sp.includes(token+': var('),token);
 assert.match(css,/\.environment\.antes-pagina\{margin-bottom:var\(--espaco-ambiente-pagina\)/);
 assert.match(css,/\.pagina-catalogo \.page\{gap:var\(--espaco-blocos-pagina\)/);
 assert.match(css,/\.pagina-catalogo \.page-title\{margin-bottom:0\}/);
 assert.match(css,/\.pagina-catalogo \.page-title \.kicker\{margin-top:var\(--espaco-titulo-subtitulo-pagina\)/);
 assert.doesNotMatch(css,/\.environment\.antes-pendencias/);
 assert.match(sw,/projoteca-visualizador-v030/);
});
test('Tratamento exclusivo dos avisos e pendencias continua exclusivo',()=>{
 assert.match(css,/\.tip\{[^}]*border-radius:var\(--raio-cartao\)/);
 assert.match(css,/\.pagina-pendencias \.pending-card\{background:var\(--surface\)/);
 assert.match(css,/\.acao-aprovar\{[^}]*var\(--color-success\)/);
 assert.match(css,/\.acao-reprovar\{[^}]*var\(--color-danger\)/);
});
