// Optional Firefox WebDriver BiDi smoke test. No dependencies or personal ZIPs.
// Start a local server and an isolated Firefox with --remote-debugging-port 8772.
// PROJOTECA_TEST_URL may include a GitHub Pages-like subdirectory.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const socket=new WebSocket(process.env.PROJOTECA_BIDI_URL||'ws://127.0.0.1:8772/session');
await new Promise((res,rej)=>{socket.onopen=res;socket.onerror=rej});
let next=0;const pending=new Map();
socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.type==='error')p.reject(Error(JSON.stringify(m)));else p.resolve(m.result)}};
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})}
try{
 await send('session.new',{capabilities:{alwaysMatch:{acceptInsecureCerts:false}}});
 const {userContext}=await send('browser.createUserContext');
 const {context}=await send('browsingContext.create',{type:'tab',userContext});
 const evaluate=async expression=>{const r=await send('script.evaluate',{expression,target:{context},awaitPromise:true});if(r.type==='exception')throw Error(JSON.stringify(r));return r.result.value};
 const check=async(name,expression)=>{assert.equal(await evaluate(`(async()=>Boolean(${expression}))()`),true,name);console.log('PASS',name)};
 const wait=async expression=>{assert.equal(await evaluate(`(async()=>{for(let i=0;i<100;i++){if(${expression})return true;await new Promise(r=>setTimeout(r,50))}return false})()`),true,'Timeout: '+expression)};
 const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click(); true`);
 const viewport=async(width,height=844)=>send('browsingContext.setViewport',{context,viewport:{width,height},devicePixelRatio:1});
 await send('browsingContext.navigate',{context,url:process.env.PROJOTECA_TEST_URL||'http://127.0.0.1:8771/',wait:'complete'});
 await wait("document.querySelector('#main h1')");
 await check('Empty catalog has import and no simulated projects',"document.querySelector('#main').innerText.includes('Projoteca ainda não carregada') && !document.querySelector('.project-card') && document.querySelector('#main [data-action=import]')");
 await check('Typography uses real 14, 18, 24 and 11px roles',"getComputedStyle(document.documentElement).fontSize==='14px' && getComputedStyle(document.querySelector('h2')).fontSize==='18px' && getComputedStyle(document.querySelector('h1')).fontSize==='24px' && getComputedStyle(document.querySelector('.bottom button')).fontSize==='11px'");
 await check('Four SVG navigation buttons',"document.querySelectorAll('.bottom button svg').length===4 && !/[▦▤☷▱↥]/.test(document.body.innerText)");
 await click('[data-env=programacao]');
 await check('Programming disabled and one source sufficient',"document.querySelectorAll('.tools button:disabled').length===6 && document.querySelector('#main').innerText.includes('Basta UMA fonte') && document.querySelector('#main').innerText.includes('Nenhum projeto carregado') && getComputedStyle(document.querySelector('.bottom')).display==='none'");
 for(const source of ['github','macbook','zip']){await click(`[data-action=code-source][data-id=${source}]`);await check('Source '+source,`document.querySelector('[data-action=code-source][data-id=${source}]').getAttribute('aria-pressed')==='true'`)}
 await click('[data-env=catalogo]');
 await evaluate("(()=>{const dt=new DataTransfer();dt.items.add(new File(['invalid'],'invalido.zip'));const input=document.querySelector('#zip-file');input.files=dt.files;input.dispatchEvent(new Event('change'));return true})()");
 await wait("document.querySelector('#toast').textContent.includes('ZIP incompleto')");
 await check('Import error preserves empty catalog',"!document.querySelector('.project-card') && document.querySelector('#main [data-action=import]')");
 // A generated fixture lives only in this browser profile, never in the repository.
 await evaluate(`(async()=>{
 const {writeZip,putJson,putText,updateManifest}=await import('./zip.js');
 const make=(id,fase,atividade,priority='normal',parent=null)=>({id,nome:'Projeto fictício '+id,descricao:'Dado sintético de teste',fase,prioridade:priority,pai_id:parent,trajetoria:{estado_atividade:atividade},repositorios:[],pendencias:[],observacoes:[],decisoes:[]});
 const ps=[make('raiz','desenvolvimento','ativo_confirmado','principal'),make('filho-a','ideia','nao_verificado','normal','raiz'),make('filho-b','planejado','nao_iniciado_confirmado','normal','raiz'),make('filho-c','planejado','inicio_interrompido_confirmado','normal','raiz'),make('outro','a_verificar','nao_verificado','principal')];
 ps[0].pendencias=[{id:'acao',descricao:'Ação fictícia',estado:'aberta',requer_aprovacao:false},{id:'decisao',descricao:'Decisão fictícia',estado:'aberta',requer_aprovacao:true}];
 const files=new Map();putJson(files,'manifesto.json',{versao:'0.0.1'});putJson(files,'catalogo.json',{projetos:ps});
 putJson(files,'governanca/REGISTRO.json',{itens:[{id:'g1',assunto:'Proposta fictícia',texto:'Somente teste',status:'aguardando_decisao'},{id:'g2',assunto:'Opinião fictícia',texto:'Somente teste',status:'sem_opiniao_usuario'},{id:'g3',assunto:'Aprovado fictício',texto:'Somente teste',status:'aprovado_nao_implementado'},{id:'g4',assunto:'Regra fictícia',texto:'Somente teste',status:'obrigatoria'}]});
 for(const p of ps)putJson(files,'projetos/'+p.id+'/projeto.json',p);
 putText(files,'pasta/seguro.html','<script>window.importedCodeExecuted=true</script>');
 await updateManifest(files,'0.0.1');
 const dt=new DataTransfer();dt.items.add(new File([writeZip(files)],'catalogo-sintetico.zip',{type:'application/zip'}));
 const input=document.querySelector('#zip-file');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));return true;
 })()`);
 await wait("document.querySelectorAll('.stats strong').length===4");
 await check('Derived dashboard statistics',"[...document.querySelectorAll('.stats strong')].map(x=>x.textContent).join(',')==='5,2,1,2'");
 await check('Parent displays three real child links',"document.querySelectorAll('.tree-child .child-link').length===3");
 await click('[data-tab=projetos]');
 for(const [filter,count] of [['todos',5],['ideias',1],['nunca',1],['interrompidos',1],['principais',2]]){await click(`[data-action=filter][data-id=${filter}]`);await check('Semantic filter '+filter,`document.querySelectorAll('.project-card').length===${count}`)}
 await click('[data-action=filter][data-id=todos]');
 await evaluate("document.querySelector('#search').value='filho-a';document.querySelector('#search').dispatchEvent(new Event('input',{bubbles:true}));true");
 await check('Search preserves focus',"document.querySelectorAll('.project-card').length===1 && document.activeElement.id==='search'");
 await click('[data-action=detail][data-id=filho-a]');
 await check('Child detail has parent',"document.querySelector('[data-action=detail][data-id=raiz]')!==null");
 await click('[data-action=detail][data-id=raiz]');
 await check('Ordinary actions do not offer approval',"!document.querySelector('[data-action=approve-task][data-id=\"raiz|acao\"]') && document.querySelector('[data-action=approve-task][data-id=\"raiz|decisao\"]')");
 await click('[data-action=add-note]');
 await check('Accessible modal',"document.querySelector('#modal').open && document.querySelector('#modal').getAttribute('aria-labelledby')==='modal-title' && document.activeElement.tagName==='TEXTAREA'");
 await evaluate("document.querySelector('textarea').value='Anotação sintética';document.querySelector('#modal-form').requestSubmit();true");
 await wait("!document.querySelector('#modal').open");
 await check('Note saved and export available',"document.querySelector('#main').innerText.includes('Anotação sintética') && document.querySelector('[data-action=export]')");
 await click('[data-tab=pendencias]');
 await check('All pending categories and rules',"['Aguardando decisão','Sem sua opinião','Aprovado · não implementado','Ações dos projetos','Regras do catálogo'].every(s=>document.querySelector('#main').innerText.includes(s))");
 await click('[data-action=approve-rule][data-id=g1]');
 await check('Approved rule stays visible without execution',"!document.querySelector('[data-action=approve-rule][data-id=g1]') && document.querySelector('.status-aprovado_nao_implementado').innerText.includes('Proposta fictícia')");
 await click('[data-tab=arquivos]');
 await click('[data-action=folder][data-id="pasta/"]');
 await click('[data-action=file-preview]');
 await check('HTML preview is inert escaped text',"!window.importedCodeExecuted && document.querySelector('pre').textContent.includes('<script>') && document.querySelector('[data-action=file-up]')");
 await click('[data-action=file-up]');
 await check('Folder return',"document.querySelector('[data-action=folder][data-id=\"pasta/\"]')!==null");
 // Capture actual exports without downloading or sending any imported data.
 await evaluate("window.testExportBlob=null;URL.createObjectURL=blob=>{window.testExportBlob=blob;return 'blob:test-only'};HTMLAnchorElement.prototype.click=function(){};true");
 await click('[data-tab=painel]');await click('[data-action=export]');
 await wait('window.testExportBlob');
 await check('Versioned export reimports with note and decision',`await (async()=>{const {readZip}=await import('./zip.js');const {readCatalog}=await import('./catalog.js');const c=readCatalog(await readZip(window.testExportBlob));return c.manifest.versao==='0.0.2' && c.byId.get('raiz').observacoes.some(s=>s.includes('Anotação sintética')) && c.registry.itens.find(x=>x.id==='g1').status==='aprovado_nao_implementado'})()`);
 for(const theme of ['light','dark']){
  await click('#btn-settings');
  await check('Settings independent of catalog',"document.querySelector('#main h1').textContent==='Ajustes' && getComputedStyle(document.querySelector('.bottom')).display==='none'");
  await click('button[data-action=theme][data-id='+theme+']');
  await check('Theme '+theme,`document.documentElement.dataset.theme==='${theme}' && getComputedStyle(document.documentElement).colorScheme==='${theme}' && localStorage.getItem('projoteca.theme.v1')==='${theme}'`);
  await check('Theme button selected',`document.querySelector('[data-action=theme][data-id=${theme}]').getAttribute('aria-pressed')==='true'`);
  await check('Settings priority pills use real classes', "Boolean(document.querySelector('.settings-legend .priority-principal .priority-pill')&&document.querySelector('.settings-legend .priority-alta .priority-pill'))");
  await evaluate("window.settingsTagStyle=(()=>{const c=getComputedStyle(document.querySelector('.settings-legend .priority-principal .priority-pill'));return Object.fromEntries(['backgroundColor','color','borderColor','paddingTop','paddingLeft'].map(k=>[k,c[k]]))})()");
  await click('[data-action=settings-close]');
  await click('[data-tab=painel]');
  if(theme==='light') await check('Neutral light stat cards', "['project','principal','idea','review'].every(c=>getComputedStyle(document.querySelector('.stats .stat-'+c)).backgroundColor==='rgb(255, 255, 255)')");
  else await check('Dark statistics remain uniform', "getComputedStyle(document.querySelector('.stats .stat-principal')).backgroundColor===getComputedStyle(document.querySelector('.stats .stat-project')).backgroundColor");
  await click('[data-tab=projetos]');
  await evaluate("document.querySelector('#search').value='';document.querySelector('#search').dispatchEvent(new Event('input',{bubbles:true}));true");
  await check('Settings and catalog Principal tags render identically',"(()=>{const b=document.querySelector('.priority-principal .priority-pill');return b&&window.settingsTagStyle&&['backgroundColor','color','borderColor','paddingTop','paddingLeft'].every(k=>getComputedStyle(b)[k]===window.settingsTagStyle[k])})()");
  await check('Compact list cards clamp descriptions to two lines',"(()=>{const p=document.querySelector('.project-card > p.small');return p && getComputedStyle(p).webkitLineClamp==='2'})()");
  if(theme==='light') await check('Light priority pill is solid violet',"getComputedStyle(document.querySelector('.priority-principal .priority-pill')).backgroundColor==='rgb(148, 41, 255)'");
  if(theme==='light') await check('Projects have subtle tinted backgrounds', "(()=>{const a=document.querySelector('.project-entry');return Boolean(a&&getComputedStyle(a).backgroundColor!=='rgb(255, 255, 255)'&&getComputedStyle(a).backgroundColor!=='rgba(0, 0, 0, 0)')})()");
  else await check('Dark priority pill stays subdued',"getComputedStyle(document.querySelector('.priority-principal .priority-pill')).backgroundColor!=='rgb(148, 41, 255)'");
  await click('[data-tab=painel]');
  for(const width of [320,390,768]){
   await viewport(width);
   for(const tab of ['painel','projetos','pendencias','arquivos']){await click(`[data-tab=${tab}]`);await check('Active navigation '+tab,`document.querySelector('.bottom [aria-current=page]').dataset.tab==='${tab}'`);await check(`${theme} ${width}px ${tab} no horizontal overflow`,"document.documentElement.scrollWidth<=innerWidth")}
   await click('[data-env=programacao]');await check(`${theme} ${width}px programming no overflow`,"document.documentElement.scrollWidth<=innerWidth");await click('[data-env=catalogo]');
  }
 }
 await click('#btn-settings');
 await click('[data-action=theme][data-id=auto]');
 await check('Automatic follows system without override', "document.documentElement.dataset.theme===undefined && localStorage.getItem('projoteca.theme.v1')===null && getComputedStyle(document.documentElement).colorScheme==='light dark'");
 await click('[data-action=settings-close]');
 await viewport(390);await click('[data-tab=painel]');
 await check('Dashboard navigation selected',"document.querySelector('.bottom .selected').dataset.tab==='painel'");
 await click('#btn-settings');
 await click('[data-action=token-open]');
 await check('Editor opens with token list and Copy at the end',"document.querySelector('.token-editor') && document.querySelectorAll('.token-row').length===7 && document.querySelector('.token-editor').lastElementChild.querySelector('[data-action=token-copy]')");
 await click('[data-action=token-theme][data-id=light]');
 await click('[data-action=token-group][data-id=types]');
 await evaluate("(()=>{const input=document.querySelector('[data-token-input=hex]');input.value='#AA4400';input.dispatchEvent(new Event('input',{bubbles:true}));return true})()");
 await check('HEX applies live to preview and persists locally',"getComputedStyle(document.querySelector('.token-preview .stat-project')).borderInlineStartColor==='rgb(170, 68, 0)' && JSON.parse(localStorage.getItem('projoteca.token-overrides.v1')).themes.light['--type-project']==='#AA4400'");
 await check('Copy payload contains token and no catalog information',`(await import('./token-editor.js?v=024')).buildCopyText().includes('LIGHT  --type-project = #AA4400') && !(await import('./token-editor.js?v=024')).buildCopyText().includes('Projeto fictício')`);
 await click('[data-action=token-undo]');
 await check('Undo restores original color',"getComputedStyle(document.querySelector('.token-preview .stat-project')).borderInlineStartColor==='rgb(9, 141, 240)'");
 await click('[data-action=token-redo]');
 await check('Redo restores custom color',"getComputedStyle(document.querySelector('.token-preview .stat-project')).borderInlineStartColor==='rgb(170, 68, 0)'");
 await click('[data-action=token-theme][data-id=dark]');
 await check('Dark theme independent of light override',"getComputedStyle(document.querySelector('.token-preview .stat-project')).borderInlineStartColor==='rgb(136, 202, 255)'");
 await click('[data-action=token-theme][data-id=light]');
 await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedTokenConfig=value}}});true");
 await click('[data-action=token-copy]');
 await wait('window.copiedTokenConfig');
 await check('Copy button sends complete structured changes',"window.copiedTokenConfig.includes('LIGHT  --type-project = #AA4400') && window.copiedTokenConfig.includes('projoteca-token-changes-v1')");
 await click('[data-action=token-back]');
 await check('Leaving token editor restores automatic theme',"document.documentElement.dataset.theme===undefined && document.querySelector('.settings-page h1').textContent==='Ajustes'");
 await click('#btn-settings');
 await check('Overrides remain applied outside editor',"getComputedStyle(document.documentElement).getPropertyValue('--type-project').includes('#AA4400')");
 await wait("!document.querySelector('#toast').classList.contains('show')");
 await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(true))))');
 if(process.env.PROJOTECA_SCREENSHOT){const {data}=await send('browsingContext.captureScreenshot',{context});fs.writeFileSync(process.env.PROJOTECA_SCREENSHOT,Buffer.from(data,'base64'))}
 console.log('PASS browser smoke complete (synthetic data only)');
}catch(e){console.error(e);process.exitCode=1}
finally{await send('session.end').catch(()=>{});socket.close()}
