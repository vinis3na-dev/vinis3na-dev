/* KRAKEN V3 — test the published WebGL, not only a successful build. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const crypto = require('node:crypto');
const URL = 'https://vinis3na-dev.github.io/vinis3na-dev/';
const OUT = 'v3-webgl-evidence';
fs.mkdirSync(OUT, { recursive:true });
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const report={url:URL,checkedAt:new Date().toISOString(),checks:{},errors:[]};
  try {
    const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
    const page=await context.newPage();
    page.on('pageerror',e=>report.errors.push(e.message));
    const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
    report.httpStatus=response?.status();
    const button=page.locator('#threeToggle'),canvas=page.locator('#threeCanvas');
    await button.waitFor({state:'visible',timeout:15000});
    report.checks.initiallyDisabled=(await button.getAttribute('aria-pressed'))!=='true';
    await page.screenshot({path:OUT+'/before.png',animations:'disabled'});
    await button.click();
    await page.waitForFunction(()=>{
      const b=document.querySelector('#threeToggle'),c=document.querySelector('#threeCanvas');
      return b?.getAttribute('aria-pressed')==='true' && c && !c.hidden && c.width>=300 && c.height>=200;
    },null,{timeout:35000});
    report.checks.activated=(await button.getAttribute('aria-pressed'))==='true';
    report.checks.canvasVisible=await canvas.isVisible();
    report.canvas=await canvas.evaluate(c=>{
      const gl=c.getContext('webgl2')||c.getContext('webgl');
      return {width:c.width,height:c.height,context:!!gl,version:gl?.getParameter(gl.VERSION)||null};
    });
    report.checks.webgl=report.canvas.context && report.canvas.width>=300 && report.canvas.height>=200;
    await page.waitForTimeout(1200);
    const frame1=await canvas.screenshot({path:OUT+'/frame-1.png'});
    await page.waitForTimeout(1500);
    const frame2=await canvas.screenshot({path:OUT+'/frame-2.png'});
    report.checks.frameChanged=sha(frame1)!==sha(frame2);
    await page.screenshot({path:OUT+'/full-3d.png',animations:'disabled'});
    await button.click();
    report.checks.returnedToArt=(await button.getAttribute('aria-pressed'))==='false' && !(await canvas.isVisible());
    report.checks.noPageErrors=report.errors.length===0;
    await context.close();
    // New context: deny the 3D CDN and verify cinematic fallback survives failure.
    const offline=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
    await offline.route('https://esm.sh/**',route=>route.abort());
    const fallback=await offline.newPage(),fallbackErrors=[];
    fallback.on('pageerror',e=>fallbackErrors.push(e.message));
    await fallback.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
    await fallback.locator('#threeToggle').click();
    await fallback.waitForFunction(()=>/INDISPONÍVEL/.test(document.querySelector('#threeToggle')?.textContent||''),null,{timeout:30000});
    report.checks.offlineFallback=await fallback.locator('.kraken-art').isVisible()
      && (await fallback.locator('#threeCanvas').isVisible())===false
      && fallbackErrors.length===0;
    await fallback.screenshot({path:OUT+'/offline-fallback.png',animations:'disabled'});
    await offline.close();
    report.passed=report.httpStatus===200 && Object.values(report.checks).every(Boolean);
  } catch(e) {
    report.error=String(e.message||e);
    report.passed=false;
  } finally {
    fs.writeFileSync(OUT+'/report.json',JSON.stringify(report,null,2));
    console.log('V3 REAL WEBGL AUDIT '+JSON.stringify(report,null,2));
    await browser.close();
  }
  if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
