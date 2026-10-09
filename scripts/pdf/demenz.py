from base import *
# Demenzkarte – die 4 Demenzformen im Examen (Gratis-PDF zu /gratis/demenz)
X=""".p4 .card{padding:3mm 4mm;margin-bottom:3mm}.p4 li{margin:.3mm 0}.p4 .lead{margin-bottom:3mm}.p4 h2{margin-top:4mm}.end{margin-top:4mm}
.dz{break-inside:avoid;margin-bottom:4mm;padding:0;overflow:hidden}
.dz .top{display:flex;align-items:center;gap:3mm;padding:3mm 5mm;color:#fff}
.dz .top b{font:800 12pt M} .dz .top span{margin-left:auto;font:600 8pt M;opacity:.9}
.dz .in{padding:3mm 5mm 3.5mm}
.dz table.kv td:first-child{width:28%}
.falle{margin-top:2mm;background:#fef2f2;border-left:1.8mm solid #dc2626;border-radius:2mm;padding:2.2mm 3.5mm;font-size:9pt;color:#7f1d1d}
.falle b{font-family:M;font-weight:800}
table.cmp{width:100%;border-collapse:collapse;font-size:8.8pt;margin-bottom:3mm}
table.cmp th{background:#0b1a35;color:#fff;font:700 8pt M;text-align:left;padding:2mm}
table.cmp td{padding:1.3mm 2mm;border-bottom:0.5pt solid #e2e8f0;vertical-align:top}
table.cmp td:first-child{font:700 8.5pt M;color:#0b1a35;width:20%}
table.cmp tr:nth-child(even) td{background:#f8fafc}"""
FARBE={'a':'#0b1a35','v':'#0284c7','l':'#7c3aed','f':'#0d9488'}
def form(k,n,titel,merk,rows,falle):
    tr=''.join(f'<tr><td>{a}</td><td>{b}</td></tr>' for a,b in rows)
    return f'''<div class="card dz"><div class="top" style="background:{FARBE[k]}"><b>{n} · {titel}</b><span>{merk}</span></div>
<div class="in"><table class="kv">{tr}</table><div class="falle"><b>Examens-Falle:</b> {falle}</div></div></div>'''

body=cover('Gratis-Lernhilfe · Demenzkarte','Die 4 Demenz&shy;formen',
 'Alzheimer, vaskulär, Lewy-Körper und frontotemporal – Ursache, Leitsymptome, Verlauf und Pflege-Schwerpunkte kompakt für das Pflegeexamen.',
 ['Alzheimer','Vaskulär','Lewy-Körper','Frontotemporal','Demenz vs. Delir','Kommunikation'],
 [('4','Demenzformen'),('1','Vergleichstabelle'),('A4','druckfertig')],
 'Lernhilfe für Ausbildung und Prüfung, kein Ersatz für ärztliche Diagnostik oder Anordnung. Angaben können je nach Lehrbuch und Leitlinie leicht abweichen – maßgeblich ist der Standard deiner Einrichtung.',
 toc=['Alzheimer-Demenz','Vaskuläre Demenz','Lewy-Körper-Demenz','Frontotemporale Demenz','Vergleich auf einen Blick','Pflege &amp; Kommunikation'])

body+='<h2>Die 4 Formen im Überblick</h2><p class="lead">Pro Form: was im Gehirn passiert, woran du sie erkennst und welche Frage im Examen gern kommt.</p>'
body+=form('a','1','Alzheimer-Demenz','häufigste Form · ca. 60–70 %',[
 ('Ursache','Neurodegeneration: Amyloid-Plaques und Tau-Fibrillen, Nervenzelluntergang – beginnt meist im Hippocampus/Schläfenlappen'),
 ('Leitsymptome','Kurzzeitgedächtnis zuerst, Wortfindungsstörungen, Orientierungsstörungen (Zeit → Ort → Situation → Person), später Apraxie und Agnosie'),
 ('Verlauf','Schleichend, langsam fortschreitend in drei Stadien (leicht · mittel · schwer) bis zum Verlust der Selbstständigkeit'),
 ('Therapie','Leicht–mittel: Acetylcholinesterase-Hemmer (Donepezil, Rivastigmin, Galantamin) · mittel–schwer: Memantin · nicht heilbar'),
 ('Pflege','Feste Tagesstruktur, Biografiearbeit, Orientierungshilfen (Uhr, Kalender, Namensschild), Validation')],
 'Das Langzeitgedächtnis bleibt lange erhalten – alte Erinnerungen sind eine Ressource für die Biografiearbeit.')
