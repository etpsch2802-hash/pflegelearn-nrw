from base import *
# Wunddoku-Spickzettel – Wunden sicher beschreiben (DNQP + TIME). Eigenständiger Inhalt.
X=""".sec{break-inside:avoid;margin-bottom:4mm}.sec h3{margin-top:0;display:flex;align-items:center;gap:2mm}
.sec h3 i{font-style:normal;display:inline-block;width:6mm;height:6mm;border-radius:1.5mm;background:#14b8a6;color:#fff;text-align:center;font:800 8pt/6mm M}
table.cmp{width:100%;border-collapse:collapse;font-size:9pt}
table.cmp th{background:#0b1a35;color:#fff;font:700 8pt M;text-align:left;padding:2mm}
table.cmp td{padding:1.6mm 2mm;border-bottom:0.5pt solid #e2e8f0;vertical-align:top}
table.cmp td:first-child{font:700 8.6pt M;color:#0b1a35;width:24%}
table.cmp tr:nth-child(even) td{background:#f8fafc}
.dot{display:inline-block;width:3.2mm;height:3.2mm;border-radius:50%;vertical-align:-0.5mm;margin-right:1.5mm;border:0.5pt solid #94a3b8}
.time{display:grid;grid-template-columns:1fr 1fr;gap:3mm;break-inside:avoid}
.time div{border-radius:3mm;padding:3mm 4mm;background:#f0fdfa;border-left:2mm solid #14b8a6;break-inside:avoid}
.time b{font:800 14pt M;color:#0b1a35;margin-right:2mm}
.beispiel{background:#f1f5f9;border-radius:3mm;padding:4mm 5mm;font-size:9.6pt;line-height:1.55;border-left:2mm solid #0284c7;break-inside:avoid}"""
def sec(n,t,rows):
    tr=''.join(f'<tr><td>{a}</td><td>{b}</td></tr>' for a,b in rows)
    return f'<div class="sec card t"><h3><i>{n}</i>{t}</h3><table class="kv">{tr}</table></div>'

body=cover('Gratis-Lernhilfe · Wundmanagement','Wunddoku-<br>Spickzettel',
 'Wunden sicher beschreiben, messen und dokumentieren – nach dem DNQP-Expertenstandard chronische Wunden und dem TIME-Prinzip.',
 ['Assessment','Messen','Wundgrund','Exsudat','Wundrand','TIME'],
 [('12','Doku-Kriterien'),('1','Musterformulierung'),('A4','druckfertig')],
 'Lernhilfe für Ausbildung und Prüfung. Wundversorgung, Debridement und Materialwahl nach ärztlicher Anordnung, Hausstandard und ggf. Wundexpertin/-experte.',
 toc=['Was in jede Wunddoku gehört','Richtig messen','Wundgrund beurteilen','Exsudat, Rand &amp; Umgebung','TIME-Prinzip &amp; Infektzeichen','Musterformulierung &amp; No-Gos'])

body+='<h2>Wunden sicher dokumentieren</h2><p class="lead">Beschreiben statt bewerten: Wer deine Doku liest, muss die Wunde vor Augen haben – ohne sie zu sehen.</p>'
body+=sec('1','Was in jede Wunddoku gehört',[
 ('Wundart &amp; Ursache','z. B. Dekubitus Kat. 3, Ulcus cruris venosum, diabetisches Fußsyndrom, OP-Wunde'),
 ('Lokalisation','Genaue Körperstelle, Seite (rechts/links), ggf. Körperskizze'),
 ('Wunddauer &amp; Rezidive','Seit wann besteht die Wunde? Gab es sie schon einmal?'),
 ('Größe','Länge × Breite × Tiefe in cm, dazu Taschen/Unterminierungen'),
 ('Wundgrund','Gewebearten in Prozent (z. B. 70 % Granulation, 30 % Fibrin)'),
 ('Exsudat','Menge, Farbe, Konsistenz'),
 ('Geruch','kein / leicht / stark – nach dem Reinigen beurteilen'),
 ('Wundrand','z. B. mazeriert, unterminiert, wulstig, gerötet'),
 ('Wundumgebung','Haut um die Wunde: Rötung, Ödem, Ekzem, Trockenheit'),
 ('Infektionszeichen','Rötung, Überwärmung, Schwellung, Schmerz, Geruch, Fieber'),
 ('Schmerz','z. B. NRS 0–10, in Ruhe und beim Verbandwechsel'),
 ('Versorgung','Material, Wechselintervall, Hautschutz – Datum und Handzeichen')])
body+='<div class="tip"><b>Wundfoto:</b> nur mit Einwilligung, immer mit Maßstab und Datum, möglichst gleiche Position und gleiches Licht – so werden Verläufe vergleichbar.</div>'

body+='<h2 style="margin-top:6mm">Richtig messen</h2><p class="lead">Immer gleich messen, sonst sind Verläufe wertlos.</p>'
body+=sec('2','Messen nach dem Uhrzeigerprinzip',[
 ('Orientierung','Kopf der Person = 12 Uhr, Füße = 6 Uhr'),
 ('Länge','Größte Ausdehnung in Kopf-Fuß-Richtung (12 → 6 Uhr)'),
 ('Breite','Größte Ausdehnung rechtwinklig dazu (3 → 9 Uhr)'),
 ('Tiefe','Mit sterilem Watteträger an der tiefsten Stelle, Länge am Träger ablesen'),
 ('Taschen','Richtung als Uhrzeit + Tiefe in cm angeben, z. B. „Tasche bei 2 Uhr, 1,5 cm“'),
 ('Hilfsmittel','Einmal-Papierlineal oder Messfolie – nie wiederverwenden')])

