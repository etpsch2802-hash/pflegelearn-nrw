from base import *
import sys
# Pflege beim intubierten Patienten – Inhalte aus dem Docs-Entwurf (fachlich freigegeben von P. Schenkelberger, 28.10.2026)
OUT=sys.argv[1] if len(sys.argv)>1 else '/mnt/user-data/outputs/PLAN-NRW_Intubierter-Patient.pdf'
X=""".sec{break-inside:avoid;margin-bottom:4mm}.sec h3{margin-top:0;display:flex;align-items:center;gap:2mm}
.sec h3 i{font-style:normal;display:inline-block;width:6mm;height:6mm;border-radius:1.5mm;background:#14b8a6;color:#fff;text-align:center;font:800 8pt/6mm M}
table.ov{width:100%;border-collapse:collapse;font-size:9pt;break-inside:avoid}
table.ov th{background:#0b1a35;color:#fff;font:700 8.5pt M;text-align:left;padding:2mm}
table.ov td{padding:1.6mm 2mm;border-bottom:0.5pt solid #e2e8f0;vertical-align:top}
table.ov td:first-child{font-weight:700;color:#0b1a35;width:22%}
table.ov td:last-child{width:24%;color:#475569}
table.ov tr:nth-child(even) td{background:#f8fafc}
.dopes{display:grid;grid-template-columns:repeat(5,1fr);gap:2mm;break-inside:avoid;margin:2mm 0 3mm}
.dopes div{border-radius:3mm;background:#fef2f2;border-top:2mm solid #dc2626;padding:2.5mm;text-align:center;font:600 8.5pt M;color:#0b1a35}
.dopes b{display:block;font:800 20pt M;color:#dc2626;line-height:1.1}
.pp{border:0.8pt solid #e2e8f0;border-left:2mm solid #14b8a6;border-radius:3mm;padding:3.5mm 4.5mm;margin-bottom:4mm;break-inside:avoid}
.pp h4{margin:0 0 2mm;font:800 11pt M;color:#0b1a35}
.pp .r{display:grid;grid-template-columns:24mm 1fr;gap:1mm 3mm;font-size:9.3pt}
.pp .r>b{font:700 8.5pt M;color:#0284c7;padding-top:.4mm}
.merk{border-radius:4mm;background:linear-gradient(90deg,#14b8a6,#0284c7);color:#fff;padding:5mm 6mm;font:800 12.5pt/1.35 M;text-align:center;break-inside:avoid;margin:3mm 0 4mm}
.mc{border:0.8pt solid #e2e8f0;border-radius:3mm;padding:3mm 4mm;margin-bottom:3mm;break-inside:avoid}
.mc b.q{display:block;font:700 9.5pt M;color:#0b1a35;margin-bottom:1.5mm}
.mc span{display:inline-block;border:0.6pt solid #cbd5e1;border-radius:10mm;padding:.8mm 3mm;margin:0 1.5mm 1.5mm 0;font-size:9pt}
.loes{font-size:8.5pt;color:#64748b;margin-top:1mm}"""
def ul(items): return '<ul>'+''.join(f'<li>{x}</li>' for x in items)+'</ul>'

body=cover('Gratis-Lernhilfe · Intensivpflege','Pflege beim<br>intubierten Patienten',
 'Tubus, Cuffdruck, VAP-Prophylaxe, Kommunikation und der Notfall-Check DOPES – kompakt für Examen und Station. Mit fertiger Musterpflegeplanung.',
 ['Tubus','Cuffdruck','VAP-Bündel','Kommunikation','DOPES','Pflegeplanung'],
 [('20–30','cmH₂O Cuffdruck'),('30–45°','Oberkörper hoch'),('3','Pflegeprobleme')],
 'Lernhilfe, ersetzt keine ärztliche Anordnung und keinen Hausstandard. Es gelten immer die Standards deiner Einrichtung.',
 toc=['Pflege im Überblick','VAP-Prophylaxe','Kommunikation','Notfall-Check DOPES','Komplikationen & Prüfungswissen','Musterpflegeplanung','Prüfungsfragen'])