body+=form('v','2','Vaskuläre Demenz','zweithäufigste Form',[
 ('Ursache','Durchblutungsstörungen: viele kleine Infarkte („Mini-Schlaganfälle“) oder Schädigung der kleinen Hirngefäße'),
 ('Risikofaktoren','Bluthochdruck, Diabetes mellitus, Rauchen, Fettstoffwechselstörung, Vorhofflimmern'),
 ('Leitsymptome','Verlangsamung, Konzentrations- und Aufmerksamkeitsstörung, Gangstörung, Inkontinenz, Stimmungslabilität – Gedächtnis oft weniger betroffen'),
 ('Verlauf','Stufenweise: plötzliche Verschlechterung nach jedem neuen Ereignis, dazwischen stabile Phasen'),
 ('Pflege','RR- und BZ-Kontrolle, Sturzprophylaxe, Medikamenten-Adhärenz (Sekundärprophylaxe)')],
 'Neue neurologische Ausfälle (FAST: Gesicht, Arm, Sprache) sind ein Notfall – nicht als „Demenz“ abtun, sofort Arzt/Notruf.')
body+=form('l','3','Lewy-Körper-Demenz','Halluzinationen + Parkinson',[
 ('Ursache','Eiweißablagerungen (Lewy-Körperchen, α-Synuclein) in der Hirnrinde'),
 ('Leitsymptome','Detailreiche visuelle Halluzinationen (Personen, Tiere), stark schwankende Wachheit und Tagesform, Parkinson-Symptome (Rigor, Bradykinese)'),
 ('Weitere Zeichen','REM-Schlaf-Verhaltensstörung (Ausagieren von Träumen), häufige Stürze, Kreislaufschwankungen'),
 ('Verlauf','Fortschreitend, mit großen Schwankungen von Tag zu Tag oder sogar Stunde zu Stunde'),
 ('Pflege','Sturzprophylaxe, Halluzinationen nicht ausreden und nicht bestätigen – beruhigen, Licht und klare Umgebung')],
 'Überempfindlichkeit gegen Neuroleptika: klassische Neuroleptika (z. B. Haloperidol) können schwere, lebensbedrohliche Reaktionen auslösen – Beobachtungen sofort melden.')
body+=form('f','4','Frontotemporale Demenz','Persönlichkeit vor Gedächtnis',[
 ('Ursache','Abbau im Stirn- und Schläfenlappen (Frontal-/Temporallappen)'),
 ('Beginn','Oft früher als andere Formen, häufig zwischen 50 und 60 Jahren'),
 ('Leitsymptome','Frühe Wesensänderung: Enthemmung, Distanzlosigkeit, Taktlosigkeit, Apathie, Verlust von Empathie, verändertes Essverhalten (z. B. Heißhunger auf Süßes) · Sprachvariante: fortschreitende Sprachstörung'),
 ('Gedächtnis','Bleibt zu Beginn oft noch intakt – deshalb wird die Erkrankung anfangs leicht als psychische Störung verkannt'),
 ('Pflege','Klare Regeln und Routinen, Verhalten nicht persönlich nehmen, Angehörige entlasten und aufklären')],
 'Antidementiva wie Acetylcholinesterase-Hemmer sind bei der frontotemporalen Demenz nicht wirksam.')

