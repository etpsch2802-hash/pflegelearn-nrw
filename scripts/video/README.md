# TikTok-Videos im Gemini-Stil

Vorlage: `vorlage-gemini.html` (Beispiel: Ausbildung meistern Teil 1, 60 s). Jede Szene ist ein `<div class="sc" data-von="s" data-bis="s">`,
Elemente erscheinen über `data-pop="s"` bzw. `data-rein="s"`. Logo `logo.png`, Herzschlag `herz.wav` (30 s, wird geloopt).

```bash
cd scripts/video
SEITE=meinvideo.html ZEITEN=1,10,20 node render.js vorschau        # Vorschaubilder v_<t>.png
SEITE=meinvideo.html OUT=frames FRAMES=1800 node render.js voll     # 60 s = 1800 Bilder (30 s = 900)
ffmpeg -y -framerate 30 -i frames/f%04d.jpg -stream_loop 1 -i herz.wav -t 60 \
  -c:v libx264 -pix_fmt yuv420p -crf 20 -vf scale=1080:1920 -c:a aac -b:a 128k -shortest ../../private/social/<NAME>.mp4
```
Fertige MP4 nach `private/social/` pushen; die raw.githubusercontent-URL dient Metricool als Medium.

## Soundeffekte (seit 13.11.2026)
`sfx.py` legt eigene, synthetisch erzeugte Klänge (keine Lizenzfragen) genau auf die Animationen: Wischen bei Szenenwechsel (`data-von`), Pop (`data-pop`), Klick (`data-rein`), heller Ton bei `.merke`/`.riesig`.
```bash
python3 sfx.py meinvideo.html 60 sfx.wav            # Spur erzeugen (Zeiten aus dem HTML)
ffmpeg -y -framerate 30 -i frames/f%04d.jpg -i vo.mp3 -stream_loop 1 -i herz.wav -i sfx.wav \
  -filter_complex "[1:a]volume=1.0[v];[2:a]volume=0.35[h];[3:a]volume=0.7[s];[v][h][s]amix=inputs=3:duration=first:normalize=0[a]" \
  -map 0:v -map "[a]" -t 60 -c:v libx264 -pix_fmt yuv420p -crf 20 -vf scale=1080:1920 -c:a aac -b:a 128k ../../private/social/<NAME>.mp4
```
Mit Voiceover Effekte leiser (0,5–0,7), damit die Stimme klar bleibt.
