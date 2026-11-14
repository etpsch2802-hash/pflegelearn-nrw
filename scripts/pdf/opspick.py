from base import *
import sys
# OP-Spickzettel ATA/OTA – ENTWURF (14.11.2026, ATA/OTA-Ausbau Teil 4). Inhalte wie die Entwurfsfragen,
# Handgriffe und Fälle (data/entwurf/ataota.js, IIFEs am Ende von index.html). Fachliche Freigabe P. Schenkelberger offen.
# Ausgabe ins private Repo, wird erst nach Go in PAKETE/L/PK/links.html registriert.
OUT=sys.argv[1] if len(sys.argv)>1 else '../plan-nrw-privat/gratis-pdfs/PLAN-NRW_OP-Spickzettel-ATA-OTA.pdf'
X=""".sec{break-inside:avoid;margin-bottom:4mm}
table.ov{width:100%;border-collapse:collapse;font-size:9pt;break-inside:avoid;margin-bottom:3mm}
table.ov th{background:#0b1a35;color:#fff;font:700 8.5pt M;text-align:left;padding:2mm}
table.ov td{padding:1.6mm 2mm;border-bottom:0.5pt solid #e2e8f0;vertical-align:top}
table.ov td:first-child{font-weight:700;color:#0b1a35;width:30%}
table.ov tr:nth-child(even) td{background:#f8fafc}
.nf{border:0.8pt solid #fecaca;border-left:2mm solid #dc2626;border-radius:3mm;padding:3mm 4mm;margin-bottom:3mm;break-inside:avoid}
.nf h4{margin:0 0 1.5mm;font:800 10.5pt M;color:#b91c1c}
.merk{border-radius:4mm;background:linear-gradient(90deg,#14b8a6,#0284c7);color:#fff;padding:5mm 6mm;font:800 12pt/1.35 M;text-align:center;break-inside:avoid;margin:3mm 0 4mm}
.mc{border:0.8pt solid #e2e8f0;border-radius:3mm;padding:3mm 4mm;margin-bottom:3mm;break-inside:avoid}
.mc b.q{display:block;font:700 9.5pt M;color:#0b1a35;margin-bottom:1.5mm}
.mc span{display:inline-block;border:0.6pt solid #cbd5e1;border-radius:10mm;padding:.8mm 3mm;margin:0 1.5mm 1.5mm 0;font-size:9pt}
.loes{font-size:8.5pt;color:#64748b;margin-top:1mm}"""
def ul(items): return '<ul>'+''.join(f'<li>{x}</li>' for x in items)+'</ul>'
def tab(kopf,zeilen): return '<table class="ov"><tr>'+''.join(f'<th>{k}</th>' for k in kopf)+'</tr>'+''.join('<tr>'+''.join(f'<td>{c}</td>' for c in z)+'</tr>' for z in zeilen)+'</table>'

body=cover('Gratis-Lernhilfe · ATA & OTA','OP-Spickzettel<br>für ATA und OTA',
 'Narkose, Monitoring, Notfälle im OP, Sterilität, Lagerung, Zählkontrolle und Team-Time-out – kompakt für Ausbildung und Prüfung.',
 ['Narkose','Monitoring','Notfälle','Sterilität','Lagerung','Checkliste'],
 [('20–30','cmH₂O Cuffdruck'),('35–45','mmHg etCO₂'),('≥ 0,9','TOF vor Extubation')],
 'Lernhilfe, ersetzt keine ärztliche Anordnung und keinen Hausstandard. Es gelten immer die Standards deiner Einrichtung.',
 toc=['Narkose kompakt','Monitoring: Werte & Fallstricke','Notfälle im OP','Steril arbeiten','Lagerung','Zählkontrolle & HF-Chirurgie','WHO-Checkliste','Prüfungsfragen'])

body+='<h2><span class="n">1</span>Narkose kompakt</h2>'
body+=tab(['Begriff','Kurz erklärt'],[
 ('Prämedikation','Medikamentöse Vorbereitung vor der Narkose, z. B. zur Beruhigung, plus Aufklärungsgespräch'),
 ('Einleitung','Übergang vom Wachzustand in die Narkose, danach Atemwegssicherung'),
 ('Analgosedierung','Schmerzausschaltung und Beruhigung, meist bei erhaltener Spontanatmung'),
 ('Volatile Anästhetika','Narkosegase wie Sevofluran – können eine maligne Hyperthermie auslösen'),
 ('Spinalanästhesie','Sympathikusblockade → Gefäße weit → Blutdruckabfall möglich'),
 ('Standby','Anästhesie überwacht einen Eingriff in Lokalanästhesie')])
