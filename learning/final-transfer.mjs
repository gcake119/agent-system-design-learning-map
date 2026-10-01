// Keep existing bookmarks, but use the current course scope and neutral phenomena.
export const finalTransfer={
 id:'case-pipeline',title:'案件追蹤＋檔案處理',intro:'同一套工作臺：查詢案件、建立檔案工作、產物完成後通知。這五組合成觀察資料沒有章節提示；請自己說明設計理由與驗證。',
 incidents:[
  {id:'concurrent',title:'早上大家都開啟列表',question:'來源收到每秒 1000 次相似讀取；教學來源上限 500 次。不要先決定方案，先指出受限位置與證據。'},
  {id:'unknown',title:'這次操作的結果尚未確認',question:'本地已送出某筆通知，五秒後仍未拿到回應；外部到底做了沒有？目前還不知道。'},
  {id:'backlog',title:'檔案越等越久',question:'每秒新增 0.3 件檔案工作，每件平均 60 秒；請比較新進工作與本模型處理能力。'},
  {id:'provider',title:'使用者等通知，但沒有回覆',question:'檔案產物已存在，某筆外部通知回應遺失；修改檔案處理人力能回答外部結果嗎？'},
  {id:'version',title:'另一頁看到舊值',question:'權威資料已是 v3，工作臺讀取副本可能還是 v2。負載改善能證明這個畫面符合需求嗎？'}
 ]
};
