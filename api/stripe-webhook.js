// PflegeLearn NRW – Stripe Webhook -> Supabase Auto-Freischaltung
// Route: /api/stripe-webhook
// Verifizierung: Re-Fetch ueber die Stripe-API (Secret Key). Kein Raw-Body/HMAC noetig.
// Schreibt serverseitig mit SUPABASE_SERVICE_ROLE in public.subscriptions (umgeht RLS).
// Beruehrt NICHT: chat.js, vercel.json, Stripe-Button.

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const SB_URL = process.env.SUPABASE_URL;
  const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE;
  if (!STRIPE_SECRET || !SB_URL || !SB_SERVICE) {
    console.error('[stripe-webhook] env fehlt');
    res.status(500).json({ error: 'config' }); return;
  }

  let event = req.body;
  if (typeof event === 'string') {
    try { event = JSON.parse(event); } catch (e) { res.status(400).json({ error: 'badjson' }); return; }
  }
  if (!event || !event.type) { res.status(400).json({ error: 'noevent' }); return; }

  async function stripeGet(path) {
    const r = await fetch('https://api.stripe.com/v1/' + path, {
      headers: { 'Authorization': 'Bearer ' + STRIPE_SECRET }
    });
    if (!r.ok) throw new Error('stripe ' + path + ' ' + r.status);
    return r.json();
  }

  try {
    const type = event.type;
    const obj = (event.data && event.data.object) ? event.data.object : {};
    let email = null, status = null, customerId = null, subId = null, periodEnd = null;
    const plan = 'pflegelearn';

    if (type === 'checkout.session.completed') {
      // Daten direkt aus dem (signierten) Event nehmen - kein Re-Fetch (Adaptive Pricing -> 404).
      const session = obj;
      if (session.payment_status !== 'paid' && session.status !== 'complete') {
        res.status(200).json({ ignored: 'not_paid' }); return;
      }
      email = (session.customer_details && session.customer_details.email) || session.customer_email;
      customerId = session.customer || null;
      subId = session.subscription || null;
      status = 'active';
      if (subId) {
        try {
          const sub = await stripeGet('subscriptions/' + subId);
          status = sub.status;
          periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
        } catch (e) { console.warn('[stripe-webhook] sub-fetch optional', e); }
      }
    } else if (type === 'customer.subscription.updated' || type === 'customer.subscription.deleted') {
      // Subscription steckt bereits vollstaendig im signierten Event - KEIN Re-Fetch
      // (führte bei Kündigung zu 404 -> 500 -> endlose Stripe-Retries).
      const sub = obj;
      subId = sub.id || null;
      customerId = sub.customer || null;
      status = (type === 'customer.subscription.deleted') ? 'canceled' : (sub.status || null);
      const cpe = sub.current_period_end
        || (sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].current_period_end)
        || sub.cancel_at || null;
      periodEnd = cpe ? new Date(cpe * 1000).toISOString() : null;
      if (customerId) {
        try { const cust = await stripeGet('customers/' + customerId); email = cust && cust.email ? cust.email : null; }
        catch (e) { console.warn('[stripe-webhook] customer-fetch optional', e); }
      }
    } else if (type === 'charge.refunded') {
      // Rueckerstattung -> Zugang entziehen
      const charge = obj;
      customerId = charge.customer || null;
      email = (charge.billing_details && charge.billing_details.email) || charge.receipt_email || null;
      if (!email && customerId) {
        try { const cust = await stripeGet('customers/' + customerId); email = cust && cust.email ? cust.email : null; } catch (e) {}
      }
      status = 'revoked';
      periodEnd = new Date().toISOString();
    } else if (type === 'charge.dispute.created') {
      // Chargeback -> Zugang entziehen
      const dispute = obj;
      let charge = null;
      try { charge = await stripeGet('charges/' + dispute.charge); } catch (e) {}
      if (charge) {
        customerId = charge.customer || null;
        email = (charge.billing_details && charge.billing_details.email) || charge.receipt_email || null;
      }
      if (!email && customerId) {
        try { const cust = await stripeGet('customers/' + customerId); email = cust && cust.email ? cust.email : null; } catch (e) {}
      }
      status = 'revoked';
      periodEnd = new Date().toISOString();
    } else {
      res.status(200).json({ ignored: type }); return;
    }

    if (!email) { res.status(200).json({ ignored: 'no_email' }); return; }
    email = email.toLowerCase();

    // Supabase-User per E-Mail finden (RPC uid_by_email, Service-Role)
    const rpcR = await fetch(SB_URL + '/rest/v1/rpc/uid_by_email', {
      method: 'POST',
      headers: {
        'apikey': SB_SERVICE,
        'Authorization': 'Bearer ' + SB_SERVICE,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_email: email })
    });
    if (!rpcR.ok) {
      const t = await rpcR.text();
      console.error('[stripe-webhook] rpc uid_by_email', rpcR.status, t);
      res.status(500).json({ error: 'rpc', detail: t }); return;
    }
    const userId = await rpcR.json();
    if (!userId) {
      console.warn('[stripe-webhook] kein Supabase-User fuer', email);
      res.status(200).json({ ignored: 'no_user', email }); return;
    }
    const user = { id: userId };

    // Upsert in subscriptions (Service-Role umgeht RLS)
    const up = await fetch(SB_URL + '/rest/v1/subscriptions?on_conflict=user_id', {
      method: 'POST',
      headers: {
        'apikey': SB_SERVICE,
        'Authorization': 'Bearer ' + SB_SERVICE,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_sub_id: subId,
        status: status,
        plan: plan,
        current_period_end: periodEnd,
        updated_at: new Date().toISOString()
      })
    });
    if (!up.ok) {
      const t = await up.text();
      console.error('[stripe-webhook] upsert', up.status, t);
      res.status(500).json({ error: 'db', up_status: up.status, detail: t }); return;
    }

    res.status(200).json({ ok: true, user: user.id, status: status });
  } catch (e) {
    console.error('[stripe-webhook]', e);
    res.status(500).json({ error: String(e && e.message || e) });
  }
}
