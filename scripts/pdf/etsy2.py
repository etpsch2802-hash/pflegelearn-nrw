# Etsy-Pakete Teil 2 (18.10.2026): Probeklausur, Fallbeispiele, Krankheitsbilder, Medikamente, Taschenkarten, ATA/OTA, Komplettpaket.
# Quellen (alle bereits live in der App): /tmp/appdata.json (KRANKHEITSBILDER, MEDIKAMENTE(_NEU), FAELLE, TASCHENKARTEN aus index.html),
# /tmp/klausur_u.json (data/klausur-*.js, Umlaute ergänzt), /tmp/q.json (QUIZ_FRAGEN). Ausgabe: private/etsy/ (nicht ausgeliefert).
import json,random,html,os,sys
from base import *
from pypdf import PdfReader,PdfWriter
OUT=os.path.join(D,'..','..','private','etsy'); os.makedirs(OUT,exist_ok=True)
GR=os.path.join(D,'..','..','private','gratis-pdfs')
E=lambda x: html.escape(str(x))
A=json.load(open('/tmp/appdata.json')); K=json.load(open('/tmp/klausur_u.json')); Q=json.load(open('/tmp/q.json'))
WARN='Lernhilfe, mit KI-Unterstützung erstellt und fachlich geprüft. Maßgeblich sind Lehrinhalte, Leitlinien und Standards deiner Einrichtung.'
LIZ='<p class="lic">© PLAN Digital · Patrick Schenkelberger. Nur für den persönlichen Gebrauch. Weitergabe, Weiterverkauf und Veröffentlichung nicht gestattet.</p>'
LV={'leicht':'●','mittel':'●●','schwer':'●●●'}
X=""".area{page-break-before:always}.grp{margin-top:7mm}.lic{margin-top:5mm;font-size:8.5pt;color:#64748b}
.q{break-inside:avoid;padding:2.6mm 0 2.2mm;border-bottom:0.6pt solid #e2e8f0}
.q .qh{display:flex;gap:3mm;font:700 9.8pt/1.35 M;color:#0b1a35}.q .qn{flex:none;width:9mm;height:6.2mm;border-radius:1.6mm;background:#0b1a35;color:#fff;text-align:center;font:800 8pt/6.2mm M}
.q .lv{margin-left:auto;color:#14b8a6;font-size:8pt;letter-spacing:1pt;flex:none}
.q ol{list-style:none;padding:0 0 0 12mm;margin:1.4mm 0 0;display:grid;grid-template-columns:1fr 1fr;gap:1mm 5mm;font-size:9.3pt}
.q ol.one{grid-template-columns:1fr}
.q li:before{content:attr(data-l);display:inline-block;width:5mm;height:5mm;border:0.9pt solid #94a3b8;border-radius:50%;text-align:center;font:700 7pt/4.8mm M;color:#475569;margin-right:2mm}
.sol{font-size:8.8pt}.sol .r{display:flex;gap:2.5mm;padding:1.3mm 0;border-bottom:0.5pt solid #e2e8f0;break-inside:avoid}
.sol .r b{flex:none;width:8mm;font:800 8pt M;color:#64748b}.sol .r i{flex:none;font-style:normal;width:5.5mm;height:5.5mm;border-radius:50%;background:#14b8a6;color:#fff;text-align:center;font:800 7.5pt/5.5mm M}
.solh{font:800 10pt M;color:#0284c7;margin:4mm 0 1mm;break-after:avoid}
.fall{background:#f0f7ff;border-left:2mm solid #0284c7;border-radius:2.5mm;padding:3.5mm 4.5mm;margin:0 0 3mm;break-inside:avoid;font-size:9.8pt}
.fall .ctx{font:700 7.5pt M;letter-spacing:1pt;text-transform:uppercase;color:#0284c7;margin-bottom:1mm}
.meta{display:flex;gap:2mm;flex-wrap:wrap;margin:0 0 3mm}.meta span{font:700 7.5pt M;color:#0b1a35;background:#f1f5f9;border-radius:10mm;padding:.8mm 2.6mm}
.tag{display:inline-block;font:800 7pt M;border-radius:1.2mm;padding:.3mm 1.6mm;margin-right:1.5mm;color:#fff}
.t-gut{background:#16a34a}.t-warn{background:#d97706}.t-fehler{background:#dc2626}
.fz{background:#f0fdfa;border-left:1.8mm solid #14b8a6;border-radius:2mm;padding:2.4mm 3.5mm;font-size:9pt;color:#134e4a;margin:1.5mm 0 3mm;break-inside:avoid}
.kb h2{font-size:15pt}.kb .icd{font:700 9pt M;color:#64748b;margin-left:2mm}
.c3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:3mm;margin:2mm 0 3mm}.c3 .card{margin:0;padding:3mm 3.5mm;font-size:8.8pt}
.pp{width:100%;border-collapse:collapse;font-size:8.6pt;margin:1mm 0 3mm;break-inside:avoid}.pp td{border:0.6pt solid #e2e8f0;padding:1.6mm 2.2mm;vertical-align:top}
.pp td:first-child{width:24%;font:700 8pt M;color:#0b1a35;background:#f8fafc}
.med{break-inside:avoid;border:0.8pt solid #e2e8f0;border-top:2.2pt solid #14b8a6;border-radius:3mm;padding:3mm 4mm;margin-bottom:3.5mm}
.med h4{margin:0 0 1.5mm;font:800 11pt M;color:#0b1a35}.med h4 span{font:700 8pt M;color:#0284c7;margin-left:2mm}
"""
def qblock(num,q,one=False):
    return f'<div class="q"><div class="qh"><span class="qn">{num}</span><span>{E(q["frage"])}</span><span class="lv">{LV.get(q.get("s"),"")}</span></div><ol class="{"one" if one else ""}">'+''.join(f'<li data-l="{"ABCD"[j]}">{E(o)}</li>' for j,o in enumerate(q['opt']))+'</ol></div>'
