from base import *
O='/mnt/user-data/outputs/'
T=""".lt{width:100%;border-collapse:collapse;font-size:8.6pt;margin-bottom:4mm}.lt th{background:#0b1a35;color:#fff;font:700 7.4pt M;text-align:left;padding:1.6mm 2mm;letter-spacing:.4pt}
.lt td{padding:1.4mm 2mm;border-bottom:0.5pt solid #e2e8f0;vertical-align:top}.lt td:first-child{font-weight:700;color:#0b1a35}.lt td:nth-child(2){white-space:nowrap;color:#0f766e;font-weight:700}
.lt tr:nth-child(even) td{background:#f8fafc}.lt .grp td{background:#f0fdfa!important;font:800 8pt M;color:#0284c7;letter-spacing:1pt;text-transform:uppercase}
.ex{border:0.8pt solid #e2e8f0;border-left:2mm solid #0284c7;border-radius:2mm;padding:2.6mm 4mm;margin-bottom:3mm;break-inside:avoid;font-size:9.6pt}.ex b{color:#0b1a35}
.ln{border-bottom:0.7pt solid #cbd5e1;height:7mm}.chk{display:inline-block;width:3.6mm;height:3.6mm;border:0.9pt solid #475569;border-radius:.7mm;margin-right:2mm;vertical-align:-0.6mm}
.wk{border:0.8pt solid #e2e8f0;border-top:2.2pt solid #14b8a6;border-radius:3mm;padding:3mm 4mm;break-inside:avoid;margin-bottom:3.5mm}.wk h4{margin:0 0 1.5mm;font:800 10.5pt M;color:#0b1a35}.wk h4 span{color:#14b8a6}
.days{display:grid;grid-template-columns:repeat(7,1fr);gap:1.5mm;margin-top:2mm}.days div{border:0.7pt solid #cbd5e1;border-radius:1.5mm;height:9mm;font:700 6.5pt M;color:#94a3b8;padding:.8mm 1.2mm}"""
# ---------- 1 Laborwerte
G=[('Blutbild',[('Hämoglobin (Hb)','♀ 12–16 · ♂ 13,5–17,5 g/dl','Polyglobulie, Dehydratation','Anämie, Blutung'),('Hämatokrit (Hk)','♀ 37–47 · ♂ 40–52 %','Dehydratation','Anämie, Überwässerung'),('Erythrozyten','♀ 4,0–5,2 · ♂ 4,5–5,9 /pl','Polyglobulie','Anämie'),('Leukozyten','4–10 /nl','Infektion, Entzündung, Kortison','Chemotherapie, Knochenmarkschaden'),('Thrombozyten','150–400 /nl','Entzündung, nach Blutung','Blutungsgefahr, HIT, Sepsis')]),
('Elektrolyte',[('Natrium','135–145 mmol/l','Dehydratation','Verwirrtheit, Krampfanfälle'),('Kalium','3,5–5,0 mmol/l','Herzrhythmusstörungen! Niereninsuffizienz','Rhythmusstörungen, Muskelschwäche, Diuretika'),('Calcium','2,2–2,6 mmol/l','Hyperparathyreoidismus, Tumor','Tetanie, Kribbeln'),('Magnesium','0,7–1,1 mmol/l','Niereninsuffizienz','Krämpfe, Rhythmusstörungen')]),
('Niere &amp; Stoffwechsel',[('Kreatinin','♀ 0,5–0,9 · ♂ 0,7–1,2 mg/dl','Niereninsuffizienz','geringe Muskelmasse'),('Harnstoff','17–43 mg/dl','Niereninsuffizienz, Dehydratation, GI-Blutung','Leberinsuffizienz'),('eGFR','&gt; 90 ml/min','–','Nierenfunktion ↓ – Dosis anpassen!'),('Blutzucker nüchtern','70–100 mg/dl','Diabetes, Stress, Kortison','Hypoglykämie &lt; 70 → Traubenzucker'),('HbA1c','&lt; 5,7 %','Diabetes (≥ 6,5 %)','–')]),
('Entzündung &amp; Notfall',[('CRP','&lt; 5 mg/l','Infektion, Entzündung','–'),('Procalcitonin (PCT)','&lt; 0,5 ng/ml','bakterielle Infektion, Sepsis','–'),('Laktat','0,5–2,2 mmol/l','Schock, Sepsis, Minderperfusion','–'),('Troponin T (hs)','&lt; 14 ng/l','Herzinfarkt, Myokardschaden','–'),('NT-proBNP','&lt; 125 pg/ml','Herzinsuffizienz','–')]),
('Gerinnung',[('Quick','70–120 %','–','Marcumar, Leberschaden, Vit.-K-Mangel'),('INR','0,85–1,15','Marcumar (Ziel meist 2–3)','–'),('aPTT','25–38 s','Heparin, Gerinnungsstörung','–'),('D-Dimere','&lt; 0,5 mg/l','Thrombose, Lungenembolie, nach OP','–')]),
('Leber &amp; Pankreas',[('GOT (AST)','♀ &lt; 35 · ♂ &lt; 50 U/l','Leber-, Herz-, Muskelschaden','–'),('GPT (ALT)','♀ &lt; 35 · ♂ &lt; 50 U/l','Leberschaden','–'),('γ-GT','♀ &lt; 40 · ♂ &lt; 60 U/l','Alkohol, Gallenstau','–'),('Bilirubin gesamt','&lt; 1,2 mg/dl','Ikterus, Gallenstau, Hämolyse','–'),('Lipase','&lt; 60 U/l','Pankreatitis','–'),('Albumin','35–52 g/l','–','Mangelernährung, Leberschaden, Ödeme')]),
('Blutgasanalyse (arteriell)',[('pH','7,35–7,45','Alkalose','Azidose'),('pO<sub>2</sub>','75–100 mmHg','O<sub>2</sub>-Gabe','Hypoxämie'),('pCO<sub>2</sub>','35–45 mmHg','Hypoventilation (resp. Azidose)','Hyperventilation'),('HCO<sub>3</sub><sup>–</sup>','22–26 mmol/l','metabolische Alkalose','metabolische Azidose'),('BE','–2 bis +2 mmol/l','metabolische Alkalose','metabolische Azidose')])]
b=cover('Gratis-Lernhilfe · Nachschlagen','Laborwerte<br>kompakt','Die wichtigsten Laborwerte mit Normbereich und was erhöhte oder erniedrigte Werte bedeuten – mit Fokus auf das, was für die Pflege wichtig ist.',
 ['Blutbild','Elektrolyte','Niere','Gerinnung','Leber','BGA'],[('7','Themenblöcke'),('35+','Laborwerte'),('A4','druckfertig')],
 'Referenzbereiche unterscheiden sich je nach Labor, Methode und Alter. Maßgeblich sind immer die Normwerte auf dem Befund deines Labors.',toc=[g for g,_ in G])
