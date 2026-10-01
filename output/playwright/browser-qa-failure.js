async (page)=>{
 await page.goto('http://127.0.0.1:4173/agent-system-design-learning-map/#/queue/reason');await page.reload();
 await page.getByRole('button',{name:'重設目前實驗',exact:true}).click();await page.getByLabel('工作者在觀察視窗內失敗',{exact:true}).check();
 if(!(await page.locator('.experiment-metrics').innerText()).includes('未完成，無法估計'))throw Error('failure predicts completion');
 if(!(await page.locator('.experiment-nodes').innerText()).includes('本件未完成'))throw Error('node missing failure');
 await page.getByLabel('先回覆已接收，稍後追蹤完成',{exact:true}).check();
 if(!(await page.locator('.experiment-metrics').innerText()).includes('0.18 秒（接收）'))throw Error('acceptance not separated');
 return {synchronousFailureWait:'PASS',asynchronousAcceptanceDespiteFailure:'PASS'};
}