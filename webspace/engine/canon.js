/* Webspace Canon 1.0 — Garden of Chuzhoy is the default safe landing.
   A descendant world may override presentation and physics but not silently weaken
   explicit portal consent, visible interaction, or the meaning of screen vs portal.
   Compatibility scaffold; no license grant is inferred for bundled art assets. */
(function(root){
  'use strict';
  const landing=Object.freeze({world:'garden',node:'arrival',yaw:0,pitch:0});
  const contracts=Object.freeze({
    portal:Object.freeze({version:'webspace/1',explicitConsent:true,publicEntryTagsOnly:true,sendPlayerHistory:false}),
    screen:Object.freeze({version:'webspace/1',sandbox:true,screenIsNotPortal:true}),
    travel:Object.freeze({version:'webspace/1',graphEdgesOnly:true,routeLabelsVisible:true}),
    action:Object.freeze({version:'webspace/1',visibleObject:true,tapAndKeyboard:true})
  });
  const cloneLanding=()=>({...landing,history:[]});
  const freezeEntries=(entries)=>Object.freeze(Object.fromEntries(
    Object.entries(entries).map(([key,value])=>[key,Object.freeze({...value})])));
  function extendWorld(definition,overrides={}){
    if(!definition||typeof definition!=='object')throw new TypeError('World definition required');
    const world={...definition,...overrides};
    world.contracts={...contracts,...definition.contracts,...overrides.contracts};
    return world;
  }
  root.WebspaceCanon=Object.freeze({version:'1.0.0',defaultLanding:cloneLanding,freezeEntries,extendWorld,contracts});
})(window);