body+='<div class="sec card t"><h3 style="margin-top:0">Einleitung bei Aspirationsgefahr (RSI)</h3>'+ul([
 'Absaugung <b>läuft</b> und liegt bereit, Material für den schwierigen Atemweg da',
 'Nach Anordnung Magen über Magensonde entlasten',
 'Mit <b>dicht sitzender Maske</b> und 100 % Sauerstoff präoxygenieren',
 'Keine routinemäßige Zwischenbeatmung, Tubus <b>sofort blocken</b>, Lage per <b>Kapnographie</b> bestätigen'])+'</div>'
body+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">Antagonisten</h3>'+ul(['Opioide → <b>Naloxon</b>','Benzodiazepine → <b>Flumazenil</b>','Rocuronium/Vecuronium → <b>Sugammadex</b>','Wirkung kann kürzer sein als die des Medikaments → weiter überwachen'])+'</div>'
body+='<div class="card t"><h3 style="margin-top:0">Atemweg</h3>'+ul(['Cuffdruck <b>20–30 cmH₂O</b>','Mallampati = Sicht in den Rachen (Intubationsbedingungen)','ASA = Narkoserisiko nach Vorerkrankungen','Lachgas vergrößert luftgefüllte Räume (Pneumothorax, Ileus)'])+'</div></div>'

body+='<h2 class="pb"><span class="n">2</span>Monitoring: Werte &amp; Fallstricke</h2>'
body+=tab(['Messung','Orientierung','Achtung'],[
 ('SpO₂','etwa 95–100 % (Lungengesunde)','Erst Patient, dann Sensor prüfen'),
 ('etCO₂','35–45 mmHg','Plötzlich weg: Diskonnektion/Tubus? Unerklärt hoch: an MH denken'),
 ('NIBP','Manschette passend zum Arm','Zu klein = zu hohe Werte'),
 ('Invasiver Blutdruck','Nullpunkt auf Höhe rechter Vorhof','Gedämpfte Kurve: Luft, Knick, Gerinnsel'),
 ('Relaxometrie (TOF)','Quotient ≥ 0,9 vor Extubation','Restrelaxierung → Aspiration, Atemschwäche')])

body+='<h2><span class="n">3</span>Notfälle im OP</h2>'
NF=[('Maligne Hyperthermie','Unerklärter etCO₂-Anstieg, Tachykardie, Muskelsteife, später Fieber. <b>Trigger stoppen</b> (Narkosegas, Succinylcholin), 100 % O₂ mit hohem Fluss, Hilfe rufen, <b>Dantrolen</b> nach Anordnung (mehrere Helfer zum Auflösen), kühlen, Kalium/BGA.'),
 ('Anaphylaxie','Hautrötung, Blutdruckabfall, Bronchospasmus kurz nach Medikamenten. Auslöser stoppen, Hilfe, <b>Adrenalin</b> nach Anordnung, 100 % O₂, Volumen. Antihistaminikum/Kortison nur ergänzend. Danach dokumentieren und abklären.'),
 ('Laryngospasmus','Einatemgeräusch (Stridor), Einziehungen, Sättigungsabfall nach Extubation. Absaugen, <b>100 % O₂ mit Maske und Überdruck</b>, Arzt sofort.'),
 ('Lokalanästhetika-Vergiftung (LAST)','Zufuhr stoppen, Hilfe, Atemweg, Krämpfe behandeln, ggf. Reanimation. Spezifisch: <b>Lipidemulsion 20 %</b> nach Anordnung.')]
body+=''.join(f'<div class="nf"><h4>{t}</h4>{x}</div>' for t,x in NF)

body+='<h2 class="pb"><span class="n">4</span>Steril arbeiten</h2>'
body+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">Chirurgische Händedesinfektion</h3>'+ul(['Kein Schmuck, Nägel kurz, ohne Lack','Waschen nur zu Dienstbeginn und bei Verschmutzung, gut abtrocknen','Bürste allenfalls für Nägel','Bis zum Ellenbogen benetzen, <b>Einwirkzeit nach Herstellerangabe</b>','Hände über Ellenbogenhöhe, an der Luft trocknen'])+'</div>'
body+='<div class="card t"><h3 style="margin-top:0">Steril einkleiden</h3>'+ul(['Kittel innen anfassen, fallen lassen','Geschlossen: Hände bleiben im Bündchen','Springer schließt nur innen','Steril: <b>vorn bis Tischhöhe und Ärmel</b>','Loch im Handschuh → sofort wechseln'])+'</div></div>'
body+='<div class="sec card t"><h3 style="margin-top:0">Instrumententisch</h3>'+ul(['Sterilgut prüfen: Verpackung heil und trocken, Indikator, Verfallsdatum','Tisch vollständig steril abdecken, Verpackungsrand gilt als unsteril','Instrumente in OP-Reihenfolge ordnen','Nie unbeaufsichtigt lassen oder steril abdecken'])+'</div>'

