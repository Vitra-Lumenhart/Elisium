// Run with: node tests/test_manifest.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'world_manifest.json'),'utf8'));
const nodes=manifest.nodes;
assert.equal(Object.keys(nodes).length,12);
assert.equal(manifest.initial_node,'birth');
for(const [id,n] of Object.entries(nodes)){
 assert.equal(n.cartesian_xyz.length,3,`${id} must have 3D coordinates`);
 assert(n.cartesian_xyz.every(Number.isFinite),`${id} must be finite`);
 for(const dest of n.links){assert(dest in nodes,`${id} -> ${dest} references missing node`);assert(nodes[dest].links.includes(id),`${id} -> ${dest} must be symmetrical`);}
}
assert.equal(manifest.sprites.aslan.panel_count,3);
assert.equal(manifest.sprites.tash.panel_count,3);
assert.equal(manifest.foliage.tree_families.length,5);
assert.equal(manifest.foliage.stage_names.length,3);
for(const id of ['aslan','tash']){
 const fp=path.join(root,manifest.sprites[id].atlas),png=fs.readFileSync(fp);
 assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
 const w=png.readUInt32BE(16),h=png.readUInt32BE(20);
 assert.equal(w%3,0,`${id} atlas needs equal-width panels`);
 assert(w>900&&h>300);
}
for(const id of ['birth','gate','lion','bird','letters'])assert(id in nodes);
for(const file of ['index.html','engine.js','style.css','README.txt','TECH_MANUAL.html','COMPATIBILITY.md'])assert(fs.existsSync(path.join(root,file)));
console.log('Elisium manifest: 12 symmetric nodes, 2 intact triptychs, 5 species × 3 growth stages. PASS');
