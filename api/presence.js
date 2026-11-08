// /api/presence.js — Live-Nutzer-Uebersicht fuer den Admin.
// Auth: Admin-Secret (ADMIN_API_SECRET) via Header x-admin-secret ODER Body { secret }.
// 04.11.2026: Zeitgrenze für alle externen Aufrufe (Supabase, Resend, Stripe, Groq …). Antwortet ein Dienst nicht,
// bricht der Aufruf nach timeoutMs (Standard 9 s) ab, statt bis zum Vercel-Limit zu hängen. Eigenes signal hat Vorrang.
const _plFetch = globalThis.fetch;
const fetch = (u, o = {}) => _plFetch(u, (o && o.signal) ? o : Object.assign({}, o, { signal: AbortSignal.timeout((o && o.timeoutMs) || 9000) }));
export default async function handler(req, res) {
  try {
    const SB_URL = process.env.SUPABASE_URL;
    const SB_KEY = process.env.SUPABASE_SERVICE_ROLE;
    const ADMIN_SECRET = process.env.ADMIN_API_SECRET;
    if (!SB_URL || !SB_KEY || !ADMIN_SECRET) return res.status(500).json({ ok: false, error: 'config' });
    const H = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' };

    let B = req.body;
    if (typeof B === 'string') { try { B = JSON.parse(B || '{}'); } catch (e) { B = {}; } }
    B = B || {};

    // ── Nutzungszähler (21.10.2026): ein Ping pro App-Start, ohne Cookie/Geräte-ID ──
    // Kennung = HMAC(Tages-Schlüssel, IP + Browser) → nur innerhalb eines Tages gleich,
    // nicht über Tage verknüpfbar, IP wird nicht gespeichert. Tabelle app_nutzung (nur service_role).
    if (B.action === 'ping') {
      const ua = String(req.headers['user-agent'] || '');
      if (/bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(ua)) return res.status(204).end();
      const modus = ['app', 'installiert', 'browser'].indexOf(B.modus) >= 0 ? B.modus : 'browser';
      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || String(req.headers['x-real-ip'] || '');
      const tag = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
      const { createHmac } = await import('node:crypto');
      const kennung = createHmac('sha256', String(ADMIN_SECRET) + '|nutzung|' + tag).update(ip + '|' + ua).digest('hex').slice(0, 20);
      const angemeldet = B.angemeldet === true;
      try {
        await fetch(`${SB_URL}/rest/v1/app_nutzung?on_conflict=tag,kennung,modus`, {
          method: 'POST',
          headers: Object.assign({}, H, { Prefer: (angemeldet ? 'resolution=merge-duplicates' : 'resolution=ignore-duplicates') + ',return=minimal' }),
          body: JSON.stringify(angemeldet ? { tag, kennung, modus, angemeldet: true } : { tag, kennung, modus })
        });
      } catch (e) {}
      return res.status(204).end();
    }

    // ── Öffentlicher Rekord (08.11.2026): höchste Zahl eindeutiger Geräte an einem Tag ──
    // Nur Zahl + Datum, keine Einzeldaten. RPC nutzung_rekord (speichert den Rekord dauerhaft in kennzahlen);
    // fehlt die RPC noch, wird aus app_nutzung (60 Tage) gezählt. Eine Stunde im CDN zwischengespeichert.
    if (req.method === 'GET' && req.query && req.query.rekord) {
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      try {
        const r = await fetch(`${SB_URL}/rest/v1/rpc/nutzung_rekord`, { method: 'POST', headers: H, body: '{}' });
        if (r.ok) { const j = await r.json(); return res.status(200).json({ ok: true, rekord: j.rekord || 0, datum: j.datum || null }); }
      } catch (e) {}
      const proTag = {}; let rows = [];
      for (let off = 0; off < 40000; off += 1000) {
        const r = await fetch(`${SB_URL}/rest/v1/app_nutzung?select=tag,kennung`, { headers: Object.assign({}, H, { Range: off + '-' + (off + 999) }) });
        if (!r.ok) break;
        const t = await r.json(); rows = rows.concat(t); if (t.length < 1000) break;
      }
      rows.forEach(x => { (proTag[x.tag] = proTag[x.tag] || new Set()).add(x.kennung); });
      let rekord = 0, datum = null;
      Object.keys(proTag).sort().forEach(t => { if (proTag[t].size > rekord) { rekord = proTag[t].size; datum = t; } });
      return res.status(200).json({ ok: true, rekord, datum });
    }

    // Secret robust: zuerst Header, dann Query, dann Body (String/Objekt)
    let secret = (req.headers['x-admin-secret'] || (req.query && req.query.secret) || '') + '';
    if (!secret) secret = B.secret ? String(B.secret) : '';
    secret = secret.trim();
    if (secret !== String(ADMIN_SECRET).trim()) {
      return res.status(401).json({ ok: false, error: 'unauthorized', got: secret.length, exp: String(ADMIN_SECRET).trim().length });
    }

    // Admin: Nutzungsstatistik (aggregiert, keine Einzeldaten)
    if (B.action === 'nutzung') {
      const tagVon = (n) => new Date(Date.now() - n * 86400000).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
      try { await fetch(`${SB_URL}/rest/v1/app_nutzung?tag=lt.${tagVon(60)}`, { method: 'DELETE', headers: H }); } catch (e) {}
      let rows = [];
      for (let off = 0; off < 200000; off += 1000) {
        const r = await fetch(`${SB_URL}/rest/v1/app_nutzung?tag=gte.${tagVon(29)}&select=tag,modus,angemeldet&order=tag.asc`, { headers: Object.assign({}, H, { Range: off + '-' + (off + 999) }) });
        if (!r.ok) return res.status(200).json({ ok: false, error: 'tabelle' });
        const t = await r.json(); rows = rows.concat(t); if (t.length < 1000) break;
      }
      const tage = {};
      for (let i = 29; i >= 0; i--) tage[tagVon(i)] = { app: 0, installiert: 0, browser: 0, angemeldet: 0 };
      rows.forEach(x => { const t = tage[x.tag]; if (!t) return; t[x.modus] = (t[x.modus] || 0) + 1; if (x.angemeldet) t.angemeldet++; });
      const liste = Object.keys(tage).sort().map(k => Object.assign({ tag: k, gesamt: tage[k].app + tage[k].installiert + tage[k].browser }, tage[k]));
      const schnitt = (n, f) => { const a = liste.slice(-n); return Math.round(a.reduce((s, x) => s + x[f], 0) / a.length * 10) / 10; };
      return res.status(200).json({ ok: true, tage: liste, heute: liste[liste.length - 1], gestern: liste[liste.length - 2],
        schnitt7: { gesamt: schnitt(7, 'gesamt'), app: schnitt(7, 'app'), installiert: schnitt(7, 'installiert'), browser: schnitt(7, 'browser') },
        schnitt30: { gesamt: schnitt(30, 'gesamt'), app: schnitt(30, 'app'), installiert: schnitt(30, 'installiert'), browser: schnitt(30, 'browser') } });
    }

    const dayAgo = new Date(Date.now() - 86400000).toISOString();
    try { await fetch(`${SB_URL}/rest/v1/presence?last_seen=lt.${encodeURIComponent(dayAgo)}`, { method: 'DELETE', headers: H }); } catch (e) {}

    const twoMinAgo = new Date(Date.now() - 120000).toISOString();
    const pv = await fetch(`${SB_URL}/rest/v1/presence?last_seen=gt.${encodeURIComponent(twoMinAgo)}&select=name,email,screen,last_seen&order=last_seen.desc`, { headers: H });
    const rows = await pv.json();
    const now = Date.now();
    const users = (Array.isArray(rows) ? rows : []).map(r => ({
      name: r.name || 'Gast', email: r.email || '', screen: r.screen || '',
      secondsAgo: Math.max(0, Math.round((now - new Date(r.last_seen).getTime()) / 1000))
    }));
    return res.status(200).json({ ok: true, count: users.length, users, ts: now });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String((e && e.message) || e) });
  }
}
