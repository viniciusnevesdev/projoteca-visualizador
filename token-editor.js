/* Projoteca — editor local de tokens. Nenhum dado do catálogo é lido ou transmitido. */
export const TOKEN_STORAGE='projoteca.token-overrides.v1';
export const LEGACY_STORAGE='projoteca.token-overrides.backup-v019';
export const TOKEN_SCHEMA='projoteca-token-changes-v1';
const VERSION='0.1.12';
const SECTIONS=[
 {
  "id": "structure",
  "name": "Estrutura",
  "keys": [
   "--bg",
   "--surface",
   "--ink",
   "--muted",
   "--line",
   "--brand",
   "--shadow"
  ]
 },
 {
  "id": "priority",
  "name": "Importância",
  "keys": [
   "--priority-principal",
   "--priority-alta"
  ]
 },
 {
  "id": "types",
  "name": "Tipos",
  "keys": [
   "--type-project",
   "--type-idea",
   "--type-decision",
   "--type-file",
   "--type-pending",
   "--type-rule"
  ]
 },
 {
  "id": "actions",
  "name": "Semânticas MMU",
  "keys": [
   "--color-danger",
   "--color-success",
   "--color-warning",
   "--color-info",
   "--action-add"
  ]
 }
];
const LABELS={
 "--bg": "Fundo geral",
 "--surface": "Cartões e superfícies",
 "--ink": "Texto principal",
 "--muted": "Texto secundário",
 "--line": "Bordas e superfícies derivadas",
 "--brand": "Cor principal do app",
 "--shadow": "Sombra compartilhada",
 "--priority-principal": "Principal",
 "--priority-alta": "Alta",
 "--type-project": "Projetos",
 "--type-idea": "Ideias",
 "--type-decision": "Decisões",
 "--type-file": "Arquivos",
 "--type-pending": "Pendências",
 "--type-rule": "Regras",
 "--color-danger": "Perigo MMU",
 "--color-success": "Concluído MMU",
 "--color-warning": "Atenção MMU",
 "--color-info": "Informação MMU",
 "--action-add": "Adicionar MMU"
};
const ALL=new Set(SECTIONS.flatMap(x=>x.keys));
let base=new Map();
let overrides={light:{},dark:{}};
let history=[],future=[],activeGesture=null;
let section='structure',selected='--bg',previewTheme='light',opened=false;
let lastError=null;
let legacyOverrides={light:{},dark:{}};
const root=()=>document.documentElement;
const clone=x=>structuredClone(x);
export function normalizeHex(value){
 let s=String(value||'').trim().toUpperCase();
 if(/^#[A-F0-9]{3,4}$/.test(s))s='#'+[...s.slice(1)].map(c=>c+c).join('');
 return /^#[A-F0-9]{6}([A-F0-9]{2})?$/.test(s)?s:null;
}
function splitColor(expr,theme){
 let s=String(expr||'').trim();
 const light=s.match(/^light-dark\((.*?),(.*)\)$/);
 if(light)s=(theme==='light'?light[1]:light[2]).trim();
 return s;
}
function rawToken(name){
 if(base.has(name))return base.get(name);
 const val=getComputedStyle(root()).getPropertyValue(name).trim();
 return val;
}
function defaultExpr(name,theme){return splitColor(rawToken(name),theme)}
function resolve(name,theme,seen=new Set()){
 if(seen.has(name))return '#808080';
 seen.add(name);
 const expr=defaultExpr(name,theme);
 if(expr==='transparent')return '#00000000';
 const parsed=normalizeHex(expr);if(parsed)return parsed;
 const v=expr.match(/^var\((--[a-z0-9-]+)\)$/i);
 if(v)return resolve(v[1],theme,seen);
 return '#808080';
}
export function rgbToHsl(hex){
 const c=normalizeHex(hex)||'#808080';
 const v=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);
 const max=Math.max(...v),min=Math.min(...v),d=max-min,l=(max+min)/2;
 let h=0,s=0;
 if(d){s=d/(1-Math.abs(2*l-1));switch(max){case v[0]:h=((v[1]-v[2])/d)%6;break;case v[1]:h=(v[2]-v[0])/d+2;break;default:h=(v[0]-v[1])/d+4}h=(h*60+360)%360}
 return [Math.round(h),Math.round(s*100),Math.round(l*100)];
}
export function hslToHex(h,s,l){
 h=((Number(h)%360)+360)%360;s=Math.max(0,Math.min(100,Number(s)))/100;l=Math.max(0,Math.min(100,Number(l)))/100;
 const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
 const pair=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
 return '#'+pair.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('').toUpperCase();
}
function knownData(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Formato inválido.');
 const source=data.themes||data;
 if(!source||typeof source!=='object'||Array.isArray(source))throw Error('Temas ausentes.');
 const result={light:{},dark:{}};
 for(const theme of ['light','dark']){
  const entries=source[theme]||{};
  if(!entries||typeof entries!=='object'||Array.isArray(entries))throw Error('Tema inválido: '+theme);
  for(const [key,hex] of Object.entries(entries)){
   if(!ALL.has(key))continue;
   const color=normalizeHex(hex);
   if(!color)throw Error('Cor inválida: '+key);
   result[theme][key]=color;
  }
 }
 return result;
}
export function validateImport(text){
 if(text.length>64000)throw Error('Arquivo muito grande para a configuração.');
 const data=JSON.parse(text);
 if(data.format&&data.format!==TOKEN_SCHEMA)throw Error('Formato incompatível.');
 return knownData(data);
}
function collectLegacy(data){
 const src=data.themes||data, out={light:{},dark:{}};
 const former=data.legacy||{};
 for(const theme of ['light','dark']){
  const entries={...(src[theme]||{}),...(former[theme]||{})};
  for(const [key,v] of Object.entries(entries)){
   if(ALL.has(key)||!/^--[a-z0-9-]{2,80}$/.test(key))continue;
   const hex=normalizeHex(v);if(hex)out[theme][key]=hex;
  }
 }
 return out;
}
function migrateStored(s){
 const parsed=JSON.parse(s);
 const migrated=knownData(parsed);
 const old=collectLegacy(parsed);
 // Migrate only hue-equivalent values, retaining the full original report.
 const aliases=[
  ['--priority-principal-ink','--priority-principal'],
  ['--priority-alta-ink','--priority-alta'],
  ['--priority-principal-on-fill','--priority-principal'],
  ['--priority-alta-on-fill','--priority-alta'],
  ['--shadow-subtle','--shadow'],
  ['--shadow-toast','--shadow']
 ];
 for(const theme of ['light','dark']){
  for(const [alias,target] of aliases){
   if(old[theme][alias] && !migrated[theme][target]){
    if(alias.endsWith('on-fill')&&theme==='light')continue;
    migrated[theme][target]=old[theme][alias];
   }
  }
 }
 return {migrated,old};
}
function load(){
 try{
  const s=localStorage.getItem(TOKEN_STORAGE);
  if(!s)return;
  const {migrated,old}=migrateStored(s);
  overrides=migrated;legacyOverrides=old;
  if(Object.keys(old.light).length||Object.keys(old.dark).length){
   if(!localStorage.getItem(LEGACY_STORAGE))localStorage.setItem(LEGACY_STORAGE,s);
   persist();
  }
 }catch(e){lastError=e}
}
function remember(){
 history.push(clone(overrides));if(history.length>40)history.shift();
 future=[];activeGesture=null;
}
function current(name,theme){return overrides[theme][name]||resolve(name,theme)}
function buildRule(){
 const keys=[...new Set([...Object.keys(overrides.light),...Object.keys(overrides.dark)])].sort();
 if(!keys.length)return '';
 const light=keys.map(key=>key+':'+(overrides.light[key]||defaultExpr(key,'light'))+';').join('');
 const dark=keys.map(key=>key+':'+(overrides.dark[key]||defaultExpr(key,'dark'))+';').join('');
 // Literal, theme-scoped CSS values: avoids inconsistencies in dynamically injected
 // light-dark() variable expressions (especially WebKit/Firefox).
 return ':root{'+light+'}'
  +'@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){'+dark+'}}'
  +':root[data-theme="dark"]{'+dark+'}';
}
function apply(){
 let style=document.getElementById('token-overrides');
 if(!style){style=document.createElement('style');style.id='token-overrides';document.head.append(style)}
 style.textContent=buildRule();
}
function persist(toast){
 try{localStorage.setItem(TOKEN_STORAGE,JSON.stringify({format:TOKEN_SCHEMA,themes:overrides,legacy:legacyOverrides}))}
 catch(e){lastError=e;toast?.('Armazenamento indisponível; copie suas alterações para não perdê-las.')}
}
export function initTokenEditor(){
 const sheet=[...document.styleSheets].find(s=>s.href&&s.href.includes('/tokens.css'));
 if(sheet){
  try{const rule=[...sheet.cssRules].find(r=>r.selectorText===':root');
   if(rule)for(const name of ALL){const v=rule.style.getPropertyValue(name).trim();if(v)base.set(name,v)}
  }catch(e){lastError=e}
 }
 load();apply();
}
function count(){return Object.keys(overrides.light).length+Object.keys(overrides.dark).length}
function changed(key,theme){return Boolean(overrides[theme][key])}
function validSet(key,theme,hex,toast,gesture=false){
 if(!ALL.has(key)||!['light','dark'].includes(theme))return false;
 const value=normalizeHex(hex);if(!value){toast?.('Informe HEX com 6 ou 8 dígitos.');return false}
 if(current(key,theme)===value)return true;
 if(!gesture||activeGesture!==key+'@'+theme){remember();activeGesture=gesture?key+'@'+theme:null}
 if(value===resolve(key,theme))delete overrides[theme][key];else overrides[theme][key]=value;
 apply();persist(toast);return true;
}
function setTemporaryTheme(mode){
 if(!['light','dark'].includes(mode))return;
 previewTheme=mode;root().dataset.theme=mode;
}
export function enterTokenEditor(theme){
 opened=true;
 const resolved=theme==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):theme;
 setTemporaryTheme(resolved);
}
export function leaveTokenEditor(theme){
 opened=false;activeGesture=null;
 if(theme==='auto')root().removeAttribute('data-theme');else root().dataset.theme=theme;
}
function labelFor(key){return LABELS[key]||key.slice(2).replaceAll('-',' ')}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function colorControl(key){
 const v=current(key,previewTheme);
 const hsl=rgbToHsl(v);
 return `<div class="token-controls">
  <div class="token-controls-head">
   <span class="token-chip" style="--sample:${v}" aria-hidden="true"></span>
   <label class="token-picker-label">Escolher cor <input type="color" data-token-input="picker" data-token="${key}" value="${v.slice(0,7)}" aria-label="Seletor de cor de ${esc(labelFor(key))}"></label>
   <label class="token-hex-label">HEX <input type="text" data-token-input="hex" data-token="${key}" value="${v}" maxlength="9" spellcheck="false" autocapitalize="characters" aria-label="Cor HEX de ${esc(labelFor(key))}"></label>
  </div>
  <div class="token-sliders">
  ${[['h','Matiz',360,hsl[0]],['s','Saturação',100,hsl[1]],['l','Luminosidade',100,hsl[2]]].map(([kind,text,max,value])=>`<label class="token-slider"><span>${text} <output data-hsl-output="${kind}">${value}${kind==='h'?'°':'%'}</output></span><input type="range" min="0" max="${max}" step="1" value="${value}" data-token-input="${kind}" data-token="${key}" aria-label="${text} de ${esc(labelFor(key))}"></label>`).join('')}
  </div>
  <div class="row"><code>${esc(key)}</code><button type="button" class="ghost mini" data-action="token-reset" data-id="${esc(key)}" ${changed(key,previewTheme)?'':'disabled'}>Restaurar este token</button></div>
 </div>`;
}
export function renderTokenEditor(){
 const cat=SECTIONS.find(x=>x.id===section)||SECTIONS[0], changedCount=count();
 return `<div class="token-editor">
  <div class="row"><div><h1>Editor de Tokens</h1><p class="small">20 cores-base compartilhadas · os usos derivados são automáticos.</p></div><button type="button" class="ghost mini" data-action="token-back">Voltar</button></div>
  <p class="tip" id="token-legacy-notice" ${(Object.keys(legacyOverrides.light).length+Object.keys(legacyOverrides.dark).length)?'':'hidden'}>Personalizações antigas sem correspondência direta estão preservadas no backup e no JSON copiado. Escolha novamente apenas as que precisar.</p>
  <div class="token-toolbar">
    <span class="small">Tema de prévia</span>
    <div class="theme-options" role="group" aria-label="Editar cores do tema">
    ${[['light','Claro'],['dark','Escuro']].map(([v,t])=>`<button type="button" class="theme-choice" data-action="token-theme" data-id="${v}" aria-pressed="${previewTheme===v}">${t}</button>`).join('')}
    </div>
    <p class="settings-note">Alterar esta prévia não muda sua preferência de tema dos Ajustes.</p>
  </div>
  <div class="chips token-groups" aria-label="Famílias de tokens">
   ${SECTIONS.map(g=>`<button type="button" class="chip ${section===g.id?'active':''}" data-action="token-group" data-id="${g.id}" aria-pressed="${section===g.id}">${esc(g.name)}</button>`).join('')}
  </div>
  <label class="token-search-label">Buscar token<input type="search" id="token-search" data-token-input="search" placeholder="Ex.: fundo, principal, --type-project" aria-label="Buscar token"></label>
  <div class="token-list">
  ${cat.keys.filter(key=>base.has(key)).map(key=>{
   const v=current(key,previewTheme),active=selected===key,wasChanged=changed(key,previewTheme);
   return `<section class="token-row" data-token-row="${key}" data-search="${esc((labelFor(key)+' '+key).toLowerCase())}">
    <button type="button" class="token-select" data-action="token-select" data-id="${key}" aria-expanded="${active}">
      <span class="token-swatch" style="--sample:${v}" aria-hidden="true"></span>
      <span class="token-description"><strong>${esc(labelFor(key))}</strong><small>${esc(key)}</small></span>
      <span class="token-value">${v}${wasChanged?' •':''}</span>
    </button>
    ${active?colorControl(key):''}
   </section>`;
  }).join('')}
  </div>
  <div class="token-preview" aria-label="Prévia ilustrativa">
   <h2>Prévia das cores</h2>
   <div class="grid2 stats">
    <section class="card stat-project"><strong>47</strong><span>Projetos</span></section>
    <section class="card stat-principal"><strong>2</strong><span>Principais</span></section>
    <section class="card stat-idea"><strong>1</strong><span>Só ideias</span></section>
    <section class="card stat-review"><strong>46</strong><span>A verificar</span></section>
   </div>
   <section class="card project-entry type-project priority-principal"><div class="row"><strong>Projeto de exemplo</strong><span class="pill priority-pill">Principal</span></div><p class="small">Fundo sutil de projeto e etiqueta destacada.</p></section>
  </div>
  <div class="token-utilities">
   <button type="button" class="ghost mini" data-action="token-undo" ${history.length?'':'disabled'}>Desfazer</button>
   <button type="button" class="ghost mini" data-action="token-redo" ${future.length?'':'disabled'}>Refazer</button>
   <button type="button" class="ghost mini" data-action="token-reset-group">Restaurar categoria</button>
   <button type="button" class="ghost mini" data-action="token-reset-all">Restaurar tudo</button>
  </div>
  <div class="token-transfer">
   <button type="button" class="ghost mini" data-action="token-export">Exportar JSON</button>
   <button type="button" class="ghost mini" data-action="token-import">Importar JSON</button>
   <input id="token-import-file" type="file" accept=".json,application/json" hidden>
  </div>
  <section class="token-copy-footer"><div><strong>Copiar alterações</strong><p class="small" data-token-counter>${changedCount} cor(es) modificada(s) · claro ${Object.keys(overrides.light).length} · escuro ${Object.keys(overrides.dark).length}</p></div><button type="button" class="primary full" data-action="token-copy">Copiar alterações</button><p class="settings-note">Cole aqui no chat para aplicar os valores escolhidos ao código. Apenas tokens e cores serão copiados.</p></section>
 </div>`;
}
function updateEditorControls(key,source){
 const v=current(key,previewTheme),hsl=rgbToHsl(v);
 const row=document.querySelector('.token-row[data-token-row="'+key+'"]');
 if(!row)return;
 row.querySelector('.token-swatch')?.style.setProperty('--sample',v);
 const val=row.querySelector('.token-value');if(val)val.textContent=v+(changed(key,previewTheme)?' •':'');
 const chip=row.querySelector('.token-chip');if(chip)chip.style.setProperty('--sample',v);
 const hex=row.querySelector('[data-token-input=hex]');if(hex&&source!=='hex'){hex.value=v;hex.setAttribute('aria-invalid','false')}
 const picker=row.querySelector('[data-token-input=picker]');if(picker&&source!=='picker')picker.value=v.slice(0,7);
 for(const [i,k]of ['h','s','l'].entries()){
  const slider=row.querySelector('[data-token-input='+k+']');if(slider&&source!==k)slider.value=hsl[i];
  const out=row.querySelector('[data-hsl-output='+k+']');if(out)out.textContent=hsl[i]+(k==='h'?'°':'%');
 }
 const reset=row.querySelector('[data-action=token-reset]');if(reset)reset.disabled=!changed(key,previewTheme);
 const n=document.querySelector('[data-token-counter]');if(n)n.textContent=count()+' cor(es) modificada(s) · claro '+Object.keys(overrides.light).length+' · escuro '+Object.keys(overrides.dark).length;
 const undo=document.querySelector('[data-action=token-undo]');if(undo)undo.disabled=!history.length;
 const redo=document.querySelector('[data-action=token-redo]');if(redo)redo.disabled=!future.length;
}
export function tokenInput(event,toast){
 if(!opened)return false;
 const elem=event.target,kind=elem.dataset.tokenInput;
 if(!kind)return false;
 if(kind==='search'){
  const q=elem.value.trim().toLowerCase();
  document.querySelectorAll('.token-row').forEach(row=>row.hidden=!row.dataset.search.includes(q));
  return true;
 }
 const key=elem.dataset.token;if(!ALL.has(key))return true;
 const currentHex=current(key,previewTheme);
 let newHex=null;
 if(kind==='hex'){
  newHex=normalizeHex(elem.value);
  elem.setAttribute('aria-invalid',String(!newHex));
  if(!newHex)return true;
 }else if(kind==='picker'){
  newHex=normalizeHex(elem.value);
  if(currentHex.length===9)newHex+=currentHex.slice(7);
 }else if(['h','s','l'].includes(kind)){
  const row=elem.closest('.token-row');
  const hsl=['h','s','l'].map(k=>Number(row.querySelector('[data-token-input='+k+']').value));
  newHex=hslToHex(...hsl);
  if(currentHex.length===9)newHex+=currentHex.slice(7);
 }else return false;
 if(validSet(key,previewTheme,newHex,toast,true))updateEditorControls(key,kind);
 return true;
}
export function tokenChange(event,toast){
 const kind=event.target.dataset.tokenInput;
 if(!kind)return false;
 if(kind!=='search'){
  activeGesture=null;
  const key=event.target.dataset.token;
  if(kind==='hex'&&!normalizeHex(event.target.value)){
   event.target.value=current(key,previewTheme);event.target.setAttribute('aria-invalid','false');
   toast?.('HEX inválido. O último valor válido foi mantido.');
  }
 }
 return true;
}
export function tokenFileChange(event,toast,render){
 if(event.target.id!=='token-import-file')return false;
 const file=event.target.files?.[0];event.target.value='';
 if(!file)return true;
 file.text().then(text=>{
  const parsed=validateImport(text),legacy=collectLegacy(JSON.parse(text));
  if(!confirm('Substituir as cores locais pelos valores desse JSON?'))return;
  remember();overrides=parsed;legacyOverrides=legacy;apply();persist(toast);render();toast('Cores importadas neste dispositivo.');
 }).catch(e=>toast('Importação inválida: '+e.message));
 return true;
}
function changeState(next,toast){
 remember();overrides=next;apply();persist(toast);
}
export function buildCopyText(){
 const n=count();
 const entries=[];
 for(const theme of ['light','dark'])for(const [key,val] of Object.entries(overrides[theme]).sort(([a],[b])=>a.localeCompare(b))){
  entries.push(theme.toUpperCase()+'  '+key+' = '+val);
 }
 const json={format:TOKEN_SCHEMA,version:2,app:'Projoteca Visualizador',appVersion:VERSION,themes:clone(overrides),legacy:clone(legacyOverrides)};
 return 'PROJOTECA — ALTERAÇÕES DE CORES PARA APLICAR NO CÓDIGO\n'
 +'Esta é uma proposta de personalização local; ainda não altera os tokens padrão do repositório.\n'
 +n+' cor(es) personalizada(s).\n\n'
 +(entries.length?entries.join('\n'):'Nenhuma cor alterada.')+'\n\nJSON:\n'
 +JSON.stringify(json,null,2)
 +((Object.keys(legacyOverrides.light).length+Object.keys(legacyOverrides.dark).length)
 ? '\n\nAVISO: tokens antigos preservados no JSON (campo legacy). Alguns fundos/contrastes não têm equivalente exato entre as cores-base.' : '');
}
async function copyText(toast){
 const text=buildCopyText();
 try{if(!navigator.clipboard?.writeText)throw Error('clipboard indisponível');await navigator.clipboard.writeText(text);toast('Alterações copiadas. Cole aqui no chat.');return}
 catch{
  const box=document.createElement('textarea');box.value=text;
  Object.assign(box.style,{position:'fixed',left:'-9999px',top:'0'});
  document.body.append(box);box.focus();box.select();
  let ok=false;try{ok=document.execCommand('copy')}catch{}
  if(ok){box.remove();toast('Alterações copiadas. Cole aqui no chat.')}
  else{box.style.cssText='position:fixed;z-index:200;top:10%;left:5%;width:90%;height:70%;background:var(--surface);color:var(--ink);';box.focus();box.select();toast('Selecione e copie o texto exibido.')}
 }
}
export function tokenClick(action,id,theme,toast,render){
 if(!action.startsWith('token-'))return false;
 switch(action){
 case 'token-open':enterTokenEditor(theme);render();break;
 case 'token-back':leaveTokenEditor(theme);render();break;
 case 'token-theme':if(['light','dark'].includes(id)){setTemporaryTheme(id);render()}break;
 case 'token-group':if(SECTIONS.some(x=>x.id===id)){section=id;selected=SECTIONS.find(x=>x.id===id).keys[0];render()}break;
 case 'token-select':if(ALL.has(id)){selected=selected===id?'':id;render()}break;
 case 'token-reset':if(ALL.has(id)&&changed(id,previewTheme)){const obj=clone(overrides);delete obj[previewTheme][id];changeState(obj,toast);render()}break;
 case 'token-reset-group':{
  const cat=SECTIONS.find(x=>x.id===section);if(!cat)break;
  const obj=clone(overrides);cat.keys.forEach(k=>delete obj[previewTheme][k]);changeState(obj,toast);render();break;
 }
 case 'token-reset-all':if(confirm('Restaurar todas as cores dos temas claro e escuro?')){changeState({light:{},dark:{}},toast);render()}break;
 case 'token-undo':if(history.length){future.push(clone(overrides));overrides=history.pop();activeGesture=null;apply();persist(toast);render()}break;
 case 'token-redo':if(future.length){history.push(clone(overrides));overrides=future.pop();activeGesture=null;apply();persist(toast);render()}break;
 case 'token-copy':copyText(toast);break;
 case 'token-export':{
  const blob=new Blob([JSON.stringify({format:TOKEN_SCHEMA,version:2,themes:overrides,legacy:legacyOverrides},null,2)],{type:'application/json'});
  const href=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=href;a.download='Projoteca_Tokens_Personalizados.json';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(href),30000);break;
 }
 case 'token-import':document.getElementById('token-import-file')?.click();break;
 }
 return true;
}
export function getEditorState(){return {opened,previewTheme,section,selected,overrides:clone(overrides),historyLength:history.length,lastError:String(lastError||'')}}