def sols(title,items):
    return f'<div class="solh">{title}</div>'+''.join(f'<div class="r"><b>{a}</b><i>{l}</i><span>{E(e)}</span></div>' for a,l,e in items)
def save(datei,titel,b):
    p=os.path.join(OUT,datei); build(p,titel,b,X); print('OK',datei,len(PdfReader(p).pages),'Seiten'); return p
def ok(q): return len(q['opt'])==4 and q.get('erkl') and q.get('frage')

# ---------- 1) Probeklausur
def probeklausur():
    F=K['faelle']; G=[g for g in K['gross'] if g.get('aktiv',True)]
    N=sum(len(f['fragen']) for f in F)+sum(len(g['fragen']) for g in G)
    b=cover('Prüfungstraining · Schriftliche Prüfung','Probeklausur<br>Pflegeexamen',f'{len(F)} Fallsituationen und {len(G)} Großfälle mit {N} fallbezogenen Aufgaben – so, wie im Examen gefragt wird: Situation lesen, einschätzen, richtig handeln.',
      ['Fallbezogen','Großfälle','Erklärungen','Lösungsschlüssel'],[(str(N),'Aufgaben'),(str(len(F)+len(G)),'Fälle'),('A4','druckfertig')],WARN,
      toc=['Teil A: Fallsituationen','Teil B: Großfälle','Lösungen mit Begründung','Auswertung'])
    b+='<h2>So nutzt du die Probeklausur</h2><p class="lead">Bearbeite die Aufgaben am Stück und ohne Hilfsmittel – wie in der echten Prüfung. Plane etwa zwei Minuten pro Aufgabe ein. Erst danach in den Lösungsteil schauen.</p>'
    b+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">Teil A</h3>Kurze Fallsituationen aus Krankenhaus, Pflegeheim und ambulanter Pflege – je mehrere Aufgaben zu einem Fall.</div><div class="card t"><h3 style="margin-top:0">Teil B</h3>Große Fälle, die sich über Aufnahme, Verlauf und Entlassung entwickeln – wie im Examen.</div></div>'+LIZ
    n=0; S=[]
    b+='<div class="area"><h2><span class="n">A</span>Fallsituationen</h2><p class="lead">Lies jeden Fall genau – die Antworten stecken oft in den Details.</p>'
    for i,f in enumerate(F):
        b+=f'<div class="{"grp" if i else ""}"><div class="fall"><div class="ctx">Fall {i+1} · {E(f.get("kontext",""))}</div><b>{E(f["titel"])}</b><br>{E(f["fall"])}</div>'; ss=[]
        for q in f['fragen']: n+=1; b+=qblock(n,q,True); ss.append((n,'ABCD'[q['k']],q['erkl']))
        b+='</div>'; S.append((f'Fall {i+1}: {E(f["titel"])}',ss))
    b+='</div>'
    for i,g in enumerate(G):
        b+=f'<div class="area"><h2><span class="n">B{i+1}</span>Großfall</h2><div class="fall"><div class="ctx">{E(g.get("kontext",""))}</div><b>{E(g["titel"])}</b><br>{E(g["einleitung"])}</div>'; ss=[]; kap=None
        for q in g['fragen']:
            if q.get('kapitel') and q['kapitel']!=kap: kap=q['kapitel']; b+=f'<h3>{E(kap)}</h3>'
            if q.get('situation'): b+=f'<div class="fall" style="background:#f8fafc;border-color:#94a3b8">{E(q["situation"])}</div>'
            n+=1; b+=qblock(n,q,True); ss.append((n,'ABCD'[q['k']],q['erkl']))
        b+='</div>'; S.append((f'Großfall {i+1}: {E(g["titel"])}',ss))
    b+='<div class="area"><h2>Lösungen &amp; Begründungen</h2><p class="lead">Richtige Antwort und warum – auch die Begründung, warum die anderen Antworten nicht passen.</p><div class="sol">'+''.join(sols(t,ss) for t,ss in S)+'</div>'
    b+=f'<h2 style="margin-top:8mm">Auswertung</h2><table class="kv"><tr><td>Richtig beantwortet</td><td>______ von {N}</td></tr><tr><td>Davon Teil A</td><td>______</td></tr><tr><td>Davon Teil B</td><td>______</td></tr><tr><td>Themen zum Wiederholen</td><td>________________________________</td></tr></table>'+endbox()+LIZ+'</div>'
    return save('PLAN-NRW_Probeklausur-Pflegeexamen.pdf','Probeklausur Pflegeexamen',b),N

