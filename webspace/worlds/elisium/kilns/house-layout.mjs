// Kilns 3D architectural plan · world coordinates in meters.
// World graph IDs derive from the existing v5/v6 Kilns list; the gallery is
// an unscored connecting hall, not a new theological station.
// Local time remains child-world time; an attic ascent is +3 minutes.
export const CELL = 10;
export const FLOOR_HEIGHT = 4.4;
export const ROOM_ORDER = [
  {name:'Oratory',col:0,row:0,signature:'spectral'},
  {name:'Library',col:1,row:0,signature:'books'},
  {name:'Study',col:2,row:0,signature:'ink'},
  {name:'Stair Landing',col:0,row:1,signature:'stairs'},
  {name:'Common Room',col:1,row:1,signature:'hearth'},
  {name:'Dining Room',col:2,row:1,signature:'supper'},
  {name:'Picture Gallery',col:0,row:2,signature:'portraits'},
  {name:'Vestibule',col:1,row:2,signature:'threshold'},
  {name:'Kitchen',col:2,row:2,signature:'rain'},
  {name:'Attic',col:0,row:1,level:1,signature:'restoration'}
].map(o=>({...o,level:o.level||0,x:(o.col-1)*CELL,z:(o.row-1)*CELL,y:(o.level||0)*FLOOR_HEIGHT}));
export const BY_NAME = Object.fromEntries(ROOM_ORDER.map(r=>[r.name,r]));
export const ROOM_NAMES = ROOM_ORDER.filter(r=>r.level===0).map(r=>r.name).concat('Attic');
export const START_ROOM = 'Vestibule';
export const LOCAL_OBJECT_POSITIONS = [
 [-2.75,-2.65],[2.75,-2.65],[-2.75,2.65],[2.75,2.65],[0,-2.65]
];
export const doorwayHalfWidth = 1.35;
export const overallHalfExtent = 1.5 * CELL;
export function cellIndex(coordinate) {
  return Math.max(0,Math.min(2, Math.floor((coordinate+overallHalfExtent)/CELL)));
}
export function roomForPosition(x,z,level=0) {
  if(level===1) return BY_NAME.Attic;
  const col=cellIndex(x), row=cellIndex(z);
  return ROOM_ORDER.find(r=>r.level===0&&r.col===col&&r.row===row);
}
export function positionOf(r) {
  const room=typeof r==='string'?BY_NAME[r]:r;
  return {x:room.x,z:room.z,y:room.y};
}
export function canStep(from,to,level=0) {
  if(level===1) {
    const r=BY_NAME.Attic;
    return Math.abs(to.x-r.x)<4.7 && Math.abs(to.z-r.z)<4.7;
  }
  if(Math.abs(to.x)>14.7||Math.abs(to.z)>14.7) return false;
  const a=roomForPosition(from.x,from.z),b=roomForPosition(to.x,to.z);
  if(!a||!b) return false;
  if(a===b)return true;
  if(Math.abs(a.col-b.col)+Math.abs(a.row-b.row)!==1)return false;
  // The doorway is centered on every shared wall. This deliberately refuses
  // clipping through the timber paneling rather than giving free flight.
  if(a.col!==b.col)return Math.abs(to.z-a.z)<doorwayHalfWidth-0.1;
  return Math.abs(to.x-a.x)<doorwayHalfWidth-0.1;
}
export function reachableRooms(room) {
  const a=BY_NAME[room];if(!a)return [];
  if(room==='Attic')return ['Stair Landing'];
  return ROOM_ORDER.filter(b=>b.level===0 &&
    Math.abs(a.col-b.col)+Math.abs(a.row-b.row)===1).map(r=>r.name)
    .concat(room==='Stair Landing'?['Attic']:[]);
}
export function placeForObject(room,index) {
  const [dx,dz]=LOCAL_OBJECT_POSITIONS[index%LOCAL_OBJECT_POSITIONS.length];
  return {x:room.x+dx,y:room.y,z:room.z+dz};
}
export const STAIR_STEP_COUNT=21;