body+=sec('3','Wundgrund beurteilen',[
 ('<span class="dot" style="background:#111827"></span>Schwarz','Nekrose – abgestorbenes Gewebe, Debridement nach ärztlicher Anordnung'),
 ('<span class="dot" style="background:#facc15"></span>Gelb','Fibrinbeläge – müssen gelöst werden, damit Granulation entsteht'),
 ('<span class="dot" style="background:#dc2626"></span>Rot','Granulation – gesundes, körniges Gewebe, schützen und feucht halten'),
 ('<span class="dot" style="background:#f9a8d4"></span>Rosa','Epithelisierung – Wunde schließt sich vom Rand her'),
 ('<span class="dot" style="background:#16a34a"></span>Grünlich','Verdacht auf Infektion (z. B. Pseudomonas) – melden, Abstrich nach Anordnung')])

body+='<h2>Exsudat, Rand &amp; Umgebung</h2>'
body+='''<table class="cmp"><tr><th>Exsudat</th><th>So sieht es aus</th><th>Was es bedeuten kann</th></tr>
<tr><td>Serös</td><td>klar, wässrig, hellgelb</td><td>normale Wundheilung</td></tr>
<tr><td>Serös-blutig</td><td>rosa, dünnflüssig</td><td>häufig bei frischen Wunden</td></tr>
<tr><td>Blutig</td><td>rot</td><td>Gefäßverletzung, z. B. beim Verbandwechsel</td></tr>
<tr><td>Eitrig</td><td>trüb, gelb-grün, oft riechend</td><td>Hinweis auf Infektion – melden</td></tr></table>'''
body+='<p style="font-size:9pt;color:#475569;margin:2mm 0 4mm">Menge immer mit angeben: kein · wenig · mäßig · viel (z. B. „Sekundärverband durchfeuchtet“).</p>'
body+=sec('4','Wundrand &amp; Wundumgebung',[
 ('Mazeriert','weißlich, aufgeweicht – zu viel Feuchtigkeit, Hautschutz und saugfähiger Verband'),
 ('Unterminiert','Wundrand ist unterhöhlt – Taschen messen und dokumentieren'),
 ('Wulstig / eingerollt','Rand wächst nicht weiter – Hinweis auf stagnierende Heilung'),
 ('Gerötet / überwärmt','möglicher Infekt – beobachten, melden'),
 ('Trocken / schuppig','Hautpflege der Umgebung nach Standard')])

body+='<h2 class="pb">TIME-Prinzip</h2><p class="lead">International gebräuchliches Schema, um das Wundbett zu beurteilen und gezielt zu behandeln.</p>'
body+='''<div class="time">
<div><b>T</b><strong>Tissue – Gewebe</strong><br>Ist nicht vitales Gewebe vorhanden (Nekrose, Fibrin)? Debridement nach Anordnung.</div>
<div><b>I</b><strong>Infection / Inflammation</strong><br>Gibt es Zeichen einer Infektion oder Entzündung? Erkennen, melden, behandeln.</div>
<div><b>M</b><strong>Moisture – Feuchtigkeit</strong><br>Ist das Wundmilieu zu trocken oder zu nass? Feuchtigkeitsbalance herstellen.</div>
<div><b>E</b><strong>Edge – Wundrand</strong><br>Wächst der Rand vor? Rand und Umgebung schützen, Stagnation erkennen.</div></div>'''
body+='<div class="sec card t" style="margin-top:5mm"><h3><i>5</i>Infektionszeichen – sofort melden</h3><ul><li>Rötung, Überwärmung, Schwellung und zunehmender Schmerz</li><li>Mehr oder eitriges Exsudat, neuer oder stärkerer Geruch</li><li>Wunde vergrößert sich, Granulation wird brüchig oder blutet leicht</li><li>Fieber oder allgemeine Verschlechterung – an Sepsis denken!</li></ul></div>'

body+='<h2>Musterformulierung</h2>'
body+='<div class="beispiel">„Dekubitus Kategorie 3 sakral, 4,0 × 3,0 × 0,5 cm, Tasche bei 2 Uhr 1,0 cm. Wundgrund 70 % Granulation, 30 % Fibrin. Mäßig seröses Exsudat, kein Geruch nach Reinigung. Wundrand bei 12 Uhr mazeriert, Umgebung reizlos. NRS 2 beim Verbandwechsel. Versorgung nach Wundplan, nächster Wechsel in 3 Tagen.“ <span style="color:#64748b">– Datum, Uhrzeit, Handzeichen</span></div>'
body+='<div class="note" style="margin-top:4mm"><b>No-Gos:</b> „Wunde sieht besser aus“ ohne Maße · Bewertungen ohne Beobachtung („infiziert“) · Schätzen statt Messen · fehlendes Datum oder Handzeichen · jedes Mal anders messen.</div>'
body+='<p style="font-size:8.6pt;color:#64748b;margin-top:4mm">Grundlage: DNQP-Expertenstandard „Pflege von Menschen mit chronischen Wunden“; TIME-Prinzip der Wundbettvorbereitung.</p>'
body+=endbox()
build('/mnt/user-data/outputs/PLAN-NRW_Wunddoku-Spickzettel.pdf','Wunddoku-Spickzettel',body,X)
