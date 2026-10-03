from base import *
X=""".sec{break-inside:avoid;margin-bottom:4mm}.sec h3{margin-top:0;display:flex;align-items:center;gap:2mm}
.sec h3 i{font-style:normal;display:inline-block;width:6mm;height:6mm;border-radius:1.5mm;background:#14b8a6;color:#fff;text-align:center;font:800 8pt/6mm M}
.cols{column-count:2;column-gap:6mm}"""
def sec(n,t,rows):
    tr=''.join(f'<tr><td>{a}</td><td>{b}</td></tr>' for a,b in rows)
    return f'<div class="sec card t"><h3><i>{n}</i>{t}</h3><table class="kv">{tr}</table></div>'
body=cover('Lernhilfe · Für die letzten Tage vor der Prüfung','Examens-<br>Spickzettel',
 'Alle Kernzahlen, Scores und Merksätze für das Pflegeexamen auf einen Blick – kompakt zum Ausdrucken und Wiederholen.',
 ['Vitalwerte','Scores','Perfusor','Hygiene','Recht NRW','Abkürzungen'],[('6','Themenblöcke'),('60+','Kernfakten'),('A4','druckfertig')],
 'Lernhilfe für Ausbildung und Prüfung. Werte können je nach Lehrbuch, Leitlinie und Klinikstandard leicht abweichen – im Zweifel gilt der Standard deiner Einrichtung.',
 toc=['Vitalwerte Normbereiche','Wichtige Scores','Perfusor &amp; Dosierung','Hygiene-Kernfakten','Ausbildung &amp; Recht NRW','Wichtige Abkürzungen'])
body+='<h2>Kernzahlen auf einen Blick</h2><p class="lead">Ausdrucken, an die Wand hängen, jeden Tag einmal lesen.</p><div class="cols">'
body+=sec('1','Vitalwerte Normbereiche',[('Blutdruck (Erw.)','120/80 mmHg · normal bis 139/89'),('Puls (Erw.)','60–100/Min.'),('Atemfrequenz (Erw.)','12–20/Min.'),('Temperatur','36,0–37,4 °C'),('SpO<sub>2</sub>','≥ 95 % · COPD-Ziel 88–92 %'),('Blutzucker nüchtern','70–100 mg/dl (3,9–5,6 mmol/l)'),('Puls Neugeborenes','120–160/Min.'),('AF Neugeborenes','30–60/Min.')])
body+=sec('2','Wichtige Scores',[('Braden-Skala','6–23 P. · ≤ 18 = Dekubitusrisiko'),('Barthel-Index','0–100 · 100 = selbstständig'),('Glasgow Coma Scale','3–15 · ≤ 8 = Atemwegssicherung erwägen'),('NRS Schmerz','0–10 · ab 4 behandlungsbedürftig'),('qSOFA','≥ 2 von 3: AF ≥ 22 · RR syst. ≤ 100 · Bewusstsein verändert'),('NEWS2','0–20 · ≥ 5 dringend · ≥ 7 Notfallteam'),('MNA','≥ 24 gut · 17–23,5 Risiko · &lt; 17 Mangelernährung'),('CAM-ICU','Akuter Beginn + Unaufmerksamkeit + (Denken oder Bewusstsein)')])
body+=sec('3','Perfusor &amp; Dosierung',[('Grundformel','ml/h = (µg/kg/min × kg × 60) ÷ (µg/ml)'),('Tropfen (20 Tr./ml)','Tropfen/Min. = ml/h ÷ 3'),('Noradrenalin','z. B. 5 mg auf 50 ml = 100 µg/ml'),('Insulin','z. B. 50 IE auf 50 ml = 1 IE/ml'),('Merke','Konzentrationen immer nach Klinikstandard!')])
body+=sec('4','Hygiene-Kernfakten',[('Hyg. Händedesinfektion','3–5 ml · mind. 30 Sek. (EN 1500)'),('Chirurg. Händedesinfektion','1,5–3 Min. nach Herstellerangabe'),('5 WHO-Momente','Vor Patient · vor aseptisch · nach Körperflüssigkeit · nach Patient · nach Umgebung'),('C. difficile / Noro','Zusätzlich Hände waschen – Sporen!'),('PSA anlegen','Kittel → Maske → Brille → Handschuhe'),('PSA ablegen','Handschuhe → Kittel → Brille → Maske → Händedesinfektion')])
body+=sec('5','Ausbildung &amp; Recht NRW',[('Pflegefachfrau/-mann','3 Jahre Vollzeit · Teilzeit bis 5 Jahre · Verkürzung um bis zu 1 Jahr möglich'),('Staatliche Prüfung','3 schriftliche Klausuren · mündlich (30–45 Min.) · praktisch'),('Pflegefachassistenz NRW','1 Jahr · 700 h Theorie + 950 h Praxis'),('Ausländische Abschlüsse','Kenntnisprüfung oder Anpassungslehrgang'),('Zuständig in NRW','Bezirksregierung')])
body+=sec('6','Wichtige Abkürzungen',[('ATL / AEDL','(Aktivitäten und existenzielle Erfahrungen der) Aktivitäten des Lebens'),('PESR','Problem – Einflussfaktoren – Symptome – Ressourcen'),('SMART','Spezifisch · Messbar · Attraktiv · Realistisch · Terminiert'),('SBAR','Situation · Background · Assessment · Recommendation'),('DNQP','Dt. Netzwerk für Qualitätsentwicklung in der Pflege'),('ROSC','Return of Spontaneous Circulation'),('MH','Maligne Hyperthermie'),('HIT','Heparin-induzierte Thrombozytopenie')])
body+='</div>'+endbox()
build('/mnt/user-data/outputs/PLAN-NRW_Examens-Spickzettel.pdf','Examens-Spickzettel',body,X)
