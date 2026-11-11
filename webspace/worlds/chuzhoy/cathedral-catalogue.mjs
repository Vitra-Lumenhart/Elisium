/* WORLD: chuzhoy | ID: CATHEDRAL/PROPOSAL/01
 * INVARIANT: this file never edits the 6.2.8 native scene, node graph, fountain, portals, or arrival tags.
 * WHY: Chuzhoy owns its authoritative 2D map. The cathedral compiler must follow it, not the reverse.
 * FUTURE-AI SEED: attach masonry courses to the northern ruin only after approving measured anchors
 * from the existing world. Seek one credible broken vault silhouette BEFORE adding ten ornaments.
 */
import { compileLocalCatalogue } from '../../commons/cathedral/grammar.mjs';
export const CATHEDRAL_PROPOSAL = Object.freeze({
  status: 'opt-in asset source, not mounted in Chuzhoy',
  hostVersionReviewed: '6.2.8',
  protectedSystems: ['fountain','wudu','baptism','hidden-well','astrarium','portal','navigation','flora','wildlife','compass'],
  sourceOfCoordinates: 'host-authored 2D plan only',
  palette: ['weathered granite','Caen limestone','Purbeck marble','malachite','garnet']
});
/** Make reusable local meshes. The host chooses coordinates, collision approval and visibility.
 * No magic attachment to global scene and no unreviewed origin (0,0) placement.
 */
export function prepareCathedralParts(specs, place) {
  if(typeof place!=='function') throw Error('host placement callback required');
  const meshes=compileLocalCatalogue(specs);
  return meshes.map((asset,i)=>{
    const position=place(specs[i].id,asset);
    if(!position || !Array.isArray(position.at) || position.at.length!==2 ||
       !position.at.every(Number.isFinite)) throw Error('host supplied no 2D anchor for '+specs[i].id);
    return {asset,at:[...position.at],yaw:Number(position.yaw)||0,
      approved:false, // collision, water and sacred-location checks must happen inside the host.
      contract:'catalogue-placement/1'};
  });
}
// FUTURE-AI SEED: a future host adapter may pack vertex colors into the existing WebGL2
// builder, but it must not import Three.js or add a second renderer to the Garden.
// FUTURE-AI SEED: preserve the gold structural vs pink sevenfold proposal toggles as
// separate interpretive layers; they're not the same geometrical division.
