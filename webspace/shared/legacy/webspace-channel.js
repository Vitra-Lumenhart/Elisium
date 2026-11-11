/*!
 * WebspaceChannel 1.0 — SHARED vocabulary for screens and portals.
 * Copyright (c) Webspace contributors. MIT permission: reuse, modify, and share.
 *
 * A portal is deliberate *navigation*. A screen is a sandboxed *embedded document*.
 * Both carry only a small, versioned public protocol, never private player data.
 *
 * Portal wire:  ?ws_v=1&ws_entry=<destination-defined entry id>
 * Screen wire:  postMessage({protocol:'webspace/1',kind:'screen',type,
 *                        screenId,nonce,payload}).
 * An iframe's sandbox makes its postMessage origin opaque ('null'). Authentication
 * MUST NOT be inferred from that origin or this nonce. These messages grant NO
 * powers: the host only recognizes readiness; navigation requests are ignored.
 *
 * Threat model: a screen owner, portal destination, and even a future narrated
 * AI character may be malicious. Cross-site content never sets host navigation,
 * reads private journey logs, acquires inventory, or speaks as the host AI.
 */
(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.WebspaceChannel=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const PROTOCOL='webspace/1', KINDS=new Set(['screen']); // Portal uses a URL query, never privileged postMessage.
 const TYPES=new Set(['screen:host-hello','screen:ready','screen:unavailable']);
 function safeId(value){return typeof value==='string'&&/^[a-z][a-z0-9_-]{0,63}$/i.test(value);}
 function nonce(){
   if(typeof crypto==='undefined'||!crypto.getRandomValues)throw Error('Secure randomness unavailable: bridge disabled');
   const b=new Uint8Array(16);crypto.getRandomValues(b);
   return Array.from(b,v=>v.toString(16).padStart(2,'0')).join('');
 }
 function envelope({kind='screen',type,screenId,nonce:token,payload={}}){
   const o={protocol:PROTOCOL,kind,type,screenId,nonce:token,payload};
   if(!valid(o))throw Error('Invalid Webspace message');return o;
 }
 function valid(o){
   if(!o||typeof o!=='object'||Array.isArray(o))return false;
   if(o.protocol!==PROTOCOL||!KINDS.has(o.kind)||!TYPES.has(o.type))return false;
   if(o.kind!=='screen'||!safeId(o.screenId)||typeof o.nonce!=='string'||!/^[a-f0-9]{32}$/.test(o.nonce))return false;
   if(!o.payload||typeof o.payload!=='object'||Array.isArray(o.payload))return false;
   try{return JSON.stringify(o).length<=4096;}catch{return false;}
 }
 function safeEmbedURL(input,{localhost=false}={}){
   if(typeof input!=='string'||input.length>2048||/[\u0000-\u001f\u007f]/.test(input))throw Error('Invalid screen URL');
   let u;try{u=new URL(input);}catch{throw Error('Screen URL must be absolute');}
   if(u.username||u.password||u.hash)throw Error('Screen URL must have no credentials or fragment');
   const secure=u.protocol==='https:';
   const local=localhost&&u.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(u.hostname);
   if(!(secure||local))throw Error('Only HTTPS screens (or explicit local development)');
   return u.href;
 }
 function validTravelEntry(id){return typeof id==='string'&&id.length<=64&&/^[a-z][a-z0-9_-]*$/i.test(id);}
 return Object.freeze({PROTOCOL,envelope,valid,nonce,safeId,safeEmbedURL,validTravelEntry});
});
