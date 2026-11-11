// Browser smoke for the optional Poly Haven model viewer.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const browser=await chromium.launch({
  headless:true,
  args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']
});
const page=await browser.newPage({viewport:{width:1450,height:940}});
const errors=[];
page.on('pageerror',err=>errors.push(String(err)));
page.on('console',message=> {if(message.type()==='error')errors.push('console '+message.text())});
try {
  await page.goto('http://127.0.0.1:8000/worlds/elisium/kilns/index.html',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Dining Room/}).click();
  await page.locator('#objects button').filter({hasText:'H07'}).click();
  await page.locator('#load-proxy').click();
  await page.waitForFunction(()=>document.getElementById('model-status')?.textContent.includes('low-poly proxy'),{timeout:45000});
  assert.equal(await page.locator('#model-stage').isVisible(),true,'model canvas visible for proxy');
  await page.screenshot({path:'artifacts/kilns-3d-proxy.png',fullPage:true});
  await page.locator('#load-artist').click();
  await page.waitForFunction(()=>{
    const s=document.getElementById('model-status')?.textContent || '';
    return s.includes('loaded live')||s.includes('Live artwork unavailable');
  },{timeout:90000});
  const status=await page.locator('#model-status').innerText();
  await page.screenshot({path:'artifacts/kilns-3d-live.png',fullPage:true});
  console.log('POLYHAVEN_BROWSER_STATUS:',status);
  if (!status.includes('loaded live')) throw new Error('Live original did not render: '+status);
  assert.equal(await page.locator('#count').innerText(),'0','visual inspection must not record or upload journal observations');
  if(errors.length) console.warn('BROWSER_WARNINGS:',errors.slice(0,10));
  console.log('PASS live Poly Haven source and proxy glTF loaded in Kilns browser');
} finally { await browser.close(); }
