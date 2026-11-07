#!/usr/bin/env python3
"""Instagram-Highlights für PLAN NRW: 5 Stories, 5 Titelbilder, 4 Karussells.
Inhalte stammen aus der App (Quizfragen, Taschenkarte Vitalzeichen, PL_PDF_LISTE).
Aufruf: python3 scripts/karussell/highlights.py  → private/social/highlights/
"""
import os, html
from playwright.sync_api import sync_playwright

HIER = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HIER, '..', '..', 'private', 'social', 'highlights')
os.makedirs(OUT, exist_ok=True)
e = html.escape

CSS = open(os.path.join(HIER, 'basis.css')).read()

def blobs(a='#99f6e4', b='#a5f3fc', c='#fef08a'):
    return (f'<div class="blob" style="width:320px;height:320px;left:-120px;top:60px;background:{a}"></div>'
            f'<div class="blob" style="width:280px;height:280px;right:-110px;top:360px;background:{b}"></div>'
            f'<div class="blob" style="width:240px;height:240px;left:-60px;bottom:-80px;background:{c}"></div>')

def kopfzeile(nr=''):
    n = f'<div class="nr">{nr}</div>' if nr else ''
    return f'<div class="kopfz"><div class="marke"><img src="logo.png">PLAN NRW</div>{n}</div>'

def fuss(letzte=False):
    return '' if letzte else '<div class="fuss"><span>plan-nrw.de</span><span>Wischen →</span></div>'

# ---------- Highlights: Story + Titelbild ----------
HL = [
  ('quiz', '❓', 'Quiz', '#0284c7', 'Teste dein Examenswissen', ['2.000+ Prüfungsfragen', 'Sofort Erklärung zu jeder Antwort', 'Nach Fachgebiet üben'], 'plan-nrw.de'),
  ('taschenkarten', '🗂️', 'Taschenkarten', '#0d9488', '40 Taschenkarten für Station', ['Normwerte, Scores, Notfall', 'Alles auf einen Blick', 'Kostenlos zum Ausdrucken'], 'plan-nrw.de'),
  ('pdfs', '📄', 'Gratis-PDFs', '#16a34a', '22 Gratis-PDFs fürs Examen', ['Spickzettel & Eselsbrücken', 'Notfall, Prophylaxen, Hygiene', 'Per E-Mail, kostenlos'], 'plan-nrw.de/links.html'),
  ('app', '📱', 'App', '#7c3aed', 'Die App fürs Pflegeexamen NRW', ['2.000+ Prüfungsfragen', 'KI-Lernassistent', 'Aktuell kostenlos'], 'plan-nrw.de'),
  ('impressum', '§', 'Impressum', '#334155', 'Impressum', ['Patrick Schenkelberger', 'Am Steinknapp 20a, 44795 Bochum', 'kontakt@plan-nrw.de'], 'plan-nrw.de/impressum.html'),
]

def story(h):
    sid, ico, kurz, farbe, titel, punkte, link = h
    li = ''.join(f'<li>{e(p)}</li>' for p in punkte)
    return f'''<div class="s" id="story-{sid}">{blobs()}
 <div class="kopfz"><div class="marke"><img src="logo.png">PLAN NRW</div></div>
 <div class="smitte">
  <div class="sico" style="background:{farbe}">{e(ico)}</div>
  <h1>{e(titel)}</h1>
  <div class="box" style="text-align:left;width:100%"><ul>{li}</ul></div>
  <div class="sticker">Link-Sticker hier<br><b>{e(link)}</b></div>
 </div></div>'''

def titelbild(h):
    sid, ico, kurz, farbe, *_ = h
    return f'''<div class="s" id="cover-{sid}" style="background:{farbe}">
 <div class="cring"><div class="cico">{e(ico)}</div></div></div>'''

# ---------- Karussell 1: Quiz ----------
QUIZ = [
  ('Wie lange dauert die hygienische Händedesinfektion mindestens?', ['Etwa 3 Sekunden', 'Mindestens 30 Sekunden', 'Genau 5 Minuten', 'Die Zeit spielt keine Rolle'], 1,
   'Mindestens 30 Sekunden einreiben, alle Flächen benetzen, Hände die ganze Zeit feucht halten.'),
  ('Was bedeutet ein niedriger Punktwert in der Braden-Skala?', ['Kein Dekubitusrisiko', 'Ein niedriges Sturzrisiko', 'Ein höheres Dekubitusrisiko', 'Guter Ernährungszustand'], 2,
   'Je niedriger der Wert, desto höher das Risiko. 18 Punkte oder weniger = gefährdet.'),
  ('Hypoglykämie, BZ unter 70 mg/dl, Patient wach. Was tust du?', ['Sofort Insulin geben', 'Patient schlafen lassen', '20 g schnell resorbierbare KH oral', 'Nur Blut abnehmen'], 2,
   '20 g schnelle Kohlenhydrate oral, BZ nach 15 Minuten kontrollieren.'),
  ('Wie viele „Momente der Händedesinfektion“ definiert die WHO?', ['Zwei', 'Drei', 'Fünf', 'Zehn'], 2,
   'Vor Patientenkontakt, vor aseptischer Tätigkeit, nach infektiösem Material, nach Patientenkontakt, nach Kontakt mit der Umgebung.'),
  ('Wann werden Thromboseprophylaxestrümpfe (MTPS) angezogen?', ['Abends im Sitzen', 'Morgens vor dem Aufstehen, faltenfrei', 'Nur über der Kleidung', 'Zusammengerollt am Knöchel'], 1,
   'Morgens, solange die Beine noch nicht gestaut sind. Falten schnüren ein.'),
]

