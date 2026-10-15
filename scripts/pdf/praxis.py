from base import *
# Praxis-Examen-Spickzettel – Inhalte aus dem Examen-Kompass (fachlich freigegeben 14.10.2026)
X=""".sec{break-inside:avoid;margin-bottom:4mm}.sec h3{margin-top:0;display:flex;align-items:center;gap:2mm}
.sec h3 i{font-style:normal;display:inline-block;width:6mm;height:6mm;border-radius:1.5mm;background:#14b8a6;color:#fff;text-align:center;font:800 8pt/6mm M}
.bau{display:grid;grid-template-columns:1fr 1fr;gap:3mm;break-inside:avoid;margin-bottom:4mm}
.bau div{border-radius:3mm;padding:3mm 4mm;background:#f0fdfa;border-left:2mm solid #14b8a6}
.bau b{display:block;font:800 10pt M;color:#0b1a35;margin-bottom:1mm}
.feld{border:0.8pt solid #cbd5e1;border-radius:2mm;padding:2mm 3mm;margin-bottom:2.5mm;break-inside:avoid}
.feld b{font:700 8.5pt M;color:#0284c7}.feld .l{border-bottom:0.6pt dotted #94a3b8;height:6mm}
.chk li{list-style:none;margin:1.4mm 0}.chk li:before{content:"☐  ";color:#14b8a6;font-weight:700}
.chk{padding-left:1mm}"""
def ul(items): return '<ul>'+''.join(f'<li>{x}</li>' for x in items)+'</ul>'

body=cover('Gratis-Lernhilfe · Examen','Praxis-Examen-<br>Spickzettel',
 'So läuft die praktische Prüfung ab – mit Fallvorstellung, Reflexionsgespräch, den 10 typischen Fehlern und einer Checkliste für den Prüfungstag.',
 ['Ablauf','4 Bausteine','Fallvorstellung','Reflexion','Fehler','Checkliste'],
 [('4','Prüfungsbausteine'),('10','typische Fehler'),('A4','druckfertig')],
 'Grundlage: PflAPrV § 16 (Pflegefachfrau/-mann). Organisation, Termine und Einsatzort regelt deine Pflegeschule bzw. der Prüfungsausschuss.',
 toc=['So läuft die Prüfung ab','Fallvorstellung vorbereiten','Reflexionsgespräch','10 typische Fehler','Checkliste Prüfungstag','Gegen Nervosität'])

body+='<h2>So läuft die praktische Prüfung ab</h2><p class="lead">In einer echten Pflegesituation zeigst du, dass du den Pflegeprozess selbstständig steuern kannst.</p>'
body+='<div class="sec card t"><h3><i>1</i>Rahmen</h3>'+ul([
 'Reale, komplexe Pflegesituation – möglichst im Bereich deines <b>Vertiefungseinsatzes</b>.',
 'Du versorgst <b>mindestens zwei Menschen</b>, davon einer mit <b>erhöhtem Pflegebedarf</b>.',
 'Im Mittelpunkt stehen die <b>Vorbehaltsaufgaben</b>: Pflegebedarf erheben, Pflegeprozess planen, steuern und evaluieren.',
 'Zwei Fachprüfende bewerten, bestanden ist ab der Note „ausreichend“. Die Vornote aus der praktischen Ausbildung zählt mit 25 %.'])+'</div>'
body+='<h3>Die 4 Bausteine</h3><div class="bau">'
body+='<div><b>1 · Vorbereitungsteil</b>Du erstellst vorab unter Aufsicht deinen Pflegeplan.</div>'
body+='<div><b>2 · Fallvorstellung</b>Höchstens 20 Minuten.</div>'
body+='<div><b>3 · Durchführung</b>Die geplanten und die situativ nötigen Pflegemaßnahmen.</div>'
body+='<div><b>4 · Reflexionsgespräch</b>Höchstens 20 Minuten.</div></div>'
body+='<div class="tip"><b>Dauer:</b> ohne Vorbereitungsteil höchstens 240 Minuten inklusive Reflexionsgespräch. Eine organisatorische Unterbrechung von höchstens einem Werktag ist möglich.</div>'

