# Etsy-Pakete (17.10.2026): Fragenhefte aus data/quiz-fragen.js im PLAN-Design.
# Aufruf: node-Export nach /tmp/q.json (siehe README), dann: python3 etsy.py  → private/etsy/*.pdf (nicht ausgeliefert)
import json,random,html,os
from base import *
Q=json.load(open('/tmp/q.json'))
OUT=os.path.join(D,'..','..','private','etsy'); os.makedirs(OUT,exist_ok=True)
E=lambda x: html.escape(str(x))
LV={'leicht':'●','mittel':'●●','schwer':'●●●'}
X=""".area{page-break-before:always}.grp{margin-top:7mm}.grp h2{break-after:avoid}.q{break-inside:avoid;padding:2.6mm 0 2.2mm;border-bottom:0.6pt solid #e2e8f0}
.q .qh{display:flex;gap:3mm;font:700 9.8pt/1.35 M;color:#0b1a35}.q .qn{flex:none;width:9mm;height:6.2mm;border-radius:1.6mm;background:#0b1a35;color:#fff;text-align:center;font:800 8pt/6.2mm M}
.q .lv{margin-left:auto;color:#14b8a6;font-size:8pt;letter-spacing:1pt;flex:none}
.q ol{list-style:none;padding:0 0 0 12mm;margin:1.4mm 0 0;display:grid;grid-template-columns:1fr 1fr;gap:1mm 5mm;font-size:9.3pt}
.q li:before{content:attr(data-l);display:inline-block;width:5mm;height:5mm;border:0.9pt solid #94a3b8;border-radius:50%;text-align:center;font:700 7pt/4.8mm M;color:#475569;margin-right:2mm}
.sol{font-size:8.8pt}.sol .r{display:flex;gap:2.5mm;padding:1.3mm 0;border-bottom:0.5pt solid #e2e8f0;break-inside:avoid}
.sol .r b{flex:none;width:8mm;font:800 8pt M;color:#64748b}.sol .r i{flex:none;font-style:normal;width:5.5mm;height:5.5mm;border-radius:50%;background:#14b8a6;color:#fff;text-align:center;font:800 7.5pt/5.5mm M}
.solh{font:800 10pt M;color:#0284c7;margin:4mm 0 1mm;break-after:avoid}.cols2{column-count:2;column-gap:6mm}
.lic{margin-top:5mm;font-size:8.5pt;color:#64748b}"""
WARN='Lernhilfe, mit KI-Unterstützung erstellt und fachlich geprüft. Maßgeblich sind Lehrinhalte, Leitlinien und Standards deiner Einrichtung.'
LIZ='<p class="lic">© PLAN Digital · Patrick Schenkelberger. Nur für den persönlichen Gebrauch. Weitergabe, Weiterverkauf und Veröffentlichung nicht gestattet.</p>'
def heft(datei,kicker,titel,sub,chips,sel,hinweis):
    N=sum(len(p) for _,p in sel)
    b=cover(kicker,titel,sub,chips,[(str(N),'Fragen'),(str(len(sel)),'Themenbereiche'),('A4','druckfertig')],WARN,
            toc=[n for n,_ in sel[:9]]+([f'… und {len(sel)-9} weitere Bereiche'] if len(sel)>9 else []))
    b+='<h2>So nutzt du das Heft</h2><p class="lead">'+hinweis+'</p>'
    b+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">Schwierigkeit</h3>● leicht · ●● mittel · ●●● schwer</div><div class="card t"><h3 style="margin-top:0">Ehrlich testen</h3>Lösungen und Erklärungen stehen gesammelt am Ende – kein Spoiler beim Lernen.</div></div>'
    b+='<h3>Themenbereiche</h3><div class="cols2" style="font:600 9.3pt M;color:#0b1a35">'+''.join(f'<div style="padding:1.2mm 0;border-bottom:0.5pt solid #e2e8f0"><span style="color:#14b8a6">{i+1:02d}</span>&nbsp; {n} <span style="color:#94a3b8">· {len(p)} Fragen</span></div>' for i,(n,p) in enumerate(sel))+'</div>'+LIZ
    num=0; sols=[]
    for i,(n,p) in enumerate(sel):
        cls='area' if len(p)>=15 or i==0 else 'grp'
        b+=f'<div class="{cls}"><h2><span class="n">{i+1}</span>{n}</h2><p class="lead">{len(p)} Fragen</p>'; ss=[]
        for q in p:
            num+=1
            b+=f'<div class="q"><div class="qh"><span class="qn">{num}</span><span>{E(q["frage"])}</span><span class="lv">{LV.get(q.get("s"),"●●")}</span></div><ol>'+''.join(f'<li data-l="{"ABCD"[j]}">{E(o)}</li>' for j,o in enumerate(q['opt']))+'</ol></div>'
            ss.append((num,"ABCD"[q['k']],q['erkl']))
        b+='</div>'; sols.append((n,ss))
    b+='<div class="area"><h2>Lösungsschlüssel &amp; Erklärungen</h2><p class="lead">Richtige Antwort und kurze Begründung zu jeder Frage.</p><div class="sol">'
    for n,ss in sols: b+=f'<div class="solh">{n}</div>'+''.join(f'<div class="r"><b>{a}</b><i>{l}</i><span>{E(e)}</span></div>' for a,l,e in ss)
    b+='</div>'+endbox()+LIZ+'</div>'
    p=os.path.join(OUT,datei); build(p,titel.replace('<br>',' '),b,X); print('OK',datei,N); return N
ok=lambda q: len(q['opt'])==4 and q.get('erkl') and q.get('frage')

