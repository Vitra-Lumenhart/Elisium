// KIL-IRON-003: fictional food-hoist actor. Integer simulation ticks (0.1 s).
// No real machinery control or engineering safety specification.
export const HOIST=Object.freeze({id:'KIL-IRON-003',position:[6.1,0,-4.8],stops:Object.freeze([-3.15,0,6.30,12.60]),names:Object.freeze(['Kitchen','Ground floor','First gallery','Second gallery']),poleSpacing:1.12,poleRadius:.038,headY:15.70,trayWidth:.76,trayDepth:.65,pulleyRadius:.44,step:.035,serviceAt:1});
export class FoodHoist{
 constructor(){this.tick=0;this.y=HOIST.stops[0];this.target=0;this.phase='idle';this.wait=0;this.wear=.12;this.rounds=0;this.cargo=[];this.events=[];this.seq=0;this.servicePending=false;this.lastService=null;}
 emit(kind,body={}){const e=Object.freeze({id:HOIST.id+':'+(++this.seq),tick:this.tick,kind,...body});this.events.push(e);return e;}
 start(){if(this.phase!=='idle'||this.servicePending)return false;this.phase='loading';this.wait=15;this.emit('round.requested',{round:this.rounds+1});return true;}
 move(target){this.target=target;this.phase='moving';this.emit('travel.started',{to:HOIST.names[target]});}
 advance(ticks=1){if(!Number.isInteger(ticks)||ticks<0||ticks>100000)throw Error('Invalid ticks');for(let i=0;i<ticks;i++){this.tick++;this.step();}}
 step(){
  if(this.phase==='loading'&&--this.wait<=0){this.cargo=[1,2,3].map(f=>({id:'round-'+(this.rounds+1)+'-floor-'+f,stop:f}));this.emit('cargo.loaded',{ids:this.cargo.map(c=>c.id),custody:HOIST.id});this.move(1);}
  else if(this.phase==='moving'){
   const delta=HOIST.stops[this.target]-this.y,d=Math.min(Math.abs(delta),HOIST.step);this.y+=Math.sign(delta)*d;this.wear+=d*.008;
   if(Math.abs(delta)<=HOIST.step+1e-9){this.y=HOIST.stops[this.target];this.emit('travel.arrived',{stop:HOIST.names[this.target]});
    if(this.target===0){this.rounds++;this.servicePending=this.wear>=HOIST.serviceAt;this.phase='idle';this.emit('round.complete',{round:this.rounds});if(this.servicePending)this.emit('service.due',{wear:+this.wear.toFixed(3)});}
    else{this.phase='serving';this.wait=45;}
   }
  }else if(this.phase==='serving'&&--this.wait<=0){const item=this.cargo.find(c=>c.stop===this.target);if(!item)throw Error('Cargo custody mismatch');this.cargo=this.cargo.filter(c=>c!==item);this.emit('cargo.delivered',{id:item.id,stop:HOIST.names[this.target],custody:'meal-crew'});this.move(this.target===3?0:this.target+1);}
  else if(this.phase==='maintenance'&&--this.wait<=0){this.wear=.12;this.servicePending=false;this.lastService=this.tick;this.phase='idle';this.emit('service.complete',{work:'inspection, cleaning and attention to moving fittings'});}
 }
 inspect(){return {id:HOIST.id,phase:this.phase,y:this.y,target:HOIST.names[this.target],rounds:this.rounds,wear:this.wear,servicePending:this.servicePending,lastService:this.lastService,cargo:this.cargo.map(c=>({...c})),tick:this.tick};}
 service(){if(this.phase!=='idle'||this.cargo.length)return false;this.phase='maintenance';this.wait=70;this.emit('service.started');return true;}
 snapshot(){return JSON.parse(JSON.stringify({state:this.inspect(),events:this.events}));}
}
