/* KRAKEN Command Center V3: public Pages browser smoke and screenshots */
const { chromium } = require('playwright');
const fs = require('node:fs');
const url = process.env.V3_URL || 'https://vinis3na-dev.github.io/vinis3na-dev/';
(async()=>{
  fs.mkdirSync('v3-captures',{recursive:true});
  const browser = await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  const report={url,checkedAt:new Date().toISOString(),tests:[]};
  try {
    for(const v of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
      const page=await browser.newPage({viewport:{width:v.width,height:v.height},reducedMotion:v.name==='mobile'?'reduce':'no-preference'});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      const result={viewport:v.name,checks:{},jsErrors:errors};
      try{
        const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
        result.httpStatus=response?.status()||0;
        await page.locator('#projectlist .project').first().waitFor({timeout:30000});
        result.checks.projects=await page.locator('#projectlist .project').count()===5;
        await page.screenshot({path:'v3-captures/'+v.name+'-top.png',animations:'disabled',fullPage:true});
        await page.locator('[data-filter="jogos"]').click();
        result.checks.gamesFilter=(await page.locator('#projectlist .project:visible').count())===2;
        await page.locator('[data-filter="todos"]').click();
        await page.locator('#labtabs .tab').nth(1).click();
        result.checks.room=await page.locator('#stagename').innerText()==='Cerebri Digital';
        result.checks.privateLinkNotShown=!(await page.locator('#stageart a').count());
        await page.locator('#detailsbtn').click();
        result.checks.details=await page.locator('#details').evaluate(el=>el.open);
        await page.locator('#closedialog').click();
        await page.screenshot({path:'v3-captures/'+v.name+'-holodeck.png',animations:'disabled'});
        const dim=await page.evaluate('({viewport:window.innerWidth,document:document.documentElement.scrollWidth})');
        result.checks.noOverflow=dim.document<=dim.viewport;
        result.checks.images=await page.evaluate(()=>Array.from(document.images).every(img=>img.complete&&img.naturalWidth>0));
        if(v.name==='mobile'){
          await page.locator('#mobilemenu').click();
          result.checks.mobileMenu=await page.locator('#mainnav').evaluate(n=>n.classList.contains('open'));
        }
        await page.locator('#threebtn').click();
        result.checks.threeDialog=await page.locator('#viewer3d').evaluate(el=>el.open);
        try{
          await page.waitForFunction(()=>/demonstrativo|indisponível/i.test(document.querySelector('#viewermsg')?.textContent||''),{timeout:18000});
        }catch{}
        result.threeStatus=await page.locator('#viewermsg').innerText();
        result.checks.threeAvailable=/demonstrativo/i.test(result.threeStatus);
        await page.screenshot({path:'v3-captures/'+v.name+'-3d.png',animations:'disabled'});
        result.checks.noJsErrors=errors.length===0;
        result.passed=result.httpStatus===200&&['projects','gamesFilter','room','details','noOverflow','images','threeDialog','noJsErrors'].every(k=>result.checks[k]===true);
      }catch(e){result.error=String(e.message||e);result.passed=false;}
      finally{report.tests.push(result);await page.close();}
    }
  }finally{await browser.close();}
  fs.writeFileSync('v3-captures/report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  if(report.tests.some(t=>!t.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
