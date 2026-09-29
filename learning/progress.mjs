const STORAGE_KEY='system-design-learning-progress-v1';

export function emptyProgress(){
  return {last:null,visited:{}};
}

export function normalizeProgress(value){
  const base=emptyProgress();
  if(!value||typeof value!=='object')return base;
  return {
    last:value.last&&typeof value.last==='object'?value.last:null,
    visited:value.visited&&typeof value.visited==='object'?value.visited:{}
  };
}

export function loadProgress(storage=globalThis?.localStorage){
  try{
    if(!storage)return emptyProgress();
    return normalizeProgress(JSON.parse(storage.getItem(STORAGE_KEY)||'null'));
  }catch{
    return emptyProgress();
  }
}

export function recordStage(progress,unitId,stageId){
  const next=normalizeProgress(progress);
  const stages=new Set(Array.isArray(next.visited[unitId])?next.visited[unitId]:[]);
  stages.add(stageId);
  return {
    last:{unitId,stageId},
    visited:{...next.visited,[unitId]:[...stages]}
  };
}

export function saveProgress(progress,storage=globalThis?.localStorage){
  try{
    if(storage)storage.setItem(STORAGE_KEY,JSON.stringify(normalizeProgress(progress)));
  }catch{}
}

export function visitedStages(progress,unitId){
  return Array.isArray(progress?.visited?.[unitId])?progress.visited[unitId]:[];
}
