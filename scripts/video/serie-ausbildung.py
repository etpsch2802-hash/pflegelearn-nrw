#!/usr/bin/env python3
"""Erzeugt die Videoseiten „Ausbildung meistern“ Teil 2–12 (ohne Voice-over, nur Text).
Inhalte: freigegebene Tipp-Karten (window.PL_AUSBILDUNG_KARTEN in index.html).
Aufruf: python3 serie-ausbildung.py  → am-02.html … am-12.html im selben Ordner.
"""
import os, re, json

H = os.path.dirname(os.path.abspath(__file__))
V = open(os.path.join(H, 'vorlage-gemini.html'), encoding='utf-8').read()
KOPF = V[:V.index('<!-- S1')]
SKRIPT = V[V.index('<script>'):]

HILFE = 'TelefonSeelsorge <b>0800 111 0 111</b> · kostenlos, rund um die Uhr'

def band(t):
    n = len(t)
    fs = 62 if n <= 10 else 54 if n <= 13 else 46 if n <= 16 else 40 if n <= 19 else 34
    return f'<span style="font-size:{fs}px">{t}</span>'

def zeilen(liste, start, abstand):
    out = []
    for i, z in enumerate(liste):
        letzte = i == len(liste) - 1
        mb = ' style="margin-bottom:0"' if letzte else ''
        if z.startswith('„'):
            out.append(f'<div class="zitat" data-rein="{start + i*abstand:.1f}"{mb}>{z}</div>')
        else:
            out.append(f'<div class="z" data-rein="{start + i*abstand:.1f}"{mb}>{z}</div>')
    return '\n      '.join(out)