# ---------- 2) Fallbeispiele
def hauptpfad(f):
    nodes=f['nodes']; out=[]; cur=f.get('start','n1'); seen=set()
    while cur in nodes and cur not in seen and not nodes[cur].get('ende'):
        seen.add(cur); nd=nodes[cur]; out.append((cur,nd))
        nxt=[o['ziel'] for o in nd.get('optionen',[]) if o.get('typ')=='gut']
        cur=nxt[0] if nxt else None
    return out
def fallbeispiele():
    FA=A['FAELLE']; rnd=random.Random(11)
    fach={}
    for f in FA: fach.setdefault(f['fachLabel'],[]).append(f)
    b=cover('Fallarbeit · Examen &amp; Praxis',f'{len(FA)} Fallbeispiele<br>für die Pflege',f'Klinische Fälle aus {len(fach)} Fachgebieten: Situation lesen, an jedem Entscheidungspunkt die beste Handlung wählen – mit ausführlicher Auflösung und Merksatz zu jedem Fall.',
      ['Entscheidungen','Priorisierung','Notfall','Merksätze'],[(str(len(FA)),'Fälle'),(str(len(fach)),'Fachgebiete'),('A4','druckfertig')],WARN,toc=list(fach)[:9]+(['… und weitere'] if len(fach)>9 else []))
    b+='<h2>So arbeitest du mit den Fällen</h2><p class="lead">Jeder Fall hat mehrere Entscheidungspunkte. Wähle jeweils die Handlung, die du als Pflegefachkraft zuerst bzw. am sichersten durchführen würdest. Die Auflösung zeigt, was richtig, vertretbar oder falsch ist – und warum.</p>'
    b+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">Bewertung</h3><span class="tag t-gut">RICHTIG</span> beste Wahl<br><span class="tag t-warn">VERTRETBAR</span> möglich, aber nicht optimal<br><span class="tag t-fehler">FALSCH</span> gefährlich oder falsch priorisiert</div><div class="card t"><h3 style="margin-top:0">Im Unterricht</h3>Ideal für Lerngruppen und Praxisanleitung: Fall vorlesen, gemeinsam entscheiden, dann auflösen.</div></div>'+LIZ
    nr=0; S=[]
    for fl,fs in fach.items():
        b+=f'<div class="area"><h2>{E(fl)}</h2><p class="lead">{len(fs)} Fälle</p>'
        for j,f in enumerate(fs):
            nr+=1; pf=hauptpfad(f); fid=f'F{nr}'
            b+=f'<div class="{"grp" if j else ""}" style="break-inside:avoid-page"><h3 style="font-size:10pt;letter-spacing:.3pt;text-transform:none;color:#0b1a35">Fall {nr} · {E(f["titel"])}</h3><div class="meta"><span>{E(f.get("schwere",""))}</span><span>{E(f.get("grad",""))}</span>'+(f'<span>{f["jahr"]}. Ausbildungsjahr</span>' if f.get('jahr') else '')+f'</div><div class="fall">{E(f["vignette"])}</div>'
            sol=[]
            for d,(nid,nd) in enumerate(pf):
                opts=list(nd.get('optionen',[])); rnd.shuffle(opts)
                b+=f'<div class="q"><div class="qh"><span class="qn">{d+1}</span><span><span style="display:block;font:800 7.2pt M;letter-spacing:1pt;color:#0284c7">{E(nd.get("titel",""))}</span>{E(nd["text"])}</span></div><ol class="one">'+''.join(f'<li data-l="{"ABCD"[k]}">{E(o["text"])}</li>' for k,o in enumerate(opts))+'</ol></div>'
                sol.append((d+1,opts))
            fz=(f['nodes'].get('end_gut') or {}).get('fazit','')
            b+='</div>'; S.append((nr,f['titel'],sol,fz))
        b+='</div>'
    lab={'gut':('t-gut','RICHTIG'),'warn':('t-warn','VERTRETBAR'),'fehler':('t-fehler','FALSCH')}
    b+='<div class="area"><h2>Auflösungen</h2><p class="lead">Zu jedem Entscheidungspunkt: Bewertung aller Antworten mit Begründung und der Merksatz zum Fall.</p><div class="sol">'
    for nr,t,sol,fz in S:
        b+=f'<div class="solh">Fall {nr} · {E(t)}</div>'
        for d,opts in sol:
            b+=''.join(f'<div class="r"><b>{d}{"ABCD"[k]}</b><span><span class="tag {lab.get(o.get("typ"),("t-warn","?"))[0]}">{lab.get(o.get("typ"),("","?"))[1]}</span>{E(o.get("fb",""))}</span></div>' for k,o in enumerate(opts))
        if fz: b+=f'<div class="fz"><b>Merke:</b> {E(fz)}</div>'
    b+='</div>'+endbox()+LIZ+'</div>'
    return save(f'PLAN-NRW_{len(FA)}-Fallbeispiele.pdf',f'{len(FA)} Fallbeispiele',b),len(FA)