body+='<h2><span class="n">5</span>Lagerung</h2>'
body+=tab(['Lagerung','Typisch für','Gefährdet'],[
 ('Rückenlage','viele Bauch-Eingriffe','Fersen, Hinterkopf'),
 ('Steinschnittlage','Urologie, Gynäkologie, Proktologie','<b>N. peroneus</b> am Wadenbeinköpfchen'),
 ('Bauchlage','z. B. Wirbelsäule','Augen, Gesicht, Atmung'),
 ('Seitenlage','z. B. Hüfte, Niere','unten liegender Arm → Thoraxrolle'),
 ('Armausleger','Zugänge','<b>Plexus brachialis</b> → höchstens 90°')])
body+='<div class="note">Nach <b>jeder Umlagerung</b>: Polster, Zugänge, Tubus und Auflagepunkte neu prüfen. Beine aus der Steinschnittlage <b>langsam und gemeinsam</b> ablegen. Verantwortung: OP-Lagerung Operateur, Lagerung zur Einleitung Anästhesie – kontrolliert wird gemeinsam.</div>'

body+='<h2 class="pb"><span class="n">6</span>Zählkontrolle &amp; HF-Chirurgie</h2>'
body+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">Zählkontrolle</h3>'+ul(['Zu zweit, laut, dokumentiert – vor OP, vor Verschluss, am Ende','Differenz: Operateur <b>sofort</b> informieren, Verschluss anhalten','Systematisch suchen: Situs, Tisch, Abwurf, Boden, Wäsche','Ggf. Röntgen nach ärztlicher Entscheidung','Nie Zahlen anpassen'])+'</div>'
body+='<div class="card t"><h3 style="margin-top:0">Neutralelektrode</h3>'+ul(['Vollflächig auf trockene, gut durchblutete Muskulatur nahe dem OP-Gebiet','Nicht über Knochen, Narben oder Metallimplantaten','Stromweg nicht über Schrittmacher – Vorgehen ärztlich klären','Alkoholische Desinfektion vollständig trocknen lassen, keine Pfützen'])+'</div></div>'

body+='<h2><span class="n">7</span>WHO-Checkliste</h2>'
body+=tab(['Teil','Wann','Inhalt (Auszug)'],[
 ('Sign-in','vor der Narkoseeinleitung','Identität, Eingriff, Seite, Einwilligung, Allergien, Atemweg, Blutverlust'),
 ('Team-Time-out','unmittelbar vor dem Schnitt','Vorstellung, Patient/Eingriff/Seite, Antibiose (meist bis 60 Min. vorher), Bildgebung, kritische Punkte aller Berufsgruppen'),
 ('Sign-out','vor Verlassen des Saals','Zählung vollständig, Präparate beschriftet, Geräteprobleme, Übergabe')])
body+='<div class="merk">Unklarheit heißt immer: Stopp – klären – dann weiter.</div>'

body+='<h2 class="pb"><span class="n">8</span>Prüfungsfragen</h2><p class="lead">Lösungen unten auf der Seite.</p>'
Q=[('Welcher TOF-Quotient gilt als Voraussetzung für die Extubation?',['≥ 0,2','≥ 0,5','≥ 0,9','egal'],'C'),
   ('Welcher Nerv ist in der Steinschnittlage besonders gefährdet?',['N. facialis','N. peroneus','N. phrenicus','N. medianus'],'B'),
   ('Was ist das Mittel der Wahl bei maligner Hyperthermie?',['Dantrolen','Succinylcholin','Ketamin','Neostigmin'],'A'),
   ('Wann findet das Team-Time-out statt?',['Vor der Einleitung','Unmittelbar vor dem Schnitt','Nach dem Verschluss','Auf Station'],'B'),
   ('Welcher Bereich des sterilen Kittels gilt als steril?',['Rücken','Schultern','Vorn bis Tischhöhe und Ärmel','Alles bis zum Boden'],'C')]
for i,(q,o,_) in enumerate(Q):
    body+=f'<div class="mc"><b class="q">{i+1}. {q}</b>'+''.join(f'<span>{"ABCD"[j]}) {x}</span>' for j,x in enumerate(o))+'</div>'
body+='<div class="loes">Lösungen: '+' · '.join(f'{i+1}{s}' for i,(_,_,s) in enumerate(Q))+'</div>'
body+='<div class="tip" style="margin-top:4mm">Mehr üben? In der PLAN-App findest du Prüfungsfragen zu allen ATA- und OTA-Themen – mit Erklärungen.</div>'
body+=endbox()
build(OUT,'OP-Spickzettel für ATA und OTA',body,X)