def quiz_slides():
    n = len(QUIZ) + 3
    s = [f'''<div class="f">{blobs()}{kopfzeile(f"01/{n:02d}")}
 <div class="hook"><div class="band">EXAMENS-CHECK</div>
  <h1>5 Prüfungsfragen.<br>Wie viele <em>schaffst du?</em></h1>
  <div class="pill">📌 Speichern & später auflösen</div><div class="wisch">Wischen →</div></div></div>''']
    for i, (fr, opt, k, _) in enumerate(QUIZ):
        o = ''.join(f'<div class="opt"><span>{"ABCD"[j]}</span>{e(x)}</div>' for j, x in enumerate(opt))
        s.append(f'''<div class="f">{blobs('#a5f3fc','#99f6e4','#fef08a')}{kopfzeile(f"{i+2:02d}/{n:02d}")}
 <div class="in"><div class="kopf bl"><b>Frage {i+1}</b></div>
  <div class="frage">{e(fr)}</div>{o}</div>{fuss()}</div>''')
    lo = ''.join(f'<li><b>{i+1}. {"ABCD"[k]}</b> – {e(er)}</li>' for i, (_, _, k, er) in enumerate(QUIZ))
    s.append(f'''<div class="f">{blobs()}{kopfzeile(f"{n-1:02d}/{n:02d}")}
 <div class="in"><div class="kopf gr"><b>✅ Auflösung</b><span>Schreib dein Ergebnis in die Kommentare</span></div>
  <div class="box klein"><ul>{lo}</ul></div></div>{fuss()}</div>''')
    s.append(f'''<div class="f">{blobs()}{kopfzeile(f"{n:02d}/{n:02d}")}
 <div class="hook"><h1 style="font-size:38px">Mehr davon?<br><em>2.000+ Prüfungsfragen</em></h1>
  <div class="box" style="text-align:left;width:100%"><ul><li>Mit Erklärung zu jeder Antwort</li><li>Nach Fachgebiet üben</li><li>KI-Lernassistent für Rückfragen</li></ul></div>
  <div class="gruen" style="width:100%">PLAN NRW · aktuell kostenlos<br><span style="font-size:15px">Link in der Bio</span></div></div></div>''')
    return s

# ---------- Karussell 2: Taschenkarte Vitalzeichen (Inhalt aus App) ----------
def tk_slides():
    n = 5
    def liste(p): return '<ul>' + ''.join(f'<li>{e(x)}</li>' for x in p) + '</ul>'
    return [
     f'''<div class="f">{blobs()}{kopfzeile("01/05")}<div class="hook"><div class="band">TASCHENKARTE</div>
  <h1>Vitalzeichen:<br><em>Normalwerte</em> auf einen Blick</h1>
  <div class="pill">📌 Speichern für den Frühdienst</div><div class="wisch">Wischen →</div></div></div>''',
     f'''<div class="f">{blobs('#99f6e4','#a5f3fc','#fef08a')}{kopfzeile("02/05")}<div class="in">
  <div class="kopf tk"><b>📊 Normalwerte Erwachsener</b></div>
  <div class="box">{liste(['RR: 120/80 mmHg (optimal)','Puls: 60–100/Min. (regelmäßig)','AF: 12–18/Min.','SpO₂: ≥ 95 % (COPD: ≥ 88 %)','Temp: 36,5–37,4 °C (rektal +0,5 °C)','BZ: 70–100 mg/dl (nüchtern)'])}</div></div>{fuss()}</div>''',
     f'''<div class="f">{blobs('#fecdd3','#a5f3fc','#fef08a')}{kopfzeile("03/05")}<div class="in">
  <div class="kopf rb"><b>🚨 Kritische Werte → Arzt!</b></div>
  <div class="box">{liste(['RR syst. unter 90 oder über 180 mmHg','Puls unter 40 oder über 150/Min.','SpO₂ unter 90 % trotz O₂','Temp über 40 °C oder unter 35 °C'])}</div>
  <div class="gelb">⚠️ Verbindlich sind die Meldegrenzen deiner Einrichtung und die ärztliche Anordnung.</div></div>{fuss()}</div>''',
     f'''<div class="f">{blobs('#fde68a','#99f6e4','#a5f3fc')}{kopfzeile("04/05")}<div class="in">
  <div class="kopf or"><b>😣 Schmerz-NRS</b><span>Numerische Rating-Skala 0–10</span></div>
  <div class="box">{liste(['0 = kein Schmerz','1–3 = leicht','4–6 = mittel','7–10 = stark → Analgesie dokumentieren'])}</div></div>{fuss()}</div>''',
     f'''<div class="f">{blobs()}{kopfzeile("05/05")}<div class="hook">
  <h1 style="font-size:38px"><em>40 Taschenkarten</em> kostenlos in der App</h1>
  <div class="box" style="text-align:left;width:100%"><ul><li>Scores, Notfall, Prophylaxen</li><li>Hygiene, Medikamente, Beatmung</li><li>Alle Karten zum Ausdrucken</li></ul></div>
  <div class="gruen" style="width:100%">PLAN NRW · Link in der Bio</div></div></div>''']

