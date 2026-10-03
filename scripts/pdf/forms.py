from base import *
X=""".fm{page-break-before:always}.meta{display:grid;grid-template-columns:2fr 1fr 2fr;gap:3mm;margin-bottom:3mm}
.fl{border-bottom:0.8pt solid #94a3b8;font:600 7.5pt M;color:#64748b;padding:5mm 0 1mm}
.box{border:0.8pt solid #cbd5e1;border-radius:2mm;margin-bottom:3mm;break-inside:avoid}
.box .bh{background:#f0fdfa;border-bottom:0.8pt solid #cbd5e1;padding:1.4mm 3mm;font:700 7.6pt M;letter-spacing:.8pt;color:#0f766e;text-transform:uppercase}
.box .bb{background:repeating-linear-gradient(#fff 0,#fff 6.6mm,#e2e8f0 6.6mm,#e2e8f0 6.9mm);}
.cb{display:inline-block;margin-right:5mm;font-size:9.5pt}.cb:before{content:"";display:inline-block;width:3.2mm;height:3.2mm;border:0.9pt solid #475569;border-radius:.6mm;margin-right:1.5mm;vertical-align:-0.5mm}
table.g{width:100%;border-collapse:collapse;font-size:8.5pt}table.g th{background:#0b1a35;color:#fff;font:700 7.5pt M;padding:1.6mm;text-align:left}
table.g td{border:0.6pt solid #cbd5e1;height:8.2mm}
.ex{font-size:9.3pt}.ex .bb{background:none;padding:2.4mm 3mm}"""
def box(t,h,extra=''): return f'<div class="box"><div class="bh">{t}</div><div class="bb" style="height:{h}mm">{extra}</div></div>'
def meta(*f): return '<div class="meta">'+''.join(f'<div class="fl">{x}</div>' for x in f)+'</div>'
def grid(cols,rows,widths=None):
    th=''.join(f'<th{(" style=width:"+widths[i]) if widths else ""}>{c}</th>' for i,c in enumerate(cols))
    return f'<table class="g"><tr>{th}</tr>'+('<tr>'+'<td></td>'*len(cols)+'</tr>')*rows+'</table>'
# ---------- Pflegeplanung
aedl=['Kommunizieren können','Sich bewegen können','Vitale Funktionen aufrechterhalten können','Sich pflegen können','Essen und trinken können','Ausscheiden können','Sich kleiden können','Ruhen und schlafen können','Sich beschäftigen, lernen, sich entwickeln können','Sich als Mann/Frau/Mensch fühlen können','Für eine sichere/fördernde Umgebung sorgen können','Soziale Kontakte und Beziehungen sichern können','Mit existenziellen Erfahrungen umgehen können']
b=cover('Formulare · Zum Ausdrucken','Pflegeplanungs-<br>Vorlagen','Druckfertige Formulare für deine Pflegeplanung nach dem AEDL-Modell – mit Anleitung zu PESR und SMART und einem ausgefüllten Beispiel.',
 ['AEDL nach Krohwinkel','PESR','SMART-Ziele','Beispiel'],[('8','Formulare'),('2','Musterbeispiele'),('A4','druckfertig')],
 'Formulare dürfen für Ausbildung und Praxis beliebig oft kopiert werden. Es gelten die Dokumentationsvorgaben deiner Einrichtung.',
 toc=['AEDL-Übersicht &amp; Anleitung','Ausgefülltes Beispiel','Positiv formulieren + Beispiel','8 Formulare Pflegeplanung'])
b+='<h2>So schreibst du eine gute Pflegeplanung</h2><p class="lead">Die 13 AEDL nach Monika Krohwinkel und die vier Schritte zur Planung.</p>'
b+='<div class="grid2"><div class="card t"><h3 style="margin-top:0">13 AEDL nach Krohwinkel</h3><ol style="margin:0;padding-left:5mm">'+''.join(f'<li>{a}</li>' for a in aedl)+'</ol></div><div>'
for n,(t,d) in enumerate([('Problem nach PESR','<b>P</b>roblem · <b>E</b>influssfaktoren (Ursache) · <b>S</b>ymptome · <b>R</b>essourcen – immer individuell für diesen Patienten.'),('Ziel nach SMART','<b>S</b>pezifisch · <b>M</b>essbar · <b>A</b>ttraktiv/erreichbar · <b>R</b>ealistisch · <b>T</b>erminiert. Aus Sicht des Patienten formulieren.'),('Maßnahmen','Konkret und überprüfbar: Wer macht was, wann, wie oft, womit?'),('Evaluation','Datum festlegen und prüfen: Ziel erreicht? Wenn nicht – Ursache suchen und Plan anpassen.')],1):
    b+=f'<div class="card t"><h3 style="margin-top:0">{n} · {t}</h3>{d}</div>'