body+='<h2><span class="n">1</span>Pflege im Überblick</h2><p class="lead">Ziel ist ein sicherer Atemweg ohne beatmungsassoziierte Pneumonie (VAP), Tubusdislokation, Druckschäden oder Delir.</p>'
R=[('Tubuslage','cm-Markierung an Zahnreihe/Mundwinkel mit Dokumentation vergleichen, seitengleiche Belüftung, Kapnografie-Kurve','jede Schicht, nach Lagerung und Transport'),
 ('Fixierung','fest, aber ohne Druck; Beißschutz bei Unruhe; orale Lage nach Standard umlagern','jede Schicht'),
 ('Cuffdruck','20–30 cmH₂O mit Cuffdruckmesser','mind. 1× pro Schicht und nach Umlagerung'),
 ('Oberkörper','30–45° hochlagern, wenn nichts dagegen spricht','durchgehend'),
 ('Mund und Zähne','Zähne putzen, Schleimhaut feucht halten, Lippen pflegen','mehrmals täglich nach Hausstandard'),
 ('Absaugen','nach Bedarf, nicht nach Uhrzeit; subglottisch, wenn der Tubus es kann','bei Bedarf'),
 ('Augen','Lidschluss prüfen, Hornhaut feucht halten und schützen','jede Schicht'),
 ('Haut','Druckstellen an Lippe, Mundwinkel und an den Ohren (Bänder)','jede Schicht'),
 ('Bewusstsein, Schmerz, Delir','RASS, BPS, CAM-ICU','mind. alle 8 Stunden')]
body+='<table class="ov"><tr><th>Bereich</th><th>Worauf du achtest</th><th>Wie oft</th></tr>'+''.join(f'<tr><td>{a}</td><td>{b}</td><td>{c}</td></tr>' for a,b,c in R)+'</table>'

body+='<h2 style="margin-top:6mm"><span class="n">2</span>VAP-Prophylaxe</h2><p class="lead">Das Bündel wirkt nur zusammen – jede Maßnahme jeden Tag.</p>'
body+='<div class="sec card t">'+ul(['<b>Händehygiene</b> vor und nach jedem Kontakt','<b>Oberkörper 30–45°</b>','<b>Cuffdruck 20–30 cmH₂O</b>','<b>Subglottische Sekretabsaugung</b>, wenn vorhanden','<b>Mundpflege mit Zähneputzen</b> statt routinemäßiger Chlorhexidin-Spülung','Täglich ärztlich prüfen: Sedierung reduzieren, Spontanatmung, Extubation möglich?','<b>Kondenswasser</b> im Schlauch nie Richtung Patient laufen lassen','Beatmungsschläuche <b>nicht routinemäßig</b> wechseln, nur bei Verschmutzung oder Defekt'])+'</div>'
body+='<h2><span class="n">3</span>Kommunikation</h2>'
body+='<div class="sec card t"><p style="margin:0 0 2mm">Intubierte können nicht sprechen, hören aber oft auch unter Sedierung mit.</p>'+ul(['Jede Maßnahme vorher ankündigen','Ja-Nein-Fragen stellen, Zeichen im Team weitergeben','Buchstaben- oder Schreibtafel bereitlegen','Klingel in Reichweite, Brille und Hörgerät anlegen','Angehörige einbeziehen'])+'</div>'
body+='<h2><span class="n">4</span>Notfall-Check DOPES</h2><p class="lead">Plötzliche Verschlechterung? Diese fünf Ursachen zuerst prüfen.</p>'
body+='<div class="dopes">'+''.join(f'<div><b>{a}</b>{b}</div>' for a,b in [('D','Dislokation des Tubus'),('O','Obstruktion: Sekret, Abknicken, Beißen'),('P','Pneumothorax'),('E','Equipment: Gerät, Schläuche, O₂'),('S','Stacking: Air-Trapping')])+'</div>'
body+='<div class="note"><b>Sofort Hilfe holen.</b> Bei unklarer Ursache vom Respirator trennen und mit Beatmungsbeutel und 100 % Sauerstoff beatmen.</div>'

body+='<h2 style="margin-top:6mm"><span class="n">5</span>Komplikationen &amp; Prüfungswissen</h2>'
body+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">Komplikationen</h3>'+ul(['VAP','Ungeplante Extubation','Tubusobstruktion','Druckschäden an Lippe und Trachea','Stille Aspiration','Delir','Muskelabbau'])+'</div>'
body+='<div class="card t"><h3 style="margin-top:0">Das fragen Prüfer</h3>'+ul(['Cuffdruck 20–30 cmH₂O','Oberkörper 30–45°','Absaugen nach Bedarf','Tubuslage über die cm-Markierung kontrollieren und dokumentieren','Plötzliche Verschlechterung → DOPES'])+'</div></div>'
body+='<div class="merk">Tubus fest, Cuff im Ziel, Kopf hoch, Mund sauber –<br>und jede Maßnahme ansagen.</div>'