# ---------- 3) Krankheitsbilder & Pflegeplanung
def krankheitsbilder():
    KB=A['KRANKHEITSBILDER']; N=sum(len(v['bilder']) for v in KB.values())
    b=cover('Krankheitslehre · Pflegeplanung · Mündliche Prüfung','Krankheitsbilder<br>&amp; Pflegeplanung',f'{N} Krankheitsbilder aus {len(KB)} Fachgebieten – Definition, Symptome, Diagnostik, Therapie, fertige Pflegeplanung und Prüfungsfragen. Ideal für die mündliche Prüfung.',
      ['ICD-10','Pflegeplanung','Prüfungsfragen','Mündliche Prüfung'],[(str(N),'Krankheitsbilder'),(str(len(KB)),'Fachgebiete'),('A4','druckfertig')],WARN,toc=[v['label'] for v in KB.values()][:9]+(['… und Orthopädie'] if len(KB)>9 else []))
    b+='<h2>So lernst du mit dem Heft</h2><p class="lead">Jedes Krankheitsbild folgt demselben Aufbau – genau so, wie in der mündlichen Prüfung gefragt wird: Was ist es? Woran erkenne ich es? Wie wird es behandelt? Was tue ich als Pflegefachkraft?</p>'
    b+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">Pflegeplanung</h3>Pflegeproblem nach PESR, Ressourcen, Ziel, Maßnahmen und Evaluation – als Vorlage für deine eigene Planung.</div><div class="card t"><h3 style="margin-top:0">Prüfungsfragen</h3>Zu den meisten Krankheitsbildern Kontrollfragen mit Lösung am Ende des Hefts.</div></div>'+LIZ
    num=0; S=[]
    for v in KB.values():
        b+=f'<div class="area"><h2>{E(v["label"])}</h2><p class="lead">{len(v["bilder"])} Krankheitsbilder</p>'
        for j,kb in enumerate(v['bilder']):
            li=lambda xs: '<ul>'+''.join(f'<li>{E(x)}</li>' for x in (xs or []))+'</ul>'
            b+=f'<div class="kb {"grp" if j else ""}"><h2>{E(kb["name"])}<span class="icd">{E(kb.get("icd",""))}</span></h2><p class="lead" style="margin-bottom:2mm">{E(kb.get("definition",""))}</p>'
            b+=f'<div class="c3"><div class="card t"><h3 style="margin-top:0">Symptome</h3>{li(kb.get("symptome"))}</div><div class="card t"><h3 style="margin-top:0">Diagnostik</h3>{li(kb.get("diagnostik"))}</div><div class="card t"><h3 style="margin-top:0">Therapie</h3>{li(kb.get("therapie"))}</div></div>'
            for p in kb.get('pflegeplanung') or []:
                b+='<table class="pp">'+f'<tr><td>Pflegeproblem</td><td>{E(p.get("problem",""))}</td></tr><tr><td>Ressourcen</td><td>{E(", ".join(p.get("ressourcen",[]) or []))}</td></tr><tr><td>Pflegeziel</td><td>{E(p.get("ziel",""))}</td></tr><tr><td>Maßnahmen</td><td>{li(p.get("massnahmen"))}</td></tr><tr><td>Evaluation</td><td>{E(p.get("evaluation",""))}</td></tr></table>'
            fr=[x for x in (kb.get('fragen') or []) if len(x.get('opt',[]))==4]
            if fr:
                b+='<h3>Kontrollfragen</h3>'; ss=[]
                for x in fr:
                    num+=1; b+=qblock(num,{'frage':x['f'],'opt':x['opt']}); ss.append((num,'ABCD'[x['k']],x.get('e','')))
                S.append((E(kb['name']),ss))
            b+='</div>'
        b+='</div>'
    if S: b+='<div class="area"><h2>Lösungen der Kontrollfragen</h2><div class="sol">'+''.join(sols(t,ss) for t,ss in S)+'</div>'+endbox()+LIZ+'</div>'
    return save('PLAN-NRW_Krankheitsbilder-Pflegeplanung.pdf','Krankheitsbilder & Pflegeplanung',b),N