b+='<h2>Laborwerte auf einen Blick</h2><p class="lead">Normbereiche für Erwachsene · ↑ = erhöht · ↓ = erniedrigt</p><table class="lt"><tr><th>Wert</th><th>Normbereich</th><th>↑ erhöht bei</th><th>↓ erniedrigt bei</th></tr>'
for g,rows in G:
    b+=f'<tr class="grp"><td colspan="4">{g}</td></tr>'+''.join(f'<tr><td>{a}</td><td>{n}</td><td>{h}</td><td>{l}</td></tr>' for a,n,h,l in rows)
b+='</table><div class="tip"><b>Für die Pflege besonders wichtig:</b> Kalium (Rhythmusstörungen!), Blutzucker (Hypoglykämie), Thrombozyten und Gerinnung (Blutungsgefahr, Injektionen), Kreatinin/eGFR (Medikamentendosis) und Laktat (Schock). Auffällige Werte immer an den Arzt weitergeben.</div>'+endbox()
build(O+'PLAN-NRW_Laborwerte-kompakt.pdf','Laborwerte kompakt',b,T)
# ---------- 2 Dosierungsrechnen
F=[('Dreisatz','Gesuchte Menge = (angeordnete Dosis ÷ vorhandene Dosis) × vorhandenes Volumen'),('Prozent','1 % = 1 g / 100 ml = 10 mg/ml'),('Promille','1 ‰ = 1 g / 1000 ml = 1 mg/ml'),('Verdünnung','C<sub>1</sub> × V<sub>1</sub> = C<sub>2</sub> × V<sub>2</sub>'),('Laufrate','ml/h = Volumen (ml) ÷ Zeit (h)'),('Tropfen','Tropfen/Min. = ml/h ÷ 3 (Standard: 20 Tropfen = 1 ml)'),('Mikrotropfen','Mikrotropfen/Min. = ml/h (60 µTr = 1 ml)'),('Perfusor µg/kg/min','ml/h = (Dosis × kg × 60) ÷ Konzentration (µg/ml)')]
A=[('Metamizol 500 mg i.v. sind angeordnet. Die Ampulle enthält 1 g in 2 ml. Wie viel ml ziehst du auf?','500 mg ÷ 1000 mg × 2 ml = <b>1 ml</b>'),
('Paracetamol 1 g (100 ml) soll als Kurzinfusion über 15 Minuten laufen. Welche Laufrate stellst du ein?','100 ml ÷ 0,25 h = <b>400 ml/h</b>'),
('1000 ml NaCl 0,9 % sollen über 8 Stunden laufen. Laufrate und Tropfenzahl (20 Tr./ml)?','1000 ÷ 8 = <b>125 ml/h</b> · 125 ÷ 3 ≈ <b>42 Tropfen/Min.</b>'),
('Wie viel Gramm Natriumchlorid sind in 500 ml NaCl 0,9 % enthalten?','0,9 g pro 100 ml × 5 = <b>4,5 g</b>'),
('Wie viel Gramm Glukose enthalten 20 ml Glukose 40 %?','40 g pro 100 ml → 0,4 g/ml × 20 ml = <b>8 g</b>'),
('Lidocain 2 %: Wie viel mg sind in 1 ml enthalten?','2 % = 2 g/100 ml = <b>20 mg/ml</b>'),
('Heparin 25.000 IE in 5 ml. Angeordnet sind 5.000 IE s.c. Wie viel ml?','5.000 ÷ 25.000 × 5 ml = <b>1 ml</b>'),
('Furosemid 40 mg i.v. sind angeordnet. Die Ampulle enthält 20 mg in 2 ml. Wie viel ml?','40 ÷ 20 × 2 ml = <b>4 ml</b>'),
('Morphin 10 mg/1 ml wird mit NaCl 0,9 % auf 10 ml verdünnt. Angeordnet sind 3 mg. Wie viel ml gibst du?','Neue Konzentration 10 mg ÷ 10 ml = 1 mg/ml → <b>3 ml</b>'),
('Noradrenalin-Perfusor: 5 mg auf 50 ml. Patient 70 kg, angeordnet 0,1 µg/kg/min. Laufrate?','Konzentration 100 µg/ml · (0,1 × 70 × 60) ÷ 100 = <b>4,2 ml/h</b>'),
('KCl 7,45 % (1 ml = 1 mmol): 20 mmol sollen in 500 ml Infusion über 4 Stunden laufen. Wie viel ml KCl und welche Laufrate?','<b>20 ml KCl</b> · (500 + 20) ml ÷ 4 h = <b>130 ml/h</b>'),
('Kind, 18 kg, soll Paracetamol 15 mg/kg erhalten. Saft: 200 mg in 5 ml. Wie viel ml?','18 × 15 = 270 mg · Konzentration 40 mg/ml → 270 ÷ 40 = <b>6,75 ml</b>')]
b=cover('Gratis-Lernhilfe · Üben','Dosierungs&shy;rechnen','Alle Formeln fürs Medikamenten- und Infusionsrechnen auf einer Seite – plus 12 Übungsaufgaben aus dem Stationsalltag mit ausführlichen Lösungen.',
 ['Dreisatz','Prozent','Infusion','Perfusor','Kinder'],[('8','Formeln'),('12','Übungsaufgaben'),('A4','druckfertig')],
 'Übungsbeispiele zu Ausbildungszwecken. In der Praxis gelten ärztliche Anordnung, Fachinformation, Klinikstandard und das 4-Augen-Prinzip.',toc=['Formelsammlung','12 Übungsaufgaben','Lösungen mit Rechenweg'])