body+='<h2 class="pb">Fallvorstellung vorbereiten</h2><p class="lead">Dein roter Faden für maximal 20 Minuten – direkt zum Ausfüllen.</p>'
for t in ['Person: Alter, Lebenssituation, wichtige Biografie, Diagnosen','Aktuelle Situation: Warum ist die Person hier, was hat sich verändert?','Pflegebedarf: wichtigste Probleme UND Ressourcen, Risiken (z. B. Dekubitus, Sturz)','Ziele &amp; Maßnahmen: was du heute tust – und warum (Begründung, Standard)','Ausblick: woran du den Erfolg erkennst – und dein Plan B bei Abweichung']:
    body+=f'<div class="feld"><b>{t}</b><div class="l"></div><div class="l"></div></div>'
body+='<div class="tip"><b>Tipps:</b> Stichpunkte statt Ablesen · das Wichtigste zuerst · die Person als Mensch vorstellen, nicht nur als Diagnose.</div>'

body+='<h2 class="pb">Reflexionsgespräch</h2><p class="lead">Ehrlich und fachlich begründet – Fehler erkennen zählt mehr als perfekt wirken.</p>'
body+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">Typische Fragen</h3>'+ul(['Was ist dir gut gelungen – woran machst du das fest?','Wo bist du vom Plan abgewichen und warum?','Was würdest du beim nächsten Mal anders machen?','Wie hast du die Perspektive der zu pflegenden Person einbezogen?'])+'</div>'
body+='<div class="card t"><h3 style="margin-top:0">So antwortest du</h3>'+ul(['Selbstkritisch, aber sachlich bleiben.','Abweichungen begründen: Die Situation hat sich geändert, also hast du angepasst.','Eine konkrete Verbesserung nennen statt „ich würde besser aufpassen“.'])+'</div></div>'

body+='<h2>10 typische Fehler – und wie du sie vermeidest</h2>'
F=['Händedesinfektion vergessen – vor und nach jedem Kontakt.','Identität und Einverständnis nicht geprüft.','Dich nicht vorgestellt oder nicht erklärt, was du tust.','Den Prüfer statt die zu pflegende Person ansprechen.','Maßnahmen ohne Begründung durchführen.','Starr am Plan festhalten, obwohl sich die Situation ändert.','Sicherheit vergessen: Bett runter, Bremse, Klingel in Reichweite.','Beobachtungen (Haut, Vitalwerte) nicht ansprechen oder nicht dokumentieren.','Zeit schlecht eingeteilt – der zweite Patient kommt zu kurz.','Dokumentation und Übergabe am Ende fehlen.']
body+='<table class="kv">'+''.join(f'<tr><td style="width:8%">{i+1}</td><td>{f}</td></tr>' for i,f in enumerate(F))+'</table>'

body+='<h2 class="pb">Checkliste Prüfungstag</h2>'
body+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">Am Vortag</h3><ul class="chk"><li>Dienstkleidung &amp; Namensschild</li><li>Uhr mit Sekundenzeiger</li><li>Stift &amp; Taschenlampe</li><li>Pflegeplan-Unterlagen</li><li>Ausweis</li><li>Früh schlafen – nur kurz wiederholen</li></ul></div>'
body+='<div class="card t"><h3 style="margin-top:0">Am Morgen</h3><ul class="chk"><li>Frühstücken und trinken</li><li>Früh da sein</li><li>Kurz durchatmen</li><li>Hände desinfiziert, Schmuck ab</li></ul></div></div>'
body+='<div class="sec card t"><h3><i>!</i>Gegen Nervosität</h3>'+ul(['Ruhig atmen: 4 Sekunden ein, 6 Sekunden aus.','Nervosität ist normal – die Prüfenden kennen das.','Bei einem Blackout: kurz innehalten, laut zusammenfassen, Schritt für Schritt weiter.'])+'</div>'
body+='<div class="tip">Mündliche Prüfung üben? In der PLAN-App gibt es die <b>mündliche KI-Prüfung</b>, das <b>Fachgespräch</b> und den <b>Examen-Kompass</b>.</div>'
body+=endbox()
build('/mnt/user-data/outputs/PLAN-NRW_Praxis-Examen-Spickzettel.pdf','Praxis-Examen-Spickzettel',body,X)
