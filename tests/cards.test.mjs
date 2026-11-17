import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('app.js'),css=read('styles.css'),sw=read('sw.js');
const project=app.slice(app.indexOf('function projectCard('),app.indexOf('function listProjects('));
test('Cartao inteiro usa botao nativo com rotulo para leitor de tela',()=>{
 assert.match(project,/class="project-card-hitbox" data-action="detail" data-id=/);
 assert.match(project,/aria-label="Abrir projeto/);
 assert.match(project,/class="project-title"/);
 assert.doesNotMatch(project,/class="ghost mini" data-action="detail"/);
 assert.doesNotMatch(project,/class="linkrow name"/);
 assert.match(css,/\.project-card-hitbox \{position:absolute;inset:0;z-index:1/);
 assert.match(css,/\.project-card-hitbox:focus-visible/);
});
test('Projetos filhos preservam seus botoes independentes',()=>{
 assert.match(project,/class="tree-child"/);
 assert.match(project,/class="child-link" data-action="detail"/);
 assert.match(css,/\.project-card \.tree-child,\.project-card \.child-link \{position:relative;z-index:2/);
});
test('Sem altura artificial de titulo; padding simetrico compartilhado',()=>{
 assert.doesNotMatch(css,/\.project-card button\.linkrow\{/);
 assert.match(css,/\.card\.project-entry \{position:relative;padding:var\(--espaco-dentro-cartao\);\}/);
 assert.match(css,/\.project-card \.project-title\{margin:0/);
 assert.match(sw,/projoteca-visualizador-v026/);
});
