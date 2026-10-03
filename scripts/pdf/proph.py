import re
from base import *
txt=open('/tmp/Prophylaxen-Kompendium.txt').read()
parts=re.split(r'\n(\d{1,2})\. ([^\n]+)\n',txt)
secs=[]
for i in range(1,len(parts),3):
    n,title,body=parts[i],parts[i+1].strip(),parts[i+2]
    lines=[l.strip() for l in body.split('\n')]
    lines=[l for l in lines if l and re.search(r'[A-Za-zÄÖÜäöüß]',l) and not l.startswith('\f')]
    lead=[];blocks=[];cur=None;std=''
    for l in lines:
        if l.startswith('Rechtsgrundlage'): std=l.split(':',1)[1].strip(); continue
        if re.fullmatch(r"[A-ZÄÖÜ0-9 /\-()&]+",l) and len(l)>3: cur=[l.title() if False else l,[]];blocks.append(cur); continue
        if cur is None: lead.append(l); continue
        if l.startswith('• '): cur[1].append(['li',l[2:]])
        elif cur[1] and cur[1][-1][0]=='li' and not cur[1][-1][1].endswith(('.',')','!')) and l[0].islower(): cur[1][-1][1]+=' '+l
        else: cur[1].append(['p',l])
    secs.append(dict(n=n,title=title,lead=' '.join(lead),blocks=blocks,std=std))
# Korrekturen
for s in secs:
    if s['title'].startswith('Kontraktur'):
        for b in s['blocks']:
            if b[0]=='LAGERUNGSTECHNIKEN': b[1]=[['li',x] for x in ['Funktionsstellung: Gelenke in physiologischer Mittelstellung lagern','Lagerung regelmäßig wechseln (Rücken-, Seiten-, 30°-Lagerung)','Bei Hemiplegie: Lagerung nach Bobath-Konzept, betroffene Seite einbeziehen','Füße: Fußsohle abgestützt, Bettdecke nicht auf die Zehen drücken lassen','Lagerungshilfsmittel gezielt einsetzen, keine starren Dauerlagerungen']]
        s['std']='Kein eigener DNQP-Expertenstandard – Orientierung an Physiotherapie- und Bobath-Konzept'
    if s['title'].startswith('Thrombose'): s['std']='S3-Leitlinie Prophylaxe der venösen Thromboembolie (AWMF)'
def render(s):
    h=f'<div class="ps"><h2><span class="n">{s["n"]}</span>{s["title"]}</h2><p class="lead">{s["lead"]}</p><div class="pgrid">'
    for name,items in s['blocks']:
        lis=''.join(f'<li>{t}</li>' for k,t in items if k=='li'); ps=''.join(f'<p class="sp">{t}</p>' for k,t in items if k=='p')
        cls='card t'+(' wide' if len(items)>8 or name.startswith(('NOTFALL','ATEMSTIM','5 MOMENTE')) else '')
        h+=f'<div class="{cls}"><h3 style="margin-top:0">{name.title().replace("/ ","/ ")}</h3>{ps}{"<ul>"+lis+"</ul>" if lis else ""}</div>'
    h+='</div>'
    if s['std']: h+=f'<div class="std"><b>Standard / Grundlage:</b> {s["std"]}</div>'
    return h+'</div>'
X=""".ps{page-break-before:always}.pgrid{display:grid;grid-template-columns:1fr 1fr;gap:4mm}.pgrid .card{margin:0}.pgrid .wide{grid-column:1/3}
.sp{margin:0 0 1.5mm;font-weight:600;color:#0b1a35}.std{margin-top:4mm;font-size:8.8pt;color:#475569;border-top:0.6pt solid #e2e8f0;padding-top:2mm}"""
toc=[s['title'] for s in secs]
body=cover('Kompendium · Prüfungswissen','Prophylaxen-<br>Kompendium','Alle examensrelevanten Prophylaxen mit Risikofaktoren, Assessment-Skalen, Maßnahmen und Expertenstandards – übersichtlich zum Lernen und Nachschlagen.',
 ['Expertenstandards','Assessment-Skalen','Hygiene','Examen'],[(str(len(secs)),'Themen'),('DNQP','Standards'),('A4','druckfertig')],
 'Lernhilfe für Ausbildung und Prüfung. Es gelten die Standards und Verfahrensanweisungen deiner Einrichtung.')
body+='<h2>Inhalt</h2><p class="lead">Jedes Thema auf einer eigenen Seite – ideal zum Ausdrucken und Abheften.</p><div class="pgrid">'+''.join(f'<div class="card" style="padding:2.6mm 4mm"><b style="font:700 10pt M;color:#0b1a35"><span style="color:#14b8a6">{i+1:02d}</span>&nbsp; {t}</b></div>' for i,t in enumerate(toc))+'</div>'
body+=''.join(render(s) for s in secs)+endbox()
build('/mnt/user-data/outputs/PLAN-NRW_Prophylaxen-Kompendium.pdf','Prophylaxen-Kompendium',body,X)
print(len(secs),[ (s['title'],[b[0] for b in s['blocks']]) for s in secs][:3])
