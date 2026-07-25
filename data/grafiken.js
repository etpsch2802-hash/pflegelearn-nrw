/* Aus index.html ausgelagert (Sprint 3, File-Split). Nicht direkt bearbeiten.
   Per <script src> im <head> geladen, VOR dem Haupt-Script im <body>. */
var PL_GRAFIK = (function(){
  function wrap(inner, w, h, caption){
    return '<div style="background:rgba(255,255,255,.06);border:1px solid rgba(56,189,248,.25);border-radius:12px;padding:10px 8px 6px;margin:6px 0 10px;overflow-x:auto">'
      + '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;min-width:280px;height:auto;display:block" preserveAspectRatio="xMidYMid meet">'
      + '<defs><pattern id="plgrid" width="20" height="20" patternUnits="userSpaceOnUse">'
      + '<path d="M20 0H0V20" fill="none" stroke="rgba(148,163,184,.18)" stroke-width="1"/></pattern></defs>'
      + '<rect width="'+w+'" height="'+h+'" fill="url(#plgrid)"/>' + inner + '</svg>'
      + (caption ? '<div style="font-size:11px;color:#a3bcd0;text-align:center;padding:4px 4px 0;line-height:1.4">'+caption+'</div>' : '')
      + '</div>';
  }
  function line(d, col, wdt){
    return '<path d="'+d+'" fill="none" stroke="'+(col||'#38bdf8')+'" stroke-width="'+(wdt||2)+'" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function label(x,y,t,col){
    return '<text x="'+x+'" y="'+y+'" fill="'+(col||'#93b9d1')+'" font-size="11" font-family="system-ui,sans-serif">'+t+'</text>';
  }
  // Ein Sinus-Zyklus ab Position x, Grundlinie y
  function pqrst(x,y){
    return 'M'+x+' '+y+' h14 q6 -8 12 0 h10 '            // P-Welle
         + 'l4 4 l6 -30 l6 42 l5 -16 h10 '                 // QRS
         + 'q10 -12 20 0 h16';                             // T-Welle
  }
  var G = {};

  G['ekg-sinus'] = function(){
    var d='M0 70 '; for(var i=0;i<4;i++){ d += pqrst(10+i*115, 70).substring(1)+' '; }
    return wrap(line(d)+label(6,16,'Sinusrhythmus 60–100/min'), 480, 120,
      'Regelmäßig, vor jedem QRS eine P-Welle, PQ-Zeit 0,12–0,20 s, QRS schmal.');
  };
  G['ekg-vhf'] = function(){
    // unregelmäßige Abstände, keine P-Wellen, Flimmerwellen
    var pos=[10,120,205,325,410], d='M0 70 ', fl='M0 70 ';
    pos.forEach(function(x){ d += 'L'+x+' 70 l4 4 l6 -30 l6 42 l5 -16 L'+(x+40)+' 70 q10 -10 20 0 '; });
    for(var x=0;x<470;x+=8){ fl += 'l4 '+(x%16===0?-4:4)+' '; }
    return wrap(line(fl,'rgba(148,163,184,.55)',1)+line(d)+label(6,16,'Vorhofflimmern'), 480, 120,
      'Keine abgrenzbaren P-Wellen, unregelmäßige RR-Abstände (absolute Arrhythmie).');
  };
  G['ekg-kammerflimmern'] = function(){
    var d='M0 70 ', a=[28,-34,22,-40,32,-26,38,-30,24,-36,30,-22,34,-32,26,-38,20,-30,28,-24];
    for(var i=0;i<a.length;i++){ d += 'l'+ (480/a.length/2) +' '+a[i]+' l'+(480/a.length/2)+' '+(-a[i])+' '; }
    return wrap(line(d,'#f87171')+label(6,16,'Kammerflimmern','#fca5a5'), 480, 120,
      'Chaotische Ausschläge ohne erkennbare Komplexe. Defibrillierbar – sofort Reanimation.');
  };
  G['ekg-asystolie'] = function(){
    return wrap(line('M0 70 H480','#f87171')+label(6,16,'Asystolie','#fca5a5'), 480, 120,
      'Nulllinie. Nicht defibrillierbar – Herzdruckmassage und Adrenalin.');
  };
  G['ekg-av-block-3'] = function(){
    var d='M0 70 ', p='';
    // P-Wellen regelmäßig alle 60, QRS unabhängig alle 150
    for(var x=20;x<470;x+=60){ p += 'M'+x+' 70 q6 -9 12 0 '; }
    for(var q=40;q<470;q+=150){ d += 'M'+q+' 70 l5 5 l7 -32 l7 44 l6 -17 L'+(q+50)+' 70 q10 -11 20 0 '; }
    return wrap(line(p,'rgba(56,189,248,.55)',1.6)+line(d)+label(6,16,'AV-Block III'), 480, 120,
      'Vorhöfe und Kammern schlagen unabhängig: P-Wellen ohne Bezug zum QRS. Schrittmacher nötig.');
  };
  G['ekg-stemi'] = function(){
    var d='M0 70 '; for(var i=0;i<3;i++){ var x=20+i*150;
      d += 'M'+x+' 70 h12 q6 -8 12 0 h8 l4 4 l6 -32 l6 44 l5 -18 '   // bis J-Punkt
         + 'c6 -22 14 -26 22 -26 q14 0 22 10 L'+(x+130)+' 70 '; }
    return wrap(line(d,'#fbbf24')+label(6,16,'STEMI – ST-Hebung','#fcd34d'), 480, 120,
      'ST-Strecke deutlich über der Grundlinie, monophasische Verschmelzung mit der T-Welle.');
  };
  G['beatmung-pv-loop'] = function(){
    var norm='M60 200 C90 150 130 90 210 60 C250 46 290 42 330 40 C300 60 250 100 200 130 C140 165 95 185 60 200 Z';
    var over='M60 200 C90 150 130 90 210 60 C260 44 300 42 400 41 C360 58 300 96 210 132 C150 165 95 185 60 200 Z';
    return wrap(
      line('M50 210 H430','#94a3b8',1.2)+line('M60 220 V30','#94a3b8',1.2)
      + line(norm,'#38bdf8',2)
      + line(over,'rgba(248,113,113,.85)',2)
      + label(300,225,'Druck (mbar)')+ '<text x="14" y="120" fill="#93b9d1" font-size="11" transform="rotate(-90 14 120)">Volumen</text>'
      + label(340,70,'Beak-Zeichen','#fca5a5'),
      460, 240,
      'Druck-Volumen-Loop: Blau normal. Rot mit abflachendem Ende (Beak-Zeichen) zeigt Überdehnung – Atemzugvolumen oder PEEP reduzieren.');
  };
  G['beatmung-flow-airtrapping'] = function(){
    var norm='M40 110 v-55 h70 v55 c0 40 -30 46 -70 46 v-46 ';
    var trap='M240 110 v-55 h70 v55 c0 30 -22 34 -40 34 v-34 ';
    return wrap(
      line('M20 110 H440','#94a3b8',1.2)
      + line(norm,'#38bdf8',2) + line(trap,'#f87171',2)
      + label(30,26,'normal','#7dd3fc') + label(230,26,'Air Trapping','#fca5a5')
      + label(300,170,'Fluss erreicht 0 nicht','#fca5a5'),
      460, 190,
      'Fluss-Zeit-Kurve: Erreicht der exspiratorische Fluss vor dem nächsten Hub nicht die Nulllinie, bleibt Luft in der Lunge (Auto-PEEP). Ausatemzeit verlängern.');
  };
  G['beatmung-druckkurve'] = function(){
    var d='M30 160 L90 40 L150 40 L150 60 L210 60 L210 130 L270 130 L330 40 L390 40 L390 60 L440 60';
    return wrap(
      line('M20 160 H450','#94a3b8',1.2)
      + line(d)
      + label(78,32,'Spitzendruck') + label(158,54,'Plateau') + label(215,148,'PEEP')
      , 470, 190,
      'Druckkurve: Spitzendruck entsteht durch Atemwegswiderstand, der Plateaudruck spiegelt die Lungendehnbarkeit. Plateau unter 30 mbar halten.');
  };
  G['kapnografie'] = function(){
    var d='M20 150 ', x=20;
    for(var i=0;i<3;i++){ d += 'L'+(x+18)+' 150 L'+(x+30)+' 55 L'+(x+95)+' 45 L'+(x+103)+' 150 '; x+=140; }
    return wrap(line('M15 160 H450','#94a3b8',1.2)+line(d,'#34d399')
      + label(30,28,'etCO2 35–45 mmHg','#6ee7b7'), 470, 185,
      'Normale Kapnografiekurve mit Plateau. Plötzlicher Abfall auf null bedeutet Diskonnektion, Tubusfehllage oder Kreislaufstillstand.');
  };

  G['herzzyklus'] = function(){
    var lv='M30 200 L70 200 L95 60 L200 55 L230 195 L300 200 L340 200';
    var ao='M30 130 L95 128 L110 70 L200 60 L235 95 L270 118 L340 128';
    var la='M30 205 L80 198 L120 208 L200 200 L260 190 L300 206 L340 200';
    return wrap(
      line('M25 215 H350','#94a3b8',1.2)+line('M30 225 V35','#94a3b8',1.2)
      + '<rect x="95" y="35" width="135" height="180" fill="rgba(56,189,248,.07)"/>'
      + line(lv,'#38bdf8',2) + line(ao,'#f87171',1.8) + line(la,'#34d399',1.6)
      + label(120,30,'Systole','#7dd3fc') + label(250,30,'Diastole','#93b9d1')
      + label(255,75,'Aorta','#fca5a5') + label(255,150,'Kammer','#7dd3fc') + label(120,205,'Vorhof','#6ee7b7')
      , 370, 235,
      'Herzzyklus: Übersteigt der Kammerdruck den Aortendruck, öffnet die Taschenklappe und Blut wird ausgeworfen. Fällt er darunter, schließt sie – die Diastole beginnt und die Kammer füllt sich erneut.');
  };
  G['o2-bindungskurve'] = function(){
    var norm='M40 200 C70 195 95 170 120 120 C145 70 180 48 260 42 C310 40 350 40 380 40';
    var re='M40 205 C80 202 110 185 145 140 C175 95 210 62 280 50 C325 44 355 42 380 41';
    var li='M40 195 C62 185 82 150 100 100 C120 56 155 42 230 38 C300 36 350 37 380 37';
    return wrap(
      line('M35 210 H390','#94a3b8',1.2)+line('M40 220 V30','#94a3b8',1.2)
      + line(li,'rgba(52,211,153,.9)',1.8) + line(norm,'#38bdf8',2.4) + line(re,'rgba(248,113,113,.9)',1.8)
      + label(250,225,'pO2 (mmHg)') + '<text x="14" y="140" fill="#93b9d1" font-size="11" transform="rotate(-90 14 140)">SpO2 (%)</text>'
      + label(60,50,'Linksverschiebung','#6ee7b7') + label(250,205,'Rechtsverschiebung','#fca5a5')
      , 410, 235,
      'S-förmige Kurve: Im steilen Teil gibt schon ein kleiner pO2-Abfall viel Sauerstoff ab. Rechtsverschiebung durch Fieber, Azidose und CO2 bedeutet leichtere Abgabe ans Gewebe, Linksverschiebung festere Bindung.');
  };
  G['beatmungsmodi'] = function(){
    var pcP='M30 120 L60 45 L150 45 L150 105 L200 105 L230 45 L320 45 L320 105 L370 105';
    var vcP='M30 260 L60 250 L150 190 L150 245 L200 245 L230 235 L320 175 L320 245 L370 245';
    return wrap(
      line('M25 130 H380','#94a3b8',1)+line('M25 270 H380','#94a3b8',1)
      + line(pcP,'#38bdf8',2) + line(vcP,'#fbbf24',2)
      + label(30,25,'Druckkontrolliert: Druck bleibt konstant, Volumen variiert','#7dd3fc')
      + label(30,165,'Volumenkontrolliert: Volumen garantiert, Druck steigt an','#fcd34d')
      , 400, 285,
      'Druckkontrolliert begrenzt den Druck und schützt die Lunge, das Volumen schwankt mit der Dehnbarkeit. Volumenkontrolliert garantiert das Volumen, der Druck kann gefährlich ansteigen.');
  };
  G['saeure-basen'] = function(){
    function q(x,y,w,h,col,t1,t2,t3){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+col+'" stroke="rgba(255,255,255,.18)" rx="6"/>'
        + label(x+12,y+24,t1,'#e2e8f0') + label(x+12,y+42,t2) + label(x+12,y+60,t3);
    }
    return wrap(
      q(30,30,200,90,'rgba(248,113,113,.14)','Respiratorische Azidose','pH ↓  pCO2 ↑','COPD, Hypoventilation')
      + q(240,30,200,90,'rgba(56,189,248,.14)','Respiratorische Alkalose','pH ↑  pCO2 ↓','Hyperventilation')
      + q(30,130,200,90,'rgba(251,191,36,.14)','Metabolische Azidose','pH ↓  HCO3 ↓','Sepsis, Ketoazidose, Niere')
      + q(240,130,200,90,'rgba(52,211,153,.14)','Metabolische Alkalose','pH ↑  HCO3 ↑','Erbrechen, Diuretika')
      , 470, 235,
      'Merkregel: Zeigen pH und pCO2 in entgegengesetzte Richtungen, ist die Ursache respiratorisch. Zeigen pH und Bikarbonat in dieselbe Richtung, ist sie metabolisch.');
  };
  G['reizleitung'] = function(){
    return wrap(
      '<path d="M170 30 C90 40 55 110 70 180 C82 240 130 275 175 285 C220 275 268 240 280 180 C295 110 260 40 180 30 Z" fill="rgba(56,189,248,.06)" stroke="rgba(148,163,184,.5)" stroke-width="1.5"/>'
      + '<circle cx="120" cy="72" r="7" fill="#38bdf8"/>' + label(132,70,'Sinusknoten 60–100/min','#7dd3fc')
      + '<circle cx="163" cy="132" r="6" fill="#7dd3fc"/>' + label(176,130,'AV-Knoten 40–60/min')
      + line('M163 138 L163 175','#7dd3fc',2) + label(176,168,'His-Bündel')
      + line('M163 175 L118 235','#7dd3fc',2) + line('M163 175 L212 235','#7dd3fc',2)
      + label(60,250,'Tawara-Schenkel') + label(196,262,'Purkinje 20–40/min')
      + line('M126 76 C140 100 150 115 160 128','rgba(56,189,248,.6)',1.5)
      , 380, 300,
      'Erregung entsteht im Sinusknoten und läuft über den AV-Knoten, das His-Bündel und die Tawara-Schenkel zu den Purkinje-Fasern. Jede Ebene kann bei Ausfall einspringen, aber mit langsamerer Frequenz.');
  };
  return {
    has: function(id){ return !!G[id]; },
    render: function(id){ try { return G[id] ? G[id]() : ''; } catch(e){ return ''; } },
    list: Object.keys(G)
  };
})();