b+='<h2>Formelsammlung</h2><p class="lead">Einmal verstanden – für jede Aufgabe anwendbar.</p><table class="kv" style="font-size:10pt">'+''.join(f'<tr><td>{a}</td><td>{c}</td></tr>' for a,c in F)+'</table>'
b+='<div class="tip" style="margin-top:4mm"><b>So gehst du vor:</b> 1. Was ist angeordnet? 2. Was ist vorhanden (Konzentration)? 3. Einheiten angleichen (g ↔ mg ↔ µg). 4. Rechnen. 5. Plausibel? Lieber einmal mehr nachrechnen und gegenprüfen lassen.</div>'
b+='<h2 class="pb">Übungsaufgaben</h2><p class="lead">Erst selbst rechnen, dann hinten vergleichen.</p>'+''.join(f'<div class="ex"><b>{i+1}.</b> {q}<div class="ln"></div></div>' for i,(q,_) in enumerate(A))
b+='<h2 class="pb">Lösungen</h2><p class="lead">Mit Rechenweg.</p>'+''.join(f'<div class="ex" style="border-left-color:#14b8a6"><b>{i+1}.</b> {s}</div>' for i,(_,s) in enumerate(A))+endbox()
build(O+'PLAN-NRW_Dosierungsrechnen.pdf','Dosierungsrechnen',b,T)
# ---------- 3 Lernplan
W=[('Überblick &amp; Grundlagen','Pflegeprozess, Pflegemodelle, ATL/AEDL, Recht und Berufskunde'),('Prophylaxen &amp; Hygiene','Alle Prophylaxen mit Skalen, Expertenstandards, Hygiene und Isolation'),('Herz, Kreislauf, Atmung','Herzinsuffizienz, KHK, Hypertonie, COPD, Pneumonie'),('Stoffwechsel, Niere, Verdauung','Diabetes, Niereninsuffizienz, Magen-Darm-Erkrankungen'),('Neurologie, Psychiatrie, Geriatrie','Schlaganfall, Demenz, Delir, Depression, Sucht'),('Notfall, Chirurgie, Schmerz','ABCDE, Reanimation, prä-/postoperative Pflege, Schmerzmanagement'),('Kinder, Gynäkologie, Palliativ','Pädiatrie, Geburtshilfe, Sterbebegleitung, Kommunikation'),('Wiederholen &amp; Prüfungssimulation','Schwächen nacharbeiten, Probeklausuren, mündliche Prüfung laut üben')]
b=cover('Gratis-Lernhilfe · Planen','8-Wochen-<br>Lernplan','Dein Fahrplan zum Pflegeexamen: acht Wochen mit klaren Themen, Wochen-Tracker zum Abhaken, bewährten Lerntipps und einer Checkliste für den Prüfungstag.',
 ['Wochenplan','Tracker','Lerntipps','Prüfungstag'],[('8','Wochen'),('56','Lerntage'),('A4','druckfertig')],
 'Der Plan ist ein Vorschlag – passe die Themen an den Lehrplan deiner Pflegeschule und deine Schwerpunkte an.',toc=['So lernst du effektiv','Woche 1–8 mit Tracker','Checkliste Prüfungstag'])
