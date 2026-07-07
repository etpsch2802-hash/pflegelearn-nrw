// PLAN NRW – Klassen / Lehrer-Dashboard (Schul-Lizenz, Pilot-Modus).
// Route: /api/klasse
//   GET  ?code=ABC123                 -> { found, name, schule, remaining, lizenz_bis, full }  (Vorschau vor dem Beitritt)
//   POST { action:'create', ... }     -> Lehrkraft legt eine Klasse an (erzeugt 6-stelligen Beitritts-Code)
//   POST { action:'join',   ... }     -> Azubi tritt per Code bei (Client setzt danach pl_paid_until = lizenz_bis)
//   POST { action:'list',   ... }     -> Klassen einer Lehrkraft inkl. Mitgliederzahl
//   POST { action:'members', ... }    -> Mitglieder einer Klasse
//   POST { action:'assign', ... }     -> Aufgabe/Fallbeispiel an eine Klasse verteilen
//   POST { action:'aufgaben', ... }   -> Aufgabenliste einer Klasse (für Azubis)
//
// Muster wie api/tester.js / api/lead.js: Service-Role-Zugriff auf Supabase REST (umgeht RLS bewusst).
// Beruehrt NICHT: lead.js, tester.js, chat.js, stripe-webhook.js.
// Pilot-Grade: Auth laeuft ueber die per Magic-Link bekannte E-Mail (Client). Haertung (echte JWT-Pruefung) folgt.

const DEFAULT_TAGE = 365;   // Pilot-Lizenz: 1 Jahr
const DEFAULT_SEATS = 30;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ohne I,O,0,1 (verwechslungsarm)

function heute() { return new Date().toISOString().split('T')[0]; }
function inTagen(tage) { var d = new Date(); d.setDate(d.getDate() + tage); return d.toISOString().split('T')[0]; }
function genCode(n) {
  var s = '';
  for (var i = 0; i < (n || 6); i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return s;
}

function sbHeaders(SB_SERVICE, extra) {
  var h = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE };
  if (extra) for (var k in extra) h[k] = extra[k];
  return h;
}