# ---------- Karussell 3: Gratis-PDFs (aus PL_PDF_LISTE) ----------
PDF_GRUPPEN = [
  ('🎓 Prüfung', 'bl', [('📝','Examens-Spickzettel'),('💡','12 Eselsbrücken'),('🗓️','8-Wochen-Lernplan'),('🩺','Praxis-Examen-Spickzettel'),('🧮','Dosierungsrechnen')]),
  ('🚨 Notfall & Intensiv', 'rb', [('🫀','Reanimation & Notfallalgorithmen'),('💊','Notfallkarten Anästhesie & Intensiv'),('🫁','Pflege beim intubierten Patienten'),('🧪','Laborwerte kompakt')]),
  ('🛡️ Pflege & Hygiene', 'tk', [('🛡️','Prophylaxen-Kompendium'),('🛏️','Dekubitus-Spickzettel'),('🧠','Demenzkarte'),('🩹','Wunddoku-Spickzettel'),('🧼','Zimmerhygiene-Spickzettel'),('🦠','Isolationsmanagement')]),
  ('🩺 Praxis & Ausbildung', 'or', [('📋','Pflegeplanungs-Vorlagen'),('🗂️','Dokumentationsvorlagen'),('🩺','Praxiseinsatz-Begleiter'),('🛁','Grundpflege Schritt für Schritt'),('🖐️','Handgriffe Schritt für Schritt'),('🧤','Handschuh-Spickzettel'),('🧭','Ausbildung meistern')]),
]

def pdf_slides():
    anz = sum(len(g[2]) for g in PDF_GRUPPEN)
    n = len(PDF_GRUPPEN) + 3
    s = [f'''<div class="f">{blobs()}{kopfzeile(f"01/{n:02d}")}<div class="hook"><div class="band">KOSTENLOS</div>
  <h1><em>{anz} Gratis-PDFs</em><br>fürs Pflegeexamen</h1>
  <div class="pill">📌 Speichern, damit du sie wiederfindest</div><div class="wisch">Wischen →</div></div></div>''']
    for i, (t, c, items) in enumerate(PDF_GRUPPEN):
        li = ''.join(f'<li class="pdf"><span>{x}</span>{e(y)}</li>' for x, y in items)
        s.append(f'''<div class="f">{blobs('#a5f3fc','#99f6e4','#fef08a')}{kopfzeile(f"{i+2:02d}/{n:02d}")}<div class="in">
  <div class="kopf {c}"><b>{e(t)}</b><span>{len(items)} PDFs</span></div>
  <div class="box"><ul class="ohne">{li}</ul></div></div>{fuss()}</div>''')
    s.append(f'''<div class="f">{blobs()}{kopfzeile(f"{n-1:02d}/{n:02d}")}<div class="in">
  <div class="kopf gr"><b>So bekommst du sie</b></div>
  <div class="schritte"><div><b>1</b>plan-nrw.de/links.html öffnen</div><div><b>2</b>PDF auswählen</div><div><b>3</b>E-Mail eingeben</div><div><b>4</b>Link in der Mail bestätigen – fertig</div></div>
  <div class="gelb">💡 Kein Abo, keine Kosten. Die E-Mail brauchen wir nur für den Download-Link.</div></div>{fuss()}</div>''')
    s.append(f'''<div class="f">{blobs()}{kopfzeile(f"{n:02d}/{n:02d}")}<div class="hook">
  <h1 style="font-size:38px">Alle PDFs auf <em>einer Seite</em></h1>
  <div class="gruen" style="width:100%">plan-nrw.de/links.html<br><span style="font-size:15px">Link in der Bio</span></div>
  <div class="klein2">Schick den Beitrag deiner Kurskollegin 👇</div></div></div>''')
    return s