body+='<div class="tip"><b>Screening-Tests:</b> MMST (Mini-Mental-Status-Test, max. 30 Punkte), Uhrentest, DemTect – sie geben Hinweise, die Diagnose stellt der Arzt.</div>'
body+='<div class="p4"><h2 class="pb" style="margin-top:0">Vergleich auf einen Blick</h2><p class="lead">Die Tabelle für die schnelle Wiederholung vor der Prüfung.</p>'
body+='''<table class="cmp"><tr><th></th><th>Alzheimer</th><th>Vaskulär</th><th>Lewy-Körper</th><th>Frontotemporal</th></tr>
<tr><td>Erstes Zeichen</td><td>Vergesslichkeit</td><td>Verlangsamung</td><td>Halluzinationen, Schwankungen</td><td>Wesensänderung</td></tr>
<tr><td>Verlauf</td><td>schleichend</td><td>stufenweise</td><td>stark schwankend</td><td>schleichend</td></tr>
<tr><td>Gedächtnis früh</td><td>stark betroffen</td><td>eher erhalten</td><td>wechselnd</td><td>lange erhalten</td></tr>
<tr><td>Typisch</td><td>Plaques &amp; Tau</td><td>Mini-Infarkte</td><td>Parkinson-Symptome</td><td>Enthemmung</td></tr>
<tr><td>Achtung</td><td>Biografie nutzen</td><td>Neue Ausfälle = Notfall</td><td>Neuroleptika!</td><td>oft jüngere Betroffene</td></tr></table>'''

body+='<h2>Demenz oder Delir?</h2><p class="lead">Die wichtigste Abgrenzung im Pflegealltag – ein Delir ist ein Notfall und oft behandelbar.</p>'
body+='''<table class="cmp"><tr><th></th><th>Demenz</th><th>Delir</th></tr>
<tr><td>Beginn</td><td>schleichend über Monate</td><td>plötzlich, Stunden bis Tage</td></tr>
<tr><td>Bewusstsein</td><td>klar (bis spät)</td><td>getrübt, Aufmerksamkeit gestört</td></tr>
<tr><td>Tagesverlauf</td><td>relativ stabil</td><td>stark schwankend, oft nachts schlechter</td></tr>
<tr><td>Ursache</td><td>Hirnerkrankung</td><td>z. B. Infekt, Exsikkose, Medikamente, OP, Schmerz</td></tr>
<tr><td>Reversibel?</td><td>nein</td><td>meist ja – Ursache suchen!</td></tr></table>'''
body+='<div class="note"><b>Merke:</b> Menschen mit Demenz haben ein deutlich erhöhtes Delir-Risiko. Plötzliche Verschlechterung immer melden – nicht als „Fortschreiten der Demenz“ deuten.</div>'

body+='<h2>Pflege &amp; Kommunikation</h2><p class="lead">Gilt für alle Formen – Grundlage ist der DNQP-Expertenstandard „Beziehungsgestaltung in der Pflege von Menschen mit Demenz“.</p>'
body+='''<div class="grid2"><div class="card t"><h3 style="margin-top:0">So sprichst du</h3><ul>
<li>Von vorne nähern, Blickkontakt, mit Namen ansprechen</li><li>Kurze Sätze, eine Information pro Satz</li>
<li>Geschlossene Fragen statt „Warum?“-Fragen</li><li>Nicht korrigieren oder streiten – Gefühle aufgreifen (Validation)</li>
<li>Ruhig bleiben, Zeit lassen, Gestik nutzen</li></ul></div>
<div class="card t"><h3 style="margin-top:0">Das hilft im Alltag</h3><ul>
<li>Feste Tagesstruktur und Bezugspflege</li><li>Biografiearbeit: Gewohnheiten, Beruf, Rituale</li>
<li>Orientierungshilfen: Uhr, Kalender, Bilder, Beschilderung</li><li>Aktivierung nach Fähigkeiten, nicht nach Defiziten</li>
<li>Herausforderndes Verhalten als Botschaft verstehen (Schmerz? Hunger? Angst?)</li></ul></div></div>'''
body+=endbox()+'</div>'
build('/mnt/user-data/outputs/PLAN-NRW_Demenzkarte.pdf','Demenzkarte',body,X)