def seite(v):
    nr = v['nr']
    hilfe = v.get('hilfe')
    punkte = ''.join(f'<i class="{"an" if k==nr else ("fertig" if k<nr else "")}"></i>' for k in range(1,13))
    hb = (f'<div class="wrap" style="top:842px"><div class="hilfe">{HILFE}</div></div>') if hilfe else ''
    weiter = f'Folge für <b>Teil {nr+1}</b> der Serie.' if nr < 12 else '<b>Alle 12 Tipps</b> jetzt in PLAN.'
    l1_top = 470
    s = f'''
<!-- S0 0-3.2: Serien-Hook (auch Titelbild) -->
<div class="sc" data-von="0" data-bis="3.2">
  <div class="wrap" style="top:120px;text-align:center">
    <div class="serie-tag">SERIE · TEIL {nr} VON 12</div>
    <div class="serie-titel pulse">{v['serie']}</div>
    <div class="serie-punkte">{punkte}</div>
  </div>
  <div class="band" style="top:560px">{band('AUSBILDUNG MEISTERN')}</div>
  <div class="wrap" style="top:720px;text-align:center"><div class="serie-sub">2 Lösungen, die wirklich helfen 👇</div></div>
</div>

<!-- S1 3.2-14: Hook + Gefühl -->
<div class="sc" data-von="3.2" data-bis="14">
  <div class="wrap pulse" style="top:96px">
    <div class="rot" style="font-size:24px">AUSBILDUNG MEISTERN · TEIL {nr}</div>
    <div class="weiss">{v['hook']}</div>
  </div>
  <div class="band" style="top:318px">{band('KENNST DU DAS?')}</div>
  <div class="wrap" style="top:462px" data-pop="3.8">
    <div class="gelb"><h3>DAS FÜHLST DU</h3>
      {zeilen(v['gefuehl'], 4.6, 3.0)}
    </div>
  </div>
</div>

<!-- S2 14-20: Entlastung -->
<div class="sc" data-von="14" data-bis="20">
  <div class="wrap" style="top:110px"><div class="rot">GANZ WICHTIG ❤️</div><div class="weiss">{v['entlastung']}</div></div>
  <div class="band" style="top:318px">{band(v.get('band2','DU BIST NICHT ALLEIN'))}</div>
  <div class="wrap" style="top:470px" data-pop="14.8">
    <div class="gelb"><h3>{v.get('grund_titel','DESHALB')}</h3>
      {zeilen(v['grund'], 15.4, 1.6)}
    </div>
  </div>
</div>

<!-- S3 20-32: Lösung 1 -->
<div class="sc" data-von="20" data-bis="32">
  <div class="wrap" style="top:110px"><div class="rot">WAS DIR HILFT ✅</div><div class="weiss">Lösung 1: <b>{v['l1_titel']}</b></div></div>
  <div class="band" style="top:318px">{band('LÖSUNG 1')}</div>
  <div class="wrap" style="top:{l1_top}px" data-pop="21">
    <div class="gelb"><h3>{v.get('l1_kopf','SO GEHT’S')}</h3>
      {zeilen(v['l1'], 22.2, 3.2)}
    </div>
  </div>
</div>

<!-- S4 32-44: Lösung 2 -->
<div class="sc" data-von="32" data-bis="44">
  <div class="wrap" style="top:110px"><div class="rot">{v.get('l2_rot','UND DANN? 🤝')}</div><div class="weiss">Lösung 2: <b>{v['l2_titel']}</b></div></div>
  <div class="band" style="top:318px">{band('LÖSUNG 2')}</div>
  <div class="wrap" style="top:470px" data-pop="33">
    <div class="gelb"><h3>{v.get('l2_kopf','DAS HILFT')}</h3>
      {zeilen(v['l2'], 34.2, 3.0)}
    </div>
  </div>
</div>

<!-- S5 44-50: Zum Mitnehmen -->
<div class="sc" data-von="44" data-bis="50">
  <div class="wrap" style="top:150px"><div class="rot">ZUM MITNEHMEN 📌</div></div>
  <div class="band" style="top:300px">{band(v['band5'])}</div>
  <div class="wrap" style="top:470px" data-pop="44.6">
    <div class="gruen"><h3>MERK DIR</h3><p>{v['merke']}</p></div>
  </div>
  {hb}
</div>

<!-- S6 50-56: Kommentar-Frage -->
<div class="sc" data-von="50" data-bis="56">
  <div class="wrap pulse" style="top:110px"><div class="rot" style="font-size:24px">SCHREIB IN DIE KOMMENTARE 💬</div><div class="weiss">{v['frage']}</div></div>
  <div class="band" style="top:330px">{band(v['antworten'])}</div>
  <div class="wrap" style="top:490px" data-pop="51">
    <div class="gelb"><h3>ICH LESE MIT</h3>
      <div class="z" style="margin-bottom:0">Bitte <b>ohne Namen</b> von Station, Klinik oder Personen – das <b>schützt dich.</b></div>
    </div>
  </div>
  {hb}
</div>

<!-- S7 56-60: Outro -->
<div class="sc" data-von="56" data-bis="61">
  <div class="wrap" style="top:100px"><div class="rot">DU BIST NICHT ALLEIN</div><div class="weiss">{weiter}</div></div>
  <div class="band" style="top:300px">{band('PLAN NRW')}</div>
  <div class="wrap" style="top:450px" data-pop="56.4">
    <div class="gelb"><h3>KOSTENLOS IN PLAN</h3>
      <div class="z"><b>12 Tipps</b> „Ausbildung meistern“</div>
      <div class="z"><b>Prüfungsstress, Konflikte</b> & deine Rechte</div>
      <div class="z" style="margin-bottom:0"><b>2.000+ Prüfungsfragen</b> fürs Examen</div>
    </div>
  </div>
  <div class="wrap" style="top:765px" data-pop="57.2" id="bio"><div class="gruen"><h3>LINK IN DER BIO</h3><p style="font-size:26px;font-weight:900">plan-nrw.de</p></div></div>
</div>
'''
    extra_css = '<style>.hilfe{background:#fff;border:2px solid #0f172a;border-radius:12px;padding:9px 12px;text-align:center;font-size:17px;font-weight:600;color:#0f172a}.hilfe b{font-weight:900}.weiss{font-size:24px}.gelb .z{font-size:25px;margin-bottom:16px}.zitat{font-size:23px}.hilfe{font-size:19px}.serie-tag{display:inline-block;background:#0f172a;color:#fde68a;font-weight:900;font-size:22px;letter-spacing:1.5px;border-radius:999px;padding:8px 18px;margin-bottom:22px}.serie-titel{background:#fff;border:4px solid #dc2626;border-radius:18px;padding:26px 18px;font-size:40px;line-height:1.18;font-weight:900;color:#0f172a;box-shadow:0 10px 26px rgba(200,30,30,.25)}.serie-punkte{display:flex;justify-content:center;gap:9px;margin-top:26px}.serie-punkte i{width:16px;height:16px;border-radius:50%;background:#cbd5e1;display:block}.serie-punkte i.fertig{background:#2dd4bf}.serie-punkte i.an{background:#dc2626;transform:scale(1.35)}.serie-sub{font-size:26px;font-weight:800;color:#0f172a}</style>'
    return KOPF.replace('</head>', extra_css + '</head>') + s + SKRIPT

VIDEOS = json.load(open(os.path.join(H, 'serie-ausbildung.json'), encoding='utf-8'))
for v in VIDEOS:
    open(os.path.join(H, f"am-{v['nr']:02d}.html"), 'w', encoding='utf-8').write(seite(v))
    print('ok', v['nr'], v['titel'])
