import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('styles.css'),spacing=read('spacing.css'),app=read('app.js');
test('Cabecalho compartilhado usa flex e 3px de espaco por token',()=>{
 assert.match(app,/function heading\(name,description=''\)/);
 assert.match(css,/\.page-title > div\{display:flex;justify-content:flex-start;align-items:flex-end;gap:var\(--espaco-titulo-subtitulo-pagina\);flex-wrap:wrap;min-width:0\}/);
 assert.match(spacing,/--espaco-tres: 3px/);
 assert.match(spacing,/--espaco-titulo-subtitulo-pagina: var\(--espaco-tres\)/);
});
test('Subtitulo sem margem duplicada; linha pode quebrar no iPhone',()=>{
 assert.match(css,/\.page-title > div > \.kicker\{margin-top:0;min-width:0\}/);
 assert.match(css,/\.pagina-catalogo \.page-title \.kicker\{margin-top:0\}/);
});
