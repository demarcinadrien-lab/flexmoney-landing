// ═══════════════════════════════════════════════════════════
// shared.js — Config et helpers communs FlexMoney
// Chargé par toutes les pages APRÈS les scripts CDN
// (supabase.min.js et email.min.js si la page les utilise)
// ═══════════════════════════════════════════════════════════

// ── Supabase ─────────────────────────────────────────────
const SUPABASE_URL = 'https://rvvybwflrntmdpjrumov.supabase.co';
const SUPABASE_KEY = 'sb_publishable_d8nE75u5UJ3HqsO5HDXKXQ_um8cvYX9';

// Client Supabase (uniquement si le CDN supabase est chargé sur la page)
const sb = window.supabase ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ── E-mails transactionnels ──────────────────────────────
// Fournisseur : Brevo (UE), via l'Edge Function Supabase « send-email ».
// La clé API reste côté serveur — rien de sensible n'est exposé ici.
const FLX_EMAIL_ENDPOINT = `${SUPABASE_URL}/functions/v1/send-email`;

// Templates disponibles (rendus côté serveur, versionnés dans
// supabase/functions/send-email/index.ts) :
//   'worker' · 'employer' · 'mission-posted'
//   'mission-alert' · 'proposition' · 'candidature'
const FLX_TPL = {
  WORKER:        'worker',
  EMPLOYER:      'employer',
  MISSION_POSTED:'mission-posted',
  MISSION_ALERT: 'mission-alert',
  PROPOSITION:   'proposition',
  CANDIDATURE:   'candidature'
};

/**
 * Envoie un e-mail transactionnel.
 * @param {string} template  clé de FLX_TPL
 * @param {object} params    variables du template (dont to_email)
 * @returns {Promise<{ok:boolean, messageId?:string}>}
 */
async function flxSendEmail(template, params = {}) {
  const res = await fetch(FLX_EMAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({
      template,
      to: params.to_email,
      to_name: params.to_name,
      reply_to: params.reply_to,
      params
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Envoi e-mail échoué (${res.status})`);
  return data;
}

window.flxSendEmail = flxSendEmail;

// ── Helpers communs ──────────────────────────────────────

// Déconnexion (redirection vers auth.html par défaut)
async function signOut(redirect = 'auth.html') {
  await sb.auth.signOut();
  window.location.href = redirect;
}

// Formatage montant : 1234.5 → "1 234,50"
function fmt(n) {
  return (n || 0).toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Bandeau d'information cookies (stockage strictement nécessaire) ──
function mountCookieNotice() {
  try { if (localStorage.getItem('flx_cookie_ack') === '1') return; } catch(e) { return; }
  // Ne pas afficher sur les pages légales elles-mêmes
  const page = (location.pathname.split('/').pop() || '').toLowerCase();
  if (['politique-cookies.html','politique-confidentialite.html','conditions-generales.html','mentions-legales.html'].includes(page)) return;

  const bar = document.createElement('div');
  bar.setAttribute('role', 'dialog');
  bar.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:2000;max-width:720px;margin:0 auto;background:#0f172a;color:#f1f5f9;border-radius:14px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,0.25);display:flex;gap:14px;align-items:center;flex-wrap:wrap;font-family:inherit;';
  bar.innerHTML = '<span style="font-size:13px;line-height:1.5;flex:1;min-width:220px;">🍪 FlexMoney n\'utilise que du stockage <strong>strictement nécessaire</strong> (connexion), sans cookie publicitaire ni de suivi. <a href="politique-cookies.html" style="color:#a5b4fc;font-weight:600;">En savoir plus</a></span>'
    + '<button id="flxCookieOk" style="background:#6366f1;color:#fff;border:none;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">J\'ai compris</button>';
  document.body.appendChild(bar);
  document.getElementById('flxCookieOk').onclick = () => {
    try { localStorage