# ---------- Karussell 4: App ----------
APP = [
  ('❓', 'Quiz', 'bl', ['2.000+ Prüfungsfragen', 'Erklärung zu jeder Antwort', 'Wiederholung deiner Fehlerfragen']),
  ('🩺', 'Fälle & Prüfung', 'rb', ['Klinische Fallbeispiele', 'Prüfungssimulation mündlich und schriftlich', 'Notfall-Training ABCDE']),
  ('📋', 'Krankheitsbilder', 'tk', ['Über 150 Krankheitsbilder', 'Über 120 mit Pflegeplanung', '400 Lerneinheiten']),
  ('💊', 'Medikamente', 'or', ['80+ Wirkstoffe', 'Dosisrechner mit eigenen Werten', '17 Handgriffe als Animation']),
  ('🤖', 'KI-Lernassistent', 'li', ['Fragen in deinen Worten stellen', 'Eigene Unterlagen zu Karteikarten', 'Rund um die Uhr']),
]

def app_slides():
    n = len(APP) + 2
    s = [f'''<div class="f">{blobs()}{kopfzeile(f"01/{n:02d}")}<div class="hook"><div class="band">PLAN NRW</div>
  <h1>Alles fürs <em>Pflegeexamen</em> in einer App</h1>
  <div class="pill">Von einem Fachpfleger Anästhesie & Intensiv</div><div class="wisch">Wischen →</div></div></div>''']
    for i, (ico, t, c, p) in enumerate(APP):
        li = ''.join(f'<li>{e(x)}</li>' for x in p)
        s.append(f'''<div class="f">{blobs('#a5f3fc','#99f6e4','#fef08a')}{kopfzeile(f"{i+2:02d}/{n:02d}")}<div class="in">
  <div class="kopf {c}"><b>{ico} {e(t)}</b></div><div class="box gross"><ul>{li}</ul></div></div>{fuss()}</div>''')
    s.append(f'''<div class="f">{blobs()}{kopfzeile(f"{n:02d}/{n:02d}")}<div class="hook">
  <h1 style="font-size:40px">Aktuell <em>kostenlos</em></h1>
  <div class="box" style="text-align:left;width:100%"><ul><li>Im Browser, auch als App installierbar</li><li>Für Azubis, Examinierte und Lehrkräfte</li><li>22 Gratis-PDFs dazu</li></ul></div>
  <div class="gruen" style="width:100%">plan-nrw.de · Link in der Bio</div></div></div>''')
    return s

def seite(teile, w, h):
    return f'<!doctype html><html lang="de"><head><meta charset="utf-8"><style>{CSS}.f{{width:{w}px;height:{h}px}}.s{{width:540px;height:960px}}</style></head><body>{"".join(teile)}</body></html>'

def rendern():
    jobs = [('stories', [story(h) for h in HL] + [titelbild(h) for h in HL]),
            ('quiz', quiz_slides()), ('taschenkarten', tk_slides()), ('pdfs', pdf_slides()), ('app', app_slides())]
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 560, 'height': 1000}, device_scale_factor=2)
        for name, teile in jobs:
            pfad = os.path.join(HIER, f'_hl_{name}.html')
            open(pfad, 'w').write(seite(teile, 540, 675))
            pg.goto('file://' + pfad); pg.wait_for_timeout(400)
            if name == 'stories':
                for h in HL:
                    pg.locator(f'#story-{h[0]}').screenshot(path=os.path.join(OUT, f'story_{h[0]}.png'))
                    pg.locator(f'#cover-{h[0]}').screenshot(path=os.path.join(OUT, f'titel_{h[0]}.png'))
            else:
                els = pg.locator('.f')
                for i in range(els.count()):
                    els.nth(i).screenshot(path=os.path.join(OUT, f'karussell_{name}_{i+1:02d}.png'))
            # Ueberlauf melden
            ue = pg.evaluate("""[...document.querySelectorAll('.f,.s')].map((f,i)=>{const r=f.getBoundingClientRect();let m=0;f.querySelectorAll('*').forEach(c=>{const q=c.getBoundingClientRect();if(q.width&&!c.classList.contains('blob'))m=Math.max(m,q.bottom-r.bottom+(c.closest('.fuss')?0:40))});return m>0?i+1:0}).filter(x=>x)""")
            if ue: print(name, 'Ueberlauf in Folie', ue)
            os.remove(pfad)
        b.close()

if __name__ == '__main__':
    rendern(); print('fertig', OUT)
