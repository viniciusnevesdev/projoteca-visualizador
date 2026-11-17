import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('styles.css'),ui=read('ui-tokens.css'),sp=read('spacing.css'),app=read('app.js'),html=read('index.html'),sw=read('sw.js');
test('Fundo, borda e selecao compartilham tokens reais',()=>{
 for(const k of ['--fundo-suave','--fundo-neutro-intenso','--fundo-selecionado','--borda-padrao'])assert.ok(ui.includes(k+':'),k);
 assert.doesNotMatch(css,/color-mix\(in srgb,var\(--line\) (30|55)%,var\(--surface\)\)/);
 assert.doesNotMatch(css,/border:1px solid var\(--line\)/);
 assert.ok((css.match(/var\(--fundo-suave\)/g)||[]).length>=10);
 for(const k of ['.environment .env.active','.bottom button.selected'])assert.ok(css.includes(k+'{background:var(--fundo-selecionado)}'));
});
test('Raio de caixa e capsula reaproveitados; pequenos raios coerentes',()=>{
 assert.match(css,/\.tip\{[^}]*border-radius:var\(--raio-cartao\)/);
 assert.doesNotMatch(css,/var\(--radius-(?:card|control|pill)\)/);
 assert.doesNotMatch(css,/border-radius:(?:9|10|14)px/);
 assert.match(css,/\.token-row\{[^}]*border-radius:var\(--raio-medio\)/);
});
test('Padding e gap por papel; margens de JS nao sao avulsas',()=>{
 for(const k of ['--espaco-dentro-cartao-padrao','--espaco-blocos-gerais','--margem-pagina','--espaco-controles','--espaco-separacao-conteudo'])assert.ok(sp.includes(k+':'),k);
 assert.match(css,/\.card\{[^}]*padding:var\(--espaco-dentro-cartao-padrao\)/);
 assert.match(css,/\.actions\{[^}]*gap:var\(--espaco-controles\)/);
 assert.doesNotMatch(app,/style="margin-top:\d+px"/);
 assert.equal((app.match(/class="stack deslocamento-conteudo"/g)||[]).length,4);
});
test('Sombra comum por funcao; 4 tamanhos de icone e PWA versionado',()=>{
 for(const k of ['controle','modal','amostra','aviso'])assert.ok(ui.includes('--sombra-'+k+':'));
 for(const k of ['mini','pequeno','medio','padrao'])assert.ok(ui.includes('--icone-'+k+':'));
 assert.match(html,/ui-tokens\.css\?v=030/);
 assert.match(sw,/ui-tokens\.css\?v=030/);
 assert.match(sw,/projoteca-visualizador-v030/);
});