# ---------- 4) Medikamente
def medikamente():
    G=[('Anästhesie','anaesthesie',A['MEDIKAMENTE']),('Intensivmedizin','intensiv',A['MEDIKAMENTE']),('Notfall','notfall',A['MEDIKAMENTE']),('Pflegealltag','pflege',A['MEDIKAMENTE']),
       ('Herz &amp; Kreislauf','herz',A['MEDIKAMENTE_NEU']),('Antikoagulation','antikoagulation',A['MEDIKAMENTE_NEU']),('Schmerz','schmerz',A['MEDIKAMENTE_NEU']),('Neurologie &amp; Psychiatrie','neuropsych',A['MEDIKAMENTE_NEU']),('Diabetes','diabetes',A['MEDIKAMENTE_NEU'])]
    N=sum(len(src.get(k,[])) for _,k,src in G)
    b=cover('Pharmakologie für die Pflege','Medikamente<br>kompakt',f'{N} wichtige Wirkstoffe aus Pflegealltag, Notfall, Anästhesie und Intensivmedizin – Wirkung, Nebenwirkungen, Kontraindikationen und vor allem: worauf du als Pflegekraft achten musst.',
      ['Wirkung','Nebenwirkungen','Kontraindikationen','Pflege'],[(str(N),'Wirkstoffe'),(str(len(G)),'Gruppen'),('A4','druckfertig')],
      'Lernhilfe, mit KI-Unterstützung erstellt und fachlich geprüft. Dosierungen nur als Orientierung – verbindlich sind ärztliche Anordnung, Fachinformation und Klinikstandard.',toc=[g for g,_,_ in G])
    b+='<h2>So ist jede Karte aufgebaut</h2><p class="lead">Name und Wirkstoffgruppe, Indikation bzw. Dosis, Wirkung, Nebenwirkungen (NW), Kontraindikationen (KI) und der wichtigste Pflegehinweis. Der Pflegehinweis ist das, was in Praxis und Prüfung zählt.</p>'+LIZ
    for gi,(gl,k,src) in enumerate(G):
        ms=src.get(k,[])
        if not ms: continue
        b+=f'<div class="{"area" if gi%2==0 else "grp"}"><h2>{gl}</h2><p class="lead">{len(ms)} Wirkstoffe</p>'
        for m in ms:
            rows=[('Indikation',m.get('indikation')),('Dosis (Orientierung)',m.get('dosis')),('Wirkung',m.get('wirkung')),('Nebenwirkungen',m.get('nw')),('Kontraindikationen',m.get('ki')),('Pflege',m.get('pflege'))]
            b+=f'<div class="med"><h4>{E(m["name"])}<span>{E(m.get("gruppe",""))}</span></h4><table class="kv">'+''.join(f'<tr><td>{a}</td><td>{E(v)}</td></tr>' for a,v in rows if v)+'</table></div>'
        b+='</div>'
    b+=endbox()+LIZ
    return save('PLAN-NRW_Medikamente-kompakt.pdf','Medikamente kompakt',b),N

