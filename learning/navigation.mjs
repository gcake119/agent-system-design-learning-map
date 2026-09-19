import { chapters, route } from './chapters.mjs';
export function designRoute(id){return '#/design/'+id;}
export function designUnit(hash){
 const match=/^#\/design(?:\/([^/]+))?$/.exec(hash);
 if(!match)return null;
 return match[1] ? chapters.find(c=>c.id===match[1])?.id || null : chapters[0].id;
}
export function nextUnit(id){
 const index=chapters.findIndex(c=>c.id===id);
 if(index<0 || index===chapters.length-1)return null;
 const chapter=chapters[index+1];
 return {id:chapter.id,number:chapter.number,title:chapter.title,conclusion:chapter.conclusion,href:route(index+1)};
}
