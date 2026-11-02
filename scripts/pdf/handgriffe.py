from base import *
import sys, json, os
# Gratis-PDFs aus window.PL_HANDGRIFFE (index.html), damit App und PDF gleich bleiben.
# Aufruf: python3 handgriffe.py <hg.json> <bilder-ordner> <ausgabe-ordner>
# hg.json + Bilder (<id>-<schritt>.png = Bühne der App) erzeugt ein Playwright-Skript gegen die lokale App.
# Erzeugt: PLAN-NRW_Grundpflege.pdf, PLAN-NRW_Handgriffe.pdf, PLAN-NRW_Handschuh-Spickzettel.pdf
HG=json.load(open(sys.argv[1])); IMG=os.path.abspath(sys.argv[2]); OUT=sys.argv[3]
X=""".hg{break-inside:avoid;margin-bottom:3.5mm;display:grid;grid-template-columns:62mm 1fr;gap:4.5mm;align-items:start;border-bottom:0.6pt solid #e2e8f0;padding-bottom:3.5mm}
.hg img{width:62mm;border-radius:2.5mm}
.hg .k{font:800 7.5pt M;letter-spacing:1pt;color:#14b8a6;text-transform:uppercase}
.hg h4{margin:.5mm 0 1.2mm;font:800 11pt M;color:#0b1a35}
.hg p{margin:0;font-size:9.6pt}
.merk{background:#ecfeff;border-left:1.8mm solid #0284c7;border-radius:2mm;padding:3mm 4mm;font:700 9.8pt M;color:#0b1a35;margin:1mm 0 3mm;break-inside:avoid}
.qz{border:0.8pt solid #e2e8f0;border-radius:3mm;padding:3mm 4.5mm;margin-bottom:6mm;break-inside:avoid;font-size:9.3pt}
.qz b.t{display:block;font:800 9pt M;letter-spacing:.8pt;color:#0284c7;margin-bottom:1.5mm}
.qz ol{margin:0;padding-left:5mm}.qz li{margin:1.2mm 0}.qz .o{color:#475569}
.lsg{font-size:9pt;color:#334155}.lsg b{color:#0b1a35}
.box{border-radius:3mm;padding:4mm 5mm;margin-bottom:4mm;break-inside:avoid;font-size:9.6pt}
.box h4{margin:0 0 2mm;font:800 11pt M;color:#0b1a35}
.box.o{background:#fff7ed;border:1pt solid #fdba74}.box.b{background:#f0f9ff;border:1pt solid #7dd3fc}.box.y{background:#fefce8;border:1pt solid #fde047}
.box ul{padding-left:4.5mm}
table.hs{width:100%;border-collapse:collapse;font-size:10.5pt;margin:2mm 0 4mm}
table.hs th{background:#0b1a35;color:#fff;font:700 9pt M;text-align:left;padding:2.2mm 3mm}
table.hs td{padding:2.4mm 3mm;border-bottom:0.6pt solid #e2e8f0;vertical-align:top}
table.hs td.m{font:800 10pt M;white-space:nowrap}.mit{color:#1d4ed8}.ohne{color:#15803d}
"""
def img(id_,n): return f'file://{IMG}/{id_}-{n}.png'
def ablauf(h, nr):
    o=f'<h2 class="pb"><span class="n">{nr}</span>{h["t"]}</h2><p class="lead">{h["s"]} · {len(h["schritte"])} Schritte</p>'
    for i,s in enumerate(h['schritte']):
        o+=f'<div class="hg"><img src="{img(h["id"],i)}"><div><div class="k">Schritt {i+1}</div><h4>{s["t"]}</h4><p>{s["x"]}</p></div></div>'
    o+=f'<div class="merk">Merke: {h["merke"]}</div>'
    if h.get('quiz'):
        o+='<div class="qz"><b class="t">TESTE DICH</b><ol>'+''.join(
            f'<li>{q["f"]}<br><span class="o">'+' · '.join(f'{"ABCD"[j]}) {x}' for j,x in enumerate(q['o']))+'</span></li>' for q in h['quiz'])+'</ol></div>'
    return o
def loesungen(L):
    o='<h2 class="pb">Lösungen</h2><div class="lsg">'
    for nr,h in L:
        o+=f'<p><b>{nr}. {h["t"]}:</b> '+' · '.join(f'{j+1}) {"ABCD"[q["k"]]} – {q["o"][q["k"]]}' for j,q in enumerate(h.get('quiz',[])))+'</p>'
    return o+'</div>'

