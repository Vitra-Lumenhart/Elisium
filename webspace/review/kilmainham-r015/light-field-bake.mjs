// R014: deterministic compact scalar light fields. X/Z periodic, Y bounded.
export const CLOUD={x:64,z:64,y:32,layers:16,periodX:64,periodZ:96};
export const ELECTRIC={x:48,z:96,y:16,min:[-9,0,-28],max:[9,21.5,24]};
export const wrap=(x,n)=>((x%n)+n)%n;
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=(a,b,x)=>{let t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function dist(a,b,n){let d=Math.abs(a-b);return Math.min(d,n-d)}
export function cloudBake(seed=1492){
 const c=CLOUD,r=rng(seed),v=new Uint8Array(c.x*c.z*c.y),blobs=Array.from({length:26},()=>({x:r()*c.x,z:r()*c.z,y:r()*c.y,s:3+r()*9,t:4+r()*10,h:2+r()*5,a:.4+r()*.8}));
 for(let y=0;y<c.y;y++)for(let z=0;z<c.z;z++)for(let x=0;x<c.x;x++){
 let d=0;for(const b of blobs)d+=b.a*Math.exp(-.5*((dist(x,b.x,c.x)/b.s)**2+(dist(z,b.z,c.z)/b.t)**2+((y-b.y)/b.h)**2));
 v[(y*c.z+z)*c.x+x]=Math.round(255*clamp((d-.22)*.67)*(.32+.68*smooth(0,c.y-1,y)));
 }
 // Preintegrated optical depth, not a succession of random cloud images.
 // Padded 4x4 atlas, one-texel wrap gutters avoid bleed at tile edges.
 const w=c.x+2,h=c.z+2,atlas=new Uint8Array(w*4*h*4);
 for(let k=0;k<c.layers;k++)for(let z=-1;z<=c.z;z++)for(let x=-1;x<=c.x;x++){
 let tau=0;const count=2+Math.round(k*(c.y-2)/(c.layers-1));
 for(let y=0;y<count;y++)tau+=v[(y*c.z+wrap(z,c.z))*c.x+wrap(x,c.x)]/255*.19;
 atlas[(Math.floor(k/4)*h+z+1)*w*4+(k%4)*w+x+1]=Math.round(255*Math.exp(-tau));
 }
 return {volume:v,atlas,width:w*4,height:h*4};
}
export function electricBake(fixtures){
 const e=ELECTRIC,a=new Uint8Array(e.x*e.z*e.y);
 for(let y=0;y<e.y;y++)for(let z=0;z<e.z;z++)for(let x=0;x<e.x;x++){
 const p=[x/(e.x-1),y/(e.y-1),z/(e.z-1)].map((t,i)=>e.min[i]+t*(e.max[i]-e.min[i]));let light=0;
 for(const f of fixtures){const dx=f[0]-p[0],dy=f[1]-p[1],dz=f[2]-p[2],d2=dx*dx+dy*dy+dz*dz;
 if(d2>64)continue;
 // Approximate deck occlusion, not a ray-traced lightmap.
 let oc=1;for(const deck of [6.3,12.6])if((f[1]-deck)*(p[1]-deck)<0){const t=(deck-p[1])/dy;if(Math.abs(p[0]+dx*t)>7.25)oc*=.12;}
 light+=oc*clamp(1-d2/64)**2*(dy>=0?1:.14)/(1+d2*.48)*1.35;
 }
 a[(y*e.z+z)*e.x+x]=Math.round(255*clamp(light));
 }return a;
}
// Elapsed seconds, not frames. Storm is opt-in. One broad pulse per >=22 s,
// never a repeated strobe or full-screen white overlay.
export function skyState(seconds,mode='day',gentle=false){
 const t=Math.max(0,seconds),cycle=wrap(t,150),phase=mode==='cycle'?smooth(35,105,cycle)*(1-smooth(130,150,cycle)):mode==='twilight'?.84:mode==='storm'?.92:.12;
 const storm=mode==='storm',strike=Math.floor(t/32),s=wrap(t,32),onset=strike===0?15:9+((Math.imul(strike,2654435761)>>>0)%800)/100,flash=storm?smooth(onset,onset+.22,s)*(1-smooth(onset+.42,onset+1.65,s)):0;
 return {phase,sun:2.05*(1-.94*phase),ambient:1.62*(1-.69*phase),electric:phase>.64?1:0,depth:storm?13.2:5.8+6*phase+2.2*Math.sin(t*.025),drift:[wrap(t*.21,64),wrap(t*.31,96)],flash:flash*(gentle?.18:1),thunder:storm&&s>=onset+2.7&&s<onset+3.2,strike,storm};
}
export function budget(){return CLOUD.x*CLOUD.z*CLOUD.y+(CLOUD.x+2)*(CLOUD.z+2)*CLOUD.layers+ELECTRIC.x*ELECTRIC.z*ELECTRIC.y}
