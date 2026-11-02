from base import *
import sys, json, os
# Gratis-PDF „Isolationsmanagement“ aus window.PL_ISO (index.html), damit App und PDF gleich bleiben.
# Aufruf: python3 isolation.py <iso.json> <bilder-ordner mit iso-psa-an-<n>.png / iso-psa-ab-<n>.png> <ausgabe.pdf>
D=json.load(open(sys.argv[1])); IMG=os.path.abspath(sys.argv[2]); OUT=sys.argv[3]
X=""".ek{border:0.8pt solid #e2e8f0;border-radius:3mm;padding:2.4mm 3.5mm;margin-bottom:2.2mm;break-inside:avoid;font-size:9.2pt;line-height:1.38}
.ek h4{margin:0 0 1.5mm;font:800 10.5pt M;color:#0b1a35}.ek .w{display:inline-block;font:700 7.5pt M;border-radius:2mm;padding:.6mm 2mm;margin-bottom:1.5mm}
table.ez{width:100%;border-collapse:collapse;font-size:8.8pt}table.ez td{padding:.9mm 1.5mm;vertical-align:top;border-top:0.4pt solid #eef2f7}table.ez td:first-child{width:24mm;font-weight:700;color:#475569}
table.vg{width:100%;border-collapse:collapse;font-size:8.8pt}table.vg th{background:#0b1a35;color:#fff;font:700 8.5pt M;text-align:left;padding:1.8mm}table.vg td{padding:1.8mm;border-bottom:0.5pt solid #e2e8f0;vertical-align:top}table.vg td:first-child{font-weight:700;background:#f1f5f9}
.hg{break-inside:avoid;margin-bottom:3mm;display:grid;grid-template-columns:55mm 1fr;gap:4mm;align-items:start;border-bottom:0.6pt solid #e2e8f0;padding-bottom:3mm}
.hg img{width:55mm;border-radius:2.5mm}.hg .k{font:800 7.5pt M;letter-spacing:1pt;color:#14b8a6}.hg h4{margin:.5mm 0 1mm;font:800 10.5pt M;color:#0b1a35}.hg p{margin:0;font-size:9.4pt}
.merk{background:#ecfeff;border-left:1.8mm solid #0284c7;border-radius:2mm;padding:3mm 4mm;font:700 9.6pt M;color:#0b1a35;margin:1mm 0 4mm;break-inside:avoid}
.fall{border:0.8pt solid #e2e8f0;border-radius:3mm;padding:3mm 4.5mm;margin-bottom:4mm;break-inside:avoid;font-size:9.3pt}.fall h4{margin:0 0 1.5mm;font:800 10.5pt M;color:#0b1a35}
.fall ol{margin:1.5mm 0 0;padding-left:5mm}.fall li{margin:1.5mm 0}.fall .o{color:#475569}
.lsg{font-size:8.8pt;color:#334155}.lsg p{margin:0 0 1.6mm}
.say{background:#f0fdf4;border-left:1.5mm solid #22c55e;border-radius:2mm;padding:2.5mm 3.5mm;font-style:italic;margin-bottom:2mm;font-size:9.3pt;break-inside:avoid}"""
FARBE={'luft':'#7c3aed','tröpfchen':'#0284c7','blut':'#dc2626'}
def farbe(w):
    w=w.lower()
    for k,v in FARBE.items():
        if k in w: return v
    return '#d97706'
def ul(a): return '<ul>'+''.join(f'<li>{x}</li>' for x in a)+'</ul>'
def ol(a): return '<ol>'+''.join(f'<li>{x}</li>' for x in a)+'</ol>'
def karten(a): return ''.join(f'<div class="ek"><h4>{t}</h4>{x}</div>' for t,x in a)
TOC=['Begriffe &amp; Grundlagen','Übertragungswege','Isolierungsarten im Vergleich','Erreger von A bis Z','Schutzausrüstung im Detail','PSA anlegen &amp; ablegen','Händehygiene &amp; Desinfektion','Organisation &amp; Transport','Meldepflicht &amp; Ausbruch','Psyche &amp; Kommunikation','Fälle &amp; Quiz','Recht &amp; Quellen']
body=cover('Gratis-Lernhilfe · Hygiene','Isolations&shy;management',
 'Übertragungswege, '+str(len(D['erreger']))+' Erreger von A bis Z, Schutzausrüstung Schritt für Schritt, Desinfektion, Organisation, Meldepflicht – mit Fällen und Quiz.',
 ['Kontakt','Tröpfchen','Luft','PSA','Desinfektion','Recht'],[(str(len(D['erreger'])),'Erreger'),(str(len(D['faelle'])),'Fälle'),(str(len(D['quiz'])),'Quizfragen')],
 'Lernhilfe nach KRINKO-Empfehlungen, RKI und TRBA 250. Verbindlich ist immer der Hygieneplan deiner Einrichtung.',toc=TOC)
n=0
def h2(t,pb=True):
    global n; n+=1; return f'<h2{" class=\"pb\"" if pb and n>1 else ""}><span class="n">{n}</span>{t}</h2>'
