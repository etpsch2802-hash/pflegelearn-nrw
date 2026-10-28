from base import *
import sys, json, os
# Ausbildung meistern – 12 Tipp-Karten (Idee Jessica, freigegeben von P. Schenkelberger, 28.10.2026)
# Inhalte kommen aus index.html (var RUBRIKEN), damit App und PDF gleich bleiben.
OUT=sys.argv[1] if len(sys.argv)>1 else 'PLAN-NRW_Ausbildung-meistern.pdf'
R=json.load(open(sys.argv[2])) if len(sys.argv)>2 else []
X=""".kt{border:0.8pt solid #e2e8f0;border-left:2mm solid #14b8a6;border-radius:3mm;padding:3.5mm 4.5mm;margin-bottom:4mm;break-inside:avoid}
.kt h4{margin:0 0 2mm;font:800 11.5pt M;color:#0b1a35}.kt h4 i{font-style:normal;color:#14b8a6;margin-right:2mm}
.kt .l{font:700 7.8pt M;letter-spacing:.4pt;margin:2mm 0 .8mm}.kt .s{color:#dc2626}.kt .h{color:#16a34a}
.kt p{margin:0;font-size:9.5pt}.kt ul{margin:0;padding-left:4.5mm;font-size:9.5pt}
.kt .g{margin-top:2mm;background:#fefce8;border-radius:2mm;padding:2mm 3mm;font-size:9pt}
.kt .m{margin-top:2.5mm;background:#ecfeff;border-left:1.2mm solid #0284c7;border-radius:2mm;padding:2mm 3mm;font:700 9.5pt M;color:#0b1a35}
.hilfe{border:1pt solid #38bdf8;background:#f0f9ff;border-radius:3mm;padding:3.5mm 4.5mm;margin:0 0 4mm;break-inside:avoid;font-size:9.3pt}
.hilfe b.t{display:block;font:800 10pt M;color:#0b1a35;margin-bottom:1.5mm}"""
HILFE=('<div class="hilfe"><b class="t">Wenn es dir gerade nicht gut geht, bist du nicht allein.</b>'
 '• Akute Gefahr: <b>112</b><br>• TelefonSeelsorge, rund um die Uhr, kostenlos und anonym: <b>0800 111 0 111</b> oder <b>0800 111 0 222</b><br>'
 '• krisenchat für junge Menschen bis 25, rund um die Uhr per Chat: <b>krisenchat.de</b><br>• Nummer gegen Kummer für Jugendliche: <b>116 111</b><br>'
 '• Probleme mit dem Ausbildungsbetrieb: deine Pflegeschule oder die Ombudsstelle Pflegeausbildung NRW (Bezirksregierung Münster)</div>')
def ul(items): return '<ul>'+''.join(f'<li>{x}</li>' for x in items)+'</ul>'
body=cover('Gratis-Lernhilfe · Ausbildung','Ausbildung<br>meistern',
 '12 Tipps aus der Praxis für die Pflegeausbildung: wenn die Praxisanleitung keine Zeit hat, bei Prüfungsstress, schwierigen Gesprächen, Belastung – und was deine Rechte sind.',
 [r['t'] for r in R],[('12','Tipp-Karten'),('5','Themen'),('1','Hilfe-Kasten')],
 'Tipps aus der Praxis, keine Rechtsberatung und keine Therapie. Bei Krisen: Hilfe-Kasten auf der letzten Seite.',
 toc=[r['t'] for r in R]+['Hilfe, wenn es dir nicht gut geht'])
nr=0
for i,r in enumerate(R):
    body+=f'<h2{" class=\"pb\"" if i in (1,3) else ""}><span class="n">{i+1}</span>{r["t"]}</h2>'
    for k in r['k']:
        nr+=1
        body+=(f'<div class="kt"><h4><i>{nr}</i>{k["t"]}</h4><div class="l s">SITUATION</div><p>{k["s"]}</p>'
               f'<div class="l h">WAS HILFT</div>{ul(k["h"])}'+(f'<div class="g"><b>Gut zu wissen:</b> {k["g"]}</div>' if k.get('g') else '')+
               f'<div class="m">{k["m"]}</div></div>')
        if k.get('hilfe'): body+=HILFE
body+=f'<h2><span class="n">{len(R)+1}</span>Hilfe, wenn es dir nicht gut geht</h2>'+HILFE
body+='<div class="tip" style="margin-top:4mm">Alle Tipps findest du auch in der PLAN-App unter Wissen → „Ausbildung meistern“ – zusammen mit 2.000+ Prüfungsfragen fürs Examen.</div>'
body+=endbox()
build(OUT,'Ausbildung meistern',body,X)
