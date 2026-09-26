import {unitById,stageById} from './course.mjs';
import {finalTransfer} from './final-transfer.mjs';
export function parseV2Route(hash=''){const m=/^#\/v2(?:\/([^/]+))?(?:\/([^/]+))?$/.exec(hash);if(!m)return null;if(!m[1])return{view:'map'};if(m[1]==='final'){if(m[2]&&!finalTransfer.incidents.some(x=>x.id===m[2]))return{view:'notfound'};return{view:'final',incident:m[2]||finalTransfer.incidents[0].id}}const u=unitById(m[1]);if(u.id!==m[1]||m[2]&&!u.stages.some(x=>x.id===m[2]))return{view:'notfound'};if(!u.stages.length)return{view:'unit',unit:u.id,stage:null};const s=stageById(u,m[2]);return{view:'unit',unit:u.id,stage:s.id}}
export function v2Route(unit,stage){return stage?`#/v2/${unit}/${stage}`:unit?`#/v2/${unit}`:'#/v2'}
export function finalIncident(id){return finalTransfer.incidents.find(x=>x.id===id)||finalTransfer.incidents[0]}
export function choose(stage,index){if(!stage?.options?.[index])return null;return{selected:index,feedback:stage.options[index].feedback,term:stage.term||null}}
