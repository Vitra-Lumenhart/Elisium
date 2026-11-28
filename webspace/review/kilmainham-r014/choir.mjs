// Deterministic event authority; render/observer reads never advance the simulation.
const clamp=(x,a=-1,b=1)=>Math.min(b,Math.max(a,x));
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const clone=x=>JSON.parse(JSON.stringify(x));
export class Choir {
 constructor(canon,seed=1879){this.c=canon;this.seed=seed>>>0;this.time=0;this.year=1120;this.seq=0;this.events=[];this.used=new Set();this.actors=Object.fromEntries(canon.powers.map(p=>[p.id,{id:p.id,node:p.home,polarity:0,momentum:0,influence:.45,form:p.preferred,receipts:[]} ]));this.people=Object.fromEntries(canon.humans.map(p=>[p.id,{trust:0,receipts:[],commitments:[]} ]));this.history=[];this.obligations=[];for(const epoch of canon.epochs.slice(0,-1)){this.year=epoch.year;this.advance(1,epoch.node,'historical opportunity: '+epoch.issue);this.history.push({year:epoch.year,title:epoch.title,powers:this.snapshot()});}this.year=1879;this.history.push({year:1879,title:'The Ninth Bell',powers:this.snapshot()});}
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 emit(kind,actor,node,body,parents=[],audience=[]){const e={id:'K'+String(++this.seq).padStart(5,'0'),kind,actor,node,year:this.year,time:this.time,body:clone(body),parents:[...parents],audience:[...new Set(audience)]};this.events.push(e);return e;}
 at(node){return this.c.powers.filter(p=>this.actors[p.id].node===node);}
 witnesses(node){return [...this.at(node).map(p=>p.id),...this.c.humans.filter(h=>h.node===node).map(h=>h.id)];}
 deliver(e){for(const id of e.audience){const a=this.actors[id]||this.people[id];if(a&&!a.receipts.includes(e.id))a.receipts.push(e.id);}}
 advance(steps,node,reason='arrival'){if(!Number.isInteger(steps)||steps<1||steps>100)return [];this.time+=steps;this.resolveDue(node);
  const event=this.emit('occasion','world',node,{reason},[],this.witnesses(node));this.deliver(event);return this.respond(event);}
 commit(node,key){if(!Object.hasOwn(this.c.actions,key)||this.used.has(node))return null;this.used.add(node);const e=this.emit('testimony','visitor',node,{key,probes:this.c.actions[key]},[],this.witnesses(node));this.deliver(e);this.respond(e);return e;}
 respond(cause){const out=[];for(const p of this.at(cause.node)){const a=this.actors[p.id];if(!a.receipts.includes(cause.id))continue;
  const probe=cause.body.probes||[0,0,0],res=mean(probe);const feedback=this.events.filter(e=>a.receipts.includes(e.id)&&e.kind==='human.reply'&&e.parents.some(id=>this.events.find(p=>p.id===id)?.actor===a.id)).slice(-4);const social=feedback.length?mean(feedback.map(e=>e.body.decision==='accept'?.4:e.body.decision==='challenge'?-.4:0)):0;
  // Gift and vice compete with accumulated momentum, evidence, local pressures and uncertainty.
  const u=a.polarity*.44+a.momentum*.33+res*.66+social*.35+(this.random()-.5)*.85;
  const action=u>.12?'gift':u<-.12?'vice':'wait';
  const sign=action==='gift'?1:action==='vice'?-1:0;
  const previous=a.polarity;
  a.momentum=clamp(.78*a.momentum+.22*(sign+res*.35));a.polarity=clamp(.72*a.polarity+.28*sign);
  a.influence=clamp(.92*a.influence+.08*Math.abs(u)+.04*Math.abs(sign),0,1);
  // Physical forms are independent of ethics. A change follows an actual committed occasion.
  if(this.random()<.18&&action!=='wait')a.form=a.form===p.preferred?p.alternate:p.preferred;
  const e=this.emit('power.act',p.id,cause.node,{action,form:a.form,act:action==='gift'?p.giftAct:action==='vice'?p.viceAct:'Reserve judgment',line:action==='gift'?p.giftLine:action==='vice'?p.viceLine:'Not yet.',change:a.polarity-previous},[cause.id],this.witnesses(cause.node));
  this.deliver(e);out.push(e);
  // Humans own their response: a refusal and a commitment are different acts.
  for(const h of this.c.humans.filter(h=>h.node===cause.node)){const v=this.people[h.id];if(!v.receipts.includes(e.id))continue;
   const confidence=clamp(v.trust*.4+res*.6+sign*.25+(this.random()-.5)*.6);
   const decision=confidence>.22?'accept':confidence<-.22?'challenge':'reserve';
   v.trust=clamp(v.trust*.85+confidence*.15);if(decision==='accept')v.commitments.push(e.id);
   const reply=this.emit('human.reply',h.id,cause.node,{decision,line:decision==='accept'?'I can attest to that.':decision==='challenge'?'On what evidence?':'I cannot say yet.'},[e.id],this.witnesses(cause.node));this.deliver(reply);out.push(reply);if(decision==='accept')this.obligations.push({id:reply.id,actor:h.id,node:cause.node,power:p.id,due:this.time+8,status:'pending'});
  }
 }return out;}
 resolveDue(node){for(const o of this.obligations){if(o.status!=='pending'||o.due>this.time||o.node!==node)continue;const h=this.people[o.actor];if(!h.receipts.includes(o.id))continue;const fulfill=h.trust+(this.random()-.5)*.5>=0;o.status=fulfill?'fulfilled':'withdrawn';const e=this.emit('human.commitment',o.actor,node,{status:o.status,line:fulfill?'I kept my word.':'I must withdraw.'},[o.id],this.witnesses(node));this.deliver(e);const a=this.actors[o.power];if(a.receipts.includes(e.id)){a.momentum=clamp(a.momentum+(fulfill?.08:-.08));}}}
 // A power may independently travel one adjacent edge; never teleport or force the visitor's route.
 travelPowers(edges){for(const p of this.c.powers){const a=this.actors[p.id],near=edges.filter(e=>e.includes(a.node)).map(e=>e[0]===a.node?e[1]:e[0]);if(near.length&&this.random()<.23){const from=a.node,to=near[Math.floor(this.random()*near.length)];a.node=to;this.emit('power.travel',p.id,to,{from,to},[],this.witnesses(to));}}}
 snapshot(){return Object.values(this.actors).map(a=>({id:a.id,polarity:a.polarity,momentum:a.momentum,influence:a.influence,form:a.form,node:a.node}));}
 publicAt(node,limit=6){return this.events.filter(e=>e.year===1879&&e.node===node&&['power.act','human.reply','human.commitment'].includes(e.kind)).slice(-limit).map(e=>({id:e.id,name:this.c.powers.find(p=>p.id===e.actor)?.name||this.c.humans.find(p=>p.id===e.actor)?.name,line:e.body.line,kind:e.kind}));}
}
