import json,random,html
from base import *
Q=json.load(open('/tmp/q.json')); random.seed(42)
AREAS=[('gpa','Generalistische Ausbildung &amp; Recht'),('pflegeplanung','Pflegeprozess &amp; Pflegeplanung'),('praevention','Prävention &amp; Gesundheitsförderung'),('mobilitaet','Mobilität &amp; Bewegung'),('notfall','Notfall &amp; Akutsituationen'),('innere','Innere Medizin'),('chirurgie','Chirurgie'),('paediatrie','Pädiatrie'),('gynaekologie','Gynäkologie &amp; Geburtshilfe'),('psychiatrie','Psychiatrie'),('psychologie','Psychologie &amp; Kommunikation'),('altenpflege','Altenpflege &amp; Geriatrie'),('palliation','Palliativpflege'),('rehabilitation','Rehabilitation'),('anerkennung','Anerkennung &amp; Berufszulassung')]
def longest(q): L=[len(o) for o in q['opt']]; return L[q['k']]==max(L) and L.count(max(L))==1
sel=[]
for k,name in AREAS:
    pool=[q for q in Q if q['kat']==k and len(q['opt'])==4 and q.get('erkl')]
    a=[q for q in pool if not longest(q)]; b=[q for q in pool if longest(q)]
    random.shuffle(a); random.shuffle(b)
    pick=(a+b)[:20]; random.shuffle(pick); sel.append((name,pick))
N=sum(len(p) for _,p in sel)
E=lambda x: html.escape(str(x))
LV={'leicht':'●','mittel':'●●','schwer':'●●●'}
X=""".area{page-break-before:always}.q{break-inside:avoid;padding:2.6mm 0 2.2mm;border-bottom:0.6pt solid #e2e8f0}
.q .qh{display:flex;gap:3mm;font:700 9.8pt/1.35 M;color:#0b1a35}.q .qn{flex:none;width:9mm;height:6.2mm;border-radius:1.6mm;background:#0b1a35;color:#fff;text-align:center;font:800 8pt/6.2mm M}
.q .lv{margin-left:auto;color:#14b8a6;font-size:8pt;letter-spacing:1pt;flex:none}
.q ol{list-style:none;padding:0 0 0 12mm;margin:1.4mm 0 0;display:grid;grid-template-columns:1fr 1fr;gap:1mm 5mm;font-size:9.3pt}
.q li:before{content:attr(data-l);display:inline-block;width:5mm;height:5mm;border:0.9pt solid #94a3b8;border-radius:50%;text-align:center;font:700 7pt/4.8mm M;color:#475569;margin-right:2mm}
.sol{font-size:8.8pt}.sol .r{display:flex;gap:2.5mm;padding:1.3mm 0;border-bottom:0.5pt solid #e2e8f0;break-inside:avoid}
.sol .r b{flex:none;width:8mm;font:800 8pt M;color:#64748b}.sol .r i{flex:none;font-style:normal;width:5.5mm;height:5.5mm;border-radius:50%;background:#14b8a6;color:#fff;text-align:center;font:800 7.5pt/5.5mm M}
.solh{font:800 10pt M;color:#0284c7;margin:4mm 0 1mm;break-after:avoid}.cols2{column-count:2;column-gap:6mm}"""
b=cover('Prüfungstraining · Schriftliche Prüfung','Prüfungsfragen-<br>Sammlung',f'{N} Multiple-Choice-Fragen aus {len(AREAS)} Fachbereichen – zum Selbsttest mit Lösungsschlüssel und verständlichen Erklärungen im Anhang.',
 ['Multiple Choice','Erklärungen','3 Schwierigkeitsstufen','Lösungsschlüssel'],[(str(N),'Fragen'),(str(len(AREAS)),'Fachbereiche'),('A4','druckfertig')],
 'Lernhilfe zur Prüfungsvorbereitung. Inhalte nach bestem Wissen erstellt – maßgeblich sind deine Lehrinhalte, aktuelle Leitlinien und die Standards deiner Einrichtung.',
 toc=[n for n,_ in sel[:9]]+['… und 6 weitere Bereiche'])
b+='<h2>So nutzt du die Sammlung</h2><p class="lead">Erst alle Fragen eines Bereichs beantworten, dann im Lösungsteil kontrollieren. Falsche Antworten markieren und nach ein paar Tagen wiederholen.</p>'
b+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">Schwierigkeit</h3>● leicht · ●● mittel · ●●● schwer</div><div class="card t"><h3 style="margin-top:0">Ehrlich testen</h3>Lösungen stehen gesammelt am Ende – kein Spoiler beim Lernen.</div></div>'
b+='<h3>Fachbereiche</h3><div class="cols2" style="font:600 9.3pt M;color:#0b1a35">'+''.join(f'<div style="padding:1.2mm 0;border-bottom:0.5pt solid #e2e8f0"><span style="color:#14b8a6">{i+1:02d}</span>&nbsp; {n} <span style="color:#94a3b8">· {len(p)} Fragen</span></div>' for i,(n,p) in enumerate(sel))+'</div>'
num=0; sols=[]
for i,(n,p) in enumerate(sel):
    b+=f'<div class="area"><h2><span class="n">{i+1}</span>{n}</h2><p class="lead">{len(p)} Fragen</p>'
    ss=[]
    for q in p:
        num+=1
        b+=f'<div class="q"><div class="qh"><span class="qn">{num}</span><span>{E(q["frage"])}</span><span class="lv">{LV.get(q.get("s"),"●●")}</span></div><ol>'+''.join(f'<li data-l="{"ABCD"[j]}">{E(o)}</li>' for j,o in enumerate(q['opt']))+'</ol></div>'
        ss.append((num,"ABCD"[q['k']],q['erkl']))
    b+='</div>'; sols.append((n,ss))
b+='<div class="area"><h2>Lösungsschlüssel &amp; Erklärungen</h2><p class="lead">Richtige Antwort und kurze Begründung zu jeder Frage.</p><div class="sol">'
for n,ss in sols:
    b+=f'<div class="solh">{n}</div>'+''.join(f'<div class="r"><b>{a}</b><i>{l}</i><span>{E(e)}</span></div>' for a,l,e in ss)
b+='</div>'+endbox()+'</div>'
build(f'/mnt/user-data/outputs/PLAN-NRW_Pruefungsfragen-Sammlung_{N}-Fragen.pdf','Prüfungsfragen-Sammlung',b,X)
from collections import Counter
print(N,Counter(l for _,ss in sols for _,l,_ in ss),sum(longest(q) for _,p in sel for q in p))
