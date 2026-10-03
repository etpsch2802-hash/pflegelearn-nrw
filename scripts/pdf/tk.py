import json
from base import *
K=json.load(open('/tmp/tk.json'))
for k in K:
    for s in k['vorderseite']:
        s['punkte']=[p.replace('H2: Ranitidin oder Cimetidin i.v.','H2-Blocker optional nach Klinikstandard') .replace('Ranitidin oder Cimetidin i.v.','H2-Blocker optional nach Klinikstandard') for p in s['punkte']]
PAL=['#0284c7','#14b8a6','#dc2626','#d97706','#7c3aed','#db2777','#059669','#2563eb','#ea580c','#0891b2']
X=f""".kgrid{{display:grid;grid-template-columns:1fr 1fr;gap:4mm}}
.k{{border:1pt dashed #94a3b8;border-radius:3mm;padding:3mm 3.5mm 2.5mm;break-inside:avoid;font-size:8pt;line-height:1.32;position:relative}}
.k .kt{{display:flex;align-items:center;gap:2mm;border-bottom:1.4pt solid var(--c);padding-bottom:1.6mm;margin-bottom:1.6mm}}
.k .kt b{{font:800 9.6pt M;color:var(--c)}} .k .kt img{{width:6mm;height:6mm;margin-left:auto}}
.k .kn{{font:800 7pt M;color:#fff;background:var(--c);border-radius:1.2mm;padding:.3mm 1.4mm}}
.k h4{{font:700 6.8pt M;letter-spacing:.7pt;text-transform:uppercase;color:var(--c);margin:1.6mm 0 .5mm}}
.k ul{{padding-left:3.2mm}} .k li{{margin:.2mm 0}} .k li::marker{{color:var(--c)}}
.k .kf{{margin-top:1.6mm;font:600 6pt M;color:#94a3b8;text-align:right}}"""
def card(i,k):
    c=PAL[i%len(PAL)]
    secs=''.join(f'<h4>{s["label"]}</h4><ul>'+''.join(f'<li>{p}</li>' for p in s['punkte'])+'</ul>' for s in k['vorderseite'])
    return f'<div class="k" style="--c:{c}"><div class="kt"><span class="kn">{i+1:02d}</span><b>{k["titel"]}</b><img src="file://{D}/logo.png"></div>{secs}<div class="kf">PLAN NRW · Bestehen ist planbar.</div></div>'
n=len(K)
b=cover('Kitteltaschen-Wissen · Zum Ausschneiden',f'Taschenkarten-<br>Set',f'{n} Karten mit dem wichtigsten Praxis- und Prüfungswissen – ausdrucken, entlang der gestrichelten Linie ausschneiden, laminieren und in die Kitteltasche stecken.',
 ['Hygiene','Prophylaxen','Notfall','Scores','Intensiv','Recht'],[(str(n),'Karten'),('2','pro Zeile'),('A4','druckfertig')],
 'Lernhilfe für Ausbildung und Praxis. Es gelten die Standards deiner Einrichtung und die ärztliche Anordnung.')
b+='<h2>Inhalt</h2><p class="lead">Tipp: Auf festeres Papier (160 g/m²) drucken und laminieren – dann halten die Karten die ganze Ausbildung.</p>'
b+='<div style="column-count:2;column-gap:8mm;font:600 9pt M;color:#0b1a35">'+''.join(f'<div style="padding:1.1mm 0;border-bottom:0.5pt solid #e2e8f0"><span style="color:#14b8a6">{i+1:02d}</span>&nbsp; {k["titel"]}</div>' for i,k in enumerate(K))+'</div>'
b+='<div class="pb"></div><div class="kgrid">'+''.join(card(i,k) for i,k in enumerate(K))+'</div>'+endbox()
build(f'/mnt/user-data/outputs/PLAN-NRW_Taschenkarten-Set_{n}-Karten.pdf','Taschenkarten-Set',b,X)
print(n)
