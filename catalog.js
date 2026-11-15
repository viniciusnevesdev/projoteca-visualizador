import{zipJson,zipText,putText,putJson,updateManifest,nextVersion}from'./zip.js';
export const phaseNames={ideia:'Ideia',planejado:'Planejado',a_verificar:'A verificar',desenvolvimento:'Em desenvolvimento',em_testes:'Em testes',operacional:'Operacional',pausado:'Pausado',arquivado:'Arquivado'};
export const phaseValues=Object.keys(phaseNames);
export const activityNames={nao_iniciado_confirmado:'Nunca iniciado (confirmado)',inicio_interrompido_confirmado:'Início interrompido (confirmado)',ativo_confirmado:'Ativo (confirmado)',pausado_confirmado:'Pausado (confirmado)',concluido_confirmado:'Concluído (confirmado)',nao_verificado:'Atividade a verificar'};
export const activityValues=Object.keys(activityNames);
export const decisionNames={aprovada:'Aprovada',recusada:'Recusada',obrigatoria:'Obrigatória',aguardando_decisao:'Aguardando decisão',sem_opiniao_usuario:'Sem sua opinião',aprovado_nao_implementado:'Aprovado · não implementado',implementado_nao_testado:'Implementado · não testado',testado:'Testado',nao_verificado:'Não verificado'};
const timestamp=()=>new Date().toISOString();
const localDay=()=>{let d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const mdSafe=s=>String(s??'').replace(/\|/g,'\\|').replace(/\n/g,' ');
export function readCatalog(files){
 const manifest=zipJson(files,'manifesto.json');const catalogue=zipJson(files,'catalogo.json');const registry=zipJson(files,'governanca/REGISTRO.json');
 const projects=[];for(const name of files.keys())if(/^projetos\/[^/]+\/projeto\.json$/.test(name)){const p=zipJson(files,name);if(p.id!==name.split('/')[1])throw Error('ID de projeto incompatível: '+name);projects.push(p)}
 if(!projects.length||!Array.isArray(registry.itens))throw Error('Este ZIP não parece ser uma Projoteca válida');
 const byId=new Map(projects.map(p=>[p.id,p]));if(projects.length!==byId.size)throw Error('IDs de projeto duplicados');
 for(const p of projects){if(p.pai_id && !byId.has(p.pai_id))throw Error('Pai inexistente: '+p.id);let parent=p.pai_id,visited=new Set([p.id]);while(parent){if(visited.has(parent))throw Error('Hierarquia cíclica');visited.add(parent);parent=byId.get(parent)?.pai_id}}
 return {manifest,catalogue,registry,projects:projects.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')),byId};
}
function mdProject(p,byId,children){const a=[`# ${p.nome}`,'',`**ID:** \`${p.id}\`  `,`**Fase:** ${phaseNames[p.fase]||p.fase}  `,`**Prioridade:** ${p.prioridade}  `,`**Pai:** ${p.pai_id?(byId.get(p.pai_id)?.nome||p.pai_id):'Nenhum'}  `,`**Revisão humana:** ${p.revisao_humana}`,'',p.descricao||'','', '## Subprojetos diretos',''];a.push(...(children.get(p.id).length?children.get(p.id).map(id=>`- [${byId.get(id).nome}](../${id}/README.md)`):['- Nenhum identificado.']));a.push('','## Relacionados','','...');a.pop();a.push(...((p.relacionados||[]).length?p.relacionados.map(id=>`- ${byId.get(id)?.nome||id}`):['- Nenhum.']));a.push('','## Repositórios','',...((p.repositorios||[]).length?p.repositorios.map(x=>`- ${x.nome}: ${x.url}`):['- Nenhum.']),'','## Decisões','',...((p.decisoes||[]).length?p.decisoes.map(x=>`- **${x.estado}** — ${x.texto}`):['- Nenhuma.']),'','## Pendências','',...((p.pendencias||[]).length?p.pendencias.map(x=>`- [${x.estado==='concluida'?'x':' '}] \`${x.id}\` — ${x.descricao} (${x.estado})`):['- Nenhuma.']),'','## Observações','',...((p.observacoes||[]).length?p.observacoes.map(x=>`- ${x}`):['- Nenhuma.']));return a.join('\n')+'\n'}
function hierarchy(projects){const byId=new Map(projects.map(x=>[x.id,x])),children=new Map(projects.map(x=>[x.id,[]])),roots=[];for(const p of projects)if(p.pai_id)children.get(p.pai_id).push(p.id);else roots.push(p.id);const sort=(a,b)=>byId.get(a).nome.localeCompare(byId.get(b).nome,'pt-BR');roots.sort(sort);for(const row of children.values())row.sort(sort);return{byId,children,roots}}
export async function exportCatalog(source,edited,events){
 if(!events.length)throw Error('Nenhuma alteração pendente para exportar');
 const files=new Map(source);const {manifest}=readCatalog(source);const version=nextVersion(manifest.versao),date=localDay();
 const projects=edited.projects;const{byId,children,roots}=hierarchy(projects);
 for(const p of projects){putJson(files,`projetos/${p.id}/projeto.json`,p);putText(files,`projetos/${p.id}/README.md`,mdProject(p,byId,children))}
 const original=zipJson(source,'catalogo.json');putJson(files,'catalogo.json',{...original,projetos:projects,versao_catalogo:version,gerado_em:date});
 putJson(files,'arvore.json',{schema_version:'1.0',versao_catalogo:version,raizes:roots,filhos_por_projeto:Object.fromEntries([...children]),referencia:'projetos/<id>/projeto.json: pai_id'});
 putJson(files,'governanca/REGISTRO.json',{...edited.registry,atualizado_em:date});
 const counts=Object.fromEntries(phaseValues.map(f=>[f,projects.filter(p=>p.fase===f).length]));
 const idx=['# Índice de projetos','',`**${projects.length} projetos/iniciativas**`,'','## Fases','','| Fase | Quantidade |','|---|---:|',...phaseValues.map(k=>`| ${phaseNames[k]} | ${counts[k]} |`),'','## Hierarquia',''];
 function walk(id,depth=0){const p=byId.get(id);idx.push(`${'  '.repeat(depth)}- [${p.nome}](projetos/${id}/README.md) — ${phaseNames[p.fase]}`);for(const c of children.get(id))walk(c,depth+1)}
 for(const r of roots)walk(r);putText(files,'00_INDICE.md',idx.join('\n')+'\n');
 const pend=['# Pendências e decisões','',`Atualização: ${date}`,'','## Governança',''];for(const i of edited.registry.itens)if(['aguardando_decisao','sem_opiniao_usuario','aprovado_nao_implementado'].includes(i.status))pend.push(`- [ ] ${mdSafe(i.assunto)} — ${mdSafe(i.texto)} (${i.status})`);
 pend.push('','## Pendências dos projetos','');for(const p of projects)for(const q of p.pendencias||[])if(q.estado==='aberta')pend.push(`- [ ] **${mdSafe(p.nome)}:** ${mdSafe(q.descricao)} (${q.requer_aprovacao?'aguarda decisão':'aberta'})`);
 putText(files,'relatorios/PENDENCIAS_E_APROVACOES.md',pend.join('\n')+'\n');
 let checkpoints=Array.from(files.keys()).filter(x=>/^checkpoints\/CP-\d+_/.test(x));let next=Math.max(0,...checkpoints.map(x=>Number(x.match(/CP-(\d+)_/)[1])))+1;
 const cp=`CP-${String(next).padStart(4,'0')}_${date}.md`,title=`# Checkpoint ${String(next).padStart(4,'0')} — Projoteca Visualizador\n\n**Data:** ${timestamp()}  \n**Versão:** ${version}  \n**Origem:** edição local no Projoteca Visualizador\n\n## Alterações documentais\n\n`+events.map(x=>`- ${x}`).join('\n')+'\n\n## Limites\n\nNenhum código dos outros projetos ou repositório GitHub foi modificado. Edição restrita às informações do catálogo.\n';
 putText(files,`checkpoints/${cp}`,title);putText(files,'CHECKPOINT_ATUAL.md',title);
 const cpList=zipText(source,'historico/CHECKPOINTS.md')||'# Checkpoints\n';putText(files,'historico/CHECKPOINTS.md',cpList+`\n- ${date}: ${cp} — versão ${version}\n`);
 const change=zipText(source,'historico/CHANGELOG.md')||'# Histórico\n';putText(files,'historico/CHANGELOG.md',change+`\n## ${version} — ${date} (Visualizador)\n`+events.map(x=>`- ${x}`).join('\n')+'\n');
 const newManifest=zipJson(files,'manifesto.json');newManifest.arquivo_raiz=`Projoteca_${date}_v${version}`;newManifest.total_repositorios=projects.reduce((sum,p)=>sum+(p.repositorios?.length||0),0);putJson(files,'manifesto.json',newManifest);
 await updateManifest(files,version);
 return{files,version,filename:`Projoteca_${date}_v${version}.zip`,checkpoint:cp};
}
export function addIdea(projects,{nome,descricao}){const slug=nome.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55);if(!slug)throw Error('Nome inválido');if(projects.some(p=>p.id===slug))throw Error('Já existe uma ficha com esse nome');const date=localDay();return{schema_version:'1.0',id:slug,nome:nome.trim(),descricao:descricao.trim(),categoria:'ideia',fase:'ideia',prioridade:'normal',repositorios:[],pastas_locais:[],relacionados:[],decisoes:[],pendencias:[],evidencias:[{tipo:'anotacao_usuario',descricao:'Ideia criada no Visualizador',observado_em:date}],observacoes:[],revisao_humana:'revisado',atualizado_em:date,pai_id:null,trajetoria:{estado_atividade:'nao_verificado',marcos:{houve_acao_pratica:null,codigo_criado:null,repositorio_criado:null,matriz_criada:null}}}}
export const today=localDay;
