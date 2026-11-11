'use strict';
/* v0.6.1.2 continuity regression plus Version 2 immutable originals.
   Self-contained; no missing developer-private parent directories. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),crypto=require('node:crypto');
const src=fs.readFileSync('webspace.js','utf8');
const Portal=require('./webspace-portal.js');
const graphCode=src.slice(src.indexOf('const worlds='),src.indexOf('// Stored graph'));
const worlds=new Function(graphCode+'\nreturn worlds;')();
const entries=new Function(src.slice(src.indexOf('const PORTAL_ENTRIES='),src.indexOf('const entryHint='))+'\nreturn PORTAL_ENTRIES;')();
assert.deepEqual(Object.keys(entries).sort(),['chuzhoy-north','fortress-gate','gringotts-gerudo','fortress-bank-rear'].sort());
assert.deepEqual([...worlds.fortress.nodes.crossroads.links].sort(),['cell','cloister','court','treasury'].sort());
assert.deepEqual(worlds.fortress.nodes.cell.links,['crossroads']);
assert.deepEqual(worlds.fortress.nodes.treasury.links,['crossroads']);
assert.ok(worlds.fortress.nodes.hall.p[2]<-19);
for(const [tag,landing] of Object.entries(entries)){
 assert.ok(worlds[landing.world].nodes[landing.node], 'published landing must exist');
 assert.equal(landing.yaw, ['fortress-bank-rear','gringotts-gerudo'].includes(tag)?0:Math.PI);
 assert.equal(Portal.parseArrival('?ws_v=1&ws_entry='+tag,{validEntries:Object.keys(entries)}),tag);
}
for(const bad of ['throne','treasury','cell','fountain','north','999','../admin','_','1.2.3'])assert.equal(Portal.parseArrival('?ws_v=1&ws_entry='+encodeURIComponent(bad),{validEntries:Object.keys(entries)}),null);
for(const badQuery of ['?x=42&z=900','?ws_entry=fortress-gate','?ws_v=1&ws_entry=fortress-gate&ws_entry=treasury'])assert.equal(Portal.parseArrival(badQuery,{validEntries:Object.keys(entries)}),null);
for(const pattern of [/function roseBush\(x,z,seed=1,size=1\)/,/if\(uMat==9\).*COMBED LAWN/,/if\(uMat==10\).*WELL-TRODDEN DIRT/,/if\(uMat==11\).*UNGROOMED MEADOW/,/mountModel\(buf,\[0,0,0\],1\.33\)/,/PORTAL_ENTRIES\[p\.entryTag\]/,/drawNavigationStars\(\)/,/function landAtPortalTag/,/portalTransition=true/])assert.match(src,pattern);
for(const stable of ['function parseGLB(', 'const Portal=window.WebspacePortal', 'function createSolidGpu(', 'function drawPortal(', 'function mountChairs('])assert.ok(src.includes(stable),stable);
const expected={
 'webspace-portal.js':'bd55459f04539ddfd4b638f8b68192e68ef4ddf1706529d8cf14785117c3424e',
 'webspace-channel.js':'e346ffbcccfcc3a5a7a9509fb82a911f64d9be36d5040ab94a04b5487fe786af',
 'garden_fountain.glb':'4d12b31f201616643a2e07b248f6823ef97786e64a23d2f540691ad7dfdd7a42',
 'courtyard_chandelier.glb':'17c29b6eeb62d7f9433551f69ded575de7a61862a54d5dc4fe458fdaf743e428',
 'correspondents_chair.glb':'866dbc7045259ef34e4aadafd3f141372d5eabd80725743d042bdbd02c84f747'};
for(const [path,hash] of Object.entries(expected))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex'),hash,path+' changed');
const screen=fs.readFileSync('webspace-screen.js','utf8');
assert.match(screen,/\.ws-screen-surface\{display:none;/);assert.match(screen,/pane\.style\.display='none';pane\.style\.transform='none';/);
assert.match(src,/float meadowPatch=/);assert.doesNotMatch(src,/float patch=/);
assert.ok(src.indexOf('vnn=Screen.create(')>src.indexOf('refresh();'));
console.log('PASS: restored hotfix invariants, 4 published tags, original CAD + protocol hashes unchanged');
