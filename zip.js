/* ZIP parser (store/deflate) + writer (store), sem dependências externas.
 * Não executa código dos arquivos importados. */
const enc = new TextEncoder();
const dec = new TextDecoder();
const u16=(d,p)=>d.getUint16(p,true), u32=(d,p)=>d.getUint32(p,true);
const MAX_FILES=2000, MAX_ITEM=8*1024*1024, MAX_TOTAL=32*1024*1024;
const asBytes=x => x instanceof Uint8Array ? x : enc.encode(String(x));
function safePath(p){return !!p&&!p.startsWith('/')&&!p.includes('\\')&&!p.split('/').some(x=>x==='..'||x==='.')&&!p.includes('\u0000')}
function crcTable(){const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let i=0;i<8;i++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t}
const TABLE=crcTable();
function crc32(bytes){let c=0xffffffff;for(const x of bytes)c=TABLE[(c^x)&255]^(c>>>8);return (c^0xffffffff)>>>0}
function concat(chunks){const size=chunks.reduce((n,x)=>n+x.length,0);const out=new Uint8Array(size);let i=0;for(const c of chunks){out.set(c,i);i+=c.length}return out}
const word=n=>new Uint8Array([n&255,(n>>>8)&255]);
const dword=n=>new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]);
export function zipText(files,path){const v=files.get(path);return v==null?null:dec.decode(v)}
export function zipJson(files,path){const s=zipText(files,path);if(s==null)throw Error('Arquivo obrigatório ausente: '+path);try{return JSON.parse(s)}catch{throw Error('JSON inválido: '+path)}}
export function putText(files,path,value){files.set(path,asBytes(value))}
export function putJson(files,path,value){putText(files,path,JSON.stringify(value,null,2)+'\n')}
export async function readZip(blob){
 const bytes=new Uint8Array(await blob.arrayBuffer());if(bytes.length<22)throw Error('Arquivo ZIP incompleto');
 const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let e=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(u32(dv,i)===0x06054b50){e=i;break}
 if(e<0)throw Error('Assinatura final ZIP não encontrada');
 const count=u16(dv,e+10),dir=u32(dv,e+16);if(count>MAX_FILES)throw Error('ZIP contém arquivos demais');
 if(u16(dv,e+8)!==count||u16(dv,e+4)!==0||u16(dv,e+6)!==0)throw Error('ZIP multifolha não suportado');
 if(dir+u32(dv,e+12)>e)throw Error('Índice ZIP inválido');
 let offset=dir,total=0;const files=new Map();
 for(let i=0;i<count;i++){
  if(offset+46>bytes.length||u32(dv,offset)!==0x02014b50)throw Error('Diretório ZIP danificado');
  const method=u16(dv,offset+10), size=u32(dv,offset+24),packed=u32(dv,offset+20),checksum=u32(dv,offset+16);
  const flags=u16(dv,offset+8),nameLen=u16(dv,offset+28),extra=u16(dv,offset+30),comment=u16(dv,offset+32),pos=u32(dv,offset+42);
  if(offset+46+nameLen+extra+comment>bytes.length)throw Error('Nome ZIP incompleto');
  const name=dec.decode(bytes.slice(offset+46,offset+46+nameLen));offset+=46+nameLen+extra+comment;
  if(name.endsWith('/'))continue;
  if(!safePath(name))throw Error('Caminho inseguro em ZIP: '+name);
  if(files.has(name))throw Error('Arquivo duplicado: '+name);
  if(flags&1)throw Error('ZIP criptografado não suportado');
  if(size>MAX_ITEM||total+size>MAX_TOTAL)throw Error('ZIP ultrapassa limite de segurança de leitura');
  if(method!==0&&method!==8)throw Error('Compressão ZIP não suportada: '+method);
  if(pos+30>bytes.length||u32(dv,pos)!==0x04034b50)throw Error('Entrada ZIP inválida');
  const start=pos+30+u16(dv,pos+26)+u16(dv,pos+28);
  if(start+packed>bytes.length)throw Error('Dados ZIP incompletos');
  const compressed=bytes.slice(start,start+packed);
  let content;
  if(method===0)content=compressed;
  else{
   if(typeof DecompressionStream==='undefined')throw Error('Seu navegador não suporta descompressão ZIP. Atualize o Safari.');
   try{content=new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}
   catch{throw Error('Falha ao descompactar '+name+'; verifique suporte a ZIP no Safari.')}
  }
  if(content.length!==size||crc32(content)!==checksum)throw Error('Arquivo ZIP inválido ou alterado: '+name);
  files.set(name,content);total+=size;
 }
 return files;
}
export function writeZip(files){
 const parts=[],central=[];let offset=0;
 for(const [name,raw] of files){
  if(!safePath(name))throw Error('Caminho ZIP inseguro: '+name);
  const body=asBytes(raw),title=enc.encode(name),crc=crc32(body);
  if(title.length>65535)throw Error('Caminho muito longo');
  const local=concat([dword(0x04034b50),word(20),word(0x800),word(0),word(0),word(0),dword(crc),dword(body.length),dword(body.length),word(title.length),word(0),title]);
  parts.push(local,body);
  const cd=concat([dword(0x02014b50),word(20),word(20),word(0x800),word(0),word(0),word(0),dword(crc),dword(body.length),dword(body.length),word(title.length),word(0),word(0),word(0),word(0),dword(0),dword(offset),title]);
  central.push(cd);offset+=local.length+body.length;
 }
 if(files.size>65535)throw Error('ZIP grande demais');
 const dirBytes=concat(central);
 const eocd=concat([dword(0x06054b50),word(0),word(0),word(files.size),word(files.size),dword(dirBytes.length),dword(offset),word(0)]);
 return new Blob([...parts,dirBytes,eocd],{type:'application/zip'});
}
export async function updateManifest(files,version){
 const man=zipJson(files,'manifesto.json');man.versao=version;
 man.total_projetos=Array.from(files.keys()).filter(x=>/^projetos\/[^/]+\/projeto\.json$/.test(x)).length;
 const rows={};for(const [name,bytes] of files){if(name==='manifesto.json')continue;const sha=await crypto.subtle.digest('SHA-256',bytes);rows[name]={sha256:Array.from(new Uint8Array(sha),x=>x.toString(16).padStart(2,'0')).join(''),bytes:bytes.length}}
 man.arquivos=Object.fromEntries(Object.entries(rows).sort(([a],[b])=>a.localeCompare(b,'en')));putJson(files,'manifesto.json',man);
 return man;
}
export function nextVersion(v){const match=String(v).match(/^(\d+)\.(\d+)\.(\d+)$/);if(!match)throw Error('Versão do catálogo inválida');return `${match[1]}.${match[2]}.${Number(match[3])+1}`}
