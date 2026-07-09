// ═══════════════════════════════════════════════════════════
// shared.js — Config et helpers communs FlexMoney
// Chargé par toutes les pages APRÈS les scripts CDN
// (supabase.min.js et email.min.js si la page les utilise)
// ═══════════════════════════════════════════════════════════

// ── Supabase ─────────────────────────────────────────────
const SUPABASE_URL = 'https://nresngetymtpxusrhlfj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_j8Yk8yjUMQv0AGlqHqn19Q_NJ34mcvT';

// Client Supabase (uniquement si le CDN supabase est chargé sur la page)
const sb = window.supabase ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ── EmailJS ──────────────────────────────────────────────
const EJS_PUBLIC_KEY = 'YAyl_sI2uC4Q2YCCF';
const EJS_SERVICE_ID = 'service_2749nt8';
if (window.emailjs) emailjs.init(EJS_PUBLIC_KEY);

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
