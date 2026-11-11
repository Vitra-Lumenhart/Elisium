// WEBSPACE v0.6 design contract: floor style slots and CAD repeat layout must not drift.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const src=fs.readFileSync('webspace.js','utf8');
const doc=JSON.parse(fs.readFileSync('worlds.json','utf8'));
for(const i of [6,7,8,9,10,11])assert.ok(src.includes(`if(uMat==${i})`),'missing floor shader '+i);
assert.ok(src.includes("function mountChairs(buf)"));
assert.ok(src.includes("const arcCount=14"));
assert.ok(!fs.readFileSync('index.html','utf8').includes('landmarkLines'));
assert.equal(doc.worlds.fortress.nodes.hall.details.chairInstances,18);
assert.equal(doc.worlds.fortress.nodes.hall.name,'Correspondents’ Den');
for(const f of ['correspondents_chair.glb','correspondents_chair.step','garden_fountain.glb','courtyard_chandelier.glb'])assert.ok(fs.statSync(f).size>1000);
console.log('PASS: three interior floors + three garden floors + 18 CAD instances + no compass');