HANDSCHUHE='''<div class="box o"><h4>🧤 Handschuhe – wann?</h4>
<b>Mit:</b> Intimbereich &amp; Gesäß, Achseln, Füße, Wunden, Hautkrankheiten (Pilz, Ekzem, Krätze), Ausscheidungen, Blut, Schleimhaut/Mundpflege, multiresistente Erreger.<br>
<b>Ohne</b> (bei intakter Haut): Gesicht, Arme, Oberkörper.<br>Wechsel von unrein zu rein immer mit <b>Händedesinfektion</b>.</div>'''
MATERIAL='''<div class="box b"><h4>🧽 Waschlappen &amp; Material</h4>
<b>Waschlappen (üblich):</b> 1× Gesicht/Oberkörper · 1× Beine/Rücken · 1× Füße · mind. 2× Einmal für den Intimbereich (vorn/Gesäß getrennt). <b>Handtücher:</b> oben · Füße · Intimbereich.<br>
<b>Außerdem:</b> Waschschüssel, Wasserthermometer, pH-hautneutrale Waschlotion, Hautpflege nach Hautzustand, Einmalhandschuhe, ggf. Schutzschürze, Mundpflege-Set (Zahnbürste, Becher, Prothesendose), Kamm, Rasierer, frische Kleidung und Wäsche, Inkontinenzmaterial, Bettschutz, Abwurf, Wäschesack, Händedesinfektion.<br>
<i>Genaue Anzahl und Material nach Hausstandard/Hygieneplan.</i></div>'''
RECHT='''<div class="box y"><h4>§ Rechtlicher Rahmen</h4><ul>
<li><b>Würde &amp; Selbstbestimmung</b> (Art. 1 GG, § 2 SGB XI): Wünsche berücksichtigen – auch den Wunsch nach gleichgeschlechtlicher Pflege, soweit möglich.</li>
<li><b>Aktivierende Pflege</b> (§ 28 Abs. 4 SGB XI): vorhandene Fähigkeiten erhalten und fördern.</li>
<li><b>Stand des Wissens</b> (§ 11 SGB XI): Expertenstandards (z. B. Dekubitus, Sturz) beachten – in der Langzeitpflege über § 113a SGB XI verbindlich.</li>
<li><b>Hygiene</b> (§§ 23, 36 IfSG, KRINKO-Empfehlung Händehygiene): Händedesinfektion und Hygieneplan der Einrichtung. <b>Handschuhe</b> als Schutz für dich: TRBA 250 (Arbeitsschutz).</li>
<li><b>Freiheitsentziehende Maßnahmen</b> wie Bettgitter oder Gurt nur mit Einwilligung oder Genehmigung des Betreuungsgerichts (§ 1831 BGB).</li>
<li><b>Vorbehaltene Tätigkeiten</b> (§ 4 PflBG): Pflegebedarf erheben, Pflege planen und evaluieren ist Aufgabe der Pflegefachperson. Die Körperpflege selbst darf delegiert werden.</li>
<li><b>Dokumentation</b> nach Hausstandard: Hautzustand, Ressourcen, Besonderheiten.</li></ul>
<i>Es gelten zusätzlich die Standards deiner Einrichtung.</i></div>'''
WARN='Lernhilfe für Ausbildung und Praxis. Es gelten immer die ärztliche Anordnung, der Hygieneplan und die Standards deiner Einrichtung.'

# 1) Grundpflege
GP=[h for h in HG if h['gp']]
body=cover('Gratis-Lernhilfe · Grundpflege','Grundpflege<br>Schritt für Schritt',
 'Körperpflege im Bett, an der Bettkante, am Waschbecken und unter der Dusche – mit Bildern zu jedem Schritt, Handschuh-Regeln, Material und rechtlichem Rahmen.',
 ['Material','Im Bett','Bettkante','Waschbecken','Dusche','Recht'],[(str(len(GP)),'Abläufe'),(str(sum(len(h['schritte']) for h in GP)),'Schritte mit Bild'),(str(sum(len(h.get('quiz',[])) for h in GP)),'Quizfragen')],
 WARN,toc=['Handschuhe, Material &amp; Recht']+[h['t'] for h in GP]+['Lösungen'])
