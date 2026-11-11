'use strict';
const assert=require('node:assert/strict');
const Channel=require('./webspace-channel.js'),Screen=require('./webspace-screen.js');
const nonce='ab'.repeat(16);
assert.equal(Channel.PROTOCOL,'webspace/1');
assert.equal(Channel.safeEmbedURL('https://news.vitra.ams/'),'https://news.vitra.ams/');
for(const bad of ['javascript:alert(1)','data:text/html,hi','http://evil.test','https://name:secret@example.com','https://example.com/#x','/relative'])assert.throws(()=>Channel.safeEmbedURL(bad));
assert.equal(Channel.safeEmbedURL('http://localhost:8000',{localhost:true}),'http://localhost:8000/');
assert.throws(()=>Channel.safeEmbedURL('http://localhost:8000'));
assert.equal(Channel.validTravelEntry('fountain'),true);
assert.equal(Channel.validTravelEntry('../etc/passwd'),false);
const hello=Channel.envelope({kind:'screen',type:'screen:host-hello',screenId:'vnn-wall',nonce,payload:{capabilities:['display']}});
assert.equal(Channel.valid(hello),true);
assert.equal(Channel.valid({...hello,payload:{payload:'X'.repeat(5000)}}),false);
assert.equal(Channel.valid({...hello,type:'portal:cross-world'}),false);
assert.equal(Channel.valid({...hello,nonce:'x'}),false);
assert.equal(Channel.valid({...hello,kind:'portal'}),false);
const shape=[{x:40,y:70},{x:680,y:70},{x:680,y:430},{x:40,y:430}];
const str=Screen.homography(shape);assert.ok(str.startsWith('matrix3d('));
const [a,d,_,g,b,e,__,h,m1,m2,m3,m4,c,f,m5,m6]=str.slice(9,-1).split(',').map(Number);
const mapping=(x,y)=>[(a*x+b*y+c)/(g*x+h*y+1),(d*x+e*y+f)/(g*x+h*y+1)];
for(const [i,pt] of [[0,[0,0]],[1,[640,0]],[2,[640,360]],[3,[0,360]]]){
 const actual=mapping(...pt);assert.ok(Math.abs(actual[0]-shape[i].x)<.01);assert.ok(Math.abs(actual[1]-shape[i].y)<.01);
}
assert.equal(Screen.homography([null,null,null,null]),null);
assert.ok(Screen.standbyHTML('Vitra News Network','vnn-wall').includes('STANDBY'));
assert.ok(!Screen.standbyHTML('Vitra News Network','vnn-wall').includes('src="https://'));
console.log('PASS: URL/sandbox protocol invariants, message validation and perspective homography');
