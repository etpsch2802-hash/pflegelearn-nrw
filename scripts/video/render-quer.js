// Querformat-Render (960×540 @2x = 1920×1080). Modi: zeitplan | vorschau (ZEITEN) | voll (FPS, OUT)
const { chromium } = require('playwright');
const mode=process.argv[2]||'vorschau';
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:960,height:540},deviceScaleFactor:2});
 await p.goto('file://'+__dirname+'/'+(process.env.SEITE||'perfusor-lang.html')); await p.waitForTimeout(500);
 const fs=require('fs'); const G=await p.evaluate(()=>GESAMT);
 if(mode==='zeitplan'){ console.log(JSON.stringify({gesamt:G,plan:await p.evaluate(()=>ZEITPLAN)})); }
 else if(mode==='vorschau'){ for(const t of (process.env.ZEITEN||'1').split(',').map(Number)){ await p.evaluate(t=>setT(t),t); await p.screenshot({path:__dirname+'/q_'+t+'.png'}); } }
 else { const fps=+(process.env.FPS||15), out=__dirname+'/'+(process.env.OUT||'frames-quer'); fs.mkdirSync(out,{recursive:true}); const N=Math.ceil(G*fps);
   for(let i=0;i<N;i++){ await p.evaluate(t=>setT(t),i/fps); await p.screenshot({path:out+'/f'+String(i).padStart(5,'0')+'.jpg',type:'jpeg',quality:90}); } console.log('frames',N); }
 await b.close();
})();