# ---------- 5) Taschenkarten
def taschenkarten():
    KK=A['TASCHENKARTEN']
    for k in KK:
        for s in k['vorderseite']: s['punkte']=[p.replace('H2: Ranitidin oder Cimetidin i.v.','H2-Blocker optional nach Klinikstandard').replace('Ranitidin oder Cimetidin i.v.','H2-Blocker optional nach Klinikstandard') for p in s['punkte']]
    PAL=['#0284c7','#14b8a6','#dc2626','#d97706','#7c3aed','#db2777','#059669','#2563eb','#ea580c','#0891b2']
    T=""".kgrid{display:grid;grid-template-columns:1fr 1fr;gap:4mm}.k{border:1pt dashed #94a3b8;border-radius:3mm;padding:3mm 3.5mm 2.5mm;break-inside:avoid;font-size:8pt;line-height:1.32}
.k .kt{display:flex;align-items:center;gap:2mm;border-bottom:1.4pt solid var(--c);padding-bottom:1.6mm;margin-bottom:1.6mm}.k .kt b{font:800 9.6pt M;color:var(--c)}.k .kt img{width:6mm;height:6mm;margin-left:auto}
.k .kn{font:800 7pt M;color:#fff;background:var(--c);border-radius:1.2mm;padding:.3mm 1.4mm}.k h4{font:700 6.8pt M;letter-spacing:.7pt;text-transform:uppercase;color:var(--c);margin:1.6mm 0 .5mm}
.k ul{padding-left:3.2mm}.k li{margin:.2mm 0}.k li::marker{color:var(--c)}.k .kf{margin-top:1.6mm;font:600 6pt M;color:#94a3b8;text-align:right}"""
    def card(i,k):
        c=PAL[i%len(PAL)]; secs=''.join(f'<h4>{E(s["label"])}</h4><ul>'+''.join(f'<li>{E(p)}</li>' for p in s['punkte'])+'</ul>' for s in k['vorderseite'])
        return f'<div class="k" style="--c:{c}"><div class="kt"><span class="kn">{i+1:02d}</span><b>{E(k["titel"])}</b><img src="file://{D}/logo.png"></div>{secs}<div class="kf">PLAN NRW · Bestehen ist planbar.</div></div>'
    n=len(KK)
    b=cover('Kitteltaschen-Wissen · Zum Ausschneiden','Taschenkarten-<br>Set',f'{n} Karten mit dem wichtigsten Praxis- und Prüfungswissen – ausdrucken, ausschneiden, laminieren und in die Kitteltasche stecken.',
      ['Hygiene','Prophylaxen','Notfall','Scores','Intensiv','Recht'],[(str(n),'Karten'),('2','pro Zeile'),('A4','druckfertig')],WARN)
    b+='<h2>Inhalt</h2><p class="lead">Tipp: Auf festeres Papier (160 g/m²) drucken und laminieren – dann halten die Karten die ganze Ausbildung.</p>'
    b+='<div style="column-count:2;column-gap:8mm;font:600 9pt M;color:#0b1a35">'+''.join(f'<div style="padding:1.1mm 0;border-bottom:0.5pt solid #e2e8f0"><span style="color:#14b8a6">{i+1:02d}</span>&nbsp; {E(k["titel"])}</div>' for i,k in enumerate(KK))+'</div>'+LIZ
    b+='<div class="pb"></div><div class="kgrid">'+''.join(card(i,k) for i,k in enumerate(KK))+'</div>'+endbox()
    p=os.path.join(OUT,f'PLAN-NRW_Taschenkarten-Set_{n}-Karten.pdf'); build(p,'Taschenkarten-Set',b,X+T); print('OK Taschenkarten',len(PdfReader(p).pages)); return p,n

