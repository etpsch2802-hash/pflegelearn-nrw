import re
from base import *
t=open('/tmp/Notfallkarten_Anaesthesie-Intensiv.txt').read()
t=re.sub(r'\f','\n',t); t=re.sub(r'\n\s*\n','\n',t); t=re.sub(r'\n\d+\n','\n',t)
F=['DOSIS','WIRKUNG','NEBENWIRKUNGEN','KONTRAINDIKATIONEN','PFLEGE / PRAXIS']
body_t='\n'+t.split('Notfallmedizin\n6 Medikamente',1)[1]
items=[]
for m in re.finditer(r'\n([^\n]+)\n([^\n]+)\nDOSIS\n(.*?)\nWIRKUNG\n(.*?)\nNEBENWIRKUNGEN\n(.*?)\nKONTRAINDIKATIONEN\n(.*?)\nPFLEGE / PRAXIS\n(.*?)(?=\n[^\n]+\n[^\n]+\nDOSIS\n|\Z)',body_t,re.S):
    v=[re.sub(r'\s*\n\s*',' ',x).strip() for x in m.groups()]
    items.append(dict(name=v[0],cls=v[1],f=dict(zip(F,v[2:]))))
for it in items:
    if it['name'].startswith('Rocuronium'):
        it['f']['NEBENWIRKUNGEN']='Anaphylaxie möglich · Relaxansüberhang (Restblockade) · wirkt weder sedierend noch analgetisch'
        it['f']['PFLEGE / PRAXIS']='Immer mit Hypnotikum und Analgetikum kombinieren – sonst ist der Patient gelähmt, aber wach! Relaxometrie, Antagonist: Sugammadex'
for it in items:
    if it['name']=='Atropin': it['f']['PFLEGE / PRAXIS']=it['f']['PFLEGE / PRAXIS'].replace('Bei Asystolie nicht mehr 1. Wahl!','Bei Asystolie/PEA in der Reanimation nicht mehr empfohlen!')
cats=[('Anästhesie',items[:7],'#0284c7'),('Intensivmedizin',items[7:13],'#14b8a6'),('Notfallmedizin',items[13:],'#dc2626')]
X=""".med{border:0.8pt solid #e2e8f0;border-radius:3mm;margin-bottom:4mm;break-inside:avoid;overflow:hidden}
.med .mh{display:flex;align-items:baseline;gap:3mm;padding:2.4mm 4mm;color:#fff}.med .mh b{font:800 12pt M}.med .mh span{font:600 8.5pt M;opacity:.9}
.med table{width:100%;border-collapse:collapse;font-size:9.2pt}.med td{padding:1.5mm 4mm;border-top:0.5pt solid #e2e8f0;vertical-align:top}
.med td:first-child{width:30mm;font:700 7.8pt M;letter-spacing:.6pt;color:#475569;text-transform:uppercase;padding-top:2mm}
.med tr.pf td{background:#f0fdfa}.med tr.pf td:first-child{color:#0f766e}
.cat{page-break-before:always}"""
body=cover('Notfallkarten · Anästhesie &amp; Intensiv','Notfall&shy;medikamente',f'{len(items)} Medikamente aus Anästhesie, Intensiv- und Notfallmedizin mit Dosierung, Wirkung, Nebenwirkungen, Kontraindikationen und Pflegehinweisen.',
 ['Anästhesie','Intensivmedizin','Notfallmedizin','Pflegehinweise'],[(str(len(items)),'Medikamente'),('3','Fachbereiche'),('A4','druckfertig')],
 'Nur zu Ausbildungs- und Prüfungszwecken. Ersetzt keine Fachinformation, keinen Klinikstandard und keine ärztliche Anordnung. Dosierungen immer gegen die aktuellen Standards deiner Einrichtung prüfen.',
 toc=[f'{c} ({len(l)} Medikamente)' for c,l,_ in cats])
for c,l,col in cats:
    body+=f'<div class="cat"><h2>{c}</h2><p class="lead">{len(l)} Medikamente</p>'
    for it in l:
        rows=''.join(f'<tr class="{"pf" if k.startswith("PFLEGE") else ""}"><td>{k.replace(" / PRAXIS"," &amp; Praxis")}</td><td>{v}</td></tr>' for k,v in it['f'].items())
        body+=f'<div class="med"><div class="mh" style="background:{col}"><b>{it["name"]}</b><span>{it["cls"]}</span></div><table>{rows}</table></div>'
    body+='</div>'
body+=endbox()
build('/mnt/user-data/outputs/PLAN-NRW_Notfallkarten_Anaesthesie-Intensiv.pdf','Notfallkarten Anästhesie &amp; Intensiv',body,X)
print(len(items),[i['name'] for i in items])
