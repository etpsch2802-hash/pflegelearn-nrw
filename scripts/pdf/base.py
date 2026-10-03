from weasyprint import HTML
import os
D=os.path.dirname(os.path.abspath(__file__)); F=os.path.join(D,'..','fonts')
NAVY='#0b1a35'; TEAL='#14b8a6'; SKY='#0284c7'; GOLD='#b8925a'
CSS=f"""
@font-face{{font-family:M;src:url(file://{F}/Montserrat-Regular.ttf);font-weight:400}}
@font-face{{font-family:M;src:url(file://{F}/Montserrat-SemiBold.ttf);font-weight:600}}
@font-face{{font-family:M;src:url(file://{F}/Montserrat-Bold.ttf);font-weight:700}}
@font-face{{font-family:M;src:url(file://{F}/Montserrat-ExtraBold.ttf);font-weight:800}}
@font-face{{font-family:S;src:url(file://{F}/SourceSans3-Regular.ttf);font-weight:400}}
@font-face{{font-family:S;src:url(file://{F}/SourceSans3-Semibold.ttf);font-weight:600}}
@font-face{{font-family:S;src:url(file://{F}/SourceSans3-Bold.ttf);font-weight:700}}
@font-face{{font-family:S;src:url(file://{F}/SourceSans3-It.ttf);font-style:italic}}
@page{{size:A4;margin:24mm 15mm 17mm 15mm;
  @top-left{{content:element(hdr);width:100%}}
  @bottom-left{{content:"plan-nrw.de  ·  Bestehen ist planbar.";font:600 7.5pt M;color:#64748b;width:120mm;border-top:0.6pt solid #cbd5e1;vertical-align:top;padding-top:2mm}}
  @bottom-right{{content:"Seite " counter(page) " von " counter(pages);font:600 7.5pt M;color:#64748b;width:60mm;border-top:0.6pt solid #cbd5e1;vertical-align:top;padding-top:2mm}}
}}
@page cover{{margin:0;@top-left{{content:none}}@bottom-left{{content:none}}@bottom-right{{content:none}}}}
*{{box-sizing:border-box}}
body{{font:400 10pt/1.45 S;color:#1e293b;margin:0}}
.hdr{{position:running(hdr);display:flex;align-items:center;gap:3mm;border-bottom:1.2pt solid {TEAL};padding-bottom:2mm;margin-top:8mm}}
.hdr img{{width:10mm;height:10mm}}
.hdr .b{{font:800 11pt M;color:{NAVY};letter-spacing:.5pt}} .hdr .b span{{color:{TEAL}}}
.hdr .t{{margin-left:auto;font:600 8pt M;color:#64748b}}
/* Cover */
.cover{{page:cover;height:297mm;position:relative;background:#fff;page-break-after:always;overflow:hidden}}
.cover .band{{background:{NAVY};height:118mm;padding:22mm 18mm 0;color:#fff;position:relative}}
.cover .band:after{{content:"";position:absolute;left:0;right:0;bottom:-1.5mm;height:3mm;background:linear-gradient(90deg,{TEAL},{SKY})}}
.cover .kicker{{font:700 9pt M;letter-spacing:2.5pt;color:#5eead4;text-transform:uppercase}}
.cover h1{{font:800 32pt/1.08 M;margin:4mm 0 3mm;color:#fff;max-width:130mm}}
.cover .sub{{font:400 12.5pt/1.4 S;color:#cbd5e1;max-width:125mm}}
.cover .claim{{position:absolute;left:18mm;bottom:12mm;font:800 15pt M;color:#5eead4;letter-spacing:.3pt}}
.cover .claim span{{color:#fff}}
.cover .logo{{position:absolute;right:18mm;top:20mm;width:38mm;height:38mm}}
.cover .body{{padding:22mm 18mm 0}}
.cover .chips{{display:flex;flex-wrap:wrap;gap:3mm;margin-top:0}}
.toc{{margin-top:9mm;display:grid;grid-template-columns:1fr 1fr;gap:2.5mm 8mm}}
.toc .tt{{grid-column:1/3;font:700 9pt M;letter-spacing:1.5pt;text-transform:uppercase;color:{SKY}}}
.toc .ti{{font:600 10pt M;color:{NAVY};border-bottom:0.6pt solid #e2e8f0;padding:1.6mm 0}}
.toc .ti i{{font-style:normal;display:inline-block;width:6mm;height:6mm;border-radius:50%;background:{TEAL};color:#fff;text-align:center;font:800 8pt/6mm M;margin-right:2.5mm}}
.chip{{display:inline-block;border:1pt solid {TEAL};color:{NAVY};border-radius:20mm;padding:1.6mm 4mm;font:700 8.5pt M;background:#f0fdfa}}
.cover .facts{{display:flex;gap:6mm;margin-top:14mm}}
.fact{{flex:1;border-radius:4mm;background:#f1f5f9;padding:5mm;border-left:2mm solid {TEAL}}}
.fact b{{display:block;font:800 18pt M;color:{NAVY}}} .fact span{{font:600 8.5pt M;color:#475569}}
.cover .author{{position:absolute;left:18mm;right:18mm;bottom:16mm;border-top:0.8pt solid #e2e8f0;padding-top:5mm;display:flex;justify-content:space-between;font:600 8.5pt M;color:#475569}}
.cover .author b{{color:{NAVY};font-weight:800}}
.cover .warn{{margin:10mm 0 0;font:400 8.5pt/1.4 S;color:#64748b;max-width:174mm}}
/* Content */
h2{{font:800 17pt M;color:{NAVY};margin:0 0 1mm}}
h2 .n{{display:inline-block;background:{TEAL};color:#fff;border-radius:2mm;padding:0 2.4mm;margin-right:2.5mm;font-size:13pt}}
.lead{{font:400 10.5pt S;color:#475569;margin:0 0 5mm}}
h3{{font:700 9pt M;letter-spacing:1.2pt;text-transform:uppercase;color:{SKY};margin:4mm 0 1.5mm}}
.card{{border:0.8pt solid #e2e8f0;border-radius:3mm;padding:4mm 5mm;margin-bottom:4mm;break-inside:avoid;background:#fff}}
.card.t{{border-top:2.2pt solid {TEAL}}}
ul{{margin:0;padding-left:4.5mm}} li{{margin:.6mm 0}} li::marker{{color:{TEAL}}}
.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:4mm}}
.note{{background:#fff7ed;border-left:1.8mm solid #f59e0b;border-radius:2mm;padding:3mm 4mm;font-size:9pt;color:#7c2d12;break-inside:avoid}}
.tip{{background:#f0fdfa;border-left:1.8mm solid {TEAL};border-radius:2mm;padding:3mm 4mm;font-size:9pt;color:#134e4a;break-inside:avoid}}
.pb{{page-break-before:always}}
table.kv{{width:100%;border-collapse:collapse;font-size:9.3pt}}
table.kv td{{padding:1.5mm 2mm;border-bottom:0.5pt solid #e2e8f0;vertical-align:top}}
table.kv td:first-child{{font-weight:700;color:{NAVY};width:42%}}
table.kv tr:nth-child(even) td{{background:#f8fafc}}
.end{{margin-top:6mm;border-radius:4mm;background:{NAVY};color:#fff;padding:6mm 7mm;display:flex;align-items:center;gap:6mm;break-inside:avoid}}
.end img{{width:20mm;height:20mm}} .end b{{font:800 12pt M;display:block;margin-bottom:1mm}} .end span{{font:400 9.5pt S;color:#cbd5e1}}
.end .u{{color:#5eead4;font-weight:700}}
"""
def header(title):
    return f'<div class="hdr"><img src="file://{D}/logo.png"><div class="b">PLAN <span>NRW</span></div><div class="t">{title}</div></div>'
