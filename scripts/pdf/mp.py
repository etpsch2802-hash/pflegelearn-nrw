import re
from base import *
t=open('/tmp/Muendliche-Pruefungssimulation.txt').read()
t=re.sub(r'\n\d+\n','\n',t.replace('\f','\n'))
parts=re.split(r'\nFallbeispiel (\d+) · ([^\n]+)\n',t)
cats=['Innere Medizin']*5+['Chirurgie &amp; Orthopädie']*3+['Neurologie']*2+['Onkologie']*2+['Urologie']*2+['Gynäkologie']*2+['HNO']*2+['Psychologie für Pflege']*3
cases=[]
for i in range(1,len(parts),3):
    n=int(parts[i]); head=parts[i+1].strip(); body=parts[i+2]
    for c in ['Chirurgie & Orthopädie','Neurologie','Onkologie','Urologie','Gynäkologie','HNO','Psychologie für Pflege']: body=body.replace('\n'+c+'\n','\n')
    m=re.match(r'(.*?)\s*\(([^)]*)\)$',head); name,icd=(m.group(1),m.group(2)) if m else (head,'')
    qs=re.split(r'Prüferfrage: "',body)[1:]
    def clean(x): return re.sub(r'\s*\n\s*',' ',x).strip()
    q1=qs[0].split('"',1)[1]; defi=clean(q1)
    sym=[clean(x) for x in re.findall(r'• ([^\n]+)',qs[1])]
    d3=qs[2].split('"',1)[1]; diag=re.findall(r'• ([^\n]+)',d3.split('Therapie:')[0]); ther=re.findall(r'• ([^\n]+)',d3.split('Therapie:')[1]) if 'Therapie:' in d3 else []
    pp=[]
    if len(qs)>3:
        for blk in re.split(r'\nPFLEGEPROBLEM\n',qs[3])[1:]:
            f={}
            for k,nk in [('PFLEGEPROBLEM',None)]: pass
            segs=re.split(r'\n(RESSOURCEN|PFLEGEZIEL|MASSNAHMEN|EVALUATION)\n',blk)
            f['Pflegeproblem']=clean(segs[0])
            for j in range(1,len(segs),2): f[segs[j].title()]=clean(segs[j+1])
            pp.append(f)
    cases.append(dict(n=n,name=name.strip(),icd=icd.strip('–- '),cat=cats[n-1],defi=defi,sym=sym,diag=diag,ther=ther,pp=pp))
# Korrekturen
cases=[c for c in cases if c['n']!=4]                          # Doppelter Schlaganfall entfernt (Fall 9 bleibt)
for c in cases:
    for p in c['pp']:
        for k,v in p.items():
            v=re.sub(r'\s*•\s*$','',v)
            if k=='Pflegeproblem': v='P: '+v.replace(' r/t ',' · E: ').replace(' m/d/s ',' · S: ')
            p[k]=v
    if c['name']=='COPD':
        c['pp'][0]['Pflegeziel']='SpO₂ stabil bei 88–92 % (COPD-Zielbereich), Dyspnoe NRS ≤ 3 nach 24 h'
    if c['name']=='Motivationstheorien':
        c['pp']=[{'Pflegeproblem':'P: Unwirksames Gesundheitsverhalten · E: geringe Motivation, fehlendes Krankheitsverständnis · S: unregelmäßige Medikamenteneinnahme, Termine werden nicht wahrgenommen',
          'Ressourcen':'Gesprächsbereit, Wunsch nach mehr Selbstständigkeit, Partnerin unterstützt',
          'Pflegeziel':'Patient nennt bis zur Entlassung zwei persönliche Gründe für die Therapie und nimmt seine Medikamente an 7 von 7 Tagen selbstständig ein',
          'Massnahmen':'Motivierende Gesprächsführung (offene Fragen, aktives Zuhören, Zusammenfassen) · Ziele gemeinsam vereinbaren, kleine Schritte · Fortschritte positiv verstärken · Wochendosett und Einnahmeplan einführen · Angehörige einbeziehen',
          'Evaluation':'Täglich Einnahme kontrollieren, Gespräch zur Motivation alle 2 Tage'}]
