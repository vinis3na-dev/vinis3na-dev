const {chromium}=require('playwright');const fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const p=await browser.newPage({viewport:{width:1440,height:900}});const logs=[];p.on('pageerror',e=>logs.push(e.message));
const url='https://vinis3na-dev.github.io/vinis3na-dev/';
const report={url,checkedAt:new Date().toISOString()};
try{
 const response=await p.goto(url,{waitUntil:'domcontentloaded',timeout:40000});report.http=response?.status();
 await p.locator('#threeToggle').click({timeout:12000});
 try{await p.waitForFunction(()=>{const b=document.querySelector('#threeToggle');return b?.getAttribute('aria-pressed')==='true'||/INDISPONÍVEL/i.test(b?.textContent||'')},null,{timeout:20000})}catch(e){report.waitMessage=String(e.message).slice(0,130)}
 report.label=await p.locator('#threeToggle').innerText();
 report.activated=(await p.locator('#threeToggle').getAttribute('aria-pressed'))==='true';
 report.canvasVisible=await p.locator('#threeCanvas').isVisible();
 report.glContext=await p.locator('#threeCanvas').evaluate(el=>!!el.getContext('webgl2')||!!el.getContext('webgl')).catch(()=>false);
 await p.screenshot({path:'v3-webgl-public.png',animations:'disabled',timeout:20000});
 report.pageErrors=logs;
 console.log('V3 WEBGL CHECK: '+JSON.stringify(report));
 if(report.http!==200)process.exitCode=1;
}finally{await p.close();await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});