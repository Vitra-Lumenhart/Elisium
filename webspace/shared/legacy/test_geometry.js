'use strict';
// Pure CPU geometry smoke test; WebGL GPU rendering still requires a real browser.
const assert=require('node:assert/strict'),fs=require('node:fs');
const Portal=require('./webspace-portal.js');
const src=fs.readFileSync('./webspace.js','utf8');
const builderSrc=src.slice(src.indexOf('function builder(){'),src.indexOf('// --- Authored worlds'));
const geometrySrc=src.slice(src.indexOf('function geometryFor(world){'),src.indexOf('function createSolidGpu('));
const get=new Function('Portal','TAU','clamp',builderSrc+'\n'+geometrySrc+'\nreturn {builder,geometryFor};');
const {builder,geometryFor}=get(Portal,Math.PI*2,(x,a,b)=>Math.max(a,Math.min(b,x)));
function inspect(data,name){
 let count=0,invalid=0,max=0;
 for(const [material,arr] of data.batches){
  assert.equal(arr.length%33,0,'Every triangle has 3 vertices * 11 floats');
  count+=arr.length/33;
  for(const v of arr){if(!Number.isFinite(v))invalid++;max=Math.max(max,Math.abs(v));}
 }
 assert.equal(invalid,0, name+' has no NaN/Infinity values');
 assert.ok(count>500&&count<300000, name+' plausible geometry budget');
 console.log(name,count.toLocaleString(),'triangles; portals',data.portals.length,'max abs vertex parameter',max.toFixed(1));
 return count;
}
const f=geometryFor('fortress');const g=geometryFor('garden');const bank=geometryFor('gringotts');
inspect(f,'Fortress');inspect(g,'Garden');inspect(bank,'Gringotts');
assert.equal(f.portals.length,2);assert.equal(g.portals.length,1);assert.equal(bank.portals.length,1);
// Verify passages are not covered by any triangle in the axial center below arch curve.
function archOpening(style,span,opening,wallH){
 const b=builder();b.arch(0,0,0,span,opening,wallH,1.5,[.7,.5,.33],style);
 const tri=(b.batches.get(1)||[]).concat(b.batches.get(0)||[]);
 for(let i=0;i<tri.length;i+=33){
  const coords=[[tri[i],tri[i+1],tri[i+2]],[tri[i+11],tri[i+12],tri[i+13]],[tri[i+22],tri[i+23],tri[i+24]]];
  const cx=coords.reduce((a,p)=>a+p[0],0)/3,cy=coords.reduce((a,p)=>a+p[1],0)/3;
  assert.ok(!(Math.abs(cx)<.9 && cy>1.1 && cy<2.3),'Opening blocked by a face at ('+cx+','+cy+')');
 }
}
archOpening('fourCenter',27,17.8,9.15);
archOpening('pointed',23,13,9);
console.log('PASS: arch openings, procedural geometry and finite vertex coordinates');
