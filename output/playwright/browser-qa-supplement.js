async (existing) => {
 const keyboardContext=await existing.context().browser().newContext();const page=await keyboardContext.newPage();
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:900,height:800});
 await page.goto('http://127.0.0.1:4173/agent-system-design-learning-map/#/flow/observe');
 await page.keyboard.press('Tab');
 if(await page.evaluate(()=>document.activeElement?.textContent)!=='跳到主要教材')throw Error('skip not first');
 await page.keyboard.press('Enter');await page.waitForFunction(()=>document.activeElement?.tagName==='H1');
 const link=page.getByRole('link',{name:'下一小節：必要機制閱讀 →',exact:true});await link.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.activeElement?.tagName==='H1');
 if(!page.url().endsWith('/reason'))throw Error('keyboard route');
 const context=await page.context().browser().newContext();
 await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('disabled','SecurityError')}}));
 const blocked=await context.newPage();const errors=[];blocked.on('pageerror',e=>errors.push(String(e)));
 await blocked.goto('http://127.0.0.1:4173/agent-system-design-learning-map/#/cache/reason');
 await blocked.getByRole('status').filter({hasText:'瀏覽器無法保存'}).waitFor();
 await blocked.getByLabel('使用讀取副本',{exact:true}).check();
 if(!(await blocked.locator('.experiment-metrics').innerText()).includes('100／秒'))throw Error('blocked storage prevents controls');
 await blocked.reload();if(await blocked.getByLabel('使用讀取副本',{exact:true}).isChecked())throw Error('blocked storage did not reset');
 if(errors.length)throw Error(errors.join());await context.close();await keyboardContext.close();
 return {keyboardSkip:'PASS',keyboardNavigationFocus:'PASS',blockedStorageFallback:'PASS',errors};
}