// Run from repo root: node tests/test_lantern.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const script=fs.readFileSync(path.join(root,'lantern.js'),'utf8');
const engine=fs.readFileSync(path.join(root,'engine.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'lantern.css'),'utf8');
new vm.Script(script,{filename:'lantern.js'});
new vm.Script(engine,{filename:'engine.js'});
const book={hidden:true,style:{}};
const context={
 window:{},navigator:{},localStorage:{getItem:()=>null,setItem:()=>{}},
 document:{getElementById:id=>id==='worldBook'?book:null},
 Math,Date,JSON,Array,Object,String,Number
};
vm.runInNewContext(script,context,{filename:'lantern.js'});
const lamp=context.window.ElisiumLantern;
for(const method of ['mount','geometry','projectBook','occludes','near','interact','action','paintFallback','getState'])assert.equal(typeof lamp[method],'function',method);
const counts={box:0,rod:0,ico:0,tri:0};
lamp.geometry(Object.fromEntries(Object.keys(counts).map(k=>[k,()=>{counts[k]++}])));
assert(counts.rod>300,'ornate lamp must include high-detail cylindrical and scrollwork geometry');
assert(counts.tri>20,'pedestal must include authored page meshes');
assert(counts.ico>25,'lamp must include finials, foliage and gas-glass details');
assert(lamp.near([0,1.7,2]),'book is accessible from Writer’s Lantern node');
assert(!lamp.near([0,1.7,10]),'book should not accept input from initial spawn');
const project=p=>{const depth=2-p[2];return depth>.16?{x:900+p[0]*800/depth,y:440-(p[1]-1.7)*800/depth,depth}:null;};
lamp.projectBook(project,[0,1.7,2],1800,900,null);
assert.equal(book.hidden,false,'book appears in front of Writer’s Lantern');
assert.equal(book.style.pointerEvents,'auto','book is clickable at its station');
assert(lamp.occludes({x:1260,y:330,depth:9},project),'page correctly occludes distant waypoint');
lamp.projectBook(project,[0,1.7,2],1800,900,{to:'glade'});
assert.equal(book.style.pointerEvents,'none','book becomes noninteractive during locked transit');
const wiring=['ElisiumLantern','LANTERN.geometry','LANTERN.projectBook','LANTERN.occludes','LANTERN.interact','LANTERN.mount','closest(\'#worldBook\')'];
for(const marker of wiring)assert(engine.includes(marker),'missing engine integration: '+marker);
for(const id of ['worldBook','bookLeft','bookRight','bookSwitch','bookPrev','bookNext','bookMeta'])
 assert(html.includes('id="'+id+'"'),'missing folio page or control: '+id);
assert(html.indexOf('lantern.js')<html.indexOf('engine.js'),'lantern controller must load before engine');
assert(!html.includes('id="worldScreen"'),'retired floating screen should not exist');
assert(css.includes('#worldBook[hidden]'),'hidden state must override book display');
assert(script.includes('textarea')&&script.includes('localStorage'),'guestbook must use native text input and local persistence');
console.log('Writer’s Lantern: procedural meshes, page projection, input gating, wiring and paired DOM contract PASS.',counts);