b+='</div></div><div class="tip">Typischer Fehler: „Patient soll sich wohlfühlen" ist kein Ziel – es ist weder messbar noch terminiert. Besser: „Patient gibt bis morgen 12 Uhr Schmerzen ≤ 3 auf der NRS an."</div>'
b+='<div class="fm ex"><h2>Musterbeispiel</h2><p class="lead">So kann ein ausgefülltes Formular aussehen – Patient nach Hüft-TEP, 2. postoperativer Tag.</p>'
for t,v in [('AEDL-Bereich','Sich bewegen können'),('Pflegeproblem (PESR)','Eingeschränkte Mobilität (P) durch Wundschmerz und Luxationsgefahr nach Hüft-TEP links (E), zeigt sich in Schonhaltung und Angst vor dem Aufstehen, NRS 6 bei Bewegung (S).'),('Ressourcen','Motiviert, kennt Gehstützen, Ehefrau unterstützt, versteht Anleitungen.'),('Pflegeziel (SMART)','Patient geht am 4. postoperativen Tag mit zwei Unterarmgehstützen und Begleitung 20 m auf dem Flur, Schmerz bei Bewegung ≤ 3 (NRS).'),('Maßnahmen','Analgesie nach Anordnung 30 Min. vor der Mobilisation · Mobilisation 3× täglich mit Physiotherapie · Transfer über die operierte Seite anleiten · Verbotspositionen (Beugung &gt; 90°, Beine überkreuzen) erklären · Sturzprophylaxe: rutschfeste Schuhe, Klingel in Reichweite'),('Evaluation','Täglich NRS und Gehstrecke dokumentieren · Zielüberprüfung am 4. postoperativen Tag')]:
    b+=f'<div class="box"><div class="bh">{t}</div><div class="bb">{v}</div></div>'
b+='</div>'
b+='<div class="fm"><h2>Positiv formulieren</h2><p class="lead">Ressourcenorientiert schreiben: Was <b>kann</b> der Mensch, wobei braucht er Unterstützung, was soll <b>erreicht</b> werden – statt nur aufzuzählen, was nicht geht.</p>'
b+='<table class="kv" style="font-size:9.4pt;margin-bottom:4mm"><tr><td style="background:#fef2f2;color:#991b1b">Defizitorientiert</td><td style="background:#f0fdfa;color:#0f766e;font-weight:700">Positiv / ressourcenorientiert</td></tr>'
for x,y in [('Patient kann nicht allein aufstehen.','Patient steht mit Unterstützung einer Pflegeperson aus dem Bett auf.'),('Patientin isst zu wenig.','Patientin isst derzeit etwa ein Drittel ihrer Mahlzeiten und mag am liebsten warme, weiche Kost.'),('Ziel: Kein Dekubitus.','Ziel: Die Haut an Sakrum und Fersen bleibt intakt.'),('Ziel: Patient stürzt nicht.','Ziel: Patient geht sicher mit Rollator zur Toilette.'),('Patient ist unkooperativ.','Patient möchte selbst bestimmen, wann er gewaschen wird.')]:
    b+=f'<tr><td style="font-weight:400;color:#475569">{x}</td><td>{y}</td></tr>'
b+='</table><h3>Musterbeispiel positiv formuliert</h3><p style="margin:0 0 2mm;font-size:9.3pt;color:#475569">Frau K., 84 Jahre, nach Pneumonie seit 5 Tagen überwiegend im Bett, Braden-Skala 13 Punkte.</p><div class="ex">'
for t,v in [('AEDL-Bereich','Sich bewegen können · Für eine sichere Umgebung sorgen können'),('Pflegeproblem (PESR)','Frau K. kann ihre Lage im Bett mit Anleitung selbst verändern (Ressource), bewegt sich aber durch die Erschöpfung nach Pneumonie (E) noch wenig von allein; erhöhte Druckbelastung an Sakrum und Fersen, Braden 13 (S).'),('Ressourcen','Versteht Anleitungen, dreht sich auf Ansprache selbst zur Seite, trinkt gern Tee, Tochter besucht täglich.'),('Pflegeziel (SMART)','Die Haut an Sakrum und Fersen bleibt bis zur Entlassung intakt. Frau K. verändert ihre Position ab morgen mindestens alle 2 Stunden selbstständig oder mit Anleitung.'),('Maßnahmen','Bewegungsplan gemeinsam mit Frau K. erstellen, an Lagewechsel erinnern · Mikrobewegungen und 30°-Lagerung anleiten, Fersen frei lagern · Haut bei jeder Pflege beobachten (Fingertest) · Trinkmenge 1,5 l fördern – Lieblingstee anbieten · Tochter in Bewegungsförderung einbeziehen'),('Evaluation','Täglich Hautzustand und Bewegungsprotokoll prüfen, Braden-Skala alle 3 Tage neu erheben')]:
    b+=f'<div class="box"><div class="bh">{t}</div><div class="bb">{v}</div></div>'
b+='</div><div class="tip">Merke: Positive Ziele beschreiben einen Zustand, den man sehen und überprüfen kann („Haut bleibt intakt", „geht 20 m"). So weiß jede Kollegin bei der Evaluation sofort, ob das Ziel erreicht ist.</div></div>'
for i in range(1,9):
    b+=f'<div class="fm"><h2>Pflegeplanung <span style="color:#14b8a6">· Formular {i}</span></h2>'+meta('Patient / Kürzel','Datum','AEDL-Bereich')
    b+=box('Pflegeproblem (PESR: Problem – Einflussfaktoren – Symptome)',34)+box('Ressourcen',20)+box('Pflegeziel (SMART)',27)+box('Maßnahmen (wer · was · wann · wie oft)',48)+box('Evaluation · Datum der Überprüfung',20)+'</div>'
