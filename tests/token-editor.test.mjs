import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeHex,rgbToHsl,hslToHex,validateImport,buildCopyText,TOKEN_SCHEMA,TOKEN_STORAGE} from '../token-editor.js';

test('HEX validates and normalizes both RGB and RGBA',()=>{
 assert.equal(normalizeHex('#a3f'),'#AA33FF');
 assert.equal(normalizeHex('#abc5'),'#AABBCC55');
 assert.equal(normalizeHex('#ab82cc'),'#AB82CC');
 assert.equal(normalizeHex('#12345690'),'#12345690');
 for(const invalid of ['red','#bad00','abc','#ttrrgg','#0000000g','url(fake)'])assert.equal(normalizeHex(invalid),null);
});
test('HSL remains usable for hue saturation and brightness controls',()=>{
 assert.deepEqual(rgbToHsl('#FF0000'),[0,100,50]);
 assert.deepEqual(rgbToHsl('#00FF00'),[120,100,50]);
 assert.equal(hslToHex(240,100,50),'#0000FF');
 assert.equal(hslToHex(0,0,50),'#808080');
});
test('Import accepts only known CSS tokens and both themes',()=>{
 const data=validateImport(JSON.stringify({format:TOKEN_SCHEMA,themes:{light:{'--type-project':'#112233','--wrong':'#000000'},dark:{'--priority-principal':'#aabbcc'}}}));
 assert.equal(data.light['--type-project'],'#112233'.toUpperCase());
 assert.equal(data.light['--wrong'],undefined);
 assert.equal(data.dark['--priority-principal'],'#AABBCC');
 assert.throws(()=>validateImport(JSON.stringify({format:'malicious',themes:{}})),/incompatível/);
 assert.throws(()=>validateImport(JSON.stringify({themes:{light:{'--type-project':'bad'}}})),/inválida/);
});
test('Copy format contains only token colors, no catalog contents',()=>{
 const msg=buildCopyText();
 assert.match(msg,/PROJOTECA/);
 assert.match(msg,/JSON:/);
 assert.match(msg,/"format": "projoteca-token-changes-v1"/);
 assert.doesNotMatch(msg,/catalogo\.json|manifesto\.json/);
 assert.equal(TOKEN_STORAGE,'projoteca.token-overrides.v1');
});
test('Old customized tokens are preserved and compatible hues migrate to compact base',async()=>{
 const {initTokenEditor,getEditorState,buildCopyText,LEGACY_STORAGE,TOKEN_STORAGE}=await import('../token-editor.js');
 const oldDocument=globalThis.document,oldStorage=globalThis.localStorage,oldComputed=globalThis.getComputedStyle;
 const memory=new Map();
 const oldConfig={format:'projoteca-token-changes-v1',themes:{
  light:{'--priority-principal-bg':'#e9ceff'},
  dark:{'--priority-alta-ink':'#c3afe0','--priority-principal-fill':'#202b3a','--priority-principal-on-fill':'#d9a4ff'}
 }};
 memory.set(TOKEN_STORAGE,JSON.stringify(oldConfig));
 const style={textContent:''};
 globalThis.getComputedStyle=()=>({getPropertyValue:()=> '#345678'});
 globalThis.document={
  styleSheets:[],
  getElementById:()=>style,
  head:{append:()=>{}}
 };
 globalThis.localStorage={
  getItem:k=>memory.get(k)??null,
  setItem:(k,v)=>memory.set(k,v)
 };
 try{
  initTokenEditor();
  const state=getEditorState();
  assert.equal(state.overrides.dark['--priority-alta'],'#C3AFE0');
  assert.equal(state.overrides.dark['--priority-principal'],'#D9A4FF');
  assert.ok(memory.has(LEGACY_STORAGE),'Original archive should remain accessible');
  assert.match(buildCopyText(),/legacy/);
  assert.match(buildCopyText(),/#202B3A/);
  assert.match(memory.get(TOKEN_STORAGE),/"legacy"/);
 }finally{
  globalThis.document=oldDocument;globalThis.localStorage=oldStorage;globalThis.getComputedStyle=oldComputed;
 }
});
