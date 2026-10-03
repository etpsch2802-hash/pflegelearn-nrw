from base import *
X="""
.flow{display:flex;flex-direction:column;align-items:center}
.st{width:150mm;border:1pt solid #cbd5e1;border-radius:3mm;padding:3.6mm 5mm;text-align:center;background:#fff;break-inside:avoid}
.st b{font:700 11pt M;color:#0b1a35;display:block}
.st span{font:400 9.6pt S;color:#475569}
.st.q{border-color:#0284c7;background:#f0f9ff}
.st.a{border:1.6pt solid #dc2626;background:#fef2f2}
.st.a b{color:#991b1b}
.st.k{border:1.6pt solid #14b8a6;background:#f0fdfa}
.st.k b{font-size:13pt;color:#0f766e}
.ar{height:7.5mm;width:0;border-left:1.6pt solid #94a3b8;position:relative;margin:0}
.ar:after{content:"";position:absolute;left:-2.4mm;bottom:-1mm;border:2.2mm solid transparent;border-top:2.6mm solid #94a3b8;border-bottom:0}
.split{display:grid;grid-template-columns:1fr 1fr;gap:5mm;width:174mm;margin-top:1mm}
.split .flow{align-items:stretch}.split .st{width:auto}.split .ar{align-self:center}
.lane h4{font:800 9pt M;text-align:center;margin:0 0 2mm;padding:1.5mm;border-radius:2mm;color:#fff}
.chipsrow{display:flex;gap:2mm;justify-content:center;margin-top:1.5mm;flex-wrap:wrap}
.mini{font:700 8pt M;border-radius:10mm;padding:.8mm 3mm;background:#e0f2fe;color:#075985}
.cmp .st{padding:2.4mm 4mm}.cmp .ar{height:5mm}.cmp .card{padding:3mm 4mm;margin-bottom:3mm}.cmp .end{margin-top:3mm;padding:4mm 6mm}
"""
def s(t,sub='',c=''): return f'<div class="st {c}"><b>{t}</b>{"<span>"+sub+"</span>" if sub else ""}</div>'
A='<div class="ar"></div>'
def flow(*items): return '<div class="flow">'+A.join(items)+'</div>'
P=[]
P.append(cover('Notfall-Poster · Zum Ausdrucken','Reanimation &amp;<br>Notfall&shy;algorithmen',
 '4 Algorithmen im Überblick – Erwachsene, Kinder, Fremdkörper und erweiterte Maßnahmen. A4-Poster zum Ausdrucken, Laminieren und Lernen.',
 ['BLS Erwachsene','PBLS Kinder','Fremdkörper','ALS Klinik'],[('4','Algorithmen'),('A4','druckfertig'),('ERC','Leitlinien-basiert')],
 'Nur zu Ausbildungs- und Prüfungszwecken. Ersetzt kein zertifiziertes BLS-/ALS-Training, keine innerklinischen Standards und keine ärztliche Anordnung. Maßgeblich sind die jeweils aktuellen ERC-Leitlinien und dein Klinikstandard.',
 toc=['BLS – Basic Life Support','PBLS – Kinder &amp; Säuglinge','Fremdkörperverlegung','ALS – Advanced Life Support']))