def cover(kicker,title,sub,chips,facts,warn='',toc=None):
    ch=''.join(f'<span class="chip">{c}</span>' for c in chips)
    fa=''.join(f'<div class="fact"><b>{a}</b><span>{b}</span></div>' for a,b in facts)
    w=f'<div class="warn">⚠ {warn}</div>' if warn else ''
    tc=('<div class="toc"><div class="tt">Inhalt</div>'+''.join(f'<div class="ti"><i>{i+1}</i>{t}</div>' for i,t in enumerate(toc))+'</div>') if toc else ''
    return f'''<div class="cover"><div class="band"><div class="kicker">{kicker}</div><h1>{title}</h1><div class="sub">{sub}</div><img class="logo" src="file://{D}/logo.png"><div class="claim">Bestehen ist <span>planbar.</span></div></div>
<div class="body"><div class="chips">{ch}</div><div class="facts">{fa}</div>{tc}{w}</div>
<div class="author"><div><b>Patrick Schenkelberger</b> · Fachpfleger Anästhesie & Intensivmedizin, Praxisanleiter</div><div><b>plan-nrw.de</b></div></div></div>'''
def endbox():
    return f'<div class="end"><img src="file://{D}/logo.png"><div><b>Bestehen ist planbar. Mit der PLAN-App.</b><span>Prüfungsfragen mit Erklärungen, Krankheitsbilder, Pflegeplanung und KI-Lernhilfe – kostenlos auf <span class="u">plan-nrw.de</span></span></div></div>'
def build(path,title,body,extra_css=''):
    html=f'<html lang="de"><head><meta charset="utf-8"><style>{CSS}{extra_css}</style></head><body>{header(title)}{body}</body></html>'
    HTML(string=html,base_url=D).write_pdf(path)