# 1) Langzeitpflege & ambulant
TH=json.load(open('/tmp/lzp_thema.json'))
NAMEN={'Pflegegrade':'Pflegegrade &amp; Begutachtung','Leistungsrecht':'Leistungen der Pflegeversicherung','Dokumentation':'Strukturmodell &amp; SIS','Qualität':'Qualität &amp; Heimrecht NRW','Expertenstandards':'Expertenstandards','Demenz':'Demenz &amp; Delir','Recht':'Recht: FEM, Vorsorge, Verfügung','Geriatrie':'Geriatrie','Ernährung':'Ernährung','Haut':'Haut &amp; Dekubitus','Palliativ':'Palliativ &amp; Sterbephase','Ambulant':'Ambulante Pflege','Mobilität':'Mobilität','Kommunikation':'Kommunikation &amp; Ethik','Hygiene':'Hygiene','Fall':'Fallbeispiele'}
lz=[q for q in Q if q['kat']=='langzeitpflege' and ok(q)]
grp={}
for q in lz:
    th=TH.get(q['frage'],'Fall'); th={'Ethik':'Kommunikation'}.get(th,th)
    grp.setdefault(th,[]).append(q)
ORD=['Pflegegrade','Leistungsrecht','Dokumentation','Qualität','Expertenstandards','Demenz','Recht','Geriatrie','Ernährung','Haut','Palliativ','Ambulant','Mobilität','Kommunikation','Hygiene','Fall']
sel=[(NAMEN[t],grp[t]) for t in ORD if t in grp]
heft('PLAN-NRW_Langzeitpflege-ambulant_Pruefungstraining.pdf','Prüfungstraining · Vertiefung Langzeitpflege','Langzeitpflege &amp;<br>ambulante Pflege',
 'Prüfungsfragen mit Erklärungen für den Vertiefungseinsatz im Pflegeheim und in der häuslichen Pflege – von Pflegegraden bis Palliativversorgung.',
 ['SGB XI','Expertenstandards','Demenz','Fallbeispiele'],sel,
 'Beantworte die Fragen eines Bereichs, kontrolliere dann im Lösungsteil. Falsche Antworten markieren und nach ein paar Tagen wiederholen. Rechtsstand Pflegeversicherung: Oktober 2026.')

# 2) Intensiv & Anästhesie
KAT=[('its_beatmung','Beatmung &amp; Atemweg'),('its_haemo','Hämodynamik &amp; Monitoring'),('its_sepsis','Sepsis &amp; Schock'),('its_neuro','Sedierung, Delir &amp; Neuro'),('its_organersatz','Organersatz (ECMO/Dialyse)'),('its_medikamente','Notfall- &amp; ICU-Medikamente'),('its_elyt','Elektrolyte &amp; BGA'),('its_pflege','Intensivpflege &amp; Sicherheit'),
     ('an_grundlagen','Anästhesie: Grundlagen &amp; Verfahren'),('an_medikamente','Anästhetika &amp; Medikamente'),('an_atemweg','Atemweg &amp; Intubation'),('an_regional','Regionalanästhesie'),('an_monitoring','Monitoring &amp; Geräte'),('an_notfall','Komplikationen &amp; Notfall'),('an_awr','Aufwachraum &amp; Postop')]
random.seed(7)
sel=[]
for k,n in KAT:
    p=[q for q in Q if q['kat']==k and ok(q)]; random.shuffle(p)
    if p: sel.append((n,p))
heft('PLAN-NRW_Intensiv-Anaesthesie_Fragenkatalog.pdf','Fachweiterbildung · Intensiv &amp; Anästhesie','Intensiv- &amp;<br>Anästhesiepflege',
 'Fragenkatalog mit Erklärungen für Fachweiterbildung, Einarbeitung auf ITS und Anästhesie – von Beatmung über Sepsis bis Aufwachraum.',
 ['Beatmung','Hämodynamik','Narkose','Aufwachraum'],sel,
 'Ideal zur Einarbeitung und zur Vorbereitung auf Modulprüfungen. Bereich für Bereich üben, dann im Lösungsteil kontrollieren. Erstellt von einem Fachpfleger für Anästhesie &amp; Intensivmedizin.')

# 3) Examen kompakt: 20 je Fachbereich
AREAS=[('gpa','Generalistische Ausbildung &amp; Recht'),('pflegeplanung','Pflegeprozess &amp; Pflegeplanung'),('praevention','Prävention &amp; Gesundheitsförderung'),('mobilitaet','Mobilität &amp; Bewegung'),('notfall','Notfall &amp; Akutsituationen'),('innere','Innere Medizin'),('chirurgie','Chirurgie'),('paediatrie','Pädiatrie'),('gynaekologie','Gynäkologie &amp; Geburtshilfe'),('psychiatrie','Psychiatrie'),('psychologie','Psychologie &amp; Kommunikation'),('altenpflege','Altenpflege &amp; Geriatrie'),('palliation','Palliativpflege'),('rehabilitation','Rehabilitation'),('ana_herz','Anatomie: Herz &amp; Kreislauf')]
random.seed(42); sel=[]
for k,n in AREAS:
    p=[q for q in Q if q['kat']==k and ok(q)]; random.shuffle(p)
    if p: sel.append((n,p[:20]))
heft('PLAN-NRW_Examen_300-Pruefungsfragen.pdf','Prüfungstraining · Schriftliches Examen','Pflegeexamen:<br>300 Prüfungsfragen',
 'Multiple-Choice-Fragen aus allen großen Fachbereichen der generalistischen Pflegeausbildung – mit Lösungsschlüssel und verständlichen Erklärungen.',
 ['Generalistik','Multiple Choice','Erklärungen','Lösungsschlüssel'],sel,
 'Erst alle Fragen eines Bereichs beantworten, dann im Lösungsteil kontrollieren. Falsche Antworten markieren und nach ein paar Tagen wiederholen.')