b+='<h2>So lernst du effektiv</h2><p class="lead">Fünf Methoden, die nachweislich mehr bringen als Lesen und Markieren.</p><div class="grid2">'
for t,d in [('Aktiv abrufen','Buch zu, Antwort selbst formulieren – erst dann nachsehen. Quizfragen sind dafür ideal.'),('Verteilt wiederholen','Lieber 30 Minuten täglich als 5 Stunden am Wochenende. Wiederhole nach 1, 3 und 7 Tagen.'),('Laut erklären','Erkläre ein Krankheitsbild laut, als wärst du in der mündlichen Prüfung.'),('Mischen statt blocken','Themen abwechseln – so trainierst du, was im Examen gefragt ist.'),('Pausen &amp; Schlaf','25 Minuten lernen, 5 Minuten Pause. Im Schlaf wird Gelerntes gefestigt.'),('Mit Fällen lernen','Theorie immer an einem Patienten aus deinem Einsatz durchspielen.')]:
    b+=f'<div class="card t"><h3 style="margin-top:0">{t}</h3>{d}</div>'
b+='</div>'
b+='<h2 class="pb">Dein Wochenplan</h2><p class="lead">Thema eintragen, Lerntage abhaken, Notizen zu Schwächen festhalten.</p>'
for i,(t,d) in enumerate(W,1):
    if i==5: b+='<div class="pb"></div>'
    b+=f'<div class="wk"><h4><span>Woche {i} ·</span> {t}</h4><div style="font-size:9pt;color:#475569">{d}</div><div class="days">'+''.join(f'<div>{x}</div>' for x in ['Mo','Di','Mi','Do','Fr','Sa','So'])+'</div><div class="ln" style="height:6mm"></div></div>'