# ---------- 6) ATA / OTA
def ata_ota():
    KAT=[('ata_beruf','ATA: Beruf &amp; Recht'),('ata_periop','ATA: Perioperative Versorgung'),('ata_narkose','ATA: Narkose'),('ata_atemweg','ATA: Atemweg'),('ata_monitoring','ATA: Monitoring'),('ata_medikamente','ATA: Medikamente'),('ata_sicherheit','ATA: Patientensicherheit'),
         ('ota_steril','OTA: Sterilität &amp; Hygiene'),('ota_aufbereitung','OTA: Aufbereitung'),('ota_instrumente','OTA: Instrumente'),('ota_op_technik','OTA: OP-Technik'),('ota_naht','OTA: Naht &amp; Wundverschluss'),('ota_lagerung','OTA: Lagerung'),('ota_sicherheit','OTA: Sicherheit im OP')]
    rnd=random.Random(5); sel=[]
    for k,n in KAT:
        p=[q for q in Q if q['kat']==k and ok(q)]; rnd.shuffle(p)
        if p: sel.append((n,p))
    N=sum(len(p) for _,p in sel)
    b=cover('ATA · OTA · Ausbildung &amp; Prüfung','ATA &amp; OTA<br>Fragenkatalog',f'{N} Prüfungsfragen mit Erklärungen für die Anästhesie- und Operationstechnische Assistenz – von Narkose und Atemweg bis Sterilgut, Instrumente und Lagerung.',
      ['ATA','OTA','OP','Anästhesie'],[(str(N),'Fragen'),(str(len(sel)),'Themenbereiche'),('A4','druckfertig')],WARN,toc=[n for n,_ in sel[:9]]+[f'… und {len(sel)-9} weitere Bereiche'])
    b+='<h2>So nutzt du den Katalog</h2><p class="lead">Bereich für Bereich üben, dann im Lösungsteil kontrollieren. Erstellt von einem Fachpfleger für Anästhesie &amp; Intensivmedizin.</p>'+LIZ
    num=0; S=[]
    for i,(n,p) in enumerate(sel):
        b+=f'<div class="{"area" if len(p)>=15 or i==0 else "grp"}"><h2><span class="n">{i+1}</span>{n}</h2><p class="lead">{len(p)} Fragen</p>'; ss=[]
        for q in p: num+=1; b+=qblock(num,q); ss.append((num,'ABCD'[q['k']],q['erkl']))
        b+='</div>'; S.append((n,ss))
    b+='<div class="area"><h2>Lösungsschlüssel &amp; Erklärungen</h2><div class="sol">'+''.join(sols(t,ss) for t,ss in S)+'</div>'+endbox()+LIZ+'</div>'
    return save('PLAN-NRW_ATA-OTA_Fragenkatalog.pdf','ATA & OTA Fragenkatalog',b),N

