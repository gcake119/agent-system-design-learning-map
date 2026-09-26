export const capacityPresets={
 url:{label:'URL Shortener',description:'物件很小、讀取多，主要觀察 lookup path。',objectKB:2,cacheHit:.85},
 feed:{label:'News Feed',description:'讀取多，但組合 timeline 會增加 app / DB 工作。',objectKB:8,cacheHit:.7},
 video:{label:'Video Delivery',description:'單一物件很大，bandwidth 與 origin delivery 比 request count 更重要。',objectKB:5000,cacheHit:.9},
};