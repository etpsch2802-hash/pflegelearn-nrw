#!/usr/bin/env python3
"""Soundeffekte genau auf die Animationen eines Video-HTMLs legen.

Liest die Zeiten direkt aus der Seite (wir kennen jedes Bild, keine Analyse nötig):
  data-von  (Szenenwechsel)      -> Wischen nur mit --wischen (Standard aus)
  data-pop  (Element springt auf) -> Pop
  data-rein (Element gleitet rein)-> kurzer Klick
  .merke / .riesig mit data-pop   -> heller Ton (Ergebnis/Merksatz)
Alle Klänge werden hier synthetisch erzeugt -> keine Lizenzfragen (TikTok/Instagram/YouTube).

Aufruf:
  python3 sfx.py meinvideo.html 60 sfx.wav [lautstaerke=0.35]
Danach mit ffmpeg mischen (siehe README: Voiceover + Herzschlag + sfx.wav).
"""
import re, sys, wave
import numpy as np

SR = 44100


def _hull(n, a=0.004, r=None):
    t = np.arange(n) / SR
    env = np.minimum(1, t / a)
    if r:
        env *= np.exp(-t / r)
    return env


def pop():
    n = int(SR * 0.09)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 22) + 260          # schneller Abwärts-Sweep
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return s * _hull(n, 0.002, 0.025) * 0.9


def klick():
    n = int(SR * 0.03)
    rng = np.random.default_rng(1)
    s = rng.standard_normal(n) * 0.5 + np.sin(2 * np.pi * 2400 * np.arange(n) / SR)
    return s * _hull(n, 0.0005, 0.006) * 0.45


def wisch():
    n = int(SR * 0.28)
    rng = np.random.default_rng(2)
    s = rng.standard_normal(n)
    # Rauschen durch wanderndes Tiefpassfilter -> "whoosh"
    out = np.zeros(n); y = 0.0
    for i in range(n):
        k = 0.02 + 0.25 * np.sin(np.pi * i / n)
        y += k * (s[i] - y); out[i] = y
    return out * np.sin(np.pi * np.arange(n) / n) * 1.6


def ding():
    n = int(SR * 0.7)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * 1318.5 * t) + 0.5 * np.sin(2 * np.pi * 1975.5 * t)
    return s * _hull(n, 0.003, 0.22) * 0.5


def zeiten(html):
    def alle(attr):
        return sorted({round(float(x), 2) for x in re.findall(attr + r'="([0-9.]+)"', html)})
    ding_t = {round(float(x), 2) for x in re.findall(r'class="[^"]*\b(?:merke|riesig)\b[^"]*"[^>]*data-pop="([0-9.]+)"', html)}
    ding_t |= {round(float(x), 2) for x in re.findall(r'data-pop="([0-9.]+)"[^>]*class="[^"]*\b(?:merke|riesig)\b', html)}
    return alle('data-von'), alle('data-pop'), alle('data-rein'), ding_t


def main():
    src, dauer, ziel = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    args = [a for a in sys.argv if not a.startswith('--')]
    laut = float(args[4]) if len(args) > 4 else 0.35
    html = open(src, encoding='utf-8').read()
    von, pops, reins, dings = zeiten(html)
    spur = np.zeros(int(SR * (dauer + 1)))
    belegt = []

    def setze(t, klang, abstand=0.12):
        if t <= 0.05 or t >= dauer or any(abs(t - b) < abstand for b in belegt):
            return
        belegt.append(t)
        i = int(t * SR); spur[i:i + len(klang)] += klang[:len(spur) - i]

    for t in sorted(dings): setze(t, ding(), 0.05)
    if '--wischen' in sys.argv:  # aus seit 13.11.2026 (klang wie Nase hochziehen)
        for t in von: setze(t, wisch(), 0.05)
    for t in pops: setze(t, pop())
    for t in reins: setze(t, klick())

    spur = spur[:int(SR * dauer)]
    spur = spur / max(1e-9, np.abs(spur).max()) * laut
    with wave.open(ziel, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((spur * 32767).astype('<i2').tobytes())
    print(f'{ziel}: {len(belegt)} Effekte ({len(von)} Szenen, {len(dings)} Ergebnis-Töne)')


if __name__ == '__main__':
    main()