P.append('<h2><span class="n">1</span>BLS – Basic Life Support</h2><p class="lead">Erwachsene · Ersthelfer außerhalb und innerhalb der Klinik</p>'+flow(
 s('Patient reagiert nicht?','Laut ansprechen, an den Schultern rütteln','q'),
 s('Laut um Hilfe rufen'),
 s('Atemwege freimachen &amp; Atmung prüfen','Kopf überstrecken, Kinn anheben · sehen, hören, fühlen – max. 10 Sek.'),
 s('Keine normale Atmung oder Schnappatmung','= Kreislaufstillstand','a'),
 s('Notruf 112 · AED holen lassen','Handy auf Lautsprecher, Patienten nicht verlassen'),
 s('30 Thoraxkompressionen','Mitte des Brustkorbs · 5–6 cm tief · 100–120/Min. · vollständig entlasten','k'),
 s('2 Beatmungen','Wenn geschult – sonst durchgehend drücken'),
 s('Zyklus 30 : 2 fortsetzen','Bis AED bereit, Rettungsdienst übernimmt oder Patient normal atmet','k'),
 s('AED anschließen, sobald verfügbar','Sprachanweisungen folgen · Unterbrechungen kurz halten')
)+'<div class="tip" style="margin-top:4mm">Merke: Alle 2 Minuten Drücker wechseln, wenn ein zweiter Helfer da ist – die Qualität der Kompressionen lässt schnell nach.</div>')
P.append('<h2 class="pb"><span class="n">2</span>PBLS – Paediatric Basic Life Support</h2><p class="lead">Säuglinge und Kinder bis zur Pubertät</p>'+flow(
 s('Kind reagiert nicht?','Ansprechen, sanft berühren – Säugling nicht schütteln','q'),
 s('Um Hilfe rufen'),
 s('Atemwege öffnen &amp; Atmung prüfen','Säugling: Kopf neutral · Kind: Kopf leicht überstrecken · max. 10 Sek.'),
 s('Keine normale Atmung','','a'),
 s('5 initiale Beatmungen','Säugling: Mund-zu-Mund-und-Nase · Kind: Mund-zu-Mund','k'),
 s('Lebenszeichen prüfen','Kein sicheres Lebenszeichen → sofort Kompressionen'),
 s('15 Kompressionen : 2 Beatmungen','1/3 der Brustkorbtiefe (Säugling ca. 4 cm, Kind ca. 5 cm) · 100–120/Min.','k'),
 s('Notruf 112','Zweiter Helfer sofort · allein: über Lautsprecher, sonst nach 1 Minute CPR'),
 s('15 : 2 fortsetzen','Bis Rettungsdienst übernimmt oder das Kind normal atmet')
)+'<div class="tip" style="margin-top:4mm">Merke: Säugling = zwei Finger oder zwei Daumen mit umgreifenden Händen · Kind = ein oder zwei Handballen.</div>')
P.append('<h2 class="pb"><span class="n">3</span>Fremdkörper&shy;verlegung der Atemwege</h2><p class="lead">Erwachsene und Kinder · Besonderheiten beim Säugling</p>'+flow(
 s('Plötzliches Husten, Würgen, Atemnot?','Oft beim Essen · Patient greift sich an den Hals','q'))+
 '<div class="split"><div class="lane"><h4 style="background:#14b8a6">Husten wirksam</h4>'+flow(
 s('Kann husten, sprechen, atmen'),s('Zum Husten ermutigen','Nichts weiter tun, engmaschig beobachten','k'),s('Verschlechterung?','→ wie bei unwirksamem Husten'))+
 '</div><div class="lane"><h4 style="background:#dc2626">Husten unwirksam</h4>'+flow(
 s('Kein Laut, keine Atmung','','a'),s('5 Rückenschläge','Zwischen die Schulterblätter, Oberkörper nach vorn gebeugt'),
 s('5 Oberbauchkompressionen','Heimlich-Manöver · Säugling: 5 Thoraxkompressionen!','k'),s('Im Wechsel 5 : 5','Bis Fremdkörper gelöst ist'))+
 '</div></div><div style="height:4mm"></div>'+flow(s('Wird bewusstlos?','Sofort Notruf 112 und mit CPR beginnen (BLS bzw. PBLS)','a'))+
 '<div class="note" style="margin-top:4mm">Nach Oberbauchkompressionen immer ärztlich abklären lassen – innere Verletzungen sind möglich.</div>')
P.append('<div class="cmp"><h2 class="pb"><span class="n">4</span>ALS – Advanced Life Support</h2><p class="lead">Klinischer Ablauf mit Defibrillator und Medikamenten</p>'+flow(
 s('Kreislaufstillstand · Reanimationsteam rufen','CPR 30 : 2 · Defibrillator/Monitor anschließen','q'),
 s('Rhythmus beurteilen'))+
 '<div class="split"><div class="lane"><h4 style="background:#dc2626">Schockbar (VF / pulslose VT)</h4>'+flow(
 s('1 Schock','','a'),s('Sofort CPR für 2 Min.','Danach Rhythmus erneut prüfen','k'),
 s('Nach dem 3. Schock','Adrenalin 1 mg i.v./i.o. + Amiodaron 300 mg'),s('Weiter','Adrenalin alle 3–5 Min. · Amiodaron 150 mg nach dem 5. Schock'))+
 '</div><div class="lane"><h4 style="background:#0284c7">Nicht schockbar (Asystolie / PEA)</h4>'+flow(
 s('Sofort CPR für 2 Min.','','k'),s('Adrenalin 1 mg i.v./i.o.','So früh wie möglich'),s('Rhythmus alle 2 Min. prüfen'),s('Adrenalin alle 3–5 Min.'))+
 '</div></div>'+
 '<div class="grid2" style="margin-top:4mm"><div class="card t"><h3 style="margin-top:0">Während der CPR</h3><ul><li>Hochwertige Kompressionen, Pausen &lt; 5 Sek.</li><li>Sauerstoff, Atemwegssicherung, Kapnografie</li><li>Gefäßzugang i.v. oder i.o.</li></ul></div>'+
 '<div class="card t"><h3 style="margin-top:0">Reversible Ursachen</h3><ul><li><b>4 H:</b> Hypoxie · Hypovolämie · Hypo-/Hyperkaliämie (metabolisch) · Hypo-/Hyperthermie</li><li><b>HITS:</b> Herzbeuteltamponade · Intoxikation · Thrombose (Lunge/Herz) · Spannungspneumothorax</li></ul></div></div>'+
 '<div class="tip">Nach ROSC: ABCDE-Schema · SpO<sub>2</sub> 94–98 % · 12-Kanal-EKG · Ursache behandeln · Fieber vermeiden.</div>'+endbox()+'</div>')
build('/mnt/user-data/outputs/PLAN-NRW_Reanimations-Algorithmen.pdf','Reanimation &amp; Notfallalgorithmen',''.join(P),X)
