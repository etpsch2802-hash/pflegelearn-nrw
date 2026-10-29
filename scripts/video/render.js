const { chromium } = require('playwright');
const mode=process.argv[2]||'vorschau';
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
 const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});
 await p.goto('file://'+__dirname+'/'+(process.env.SEITE||'video.html')); await p.waitForTimeout(500);
 const fs=require('fs'); fs.mkdirSync(__dirname+'/'+(process.env.OUT||'frames'),{recursive:true});
 if(mode==='vorschau'){ for(const t of (process.env.ZEITEN||'0,8,16,21,28').split(',').map(Number)){ await p.evaluate(t=>setT(t),t); await p.screenshot({path:__dirname+'/v_'+t+'.png'}); } }
 else { const N=+(process.env.FRAMES||900); for(let i=0;i<N;i++){ await p.evaluate(t=>setT(t),i/30); await p.screenshot({path:__dirname+'/'+(process.env.OUT||'frames')+'/f'+String(i).padStart(4,'0')+'.jpg',type:'jpeg',quality:92}); } }
 await b.close();
})();