// Zaehlt Mitglieder einer Klasse ueber den Content-Range-Header (wie in api/tester.js).
async function countMitglieder(SB_URL, SB_SERVICE, klasseId) {
  var r = await fetch(SB_URL + '/rest/v1/klassen_mitglieder?klasse_id=eq.' + klasseId + '&select=id', {
    headers: sbHeaders(SB_SERVICE, { 'Prefer': 'count=exact', 'Range-Unit': 'items', 'Range': '0-0' })
  });
  var cr = r.headers.get('content-range') || '';
  var m = cr.match(/\/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : 0;
}

async function findByCode(SB_URL, SB_SERVICE, code) {
  var r = await fetch(SB_URL + '/rest/v1/klassen?join_code=eq.' + encodeURIComponent(code) + '&select=*&limit=1', {
    headers: sbHeaders(SB_SERVICE)
  });
  var a = await r.json();
  return Array.isArray(a) && a.length ? a[0] : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE;
  if (!SB_URL || !SB_SERVICE) { res.status(500).json({ error: 'config' }); return; }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ── GET: Klassen-Vorschau anhand des Codes (fuer den Beitritts-Screen) ──
  if (req.method === 'GET') {
    var code = (req.query && req.query.code ? String(req.query.code) : '').trim().toUpperCase();
    if (!code) { res.status(400).json({ error: 'code' }); return; }
    try {
      var k = await findByCode(SB_URL, SB_SERVICE, code);
      if (!k) { res.status(200).json({ found: false }); return; }
      var used = await countMitglieder(SB_URL, SB_SERVICE, k.id);
      var aktiv = heute() <= k.lizenz_bis;
      res.status(200).json({
        found: true, name: k.name, schule: k.schule || '',
        lizenz_bis: k.lizenz_bis, aktiv: aktiv,
        remaining: Math.max(0, k.sitzplaetze - used),
        full: used >= k.sitzplaetze
      });
    } catch (e) { console.error('[klasse] get', e); res.status(500).json({ error: 'get' }); }
    return;
  }

  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== 'object') body = {};
  const action = String(body.action || '');

  try {
    // ── Lehrkraft legt eine Klasse an ──
    if (action === 'create') {
      var lehrer = (body.lehrer_email ? String(body.lehrer_email) : '').trim().toLowerCase();
      var name = (body.name ? String(body.name) : '').trim();
      var schule = (body.schule ? String(body.schule) : '').trim();
      var tage = Number.isInteger(body.tage) ? body.tage : DEFAULT_TAGE;
      var seats = Number.isInteger(body.sitzplaetze) ? body.sitzplaetze : DEFAULT_SEATS;
      if (!emailRe.test(lehrer)) { res.status(400).json({ error: 'lehrer_email' }); return; }
      if (name.length < 2 || name.length > 80) { res.status(400).json({ error: 'name' }); return; }

      // Eindeutigen Code erzeugen (mit ein paar Wiederholungen bei Kollision)
      var code = null, saved = null;
      for (var attempt = 0; attempt < 6 && !saved; attempt++) {
        var cand = genCode(6);
        var ins = await fetch(SB_URL + '/rest/v1/klassen', {
          method: 'POST',
          headers: sbHeaders(SB_SERVICE, { 'Content-Type': 'application/json', 'Prefer': 'return=representation' }),
          body: JSON.stringify({
            lehrer_email: lehrer, name: name, schule: schule || null,
            join_code: cand, lizenz_bis: inTagen(tage), sitzplaetze: seats
          })
        });
        if (ins.status === 409) continue; // Code-Kollision -> neuer Versuch
        if (!ins.ok) { var t = await ins.text(); console.error('[klasse] create', ins.status, t); res.status(500).json({ error: 'create', detail: (t || '').slice(0, 200) }); return; }
        var arr = await ins.json();
        saved = Array.isArray(arr) ? arr[0] : arr; code = cand;
      }
      if (!saved) { res.status(500).json({ error: 'code_collision' }); return; }
      res.status(200).json({ ok: true, klasse: saved });
      return;
    }

    // ── Azubi tritt einer Klasse bei ──
    if (action === 'join') {
      var jcode = (body.code ? String(body.code) : '').trim().toUpperCase();
      var jmail = (body.email ? String(body.email) : '').trim().toLowerCase();
      var jname = (body.name ? String(body.name) : '').trim();
      if (!jcode) { res.status(400).json({ error: 'code' }); return; }
      var kl = await findByCode(SB_URL, SB_SERVICE, jcode);
      if (!kl) { res.status(200).json({ ok: false, reason: 'not_found' }); return; }
      if (heute() > kl.lizenz_bis) { res.status(200).json({ ok: false, reason: 'expired' }); return; }
      var mcount = await countMitglieder(SB_URL, SB_SERVICE, kl.id);
      if (mcount >= kl.sitzplaetze) { res.status(200).json({ ok: false, reason: 'full' }); return; }

      var mins = await fetch(SB_URL + '/rest/v1/klassen_mitglieder', {
        method: 'POST',
        headers: sbHeaders(SB_SERVICE, { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
        body: JSON.stringify({ klasse_id: kl.id, email: jmail || null, name: jname || null })
      });
      // 409 = bereits Mitglied (email unique je Klasse) -> als Erfolg werten (idempotent)
      if (!mins.ok && mins.status !== 409) {
        var mt = await mins.text(); console.error('[klasse] join', mins.status, mt);
        res.status(500).json({ error: 'join', detail: (mt || '').slice(0, 200) }); return;
      }
      res.status(200).json({ ok: true, klasse_name: kl.name, schule: kl.schule || '', lizenz_bis: kl.lizenz_bis });
      return;
    }

    // ── Klassen einer Lehrkraft (inkl. Mitgliederzahl) ──
    if (action === 'list') {
      var le = (body.lehrer_email ? String(body.lehrer_email) : '').trim().toLowerCase();
      if (!emailRe.test(le)) { res.status(400).json({ error: 'lehrer_email' }); return; }
      var lr = await fetch(SB_URL + '/rest/v1/klassen?lehrer_email=eq.' + encodeURIComponent(le) + '&select=*&order=created_at.desc', {
        headers: sbHeaders(SB_SERVICE)
      });
      var klassen = await lr.json();
      if (!Array.isArray(klassen)) klassen = [];
      for (var i = 0; i < klassen.length; i++) {
        klassen[i].mitglieder = await countMitglieder(SB_URL, SB_SERVICE, klassen[i].id);
      }
      res.status(200).json({ ok: true, klassen: klassen });
      return;
    }

    // ── Mitglieder einer Klasse ──
    if (action === 'members') {
      var kid = (body.klasse_id ? String(body.klasse_id) : '').trim();
      if (!kid) { res.status(400).json({ error: 'klasse_id' }); return; }
      var mr = await fetch(SB_URL + '/rest/v1/klassen_mitglieder?klasse_id=eq.' + encodeURIComponent(kid) + '&select=name,email,beigetreten_at&order=beigetreten_at.asc', {
        headers: sbHeaders(SB_SERVICE)
      });
      var mem = await mr.json();
      res.status(200).json({ ok: true, mitglieder: Array.isArray(mem) ? mem : [] });
      return;
    }

    // ── Aufgabe / Fallbeispiel an eine Klasse verteilen ──
    if (action === 'assign') {
      var akid = (body.klasse_id ? String(body.klasse_id) : '').trim();
      var typ = (body.typ ? String(body.typ) : '').trim();
      var titel = (body.titel ? String(body.titel) : '').trim();
      if (!akid) { res.status(400).json({ error: 'klasse_id' }); return; }
      if (['quiz-set', 'fall', 'frei'].indexOf(typ) < 0) { res.status(400).json({ error: 'typ' }); return; }
      if (titel.length < 2 || titel.length > 120) { res.status(400).json({ error: 'titel' }); return; }
      var ar = await fetch(SB_URL + '/rest/v1/aufgaben', {
        method: 'POST',
        headers: sbHeaders(SB_SERVICE, { 'Content-Type': 'application/json', 'Prefer': 'return=representation' }),
        body: JSON.stringify({
          klasse_id: akid, typ: typ, titel: titel,
          inhalt: body.inhalt || null,
          faellig_am: body.faellig_am || null
        })
      });
      if (!ar.ok) { var at = await ar.text(); console.error('[klasse] assign', ar.status, at); res.status(500).json({ error: 'assign', detail: (at || '').slice(0, 200) }); return; }
      var aarr = await ar.json();
      res.status(200).json({ ok: true, aufgabe: Array.isArray(aarr) ? aarr[0] : aarr });
      return;
    }

    // ── Aufgabenliste einer Klasse (Azubi ruft per Code oder Klassen-ID ab) ──
    if (action === 'aufgaben') {
      var qkid = (body.klasse_id ? String(body.klasse_id) : '').trim();
      if (!qkid && body.code) {
        var kc = await findByCode(SB_URL, SB_SERVICE, String(body.code).trim().toUpperCase());
        if (kc) qkid = kc.id;
      }
      if (!qkid) { res.status(400).json({ error: 'klasse_id' }); return; }
      var qr = await fetch(SB_URL + '/rest/v1/aufgaben?klasse_id=eq.' + encodeURIComponent(qkid) + '&select=*&order=created_at.desc', {
        headers: sbHeaders(SB_SERVICE)
      });
      var auf = await qr.json();
      res.status(200).json({ ok: true, aufgaben: Array.isArray(auf) ? auf : [] });
      return;
    }

    // ── Aufgabe löschen (Lehrkraft) ──
    if (action === 'delete') {
      var did = (body.aufgabe_id ? String(body.aufgabe_id) : '').trim();
      if (!did) { res.status(400).json({ error: 'aufgabe_id' }); return; }
      var dr = await fetch(SB_URL + '/rest/v1/aufgaben?id=eq.' + encodeURIComponent(did), {
        method: 'DELETE',
        headers: sbHeaders(SB_SERVICE, { 'Prefer': 'return=minimal' })
      });
      if (!dr.ok) { var dt = await dr.text(); console.error('[klasse] delete', dr.status, dt); res.status(500).json({ error: 'delete', detail: (dt || '').slice(0, 200) }); return; }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: 'action' });
  } catch (e) {
    console.error('[klasse] server', e);
    res.status(500).json({ error: 'server' });
  }
}