body+=h2('Begriffe &amp; Grundlagen')+karten(D['begriffe'])+'<div class="tip">Basishygiene schützt immer. Erweiterte Maßnahmen kommen dazu – sie ersetzen die Basishygiene nie.</div>'
body+=h2('Übertragungswege')+''.join(f'<div class="ek" style="border-left:2mm solid {farbe(w["n"])}"><h4>{w["n"]}</h4><table class="ez"><tr><td>So</td><td>{w["wie"]}</td></tr><tr><td>Beispiele</td><td>{w["bsp"]}</td></tr><tr><td>Schutz</td><td>{w["schutz"]}</td></tr></table></div>' for w in D['wege'])
body+=h2('Isolierungsarten im Vergleich')+'<table class="vg"><tr><th></th><th>Kontakt</th><th>Tröpfchen</th><th>Luft (aerogen)</th></tr>'+''.join(f'<tr><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>' for r in D['vergleich'])+'</table>'+'<h3>Schutzisolierung (Umkehrisolierung)</h3>'+ul(D['schutz'])
body+=h2('Erreger von A bis Z')+''.join(f'<div class="ek"><span class="w" style="background:{farbe(e["weg"])}1f;color:{farbe(e["weg"])}">{e["weg"]}</span><h4>{e["n"]}</h4><table class="ez"><tr><td>Unterbringung</td><td>{e["unter"]}</td></tr><tr><td>Schutz</td><td>{e["psa"]}</td></tr><tr><td>Desinfektion</td><td>{e["des"]}</td></tr><tr><td>Dauer</td><td>{e["dauer"]}</td></tr><tr><td>Wichtig</td><td>{e["extra"]}</td></tr></table></div>' for e in D['erreger'])
body+=h2('Schutzausrüstung im Detail')+'<h3>Masken</h3>'+''.join(f'<div class="ek"><h4>{m["n"]} <span style="font:600 8pt M;color:#64748b">{m["norm"]}</span></h4>{m["txt"]}<br><b>Wann:</b> {m["wann"]}</div>' for m in D['masken'])
body+='<h3>FFP2: Dichtsitz prüfen</h3>'+ol(D['fitcheck'])+'<h3>Schutzkittel</h3>'+ul(D['kittel'])+'<h3>Handschuhe</h3>'+ul(D['handschuhe'])
body+=h2('PSA anlegen &amp; ablegen')
for h in D['psa']:
    body+=f'<h3>{h["t"]} – {h["s"]}</h3>'+''.join(f'<div class="hg"><img src="file://{IMG}/{h["id"]}-{i}.png"><div><div class="k">SCHRITT {i+1}</div><h4>{s["t"]}</h4><p>{s["x"]}</p></div></div>' for i,s in enumerate(h['schritte']))+f'<div class="merk">Merke: {h["merke"]}</div>'
body+=h2('Händehygiene &amp; Desinfektion')+ul(D['haende'])+'<h3>Wirkbereiche</h3><table class="vg"><tr><th>Wirkbereich</th><th>Wirkt gegen</th><th>Beispiel</th></tr>'+''.join(f'<tr><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>' for r in D['wirk'])+'</table>'
body+=h2('Organisation &amp; Transport')+karten(D['orga'])+'<h3>Transport &amp; Untersuchungen</h3>'+ol(D['transport'])
body+=h2('Meldepflicht &amp; Ausbruch')+karten(D['melde'])
body+=h2('Psyche &amp; Kommunikation')+ul(D['psyche'])+'<h3>Was hilft?</h3>'+ul(D['hilft'])+'<h3>So kannst du es sagen</h3>'+''.join(f'<div class="say">{s}</div>' for s in D['saetze'])
body+=h2('Fälle &amp; Quiz')
for i,f in enumerate(D['faelle']):
    body+=f'<div class="fall"><h4>Fall {i+1}: {f["t"]}</h4>{f["s"]}<ol>'+''.join(f'<li>{q["f"]}<br><span class="o">'+' · '.join(f'{"ABCD"[j]}) {o}' for j,o in enumerate(q['o']))+'</span></li>' for q in f['fr'])+'</ol></div>'
body+='<h3>Quiz</h3><div class="fall"><ol>'+''.join(f'<li>{q["f"]}<br><span class="o">'+' · '.join(f'{"ABCD"[j]}) {o}' for j,o in enumerate(q['o']))+'</span></li>' for q in D['quiz'])+'</ol></div>'
body+='<h3>Lösungen</h3><div class="lsg">'+''.join(f'<p><b>Fall {i+1}:</b> '+' · '.join(f'{j+1}) {"ABCD"[q["k"]]} – {q["e"]}' for j,q in enumerate(f['fr']))+'</p>' for i,f in enumerate(D['faelle']))
body+='<p><b>Quiz:</b> '+' · '.join(f'{j+1}) {"ABCD"[q["k"]]}' for j,q in enumerate(D['quiz']))+'</p></div>'
body+=h2('Recht &amp; Quellen')+karten(D['recht'])+'<h3>Quellen</h3><div style="font-size:8.6pt">'+ul(D['quellen'])+'</div>'
body+='<div class="tip" style="margin-top:3mm">Alles auch in der PLAN-App unter Wissen → „Isolationsmanagement“ – mit Animationen, Fällen zum Durchklicken und 2.000+ Prüfungsfragen fürs Examen.</div>'+endbox()
build(OUT,'Isolationsmanagement',body,X)
print('ok')
