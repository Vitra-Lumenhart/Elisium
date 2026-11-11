'use strict';
const fs=require('fs'),assert=require('node:assert/strict');
const text=fs.readFileSync('./webspace.js','utf8');
const src=text.slice(text.indexOf('function parseGLB(buffer){'),text.indexOf('function mountModel('));
const parseGLB=new Function(src+'\nreturn parseGLB;')();
for(const [f,min,max] of [['garden_fountain.glb',40,100],['courtyard_chandelier.glb',100,240],['correspondents_chair.glb',20,50]]){
 const b=fs.readFileSync('./'+f),array=b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
 const obj=parseGLB(array);assert.ok(obj.parts>min&&obj.parts<max);assert.ok(obj.triangles>(f==='correspondents_chair.glb'?1000:10000)&&obj.triangles<100000);
 assert.ok(obj.packed.every(Number.isFinite));
 console.log('PASS',f,':',obj.parts,'CAD components,',obj.triangles,'triangles, finite GPU vertex data');
}
