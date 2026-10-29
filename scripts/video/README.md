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
