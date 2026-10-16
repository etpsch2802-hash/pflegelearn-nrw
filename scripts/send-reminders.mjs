import webpush from 'web-push';

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
const VAPID_PUBLIC = process.env.VAPID_PUBLIC;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;

webpush.setVapidDetails('mailto:kontakt@plan-nrw.de', VAPID_PUBLIC, VAPID_PRIVATE);

const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

const res = await fetch(`${SB_URL}/rest/v1/push_subs?select=endpoint,sub,name,admin,examen_datum`, { headers: sbHeaders });
if (!res.ok) { console.error('Fetch subs failed', res.status, await res.text()); process.exit(1); }
const rows = await res.json();

// Nur echte Vornamen verwenden, keine Platzhalter oder Einzelbuchstaben
function cleanName(n) {
  if (!n || typeof n !== 'string') return '';
  const t = n.trim();
  if (t.length < 2 || t.length > 20) return '';
  if (!/^[A-Za-zÄÖÜäöüß' -]+$/.test(t)) return '';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const TEXTE = [
  'Deine Karteikarten warten – ein paar Minuten Wiederholung halten dich im Rhythmus.',
  'Halte deine Serie am Leben. Ein kurzes Quiz reicht heute.',
  'Zehn Minuten heute sind mehr wert als drei Stunden vor der Prüfung.',
  'Ein Fach, fünf Fragen, fertig. Mehr braucht es heute nicht.',
  'Dein Schwächen-Radar zeigt, wo es hakt. Schau kurz rein.',
  'Kurz üben, dann Feierabend. Deine Serie dankt es dir.',
  'Wiederholen schlägt Neulernen. Heute ein paar fällige Karten?',
  'Der KI-Prüfer hat gleich Zeit für dich – teste dein Wissen.',
  'Kleine Schritte, großer Effekt. Eine Lerneinheit vor dem Feierabend?',
  'Prüfungsreife wächst mit jedem Tag. Heute schon dran gewesen?',
  'Fünf Minuten Karteikarten – dein Kopf merkt sich den Rest.',
  'Bleib dran: Wer täglich kurz übt, geht entspannt ins Examen.'
];
const TITEL = ['Zeit für deinen PLAN', 'Deine tägliche Runde wartet', 'Kurz lernen mit PLAN NRW'];
const _day = new Date().getDate();
// Einmalige Ankuendigung: Workflow-Eingaben ueberschreiben den Tagestext (leer = normale Erinnerung)
const ANK_TITEL = (process.env.PUSH_TITEL || '').trim();
const ANK_TEXT = (process.env.PUSH_TEXT || '').trim();
const text = ANK_TEXT || TEXTE[_day % TEXTE.length];
const titelBase = ANK_TITEL || TITEL[_day % TITEL.length];

// Examens-Countdown (16.10.2026): Texte nach Tagen bis zum Examen staffeln.
// PUSH_EXAM_PUBLIC=1 (Workflow-Env) schaltet fuer alle frei, vorher nur Admin-Geraete.
const EXAM_PUBLIC = process.env.PUSH_EXAM_PUBLIC === '1';
const heute = new Date(new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' }) + 'T00:00:00Z');
function tageBis(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) return null;
  return Math.round((new Date(String(iso) + 'T00:00:00Z') - heute) / 864e5);
}
const EXAM = {
  // Versand laeuft abends (17:00 UTC) – am Examenstag ist die Pruefung dann schon vorbei
  heute: { titel: 'Wie lief dein Examen', text: 'Durchatmen, du hast es hinter dir. Trag dein Ergebnis in PLAN ein, wenn du magst.' },
  morgen: { titel: 'Morgen ist es so weit', text: 'Heute nichts Neues mehr. Kurz die Merksätze durchgehen und früh schlafen.' },
  woche: ['Noch {n} Tage: Heute eine Examen-Simulation – danach weißt du, wo du stehst.',
          'Noch {n} Tage: Wiederhole deine fälligen Karten, nicht neue Themen.',
          'Noch {n} Tage: Lass dich vom KI-Prüfer mündlich abfragen.'],
  monat: ['Noch {n} Tage bis zum Examen. Heute 15 Minuten an deinem schwächsten Thema.',
          'Noch {n} Tage. Jeden Tag ein Fach – so schaffst du den Stoff entspannt.',
          'Noch {n} Tage. Eine Examen-Simulation pro Woche zeigt dir deinen Fortschritt.'],
  lang: ['Noch {n} Tage bis zum Examen. Jetzt anfangen heißt später entspannt sein.',
         'Noch {n} Tage. Kleine tägliche Runden schlagen jeden Lernmarathon.']
};
function examText(n) {
  if (n === null || n < 0 || n > 90) return null;
  if (n === 0) return EXAM.heute;
  if (n === 1) return EXAM.morgen;
  const pick = (arr) => arr[_day % arr.length].replace('{n}', n);
  if (n <= 7) return { titel: 'Endspurt', text: pick(EXAM.woche) };
  if (n <= 30) return { titel: 'Dein Examens-Countdown', text: pick(EXAM.monat) };
  return { titel: 'Dein PLAN bis zum Examen', text: pick(EXAM.lang) };
}

let sent = 0, removed = 0, failed = 0, examSent = 0;
for (const r of rows) {
  const sub = typeof r.sub === 'string' ? JSON.parse(r.sub) : r.sub;
  const name = cleanName(r.name);
  const ex = (!ANK_TEXT && (EXAM_PUBLIC || r.admin === true)) ? examText(tageBis(r.examen_datum)) : null;
  if (ex) examSent++;
  const tB = ex ? ex.titel : titelBase;
  const payload = JSON.stringify({
    title: name ? (ex ? `${tB}, ${name}` : `${name}, ${tB}`) : `${tB} · PLAN NRW`,
    body: ex ? ex.text : text,
    url: 'https://plan-nrw.de',
    tag: ANK_TEXT ? 'pl-ankuendigung' : 'pl-reminder'
  });
  try {
    await webpush.sendNotification(sub, payload);
    sent++;
  } catch (e) {
    if (e && (e.statusCode === 404 || e.statusCode === 410)) {
      await fetch(`${SB_URL}/rest/v1/push_subs?endpoint=eq.${encodeURIComponent(r.endpoint)}`, { method: 'DELETE', headers: sbHeaders });
      removed++;
    } else {
      failed++;
      console.error('send error', e && e.statusCode, e && e.body);
    }
  }
}
console.log(JSON.stringify({ sent, removed, failed, examSent, total: rows.length }));