# ---------- 7) Komplettpaket
def komplett(teile):
    bonus=[('Prophylaxen-Kompendium','PLAN-NRW_Prophylaxen-Kompendium.pdf'),('Reanimations-Algorithmen','PLAN-NRW_Reanimations-Algorithmen.pdf'),('Laborwerte kompakt','PLAN-NRW_Laborwerte-kompakt.pdf'),('Examens-Spickzettel','PLAN-NRW_Examens-Spickzettel.pdf')]
    parts=[(t,p,d) for t,p,d in teile]+[(t+' (Bonus)',os.path.join(GR,f),'auch kostenlos in der PLAN-App') for t,f in bonus]
    pages=[len(PdfReader(p).pages) for _,p,_ in parts]
    start=3; rows=''
    for (t,p,d),pg in zip(parts,pages): rows+=f'<tr><td><b>{E(t)}</b><br><span style="color:#64748b">{E(d)}</span></td><td style="text-align:right;font:700 10pt M;color:#14b8a6">S. {start}</td></tr>'; start+=pg
    total=start-1
    b=cover('Alles fürs Pflegeexamen in einem Paket','Pflegeexamen-<br>Komplettpaket',f'{len(teile)} PLAN-Lernhilfen plus {len(bonus)} Bonus-Lernhilfen – {total} Seiten Prüfungsfragen, Probeklausur, Fallbeispiele, Krankheitsbilder, Medikamente und Taschenkarten.',
      ['Schriftlich','Mündlich','Praxis','Notfall'],[(str(len(teile)+len(bonus)),'Lernhilfen'),(str(total),'Seiten'),('A4','druckfertig')],WARN,toc=[t for t,_,_ in teile]+['… plus 4 Bonus-Lernhilfen'])
    b+=f'<h2>Inhalt des Komplettpakets</h2><p class="lead">Jede Lernhilfe beginnt mit einem eigenen Deckblatt. Die Seitenzahlen beziehen sich auf dieses Gesamt-PDF. Die Bonus-Lernhilfen gibt es auch einzeln kostenlos in der PLAN-App – hier sind sie der Vollständigkeit halber mit drin.</p><table class="kv" style="font-size:10pt">{rows}</table>'+LIZ
    build('/tmp/kp_cover.pdf','Pflegeexamen-Komplettpaket',b,X)
    w=PdfWriter(); r=PdfReader('/tmp/kp_cover.pdf')
    for pg in r.pages: w.add_page(pg)
    pos=len(r.pages)
    for (t,p,_),n in zip(parts,pages):
        for pg in PdfReader(p).pages: w.add_page(pg)
        w.add_outline_item(t,pos); pos+=n
    w.add_metadata({'/Title':'PLAN – Pflegeexamen-Komplettpaket','/Author':'Patrick Schenkelberger · plan-nrw.de'})
    out=os.path.join(OUT,'PLAN-NRW_Pflegeexamen-Komplettpaket.pdf'); w.write(out); print('OK Komplettpaket',pos,'Seiten'); return out

if __name__=='__main__':
    p1,n1=probeklausur(); p2,n2=fallbeispiele(); p3,n3=krankheitsbilder(); p4,n4=medikamente(); p5,n5=taschenkarten(); p6,n6=ata_ota()
    ex=os.path.join(OUT,'PLAN-NRW_Examen_300-Pruefungsfragen.pdf')
    komplett([('Pflegeexamen: 300 Prüfungsfragen',ex,'300 Fragen mit Erklärungen'),('Probeklausur Pflegeexamen',p1,f'{n1} fallbezogene Aufgaben'),(f'{n2} Fallbeispiele',p2,'Entscheidungsfälle mit Auflösung'),
              ('Krankheitsbilder &amp; Pflegeplanung'.replace('&amp;','&'),p3,f'{n3} Krankheitsbilder'),('Medikamente kompakt',p4,f'{n4} Wirkstoffe'),('Taschenkarten-Set',p5,f'{n5} Karten zum Ausschneiden')])