b+='<h2 class="pb">Checkliste Prüfungstag</h2><p class="lead">Am Abend vorher abhaken – dann kannst du ruhig schlafen.</p><div class="grid2"><div class="card t"><h3 style="margin-top:0">Mitnehmen</h3>'
b+=''.join(f'<div style="padding:1.4mm 0"><span class="chk"></span>{x}</div>' for x in ['Personalausweis','Einladung / Prüfungsnummer','2–3 Kugelschreiber (dokumentenecht)','Uhr ohne Internetfunktion','Getränk und kleiner Snack','Ggf. Dienstkleidung für die praktische Prüfung','Medikamente, Brille, Taschentücher'])
b+='</div><div class="card t"><h3 style="margin-top:0">Am Prüfungstag</h3>'+''.join(f'<div style="padding:1.4mm 0"><span class="chk"></span>{x}</div>' for x in ['Ausreichend schlafen – kein Lernen mehr bis spät','Frühstücken und genug trinken','30 Minuten früher losfahren','Aufgaben erst komplett lesen','Mit sicheren Fragen beginnen','In der mündlichen Prüfung: laut denken, Struktur nutzen','Nachfragen ist erlaubt!'])+'</div></div>'+endbox()
build(O+'PLAN-NRW_8-Wochen-Lernplan.pdf','8-Wochen-Lernplan',b,T)
# ---------- 4 Praxiseinsatz
b=cover('Gratis-Lernhilfe · Praxis','Praxiseinsatz-<br>Begleiter','Gut vorbereitet in jeden Einsatz: Checklisten für Erst-, Zwischen- und Abschlussgespräch, Lernziel-Planung, Reflexionsbogen und Nachweis deiner Praxisanleitung.',
 ['Erstgespräch','Lernziele','Reflexion','Nachweis'],[('5','Vorlagen'),('10 %','Praxisanleitung'),('A4','druckfertig')],
 'Vorlagen zur Unterstützung. Es gelten die Vorgaben deiner Pflegeschule und deines Ausbildungsträgers.',toc=['Checkliste Einsatzbeginn','Lernziele planen','Reflexionsbogen','Zwischen- &amp; Abschlussgespräch','Nachweis Praxisanleitung'])
