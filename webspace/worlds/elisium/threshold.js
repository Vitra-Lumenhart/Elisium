/* The Kilns -> Elisium: bounded same-tab handoff; NOT authorization or sky control. */
(function(root){
'use strict';
const KEY='webspace.elisium.kilns.handoff.v1',SCHEMA='webspace.elisium.kilns/threshold/1',IDs=new Set(Array.from({length:24},(_,i)=>'H'+String(i+1).padStart(2,'0')));
const meanings=Object.freeze({
H01:'One doorway can bear two different names.',H02:'Hospitality need not await agreement.',H03:'The colored window refracts light, not heaven itself.',H04:'A previous reader shapes what you inherit.',
H05:'Witnesses can disagree while preserving evidence.',H06:'A letter calls for truthful testimony, not false certainty.',H07:'The second cup offers company without promising an arrival.',H08:'A dragon legend is not historical proof.',
H09:'The same point looks different from another basis.',H10:'The quickest route may miss an essential witness.',H11:'Messages can arrive late or incomplete.',H12:'A corrected sentence still has a history.',
H13:'A wardrobe can shelter another world without owning it.',H14:'A mirror discloses an overlooked angle.',H15:'Several branches may share one root.',H16:'Leaving without agreement remains permitted.',
H17:'The orrery teaches a pattern without ordering the sky.',H18:'Repeating a claim is not proving it.',H19:'Two rhythms can remain distinct.',H20:'Catastrophic winter and flood are different accounts.',
H21:'Vitra reflects without judging.',H22:'The wren is free not to return.',H23:'Two chairs make room for disagreement.',H24:'Quiet repair restores a sightline, not the stars.'
});
const goodTime=n=>Number.isInteger(n)&&n>=0&&n<=2880;
function validate(x){
 if(!x||x.schema!==SCHEMA||x.from!=='elisium/kilns'||x.to!=='elisium'||x.entry!=='elisium-kilns-door'||!goodTime(x.elapsed_minutes)||!Array.isArray(x.observations)||x.observations.length>24)return null;
 const seen=new Set(),out=[];
 for(const o of x.observations){if(!o||!IDs.has(o.id)||!goodTime(o.minute)||o.minute>x.elapsed_minutes||seen.has(o.id))return null;seen.add(o.id);out.push({id:o.id,minute:o.minute})}
 return {schema:SCHEMA,from:'elisium/kilns',to:'elisium',entry:'elisium-kilns-door',elapsed_minutes:x.elapsed_minutes,observations:out};
}
const empty=()=>({schema:SCHEMA,from:'elisium/kilns',to:'elisium',entry:'elisium-kilns-door',elapsed_minutes:0,observations:[]});
function read(s){try{return validate(JSON.parse(s.getItem(KEY)||'null'))}catch{return null}}
function save(s,x){const v=validate(x);if(!v)return false;try{s.setItem(KEY,JSON.stringify(v));return true}catch{return false}}
function start(s){const v=read(s);if(v)return v;const e=empty();save(s,e);return e}
function advance(s,n){if(!Number.isInteger(n)||n<0||n>120)return false;const x=start(s);return save(s,{...x,elapsed_minutes:Math.min(2880,x.elapsed_minutes+n)})}
function observe(s,id){if(!IDs.has(id)||!advance(s,6))return false;const x=read(s);if(x.observations.some(v=>v.id===id))return true;return save(s,{...x,observations:[...x.observations,{id,minute:x.elapsed_minutes}]})}
function consume(s){const x=read(s);try{s.removeItem(KEY)}catch{}return x}
function clear(s){try{s.removeItem(KEY);return true}catch{return false}}
root.ElisiumThreshold=Object.freeze({KEY,SCHEMA,meanings,validate,read,save,start,advance,observe,consume,clear});
})(typeof window==='undefined'?globalThis:window);