body+='<h2><span class="n">1</span>Handschuhe, Material &amp; Recht</h2><p class="lead">Das Wichtigste vorab – gilt für alle Abläufe.</p>'+HANDSCHUHE+MATERIAL+RECHT
L=[]
for i,h in enumerate(GP): body+=ablauf(h,i+2); L.append((i+2,h))
body+=loesungen(L)+'<div class="tip" style="margin-top:4mm">Alle Abläufe gibt es animiert in der PLAN-App unter Wissen → „Grundpflege“ – zusammen mit 2.000+ Prüfungsfragen fürs Examen.</div>'+endbox()
build(f'{OUT}/PLAN-NRW_Grundpflege.pdf','Grundpflege Schritt für Schritt',body,X)

# 2) Handgriffe
HH=[h for h in HG if not h['gp'] and not h.get('iso')]
body=cover('Gratis-Lernhilfe · Praxis','Handgriffe<br>Schritt für Schritt',
 'Von der Infusion über die s.c.-Injektion bis zur Reanimation: '+str(len(HH))+' Pflegehandgriffe mit Bildern zu jedem Schritt, Merksatz und Quizfragen.',
 ['Infusion','Injektion','Vitalzeichen','Notfall','Prophylaxen','Hygiene'],[(str(len(HH)),'Handgriffe'),(str(sum(len(h['schritte']) for h in HH)),'Schritte mit Bild'),(str(sum(len(h.get('quiz',[])) for h in HH)),'Quizfragen')],
 WARN)
L=[]
for i,h in enumerate(HH): body+=ablauf(h,i+1).replace('<h2 class="pb">','<h2 class="pb">' if i else '<h2>',1); L.append((i+1,h))
body+=loesungen(L)+'<div class="tip" style="margin-top:4mm">Alle Handgriffe gibt es animiert in der PLAN-App unter Wissen → „Handgriffe animiert“ – zusammen mit 2.000+ Prüfungsfragen fürs Examen.</div>'+endbox()
build(f'{OUT}/PLAN-NRW_Handgriffe.pdf','Handgriffe Schritt für Schritt',body,X)

# 3) Handschuh-Spickzettel (eine Seite, ohne Deckblatt)
ZE=[('Gesicht','ohne','bei intakter Haut'),('Arme &amp; Hände','ohne','bei intakter Haut'),('Oberkörper','ohne','bei intakter Haut'),
    ('Achseln','mit','Hautfalten, Schweiß'),('Intimbereich &amp; Gesäß','mit','danach Handschuhe aus + Händedesinfektion'),('Füße','mit','Zehenzwischenräume, Pilzgefahr'),
    ('Wunden','mit','immer'),('Hautkrankheiten','mit','Pilz, Ekzem, Krätze'),('Ausscheidungen, Blut','mit','Körperflüssigkeiten'),
    ('Schleimhaut / Mundpflege','mit','Kontakt mit Speichel'),('Multiresistente Erreger','mit','plus Schutzkittel nach Hygieneplan')]
tr=''.join(f'<tr><td><b>{a}</b></td><td class="m {b}">{"🧤 MIT" if b=="mit" else "✅ OHNE"}</td><td>{c}</td></tr>' for a,b,c in ZE)
body=('<h2>Handschuhe bei der Grundpflege – wann?</h2><p class="lead">Spickzettel zum Ausdrucken · Grundlage: KRINKO-Empfehlung Händehygiene, TRBA 250.</p>'
 f'<table class="hs"><tr><th>Körperstelle / Situation</th><th>Handschuhe</th><th>Warum / Hinweis</th></tr>{tr}</table>'
 '<div class="merk">Handschuhe ersetzen nie die Händedesinfektion. Von unrein zu rein: Handschuhe aus → Hände desinfizieren → weiter.</div>'
 '<div class="box b"><h4>🧽 Waschlappen pro Ganzkörperwäsche (üblich)</h4>1× Gesicht &amp; Oberkörper · 1× Beine &amp; Rücken · 1× Füße · mind. 2× Einmal intim (vorn/Gesäß getrennt) · Handtücher: oben, Füße, Intimbereich.</div>'
 '<div class="note">Es gelten immer der Hygieneplan und die Standards deiner Einrichtung.</div>'+endbox())
build(f'{OUT}/PLAN-NRW_Handschuh-Spickzettel.pdf','Handschuh-Spickzettel',body,X)
print('ok')
