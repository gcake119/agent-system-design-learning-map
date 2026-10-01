import {normalizeExperiment} from './experiment-model.mjs';
const key=(id,context)=>`course-experiment-v1:${id}:${context}`;
const defaultStorage=()=>{try{return globalThis.localStorage;}catch{return null;}};
export function loadExperiment(id,context='teaching',storage=defaultStorage()){
 let raw={};try{raw=JSON.parse(storage?.getItem(key(id,context))||'null')||{};}catch{}
 return {state:normalizeExperiment(id,raw.state,context),selected:typeof raw.selected==='string'?raw.selected:'',note:typeof raw.note==='string'?raw.note.slice(0,8000):'',baseline:raw.baseline&&typeof raw.baseline==='object'?normalizeExperiment(id,raw.baseline,context):null};
}
export function saveExperiment(id,context,value,storage=defaultStorage()){
 try{if(!storage)return false;storage.setItem(key(id,context),JSON.stringify(value));return true;}catch{return false;}
}