THEME={'Postoperative Pflege','Onkologische Pflegegrundlagen','Palliativpflege','Tracheotomie-Pflege','Kommunikationsmodelle','Stressbewältigung & Burnout','Motivationstheorien'}
X=""".case{page-break-before:always}.qa{border-left:2mm solid #0284c7;background:#f0f9ff;border-radius:0 2mm 2mm 0;padding:2.4mm 4mm;margin:3.5mm 0 2mm;font:700 9.6pt M;color:#0b1a35;break-after:avoid}
.qa:before{content:"Prüfer: ";color:#0284c7}.ans{padding:0 1mm}.ans ul{columns:2;column-gap:6mm}
.pp{border:0.8pt solid #cbd5e1;border-radius:2.5mm;margin-top:3mm;break-inside:avoid;overflow:hidden}.pp table{width:100%;border-collapse:collapse;font-size:9pt}
.pp td{padding:1.6mm 3mm;border-top:0.5pt solid #e2e8f0;vertical-align:top}.pp td:first-child{width:28mm;font:700 7.4pt M;letter-spacing:.6pt;text-transform:uppercase;color:#0f766e;background:#f0fdfa}
.pp tr:first-child td{border-top:none}.icd{font:700 8pt M;background:#e2e8f0;color:#334155;border-radius:1.5mm;padding:.5mm 2mm;margin-left:2mm;vertical-align:middle}
.catl{font:700 8pt M;letter-spacing:1.5pt;text-transform:uppercase;color:#14b8a6;margin-bottom:1mm}"""
def case(i,c):
    th=c['name'] in THEME or c['name'].replace('&amp;','&') in THEME
    q1=f'Erklären Sie kurz: {c["name"]}.' if th else f'Stellen Sie sich vor, Sie betreuen einen Patienten mit {c["name"]}. Erklären Sie kurz das Krankheitsbild.'
    q2='Worauf achten Sie, welche Probleme können auftreten?' if th else 'Welche Symptome würden Sie beobachten?'
    q3='Welche Maßnahmen und Instrumente kennen Sie?' if th else 'Welche Diagnostik und Therapie erwarten Sie?'
    l1,l2=('Instrumente','Maßnahmen') if th else ('Diagnostik','Therapie')
    h=f'<div class="case"><div class="catl">{c["cat"]}</div><h2><span class="n">{i}</span>{c["name"].replace("&","&amp;").replace("&amp;amp;","&amp;")}{"<span class=icd>ICD "+c["icd"]+"</span>" if c["icd"] else ""}</h2>'
    h+=f'<div class="qa">„{q1}"</div><div class="ans">{c["defi"]}</div>'
    h+=f'<div class="qa">„{q2}"</div><div class="ans"><ul>'+''.join(f'<li>{s}</li>' for s in c['sym'])+'</ul></div>'
    h+=f'<div class="qa">„{q3}"</div><div class="grid2"><div class="card t" style="margin:0"><h3 style="margin-top:0">{l1}</h3><ul>'+''.join(f'<li>{s}</li>' for s in c['diag'])+f'</ul></div><div class="card t" style="margin:0"><h3 style="margin-top:0">{l2}</h3><ul>'+''.join(f'<li>{s}</li>' for s in c['ther'])+'</ul></div></div>'
    h+='<div class="qa">„Formulieren Sie eine Pflegeplanung."</div>'
    for p in c['pp']:
        h+='<div class="pp"><table>'+''.join(f'<tr><td>{k.replace("Massnahmen","Maßnahmen")}</td><td>{("<ul>"+"".join("<li>"+x+"</li>" for x in v.split(" · "))+"</ul>") if k=="Massnahmen" else v}</td></tr>' for k,v in p.items())+'</table></div>'
    return h+'</div>'
order=[]
for c in cases: order.append(c)
b=cover('Prüfungstraining · Mündliche Prüfung','Mündliche<br>Prüfungs&shy;simulation',f'{len(cases)} Fallbeispiele im echten Prüfungsdialog – Prüferfrage, Musterantwort und komplette Pflegeplanung nach PESR und SMART.',
 ['Innere','Chirurgie','Neurologie','Onkologie','Urologie','Gynäkologie','HNO','Psychologie'],[(str(len(cases)),'Fallbeispiele'),('8','Fachbereiche'),('PESR','Pflegeplanung')],
 'Lernhilfe zur Prüfungsvorbereitung. Musterantworten zeigen einen möglichen Lösungsweg – maßgeblich sind deine Lehrinhalte und die Anforderungen deiner Prüfer.',
 toc=['So übst du mit diesem Heft','Fallbeispiele nach Fachbereich'])
b+='<h2>So übst du mit diesem Heft</h2><p class="lead">Die mündliche Prüfung läuft fast immer gleich ab: Krankheitsbild, Symptome, Diagnostik und Therapie, Pflegeplanung.</p>'
b+='<div class="grid2">'+''.join(f'<div class="card t"><h3 style="margin-top:0">{a}</h3>{t}</div>' for a,t in [('1 · Zu zweit üben','Eine Person liest die Prüferfrage vor, die andere antwortet frei. Danach mit der Musterantwort vergleichen.'),('2 · Laut sprechen','Antworte immer laut und in ganzen Sätzen. So trainierst du genau das, was in der Prüfung zählt.'),('3 · Struktur nutzen','Definition → Symptome → Diagnostik/Therapie → Pflege. Diese Reihenfolge gibt dir Sicherheit.'),('4 · PESR anwenden','Pflegeproblem: P = Problem · E = Einflussfaktoren · S = Symptome. Ressourcen immer mitnennen!')])+'</div>'
b+='<h3>Fallbeispiele</h3><div style="column-count:2;column-gap:8mm;font:600 9.3pt M;color:#0b1a35">'+''.join(f'<div style="padding:1.2mm 0;border-bottom:0.5pt solid #e2e8f0"><span style="color:#14b8a6">{i+1:02d}</span>&nbsp; {c["name"]} <span style="color:#94a3b8;font-weight:600">· {c["cat"]}</span></div>' for i,c in enumerate(cases))+'</div>'
b+=''.join(case(i+1,c) for i,c in enumerate(cases))+endbox()
build('/mnt/user-data/outputs/PLAN-NRW_Muendliche-Pruefungssimulation.pdf','Mündliche Prüfungssimulation',b,X)
print(len(cases),[ (c['name'],len(c['pp']),len(c['sym'])) for c in cases])
