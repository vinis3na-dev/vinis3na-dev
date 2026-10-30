/* KRAKEN V3 Directors Cut — independent smoke test against deployed GitHub Pages */
const { chromium }=require('playwright');
const fs=require('node:fs');
const url='https://vinis3na-dev.github.io/vinis3na-dev/';
(async()=>{
fs.mkdirSync('v3-captures',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const report={url,checkedAt:new Date().toISOString(),version:'V3 Directors Cut',tests:[]};
try{
for(const v of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
 const page=await browser.newPage({viewport:{width:v.width,height:v.height},reducedMotion:v.name==='mobile'?'reduce':'no-preference'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message)); const result={viewport:v.name,checks:{},jsErrors:errors};
 try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  result.httpStatus=response?.status();
  await page.locator('.project').first().waitFor({timeout:20000});
  result.checks.projects=(await page.locator('.project').count())===5;
  result.checks.newDesign=(await page.locator('.hero-space .kraken-art').count())===1;
  result.checks.assetsLoaded=await page.evaluate(async()=>{await Promise.all(Array.from(document.images).map(i=>i.decode().catch(()=>{})));return Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)});
  await page.screenshot({path:'v3-captures/'+v.name+'-top.png',fullPage:true,animations:'disabled'});
  await page.locator('[data-filter="jogos"]').click();
  result.checks.gamesFilter=(await page.locator('.project:visible').count())===2;
  await page.locator('[data-filter="todos"]').click();
  await page.locator('.lab-tab[data-room="cerebri"]').click();
  result.checks.room=(await page.locator('#labName').innerText())==='Cerebri Digital';
  result.checks.privateRepoHidden=!(await page.locator('#labLink').isVisible());
  await page.locator('#labDetails').click();
  result.checks.dialog=await page.locator('#detailDialog').evaluate(e=>e.open);
  await page.locator('#closeDialog').click();
  await page.screenshot({path:'v3-captures/'+v.name+'-lab.png',animations:'disabled'});
  await page.locator('#motionToggle').click();
  result.checks.motionToggle=(await page.locator('#motionToggle').getAttribute('aria-pressed'))===(v.name==='mobile'?'false':'true');
  if(v.name==='mobile'){
   await page.locator('#menuToggle').click();
   result.checks.mobileMenu=await page.locator('#siteNav').evaluate(e=>e.classList.contains('open'));
   await page.locator('#menuToggle').click();
  }
  const widths=await page.evaluate('({a:document.documentElement.scrollWidth,b:window.innerWidth})');
  result.checks.noOverflow=widths.a<=widths.b;
  await page.locator('#threeToggle').click();
  try{await page.waitForFunction(()=>{const b=document.querySelector('#threeToggle');return b?.getAttribute('aria-pressed')==='true'||/INDISPONÍVEL/i.test(b?.textContent||'')},{timeout:25000})}catch{}
  result.threeStatus=await page.locator('#threeToggle').innerText();
  result.checks.threeAvailable=(await page.locator('#threeToggle').getAttribute('aria-pressed'))==='true';
  await page.screenshot({path:'v3-captures/'+v.name+'-3d.png',animations:'disabled'});
  result.checks.noJsErrors=errors.length===0;
  const core=['projects','newDesign','assetsLoaded','gamesFilter','room','privateRepoHidden','dialog','motionToggle','noOverflow','noJsErrors'];
  result.passed=result.httpStatus===200&&core.every(k=>result.checks[k]===true);
 }catch(e){result.error=String(e.message||e);result.passed=false}
 finally{report.tests.push(result);await page.close()}
}
}finally{await browser.close()}
fs.writeFileSync('v3-captures/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
if(report.tests.some(t=>!t.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