b+=endbox()
build('/mnt/user-data/outputs/PLAN-NRW_Pflegeplanungs-Vorlagen.pdf','Pflegeplanungs-Vorlagen',b,X)
# ---------- Dokumentation
d=cover('Formulare · Zum Ausdrucken','Dokumentations-<br>vorlagen','Fünf druckfertige Formulare für Ausbildung und Praxis – von der Wunddokumentation bis zur strukturierten SBAR-Übergabe.',
 ['Wunde','Vitalzeichen','SBAR','Pflegebericht','Sturz'],[('5','Formulare'),('A4','druckfertig'),('∞','kopierbar')],
 'Formulare zu Übungs- und Ausbildungszwecken. Es gelten die Dokumentationsvorgaben deiner Einrichtung.',
 toc=['Wunddokumentationsbogen','Vitalzeichen-Verlaufsbogen','SBAR-Übergabebogen','Pflegebericht','Sturz- und Ereignisprotokoll'])
cb=lambda *x:'<div style="padding:2mm 3mm">'+''.join(f'<span class="cb">{i}</span>' for i in x)+'</div>'
d+='<div><h2><span class="n">1</span>Wunddokumentationsbogen</h2>'+meta('Patient / Kürzel','Datum','Untersucher/in')
d+=box('Lokalisation &amp; Wundart',14)+box('Wundgröße (Länge × Breite × Tiefe in cm)',10)
d+='<div class="box"><div class="bh">Wundgrund</div>'+cb('Granulierend','Fibrinbelegt','Nekrotisch','Epithelisierend')+'</div>'
d+='<div class="box"><div class="bh">Exsudat</div>'+cb('Kein','Gering','Mäßig','Stark')+'<div style="padding:0 3mm 2mm;font-size:9pt;color:#64748b">Farbe / Geruch: ________________________________</div></div>'
d+='<div class="box"><div class="bh">Infektionszeichen</div>'+cb('Rötung','Überwärmung','Schwellung','Schmerz','Geruch')+'</div>'
d+=box('Wundrand / Wundumgebung',12)+box('Maßnahmen / Verbandmaterial',14)
d+='<h3>Verlauf</h3>'+grid(['Datum','Größe','Wundgrund','Exsudat','Maßnahme','Hdz.'],5)+'<p style="font-size:8pt;color:#64748b;margin-top:2mm">Orientierung am DNQP-Expertenstandard „Pflege von Menschen mit chronischen Wunden".</p></div>'
d+='<div class="fm"><h2><span class="n">2</span>Vitalzeichen-Verlaufsbogen</h2>'+meta('Patient / Kürzel','Woche','Station / Zimmer')+grid(['Datum','Uhrzeit','RR','Puls','AF','Temp.','SpO₂','BZ','NRS','Hdz.'],22)+'</div>'
d+='<div class="fm"><h2><span class="n">3</span>SBAR-Übergabebogen</h2>'+meta('Patient / Kürzel','Datum / Uhrzeit','Übergabe von → an')
for t,h in [('S – Situation: Wer, wo, was ist das aktuelle Problem?',38),('B – Background: Diagnosen, Vorgeschichte, Medikamente',44),('A – Assessment: Vitalwerte, Einschätzung, Auffälligkeiten',44),('R – Recommendation: Was ist zu tun, was brauche ich?',44)]: d+=box(t,h)
d+='</div><div class="fm"><h2><span class="n">4</span>Pflegebericht</h2>'+meta('Patient / Kürzel','Station','Blatt-Nr.')+grid(['Datum','Uhrzeit','Eintrag','Hdz.'],24,['18mm','16mm','auto','14mm'])+'</div>'
d+='<div class="fm"><h2><span class="n">5</span>Sturz- und Ereignisprotokoll</h2>'+meta('Patient / Kürzel','Datum / Uhrzeit','Ort')
d+=box('Hergang des Ereignisses (Wer hat was beobachtet?)',30)+box('Verletzungen / Symptome',20)
d+='<div class="box"><div class="bh">Sofortmaßnahmen</div>'+cb('Vitalzeichen kontrolliert','Arzt informiert','Angehörige informiert','Wunde versorgt')+'</div>'
d+='<div class="box"><div class="bh">Bekannte Risikofaktoren</div>'+cb('Sturzanamnese','Gangunsicherheit','Sehbeeinträchtigung','Sedierende Medikamente','Inkontinenz')+'</div>'
d+=box('Weitere Maßnahmen / Anpassung der Pflegeplanung',26)+meta('Dokumentiert von','Datum','Unterschrift')+'</div>'+endbox()
build('/mnt/user-data/outputs/PLAN-NRW_Dokumentationsvorlagen.pdf','Dokumentationsvorlagen',d,X)
