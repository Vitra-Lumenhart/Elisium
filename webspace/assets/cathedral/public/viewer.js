/** Temple Rev06 art-direction and performance ES module. CDN Three is pinned by index.html importmap.
 * Mounts within an existing HTML document; it does not overwrite the host map.
 * Separate coordinate modes: GLB Y up; converted from CAD x=u,y=v,z=elevation.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function mountTemple(host,{assetBase='./assets/',initial=['00_foundations','01_courts_water','02_communion_crown','05_stained_glass'],
 cameraPosition=[178,117,166],pixelRatioCap=1.6,onStatus=()=>{}}={}) {
  if (!host) throw new Error('Temple renderer container is missing');
  const phases=['00_foundations','01_courts_water','02_communion_crown','03_mont_skyline','04_ornaments_ruins','05_stained_glass'];
  const scene=new THREE.Scene();scene.background=new THREE.Color('#121821');
  scene.fog=new THREE.FogExp2('#121821',.00155);
  const camera=new THREE.PerspectiveCamera(51,1,.4,950);camera.position.set(...cameraPosition);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,pixelRatioCap));
  renderer.setSize(Math.max(host.clientWidth,320),Math.max(host.clientHeight,320));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.55;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.065;
  controls.target.set(0,27,0);controls.minDistance=35;controls.maxDistance=430;
  controls.maxPolarAngle=Math.PI*.49;
  // A small number of lights supports depth without a complex postproduction graph.
  const hemi=new THREE.HemisphereLight(0xdceafe,0x876e52,2.25);scene.add(hemi);
  const key=new THREE.DirectionalLight(0xffead0,3.8);
  key.position.set(-85,155,85);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera,{left:-125,right:125,top:160,bottom:-160,near:1,far:370});
  key.shadow.bias=-.00011;scene.add(key);
  const rim=new THREE.DirectionalLight(0x9bbfdf,1.4);rim.position.set(110,70,-120);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(700,700),new THREE.MeshStandardMaterial({color:'#181c21',roughness:.92}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-2.46;floor.receiveShadow=true;scene.add(floor);

  const loader=new GLTFLoader(),groups=new Map(),loading=new Map();let disposed=false,frame=0,dirty=true;
  let quality='standard';
  // ONE 512² atlas for nearly all stone and metal; URL requested once, reused by all phases.
  // Texture projection uses the dominant face normal, not authored per-instance UVs.
  const textureLoader=new THREE.TextureLoader();
  const stoneAtlas=textureLoader.load(assetBase+'textures/marble_micro_atlas.webp',()=>{dirty=true;});
  stoneAtlas.colorSpace=THREE.SRGBColorSpace;
  stoneAtlas.minFilter=THREE.LinearMipmapLinearFilter;
  stoneAtlas.magFilter=THREE.LinearFilter;
  stoneAtlas.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const glassMap=textureLoader.load(assetBase+'textures/sevenfold_broken_glass.png',()=>{dirty=true;});
  glassMap.colorSpace=THREE.SRGBColorSpace;
  const splashMap=textureLoader.load(assetBase+'textures/glass_caustic_fake.webp',()=>{dirty=true;});
  splashMap.colorSpace=THREE.SRGBColorSpace;
  const templeExtras=new THREE.Group(); templeExtras.name='rev06_static_colored_light_illusion'; scene.add(templeExtras);
  let glassFX=true;
  const stoneIndices={marble:0,pale:1,ashlar:2,aged:2,debris:2,shadow:3,slate:3,bronze:3,gold:1,malachite:3,inlay:2,fresco:3};
  function textureStone(material){
    if (!material || material.userData.templeShaderPatched) return;
    const name=(material.name||'').toLowerCase();
    if (!(name in stoneIndices))return;
    material.userData.templeShaderPatched=true;
    const sector=stoneIndices[name];
    const stoneJoints=['ashlar','aged','debris','shadow'].includes(name)?1:0;
    material.onBeforeCompile=(shader)=>{
      shader.uniforms.templeAtlas={value:stoneAtlas};
      shader.uniforms.templeSector={value:sector};
      shader.uniforms.templeJoints={value:stoneJoints};
      shader.vertexShader='varying vec3 templeWorld; varying vec3 templeNormal;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        templeWorld=(modelMatrix*vec4(position,1.0)).xyz;
        templeNormal=normalize(mat3(modelMatrix)*normal);`);
      shader.fragmentShader='varying vec3 templeWorld; varying vec3 templeNormal; uniform sampler2D templeAtlas; uniform float templeSector; uniform float templeJoints;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        // 1 sample, not 3: dominant-axis triplanar approximation, no additional geometry.
        vec3 an=abs(normalize(templeNormal));
        vec2 coord=(an.y>an.x && an.y>an.z) ? templeWorld.xz :
          ((an.x>an.z) ? templeWorld.zy : templeWorld.xy);
        vec2 subtile=fract(coord*0.17+0.013);
        vec2 origin=vec2(mod(templeSector,2.0),floor(templeSector/2.0))*0.5;
        vec3 rock=texture2D(templeAtlas,origin+0.009+subtile*0.482).rgb;
        float luma=dot(rock,vec3(.25,.55,.20));
        float granulation=clamp((luma-0.65)*0.55,-.18,.15);
        float coloredVein=rock.b-rock.r;
        diffuseColor.rgb *= (1.0+granulation+coloredVein*.1);
        // 1 m historically-inspired course rhythm, not an asserted Second Temple standard.
        float course=fract(templeWorld.y+.015);
        float seam=1.0-smoothstep(.0,.065,min(course,1.0-course));
        float blockShift=mod(floor(templeWorld.y),2.0)*1.4;
        float verticalSeam=1.0-smoothstep(0.0,.08,abs(fract((coord.x+blockShift)/3.0)-.5));
        diffuseColor.rgb *= 1.0-templeJoints*(.19*seam+.045*verticalSeam);
        float weather=clamp(1.0-templeWorld.y/18.0,0.0,1.0);
        diffuseColor.rgb *= 1.0-.075*weather*(.5+.5*sin(templeWorld.x*.48+templeWorld.z*.32));`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        roughnessFactor=clamp(roughnessFactor+0.15*(0.53-luma),0.22,1.0);`);
    };
    material.customProgramCacheKey=()=>`temple_r06_stone_${name}_${quality}`;
    material.needsUpdate=true;
  }
  function enrichPaneMaterial(material){
    if(!material || !(material.name||'').includes('SEVENFOLD'))return;
    material.alphaTest=.43;material.transparent=false;
    material.side=THREE.DoubleSide;material.depthWrite=true;
    material.emissive=new THREE.Color(1,1,1);
    material.emissiveMap=material.map;
    material.emissiveIntensity=2.5;
    material.toneMapped=false;
    material.needsUpdate=true;
  }
  // Art direct light WITHOUT lights: projector decals on existing annular marble walkway.
  // One mesh, 8 UV quads = one draw call. Calibrated to ring 22-26 m at +0.95 m.
  function makeSpills(){
    const vertices=[],uv=[],faces=[];let index=0;
    for(const k of [0,1,3,4,6,7,9,10]){
      const a=(k+.45)*Math.PI*2/12;
      const er=new THREE.Vector3(Math.cos(a),0,-Math.sin(a));
      const et=new THREE.Vector3(-Math.sin(a),0,-Math.cos(a));
      const cx=24*Math.cos(a),cz=-24*Math.sin(a);
      for(const [r,t,u,v] of [[-2.55,-6.3,0,0],[-2.55,6.3,1,0],[2.55,6.3,1,1],[2.55,-6.3,0,1]]){
        const pos=new THREE.Vector3(cx,.967,cz).addScaledVector(er,r).addScaledVector(et,t);
        vertices.push(pos.x,pos.y,pos.z);uv.push(u,v);
      }
      faces.push(index,index+1,index+2,index,index+2,index+3);index+=4;
    }
    const geom=new THREE.BufferGeometry();
    geom.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geom.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geom.setIndex(faces);geom.computeVertexNormals();
    const mat=new THREE.MeshBasicMaterial({map:splashMap,transparent:true,opacity:.78,
      blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true,side:THREE.DoubleSide,
      toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1});
    const mesh=new THREE.Mesh(geom,mat);mesh.name='eight_baked_prismatic_color_pools';
    mesh.renderOrder=5;return mesh;
  }
  // Mild oversize double of the glass surface, optional cheap glow; no heavy bloom pipeline.
  function makeWindowHalos(){
    const vertices=[],uv=[],faces=[];let index=0;
    for(const k of [0,1,3,4,6,7,9,10]){
      const a=(k+.45)*Math.PI*2/12;
      const posR=32.14,tx=-Math.sin(a),tz=-Math.cos(a),x=posR*Math.cos(a),z=-posR*Math.sin(a);
      for(const [dx,y,u,v] of [[-4.3,8.25,0,1],[4.3,8.25,1,1],[4.3,22,1,0],[-4.3,22,0,0]]){
        vertices.push(x+tx*dx,y,z+tz*dx);uv.push(u,v);
      }
      faces.push(index,index+1,index+2,index,index+2,index+3);index+=4;
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(faces);geo.computeVertexNormals();
    const mat=new THREE.MeshBasicMaterial({map:glassMap,color:0xffffff,transparent:true,
      opacity:.16,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,
      side:THREE.DoubleSide,toneMapped:false});
    return new THREE.Mesh(geo,mat);
  }
  const caustics=makeSpills(),halos=makeWindowHalos();
  templeExtras.add(caustics,halos);
  templeExtras.visible=false;
  async function loadPhase(phase){
    if(!phases.includes(phase))throw Error('Unknown architectural phase '+phase);
    if(loading.has(phase))return loading.get(phase);
    const promise=loader.loadAsync(assetBase+phase+'.glb').then(gltf=>{
      if(disposed)return;
      const g=gltf.scene;g.name=phase;
      g.traverse(obj=>{
        if(!obj.isMesh)return;
        obj.castShadow=phase!=='04_ornaments_ruins';obj.receiveShadow=true;
        const mats=Array.isArray(obj.material)?obj.material:[obj.material];
        mats.forEach(m=>{textureStone(m);enrichPaneMaterial(m);});
        if(phase==='05_stained_glass') obj.castShadow=false;
        // PBR alpha of the GLB water; don't render fake opaque ponds.
        if (obj.material?.name==='water'||obj.material?.name==='glass'){
          obj.material.transparent=true;obj.material.depthWrite=false;obj.material.opacity=.73;obj.material.side=THREE.DoubleSide;
        }
      });
      groups.set(phase,g);scene.add(g);
      if(phase==='05_stained_glass')templeExtras.visible=glassFX;
      dirty=true;onStatus({phase,loaded:true});return g;
    }).catch(err=>{onStatus({phase,error:err.message});loading.delete(phase);throw err;});
    loading.set(phase,promise);onStatus({phase,loading:true});return promise;
  }
  async function showPhase(phase,visible=true){
    if(visible){const g=await loadPhase(phase);if(g)g.visible=true;}
    else if(groups.has(phase))groups.get(phase).visible=false;
    if(phase==='05_stained_glass')templeExtras.visible=visible&&glassFX;
    dirty=true;
  }
  async function showAll(){await Promise.all(phases.map(p=>showPhase(p,true)));}
  function setQuality(q='standard'){
    quality=q;
    for(const grp of groups.values())grp.traverse(o=>{if(o.isMesh){(Array.isArray(o.material)?o.material:[o.material]).forEach(textureStone);}});
    templeExtras.visible=(q!=='minimal')&&glassFX&&groups.has('05_stained_glass')&&groups.get('05_stained_glass').visible;
    if(q==='high'&&key.shadow.mapSize.x<2048){key.shadow.mapSize.set(2048,2048);key.shadow.map?.dispose();key.shadow.map=null;}
    dirty=true;
  }
  function setGlassLight(enabled=true){glassFX=!!enabled;templeExtras.visible=glassFX&&groups.has('05_stained_glass')&&groups.get('05_stained_glass').visible;dirty=true;}
  function resize(){let w=Math.max(host.clientWidth,320),h=Math.max(host.clientHeight,320);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);dirty=true;}
  const ro=new ResizeObserver(resize);ro.observe(host);resize();
  // Render only while camera damping actually changes or a scene asset has changed.
  // requestAnimationFrame remains cheap, but the GPU is not repainting a static ruin 60 times/s.
  const invalidate=()=>{dirty=true;};
  controls.addEventListener('change',invalidate);
  const animate=()=>{if(disposed)return;frame=requestAnimationFrame(animate);const moving=controls.update();
    if(dirty||moving){renderer.render(scene,camera);dirty=false;}
  };animate();
  async function capture(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');}
  function dispose(){disposed=true;cancelAnimationFrame(frame);ro.disconnect();controls.dispose();
    stoneAtlas.dispose();glassMap.dispose();splashMap.dispose();
    for(const child of templeExtras.children){child.geometry.dispose();child.material.dispose();}
    for(const g of groups.values())g.traverse(o=>{if(o.isMesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m?.dispose());}});
    renderer.dispose();renderer.domElement.remove();}
  initial.forEach(p=>loadPhase(p).catch(()=>{}));
  return {scene,camera,renderer,controls,groups,loadPhase,showPhase,showAll,setQuality,setGlassLight,capture,dispose};
}
