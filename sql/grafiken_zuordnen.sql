-- PLAN NRW: Grafiken den Lerneinheiten zuordnen
-- Setzt daten->>'grafik' anhand des Titels. Bereits gesetzte Werte bleiben unangetastet.
-- Vorher pruefen, nachher kontrollieren: die SELECTs unten ausfuehren.

-- ── 1) VORHER: was ist aktuell zugeordnet? ──────────────────────────────
select count(*) filter (where daten ? 'grafik') as mit_grafik,
       count(*)                                 as gesamt
from public.lerninhalte where aktiv;


-- ── 2) ZUORDNUNG ────────────────────────────────────────────────────────
-- Reihenfolge zaehlt: spezifische Muster zuerst, allgemeine danach.
-- `where daten->>'grafik' is null` verhindert das Ueberschreiben.

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"ekg-vhf"')
 where aktiv and daten->>'grafik' is null and titel ilike '%vorhofflimmern%';

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"ekg-kammerflimmern"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%kammerflimmern%' or titel ilike '%defibrillation%');

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"ekg-asystolie"')
 where aktiv and daten->>'grafik' is null and titel ilike '%asystolie%';

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"ekg-av-block-3"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%av-block%' or titel ilike '%av block%' or titel ilike '%bradykard%');

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"ekg-stemi"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%stemi%' or titel ilike '%herzinfarkt%'
        or titel ilike '%myokardinfarkt%' or titel ilike '%akutes koronarsyndrom%');

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"reizleitung"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%reizleitung%' or titel ilike '%herzrhythmusstörung%'
        or titel ilike '%schrittmacher%');

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"herzzyklus"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%herzzyklus%' or titel ilike '%herzinsuffizienz%'
        or titel ilike '%herz %' or titel = 'Herz');

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"ekg-sinus"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%ekg%' or titel ilike '%elektrokardiogramm%'
        or titel ilike '%sinusrhythmus%');

-- Beatmung / Respiration
update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"kapnografie"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%kapnograf%' or titel ilike '%kapnometr%' or titel ilike '%etco%');

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"beatmung-pv-loop"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%ards%' or titel ilike '%loop%' or titel ilike '%compliance%');

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"beatmung-flow-airtrapping"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%air trapping%' or titel ilike '%copd%'
        or titel ilike '%asthma%' or titel ilike '%obstruktiv%');

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"beatmungsmodi"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%beatmungsmodi%' or titel ilike '%beatmungsform%'
        or titel ilike '%weaning%' or titel ilike '%entwöhnung%');

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"beatmung-druckkurve"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%beatmung%' or titel ilike '%peep%'
        or titel ilike '%intubation%' or titel ilike '%tubus%');

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"o2-bindungskurve"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%sauerstoff%' or titel ilike '%oxygenierung%'
        or titel ilike '%hypox%' or titel ilike '%pulsoxymetrie%'
        or titel ilike '%sättigung%');

update public.lerninhalte set daten = jsonb_set(daten,'{grafik}','"saeure-basen"')
 where aktiv and daten->>'grafik' is null
   and (titel ilike '%säure%' or titel ilike '%azidose%' or titel ilike '%alkalose%'
        or titel ilike '%blutgas%' or titel ilike '%bga%');


-- ── 3) NACHHER: Ergebnis kontrollieren ──────────────────────────────────
select daten->>'grafik' as grafik, count(*), string_agg(titel, ' · ' order by titel) as titel
from public.lerninhalte
where aktiv and daten ? 'grafik'
group by 1 order by 2 desc;


-- ── RUECKGAENGIG (falls die Zuordnung nicht passt) ──────────────────────
-- update public.lerninhalte set daten = daten - 'grafik' where aktiv;