b+='<h2><span class="n">1</span>Checkliste Einsatzbeginn</h2><p class="lead">Die erste Woche entscheidet, wie viel du aus dem Einsatz mitnimmst.</p><div class="grid2">'
for t,xs in [('Vor dem ersten Tag',['Einsatzort, Station und Dienstbeginn geklärt','Ansprechpartner / Praxisanleitung bekannt','Lernaufgaben der Schule gelesen','Typische Krankheitsbilder der Station wiederholt']),('In der ersten Woche',['Erstgespräch mit Praxisanleitung geführt','Lernziele schriftlich vereinbart','Termine für Zwischen- und Abschlussgespräch','Stationsabläufe, Notfallausrüstung, Hygieneplan gezeigt','Dienstplan mit Anleitungszeiten abgestimmt'])]:
    b+=f'<div class="card t"><h3 style="margin-top:0">{t}</h3>'+''.join(f'<div style="padding:1.3mm 0"><span class="chk"></span>{x}</div>' for x in xs)+'</div>'
b+='</div><div class="tip">Praxisanleitung steht dir zu: mindestens <b>10 % der praktischen Ausbildungszeit</b> je Einsatz müssen geplant und strukturiert angeleitet werden (§ 4 PflAPrV). Fordere sie freundlich, aber bestimmt ein.</div>'
F2=X2="""<div class="fl" style="border-bottom:0.8pt solid #94a3b8;font:600 7.5pt M;color:#64748b;padding:5mm 0 1mm">{}</div>"""
def lines(n): return ''.join('<div class="ln"></div>' for _ in range(n))
b+='<h2 class="pb"><span class="n">2</span>Lernziele planen</h2><p class="lead">Formuliere jedes Ziel konkret: Was kann ich am Ende des Einsatzes?</p>'
b+='<table class="lt"><tr><th style="width:44%">Mein Lernziel</th><th>Wie erreiche ich es?</th><th style="width:16%">Bis wann</th><th style="width:12%">Erreicht</th></tr>'+''.join('<tr><td style="height:15mm"></td><td></td><td></td><td></td></tr>' for _ in range(8))+'</table>'
b+='<div class="tip">Beispiel: „Ich führe bis zum Ende der 3. Woche selbstständig die Pneumonieprophylaxe bei zwei Patienten durch und dokumentiere sie."</div>'
b+='<h2 class="pb"><span class="n">3</span>Reflexionsbogen</h2><p class="lead">Nach einer besonderen Situation – gut für Lernaufgaben und das Fachgespräch.</p>'
for t,n in [('Was ist passiert? (Situation sachlich beschreiben)',4),('Wie habe ich mich gefühlt und warum?',3),('Was lief gut, was würde ich anders machen?',4),('Welches Wissen hat mir gefehlt? Was lerne ich daraus?',4),('Mein nächster Schritt',2)]:
    b+=f'<h3>{t}</h3>'+lines(n)
b+='<h2 class="pb"><span class="n">4</span>Zwischen- &amp; Abschlussgespräch</h2><p class="lead">Vorbereiten statt überraschen lassen.</p><div class="grid2">'
for t,xs in [('Zwischengespräch (Mitte)',['Welche Lernziele habe ich schon erreicht?','Wo brauche ich noch Anleitung?','Was sagt meine Praxisanleitung?','Neue Ziele für die zweite Hälfte']),('Abschlussgespräch (Ende)',['Lernziele: erreicht / teilweise / offen','Stärken, die ich mitnehme','Themen für den nächsten Einsatz','Beurteilung besprochen und verstanden'])]:
    b+=f'<div class="card t"><h3 style="margin-top:0">{t}</h3>'+''.join(f'<div style="padding:1.3mm 0"><span class="chk"></span>{x}</div>' for x in xs)+'<h3>Notizen</h3>'+lines(5)+'</div>'
b+='</div><h2 class="pb"><span class="n">5</span>Nachweis Praxisanleitung</h2><p class="lead">Einsatz: ____________________ · Praxisanleitung: ____________________</p>'
b+='<table class="lt"><tr><th style="width:15%">Datum</th><th>Inhalt der Anleitung</th><th style="width:12%">Dauer</th><th style="width:20%">Unterschrift PA</th></tr>'+''.join('<tr><td style="height:9.5mm"></td><td></td><td></td><td></td></tr>' for _ in range(16))+'</table>'+endbox()
build(O+'PLAN-NRW_Praxiseinsatz-Begleiter.pdf','Praxiseinsatz-Begleiter',b,T)