body+='<h2 class="pb"><span class="n">6</span>Musterpflegeplanung</h2><p class="lead">Nach PESR – immer an den einzelnen Menschen anpassen.</p>'
PP=[('1 · Gefahr einer beatmungsassoziierten Pneumonie',
  'Gefahr einer VAP infolge Endotrachealtubus, Sedierung und eingeschränktem Hustenstoß','Kreislauf stabil, toleriert Oberkörperhochlage',
  'keine Zeichen einer Pneumonie bis zur Extubation (Temperatur, Sekret und Oxygenierung unverändert)',
  ['Oberkörper 30–45° hochlagern','Cuffdruck mind. 1× pro Schicht messen, Ziel 20–30 cmH₂O','Zähne putzen und Mundpflege nach Hausstandard','Absaugen nach Bedarf, subglottisch absaugen, wenn vorhanden','Kondenswasser vom Patienten weg ableiten','Sedierung und Extubationsbereitschaft täglich mit dem Arzt besprechen'],
  'jede Schicht Temperatur, Sekret (Menge, Farbe, Geruch), Auskultation und Beatmungswerte dokumentieren'),
 ('2 · Beeinträchtigte verbale Kommunikation',
  'kann sich nicht sprachlich mitteilen infolge Intubation, erkennbar an Unruhe, Gesten und Sprechversuchen','wach (RASS 0 bis −1), kann nicken und mit Hilfe schreiben',
  'teilt innerhalb von 24 Stunden Schmerz, Durst und Lagerungswunsch über Ja-Nein-Zeichen oder Tafel mit',
  ['Jede Maßnahme vorher ankündigen','Ja-Nein-Zeichen vereinbaren und im Team weitergeben','Buchstaben- oder Schreibtafel bereitlegen','Klingel in Reichweite, Brille und Hörgerät anlegen','Angehörige einbeziehen'],
  'jede Schicht prüfen, ob Bedürfnisse verstanden werden; Schmerz mit BPS erfassen'),
 ('3 · Gefahr einer Hautschädigung durch Tubus und Fixierung',
  'Gefahr eines Druckschadens an Lippe, Mundwinkel und Ohren infolge Tubus und Fixierband','Haut und Schleimhaut aktuell intakt',
  'Haut und Schleimhaut bleiben bis zur Extubation intakt',
  ['Fixierung jede Schicht auf Druck prüfen','Orale Tubuslage nach Standard umlagern, dabei cm-Markierung kontrollieren','Gefährdete Stellen polstern','Lippen feucht halten und pflegen'],
  'jede Schicht Haut an Lippe, Mundwinkel und Ohren inspizieren und dokumentieren')]
for t,p,r,z,m,e in PP:
    body+=f'<div class="pp"><h4>{t}</h4><div class="r"><b>Problem</b><div>{p}</div><b>Ressourcen</b><div>{r}</div><b>Ziel</b><div>{z}</div><b>Maßnahmen</b><div>{ul(m)}</div><b>Evaluation</b><div>{e}</div></div></div>'

body+='<h2 class="pb"><span class="n">7</span>Prüfungsfragen</h2><p class="lead">Lösungen unten auf der Seite.</p>'
Q=[('Welcher Cuffdruck wird angestrebt?',['5–10 cmH₂O','20–30 cmH₂O','40–50 cmH₂O','so hoch wie möglich'],'B'),
   ('Wofür steht das P in DOPES?',['Puls','Pupillen','Pneumothorax','PEEP'],'C'),
   ('Wann wird ein intubierter Patient abgesaugt?',['stündlich','einmal pro Schicht','nur vor der Visite','nach Bedarf'],'D')]
for i,(q,o,_) in enumerate(Q):
    body+=f'<div class="mc"><b class="q">{i+1}. {q}</b>'+''.join(f'<span>{"ABCD"[j]}) {x}</span>' for j,x in enumerate(o))+'</div>'
body+='<div class="loes">Lösungen: '+' · '.join(f'{i+1}{s}' for i,(_,_,s) in enumerate(Q))+'</div>'
body+='<div class="tip" style="margin-top:4mm">Mehr üben? In der PLAN-App findest du Prüfungsfragen zu Beatmung und Intensiv, Absaugen, Weaning und Sedierung – mit Erklärungen.</div>'
body+=endbox()
build(OUT,'Pflege beim intubierten Patienten',body,X)
