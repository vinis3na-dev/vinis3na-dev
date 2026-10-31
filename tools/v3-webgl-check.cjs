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
    // GitHub Pages may lag the branch after a push. Do not validate stale JavaScript.
    const audited=['app.js','kraken-v3-glb.js','kraken-v3-surfaces.js','kraken-v3-face.js','kraken-v3-stage.js','assets/kraken-cinematic-rig.glb','styles.css'];
    const expected=audited.map(name=>({name,hash:sha(fs.readFileSync('docs/'+name))}));
    let deployed=false;
    for(let attempt=0;attempt<45;attempt++){
      try{
        const hashes=await Promise.all(expected.map(async file=>{
          const r=await fetch(URL+file.name+'?v='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(10000)});
          return r.ok&&sha(Buffer.from(await r.arrayBuffer()))===file.hash;
        }));
        if(hashes.every(Boolean)){deployed=true;break}
      }catch(_){}
      await new Promise(resolve=>setTimeout(resolve,3000));
    }
    report.checks.publishedCodeMatchesCommit=deployed;
    if(!deployed)throw Error('GitHub Pages still serves stale source or cinematic renderer');
    const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
    const page=await context.newPage();
    page.on('pageerror',e=>report.errors.push('pageerror: '+e.message));
    page.on('console',msg=>{
      if(!['warning','error','warn'].includes(msg.type()))return;
      const message=msg.text();
      // Chromium SwiftShader warns about intentional screenshot readback; not a site exception.
      if(/GPU stall due to ReadPixels/.test(message))return;
      report.errors.push('console-'+msg.type()+': '+message);
    });
    page.on('requestfailed',request=>{if(/esm.sh|three@/.test(request.url()))report.errors.push('network: '+request.url()+' '+request.failure()?.errorText)});

    const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
    report.httpStatus=response?.status();
    const button=page.locator('#threeToggle'),canvas=page.locator('#threeCanvas');
    await button.waitFor({state:'visible',timeout:15000});
    report.checks.initiallyDisabled=(await button.getAttribute('aria-pressed'))!=='true';
    await page.screenshot({path:OUT+'/before.png',animations:'disabled'});
    await button.click();
    await page.waitForFunction(()=>{
      const b=document.querySelector('#threeToggle'),c=document.querySelector('#threeCanvas');
      return /INDISPONÍVEL/i.test(b?.textContent||'')||(b?.getAttribute('aria-pressed')==='true' && c && !c.hidden && c.width>=300 && c.height>=200);
    },null,{timeout:20000});
    const buttonLabel=await button.innerText();
    if(/INDISPONÍVEL/i.test(buttonLabel))throw Error('3D initialization failed: '+report.errors.join(' | '));
    report.checks.activated=(await button.getAttribute('aria-pressed'))==='true';
    report.checks.canvasVisible=await canvas.isVisible();
    report.rig=await canvas.evaluate(c=>({
      asset:c.dataset.model||null,
      skins:Number(c.dataset.skinCount||0),
      bones:Number(c.dataset.boneCount||0),
      clips:Number(c.dataset.animationCount||0),
      curvedSurfaces:Number(c.dataset.smoothedSurfaces||0)
    }));
    report.surface=await canvas.evaluate(c=>({
      uv:Number(c.dataset.surfaceUv||0),
      materials:Number(c.dataset.surfaceMaterials||0),
      metals:Number(c.dataset.surfaceMetals||0),
      textures:Number(c.dataset.surfaceTextures||0)
    }));
    report.face=await canvas.evaluate(c=>({
      beveled:c.dataset.faceBeveled==='true',
      hiddenLegacy:Number(c.dataset.faceVisorsReplaced||0),
      opticalSlits:Number(c.dataset.faceSlits||0)
    }));
    report.stage=await canvas.evaluate(c=>({rails:Number(c.dataset.orbitalRails||0),markers:Number(c.dataset.orbitalMarkers||0),pool:c.dataset.orbitalPool==='true'}));
    report.checks.orbitalStage=report.stage.rails===3 && report.stage.markers===32 && report.stage.pool;
    report.checks.sculptedVisor=report.face.beveled
      && report.face.hiddenLegacy>=1
      && report.face.opticalSlits===2;
    report.checks.pbrMicroSurfaces=report.surface.uv>=8
      && report.surface.materials>=6
      && report.surface.metals>=3
      && report.surface.textures===6;
    report.checks.curvedTentacles=report.rig.curvedSurfaces>=8;
    report.checks.originalRig=report.rig.asset==='kraken-cinematic-rig.glb'
      && report.rig.skins===8 && report.rig.bones===80 && report.rig.clips>=1;

    report.checks.noCaptionOverlap=!(await page.locator('.hero-caption').isVisible());

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
    report.checks.skeletalAnimationAdvanced=await canvas.evaluate(c=>Number(c.dataset.animationElapsed||0)>1.4);
    await page.screenshot({path:OUT+'/full-3d.png',animations:'disabled'});
    await button.click();
    report.checks.returnedToArt=(await button.getAttribute('aria-pressed'))==='false' && !(await canvas.isVisible()) && await page.locator('.hero-caption').isVisible();
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
    // Mobile viewport and user accessibility settings: no hidden clipping or
    // obligatory animation. Do not infer actual FPS from synthetic CI hardware.
    const mobileContext=await browser.newContext({
      viewport:{width:390,height:844},
      isMobile:true,hasTouch:true,deviceScaleFactor:1,
      reducedMotion:'reduce'
    });
    const mobile=await mobileContext.newPage(),mobileErrors=[];
    mobile.on('pageerror',error=>mobileErrors.push(error.message));
    const mobileResponse=await mobile.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
    report.checks.mobileHttp200=mobileResponse?.status()===200;
    report.checks.mobileNoHorizontalOverflow=await mobile.evaluate(()=>
      document.documentElement.scrollWidth<=window.innerWidth+2
    );
    const mobileButton=mobile.locator('#threeToggle');
    await mobileButton.click({timeout:15000});
    await mobile.waitForFunction(()=>{
      const b=document.querySelector('#threeToggle');
      return b?.getAttribute('aria-pressed')==='true'
        || /INDISPONÍVEL/i.test(b?.textContent||'');
    },null,{timeout:45000});
    report.checks.mobile3d=(await mobileButton.getAttribute('aria-pressed'))==='true'
      && await mobile.locator('#threeCanvas').isVisible();
    await mobile.waitForTimeout(900);
    report.checks.respectsReducedMotion=await mobile.locator('#threeCanvas').evaluate(canvas=>
      Number(canvas.dataset.animationElapsed||0)<.06
    );
    report.checks.mobileNoPageErrors=mobileErrors.length===0;
    await mobile.screenshot({path:OUT+'/mobile-reduced-motion.png',animations:'disabled'});
    await mobileContext.close();
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
