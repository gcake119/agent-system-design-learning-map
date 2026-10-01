export const course={
  "title": "System Design",
  "subtitle": "沿著系統路徑，理解問題與設計",
  "intro": "從畫面看到的現象開始，追蹤請求與資料，用證據縮小範圍，再比較修改的理由、代價與驗證。"
};

export const units=[
  {
    "id": "flow",
    "number": 1,
    "title": "一個按鈕到底發生了什麼？",
    "summary": "指出請求送出、資料儲存、回應及畫面更新的不同證據。",
    "stages": [
      {
        "id": "observe",
        "mode": "INTERACT",
        "eyebrow": "觀察與操作",
        "title": "一個按鈕到底發生了什麼？",
        "intro": "先固定問題，改一個條件，看看系統的哪一段跟著改變。",
        "prompt": "沿著去程與回程，指出資料儲存與畫面更新各自需要什麼證據。",
        "options": []
      },
      {
        "id": "reason",
        "mode": "READ",
        "eyebrow": "必要機制閱讀",
        "title": "為什麼會這樣？",
        "intro": "讀完下面的機制與限制，再回到同一個實驗。設定會保留，這一節會加入新的比較條件。",
        "prompt": "沿著去程與回程，指出資料儲存與畫面更新各自需要什麼證據。",
        "options": []
      },
      {
        "id": "transfer",
        "mode": "TRANSFER",
        "eyebrow": "換一個問題",
        "title": "預約建立",
        "intro": "預約建立：表單填好了，但要確認重新開啟頁面仍能讀到預約。",
        "prompt": "先重建正常路徑，再解釋目前證據能支援什麼、還缺什麼。提出下一步與驗證方法。",
        "options": []
      }
    ]
  },
  {
    "id": "locate",
    "number": 2,
    "title": "問題到底壞在哪一層？",
    "summary": "比較正常與實際輸入／輸出，縮小異常範圍並保留根因假設。",
    "stages": [
      {
        "id": "observe",
        "mode": "INTERACT",
        "eyebrow": "觀察與操作",
        "title": "同樣沒反應，問題到底在哪一層？",
        "intro": "先固定問題，改一個條件，看看系統的哪一段跟著改變。",
        "prompt": "先選一組觀察資料，再找輸入正常而輸出不符合預期的地方；根因還缺哪些證據？",
        "options": []
      },
      {
        "id": "reason",
        "mode": "READ",
        "eyebrow": "必要機制閱讀",
        "title": "為什麼會這樣？",
        "intro": "讀完下面的機制與限制，再回到同一個實驗。設定會保留，這一節會加入新的比較條件。",
        "prompt": "先選一組觀察資料，再找輸入正常而輸出不符合預期的地方；根因還缺哪些證據？",
        "options": []
      },
      {
        "id": "transfer",
        "mode": "TRANSFER",
        "eyebrow": "換一個問題",
        "title": "匯出報表",
        "intro": "匯出報表：畫面沒有下載，但工作可能根本沒送出，也可能已儲存結果。",
        "prompt": "先重建正常路徑，再解釋目前證據能支援什麼、還缺什麼。提出下一步與驗證方法。",
        "options": []
      }
    ]
  },
  {
    "id": "latency",
    "number": 3,
    "title": "系統為什麼會變慢？",
    "summary": "在固定負載及結果要求下比較各段耗時，說明修改為何改善。",
    "stages": [
      {
        "id": "observe",
        "mode": "INTERACT",
        "eyebrow": "觀察與操作",
        "title": "慢到底累積在哪裡？",
        "intro": "先固定問題，改一個條件，看看系統的哪一段跟著改變。",
        "prompt": "改一段耗時，觀察總時間差值；其他段是否真的改變？",
        "options": []
      },
      {
        "id": "reason",
        "mode": "READ",
        "eyebrow": "必要機制閱讀",
        "title": "為什麼會這樣？",
        "intro": "讀完下面的機制與限制，再回到同一個實驗。設定會保留，這一節會加入新的比較條件。",
        "prompt": "改一段耗時，觀察總時間差值；其他段是否真的改變？",
        "options": []
      },
      {
        "id": "transfer",
        "mode": "TRANSFER",
        "eyebrow": "換一個問題",
        "title": "商品列表",
        "intro": "商品列表：資料查詢很快，但商品圖片摘要服務變慢。",
        "prompt": "先重建正常路徑，再解釋目前證據能支援什麼、還缺什麼。提出下一步與驗證方法。",
        "options": []
      }
    ]
  },
  {
    "id": "cache",
    "number": 4,
    "title": "為什麼要快取？",
    "summary": "解釋命中率如何改變來源讀取量，以及副本時效代價。",
    "stages": [
      {
        "id": "observe",
        "mode": "INTERACT",
        "eyebrow": "觀察與操作",
        "title": "重複讀取，怎麼減少來源壓力？",
        "intro": "先固定問題，改一個條件，看看系統的哪一段跟著改變。",
        "prompt": "比較來源收到的讀取量及版本；減少負載是否也代表資料更新了？",
        "options": []
      },
      {
        "id": "reason",
        "mode": "READ",
        "eyebrow": "必要機制閱讀",
        "title": "為什麼會這樣？",
        "intro": "讀完下面的機制與限制，再回到同一個實驗。設定會保留，這一節會加入新的比較條件。",
        "prompt": "比較來源收到的讀取量及版本；減少負載是否也代表資料更新了？",
        "options": []
      },
      {
        "id": "transfer",
        "mode": "TRANSFER",
        "eyebrow": "換一個問題",
        "title": "可預約時段",
        "intro": "可預約時段：很多人看名額，但確認預約不能只相信列表副本。",
        "prompt": "先重建正常路徑，再解釋目前證據能支援什麼、還缺什麼。提出下一步與驗證方法。",
        "options": []
      }
    ]
  },
  {
    "id": "queue",
    "number": 5,
    "title": "為什麼要佇列？",
    "summary": "說明等待位置與業務完成不同，推算有限視窗的工作累積。",
    "stages": [
      {
        "id": "observe",
        "mode": "INTERACT",
        "eyebrow": "觀察與操作",
        "title": "工作收到了，就算做完了嗎？",
        "intro": "先固定問題，改一個條件，看看系統的哪一段跟著改變。",
        "prompt": "比較接收回應、產物與未完成工作；改變等待位置會增加能力嗎？",
        "options": []
      },
      {
        "id": "reason",
        "mode": "READ",
        "eyebrow": "必要機制閱讀",
        "title": "為什麼會這樣？",
        "intro": "讀完下面的機制與限制，再回到同一個實驗。設定會保留，這一節會加入新的比較條件。",
        "prompt": "比較接收回應、產物與未完成工作；改變等待位置會增加能力嗎？",
        "options": []
      },
      {
        "id": "transfer",
        "mode": "TRANSFER",
        "eyebrow": "換一個問題",
        "title": "音訊轉錄",
        "intro": "音訊轉錄：每份音訊需 60 秒，使用者需要稍後拿到結果。",
        "prompt": "先重建正常路徑，再解釋目前證據能支援什麼、還缺什麼。提出下一步與驗證方法。",
        "options": []
      }
    ]
  },
  {
    "id": "consistency",
    "number": 6,
    "title": "資料為什麼看起來不一致？",
    "summary": "追資料版本及讀取分支，依需求判斷短暫落後。",
    "stages": [
      {
        "id": "observe",
        "mode": "INTERACT",
        "eyebrow": "觀察與操作",
        "title": "這次讀到的，是哪一份資料？",
        "intro": "先固定問題，改一個條件，看看系統的哪一段跟著改變。",
        "prompt": "選一條讀取路徑，前進時間，再依時效要求判斷這次舊值是否可接受。",
        "options": []
      },
      {
        "id": "reason",
        "mode": "READ",
        "eyebrow": "必要機制閱讀",
        "title": "為什麼會這樣？",
        "intro": "讀完下面的機制與限制，再回到同一個實驗。設定會保留，這一節會加入新的比較條件。",
        "prompt": "選一條讀取路徑，前進時間，再依時效要求判斷這次舊值是否可接受。",
        "options": []
      },
      {
        "id": "transfer",
        "mode": "TRANSFER",
        "eyebrow": "換一個問題",
        "title": "行事曆",
        "intro": "行事曆：預約已儲存，衍生行事曆檢視稍後才更新。",
        "prompt": "先重建正常路徑，再解釋目前證據能支援什麼、還缺什麼。提出下一步與驗證方法。",
        "options": []
      }
    ]
  },
  {
    "id": "evidence",
    "number": 7,
    "title": "系統出錯時怎麼知道？",
    "summary": "針對假設選證據，區分已觀察、未觀察與業務結果。",
    "stages": [
      {
        "id": "observe",
        "mode": "INTERACT",
        "eyebrow": "觀察與操作",
        "title": "下一份證據，能幫我排除什麼？",
        "intro": "先固定問題，改一個條件，看看系統的哪一段跟著改變。",
        "prompt": "先寫一個假設，再選能區分它的證據；外部結果現在知道了嗎？",
        "options": []
      },
      {
        "id": "reason",
        "mode": "READ",
        "eyebrow": "必要機制閱讀",
        "title": "為什麼會這樣？",
        "intro": "讀完下面的機制與限制，再回到同一個實驗。設定會保留，這一節會加入新的比較條件。",
        "prompt": "先寫一個假設，再選能區分它的證據；外部結果現在知道了嗎？",
        "options": []
      },
      {
        "id": "transfer",
        "mode": "TRANSFER",
        "eyebrow": "換一個問題",
        "title": "文章發布",
        "intro": "文章發布：呼叫方逾時，不能直接認定文章沒發出去。",
        "prompt": "先重建正常路徑，再解釋目前證據能支援什麼、還缺什麼。提出下一步與驗證方法。",
        "options": []
      }
    ]
  },
  {
    "id": "redesign",
    "number": 8,
    "title": "找到問題以後，要怎麼改？",
    "summary": "在同一系統限制下比較方案、指出收益及代價，提出修改後驗證。",
    "stages": [
      {
        "id": "observe",
        "mode": "INTERACT",
        "eyebrow": "觀察與操作",
        "title": "找到問題後，修改還會影響哪裡？",
        "intro": "先固定問題，改一個條件，看看系統的哪一段跟著改變。",
        "prompt": "先定位受限結果，再改一個條件；說明收益、代價與重新驗證的方法。",
        "options": []
      },
      {
        "id": "reason",
        "mode": "READ",
        "eyebrow": "必要機制閱讀",
        "title": "為什麼會這樣？",
        "intro": "讀完下面的機制與限制，再回到同一個實驗。設定會保留，這一節會加入新的比較條件。",
        "prompt": "先定位受限結果，再改一個條件；說明收益、代價與重新驗證的方法。",
        "options": []
      },
      {
        "id": "transfer",
        "mode": "TRANSFER",
        "eyebrow": "換一個問題",
        "title": "案件檔案流程",
        "intro": "案件檔案流程：查詢很多、處理較久，外部通知尚未確定。",
        "prompt": "先重建正常路徑，再解釋目前證據能支援什麼、還缺什麼。提出下一步與驗證方法。",
        "options": []
      }
    ]
  }
];

export function unitById(id){return units.find(unit=>unit.id===id)||units[0];}
export function stageById(unit,id){return unit?.stages.find(stage=>stage.id===id)||unit?.stages[0]||null;}
