export const defaults = {
  scenario: "transient",
  source: "live",
  limit: 3,
  retry: true,
  escalate: true,
};
export const phases = ["observe", "plan", "act", "verify"];
export function begin(config = defaults) {
  const c = { ...defaults, ...config };
  if (
    !["smooth", "transient", "offline"].includes(c.scenario) ||
    !["live", "cache"].includes(c.source) ||
    ![1, 2, 3, 4].includes(c.limit) ||
    typeof c.retry !== "boolean" ||
    typeof c.escalate !== "boolean"
  )
    throw new Error("Invalid experiment configuration");
  return {
    config: c,
    phase: "observe",
    calls: 0,
    round: 1,
    status: "running",
    data: null,
    events: [],
    reason: "",
  };
}
function finish(s, status, reason) {
  return {
    ...s,
    status,
    reason,
    phase: "end",
    events: [...s.events, { stage: "end", text: reason }],
  };
}
export function advance(previous) {
  if (previous.status !== "running") return previous;
  const s = { ...previous, events: [...previous.events] };
  const log = (stage, text) => s.events.push({ stage, text });
  if (s.phase === "observe") {
    log(
      "observe",
      s.round === 1
        ? "收到任務：確認案件 #1024 的附件是否齊全；只讀取，不修改案件。"
        : "收到逾時結果：目前仍無法確認附件狀態。",
    );
    s.phase = "plan";
  } else if (s.phase === "plan") {
    log(
      "plan",
      s.config.source === "live"
        ? "選擇 case.lookup：讀取最新案件狀態。"
        : "選擇昨日快取：不呼叫外部工具，但資料可能已過時。",
    );
    s.phase = "act";
  } else if (s.phase === "act") {
    if (s.config.source === "cache") {
      s.data = { attachments: "缺少稽查報告", fresh: false };
      log("act", "快取回傳：昨日缺少稽查報告。");
    } else {
      s.calls++;
      const failed =
        s.config.scenario === "offline" ||
        (s.config.scenario === "transient" && s.calls === 1);
      s.data = failed ? null : { attachments: "附件齊全", fresh: true };
      log(
        "act",
        failed
          ? `case.lookup 第 ${s.calls} 次：TIMEOUT，未取得結果。`
          : `case.lookup 第 ${s.calls} 次：200 OK，附件齊全，資料為最新。`,
      );
    }
    s.phase = "verify";
  } else if (s.phase === "verify") {
    if (s.data?.fresh) {
      log("verify", "結果驗證通過：最新資料、必要欄位齊全，任務只需回覆。");
      return finish(
        s,
        "done",
        "可回覆：案件 #1024 附件齊全，可進入人工審核；未修改案件。",
      );
    }
    if (s.data) {
      log("verify", "新鮮度驗證未通過：昨日狀態不能代表目前狀態。");
      return finish(
        s,
        s.config.escalate ? "human" : "stopped",
        "資料過時，不能據此判定目前附件狀態。",
      );
    }
    if (s.config.retry && s.calls < s.config.limit) {
      log("verify", "這是唯讀查詢，且仍有呼叫額度；進入下一輪重試。");
      s.round++;
      s.phase = "observe";
    } else {
      log(
        "verify",
        s.calls >= s.config.limit
          ? "已達工具呼叫上限，禁止繼續重試。"
          : "已停用重試，不再呼叫工具。",
      );
      return finish(
        s,
        s.config.escalate ? "human" : "stopped",
        "無法確認案件狀態；" +
          (s.config.escalate ? "交給人工查核。" : "停止，留下未解決的任務。"),
      );
    }
  }
  return s;
}
export function reflection(run) {
  if (run.status === "done")
    return {
      answer: "verified",
      text: "先驗證最新工具結果，再回覆；成功終止不需要額外修改案件。",
    };
  if (run.data && !run.data.fresh)
    return {
      answer: "freshness",
      text: "快取節省了工具呼叫，但昨日的資料不足以回答「目前」的狀態。",
    };
  return {
    answer: "bounded",
    text: "唯讀查詢可以有限重試；無法確認結果時應停止，必要時轉交人工。",
  };
}
export function qualifies(run, choice) {
  return (
    run.status !== "running" &&
    ["done", "human"].includes(run.status) &&
    choice === reflection(run).answer
  );
}
