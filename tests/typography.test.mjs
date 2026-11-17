import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const tokens=read('typography.css'),css=read('styles.css'),html=read('index.html'),sw=read('sw.js');
const values=Object.fromEntries([...tokens.matchAll(/(--fonte-[a-z-]+):\s*(\d+)px/g)].map(m=>[m[1],Number(m[2])]));
test('sete tamanhos de fonte reais, independentes e em português',()=>{
 assert.deepEqual(values,{'--fonte-navegacao':11,'--fonte-legenda':12,'--fonte-corpo':14,'--fonte-campo':16,'--fonte-secao':18,'--fonte-titulo':24,'--fonte-destaque':30});
 assert.equal(new Set(Object.values(values)).size,7);
});
test('CSS usa apenas os sete tokens e preserva campo com 16px',()=>{
 assert.doesNotMatch(css,/font-size:\s*\d+px/);
 assert.match(css,/font:var\(--fonte-corpo\)\/1\.5/);
 assert.match(css,/input,textarea,select\{[^}]*font-size:var\(--fonte-campo\)/);
 assert.match(css,/\.token-hex-label input\{[^}]*font-size:var\(--fonte-campo\)/);
 assert.match(css,/\.bottom button\{[^}]*min-height:var\(--area-toque-minima\)[^}]*font-size:var\(--fonte-navegacao\)/);
 assert.match(css,/\.env\{[^}]*min-height:var\(--altura-ambiente\)/);
 assert.match(css,/h2\{[^}]*font-size:var\(--fonte-secao\)/);
 assert.match(css,/h1\{[^}]*font-size:var\(--fonte-titulo\)/);
 assert.match(css,/\.stats strong\{[^}]*font-size:var\(--fonte-destaque\)/);
 assert.match(css,/\.token-preview \.stats strong\{[^}]*font-size:var\(--fonte-titulo\)/);
});
test('novos CSS e caches versionados offline',()=>{
 assert.match(html,/typography\.css\?v=030/);
 assert.match(html,/v0\.1\.20/);
 assert.match(sw,/typography\.css\?v=030/);
 assert.match(sw,/projoteca-visualizador-v030/);
});
