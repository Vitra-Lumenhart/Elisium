/* Browser acceptance: Elisium sky atlas + persistent Kilns child + quiet exit. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.WEBSPACE_BROWSER_PATH?{executablePath:process.env.WEBSPACE_BROWSER_PATH}:{}),args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];
page.on('pageerror',e=>errors.push('pageerror '+String(e)));
try{
 await page.goto('http://127.0.0.1:8000/worlds/elisium/index.html',{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>window.ELISIUM_ATLAS?.ready(),null,{timeout:70000});
 const baseline=await page.evaluate(()=>{
  const a=window.ELISIUM_ATLAS,inner=document.querySelector('#elisiumGame').contentWindow;
  window.__NATIVE_REFERENCE__=inner.ELISIUM;
  return {month:a.monthCount(),points:a.sevenPoints(),quiet:a.hasQuietCircle(),location:inner.ELISIUM.getState().current};
 });
 assert.equal(baseline.month,12);assert.equal(baseline.points.length,7);assert(baseline.quiet);assert.equal(baseline.location,'tip0');
 await page.getByRole('button',{name:/SKY ATLAS/}).click();
 assert.equal(await page.locator('#monthList button').count(),12);
 await page.locator('#monthList button').nth(3).click();
 assert((await page.locator('#atlasDetail').innerText()).includes('Sirius'));
 await page.locator('#monthList button').nth(4).click();
 assert((await page.locator('#atlasDetail').innerText()).includes('Leo'));
 await page.screenshot({path:'artifacts/elisium-v8-atlas.png'});
 await page.locator('#atlasClose').click();
 await page.locator('#pocketOpen').click();
 assert(await page.locator('#kilnsPocket').isVisible());
 await page.waitForFunction(()=>document.querySelector('#houseFrame')?.contentWindow?.__KILNS_TEST__?.objectCount()===24,null,{timeout:100000});
 await page.evaluate(()=>{
  const child=document.querySelector('#houseFrame').contentWindow;
  child.__KILNS_TEST__.testObserve('H06');
  child.__KILNS_TEST__.testObserve('H07');
 });
 assert.equal(await page.evaluate(()=>document.querySelector('#houseFrame').contentWindow.document.querySelector('#count').textContent.trim()),'2 / 24');
 await page.screenshot({path:'artifacts/elisium-v8-kilns.png'});
 await page.locator('#pocketClose').click();
 const state=await page.evaluate(()=>{
  const a=window.ELISIUM_ATLAS, inner=document.querySelector('#elisiumGame').contentWindow;
  return {same:window.__NATIVE_REFERENCE__===inner.ELISIUM,objects:a.houseObjects(),visits:a.houseVisits(),pairs:inner.ELISIUM.houseMemory.report().pairs,observed:inner.ELISIUM.houseLens.record().heard};
 });
 assert(state.same,'Native 4.6 runtime must not be reloaded during child visit');
 assert(state.objects.includes('H06')&&state.objects.includes('H07'));
 assert.equal(state.visits,1);
 assert(state.pairs.includes('The Unanswered Place'));
 assert.equal(state.observed,0,'Parent sky not automatically observed by entering the Kilns');
 assert(await page.locator('#houseTuning button').count()>0);
 await page.locator('#houseTuning button').first().click();
 assert.equal(await page.evaluate(()=>document.querySelector('#elisiumGame').contentWindow.ELISIUM.houseLens.record().selected),'letters');
 await page.locator('#houseReturnClose').click();
 await page.evaluate(()=>document.querySelector('#elisiumGame').contentWindow.ELISIUM.go('quietCircle'));
 await page.waitForFunction(()=>document.querySelector('#elisiumGame').contentWindow.ELISIUM.getState().current==='quietCircle',null,{timeout:15000});
 await page.waitForFunction(()=>!document.querySelector('#secularDialogue').hidden,null,{timeout:3000});
 await page.locator('button[data-secular="question"]').click();
 assert((await page.locator('#secularNote').innerText()).includes('reject being deceived'), 'Questioning should preserve the right to doubt without a moral score');
 await page.locator('#secularClose').click();
 await page.screenshot({path:'artifacts/elisium-v8-quiet-circle.png'});
 assert(!errors.length,'Unexpected JavaScript page errors: '+errors.join('; '));
 console.log('PASS Elisium v8 browser: 12 signs, genuine 4.6 sky, 3D Kilns visit, H06+H07 pairing, explicit Lens arm, native continuity and one-edge secular circle');
}finally{await browser.close();}
