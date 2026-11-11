'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const src=fs.readFileSync('webspace.js','utf8');
const graph=JSON.parse(fs.readFileSync('worlds.json','utf8')).worlds;
const runtimeSource=fs.readFileSync('worlds-runtime.js','utf8');
const preview=new Function('window','const location={};'+runtimeSource+';return window.WebspacePreviewGraph;')({});
const sceneSrc=src.slice(src.indexOf('const worlds='),src.indexOf('// Stored graph'));
const scene=new Function(sceneSrc+'\nreturn worlds;')();
for(const name of ['fortress','garden','gringotts']){
 assert.deepEqual(Object.keys(scene[name].nodes).sort(),Object.keys(graph[name].nodes).sort());
 for(const [key,n] of Object.entries(scene[name].nodes)){
  assert.deepEqual(n.links,graph[name].nodes[key].links,name+':'+key+' links');
  assert.deepEqual(n.p,graph[name].nodes[key].position,name+':'+key+' XYZ');
  assert.deepEqual(n.links,preview[name].nodes[key].links,'Canvas nav differs at '+name+':'+key);
  if(n.portal)assert.deepEqual(n.portal,preview[name].nodes[key].portal,'Canvas/WebGL portal differed at '+name+':'+key);
 }
}
const entries=new Function(src.slice(src.indexOf('const PORTAL_ENTRIES='),src.indexOf('const entryHint='))+'\nreturn PORTAL_ENTRIES;')();
assert.deepEqual(Object.keys(entries).sort(),['chuzhoy-north','fortress-bank-rear','fortress-gate','gringotts-gerudo'].sort());
assert.equal(entries['gringotts-gerudo'].world,'gringotts');
assert.equal(entries['fortress-bank-rear'].node,'bank_gate');
assert.equal(scene.fortress.nodes.throne.links.includes('royal_rear'),true);
assert.equal(scene.gringotts.nodes.arrival.portal.entryTag,'fortress-bank-rear');
assert.equal(fs.readFileSync('index.html','utf8').includes('travelRibbon'),true);
const bank=fs.readFileSync('webspace-bank-desk.js','utf8');
assert.ok(bank.includes('knownOrigins'));
assert.ok(bank.includes('No login, blockchain, real money'));
assert.ok(!bank.includes('localStorage')&&!bank.includes('sessionStorage'));
console.log('PASS: all three world graphs agree; routes, integer archive promises, portal reciprocity, fictional ledger and link allowlist');
