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
    try { localStorage.setItem('flx_cookie_ack', '1'); } catch(e) {}
    bar.remove();
  };
}
if (document.body) mountCookieNotice();
else document.addEventListener('DOMContentLoaded', mountCookieNotice);

// ── Barre d'actions rapides employeur (sticky, sur toutes les pages employeur) ──
const FLX_EMPLOYER_PAGES = [
  'dashboard-employeur.html',
  'poster-mission.html',
  'tableau-travailleurs.html',
  'mes-travailleurs.html',
  'validation-mission.html',
  'tableau-missions.html'
];

const FLX_QUICKBAR_LINKS = [
  { href: 'dashboard-employeur.html',  icon: '🏠', label: 'Accueil' },
  { href: 'poster-mission.html',       icon: '📢', label: 'Poster une mission' },
  { href: 'tableau-travailleurs.html', icon: '👥', label: 'Parcourir les profils' },
  { href: 'mes-travailleurs.html',     icon: '🤝', label: 'Mes travailleurs' }
];

function mountEmployerQuickbar() {
  if (document.querySelector('.flx-quickbar')) return; // déjà montée

  const style = document.createElement('style');
  style.textContent = `
    .flx-quickbar{position:sticky;top:0;z-index:1000;display:flex;gap:8px;justify-content:center;
      flex-wrap:wrap;background:#fff;border-bottom:1px solid #e2e8f0;padding:10px 16px;
      box-shadow:0 2px 8px rgba(15,23,42,0.05);}
    .flx-qbtn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;
      font-size:13px;font-weight:600;text-decoration:none;color:#334155;background:#f8fafc;
      border:1px solid #e2e8f0;white-space:nowrap;transition:all .15s;cursor:pointer;}
    .flx-qbtn:hover{background:#eef2ff;color:#4f46e5;border-color:#c7d2fe;}
    .flx-qbtn.active{background:#6366f1;color:#fff;border-color:#6366f1;cursor:default;box-shadow:0 2px 6px rgba(99,102,241,0.35);}
    .flx-qbtn.active:hover{background:#6366f1;color:#fff;border-color:#6366f1;}
    @media(max-width:640px){.flx-qbtn{padding:8px 10px;font-size:12px;}}
  `;
  document.head.appendChild(style);

  const current = (location.pathname.split('/').pop() || '').toLowerCase();
  const bar = document.createElement('div');
  bar.className = 'flx-quickbar';
  bar.innerHTML = FLX_QUICKBAR_LINKS.map(l => {
    const target = l.href.split('#')[0].toLowerCase();
    const isActive = target === current; // met en évidence l'onglet de la page courante
    return `<a class="flx-qbtn${isActive ? ' active' : ''}" href="${l.href}">${l.icon} ${l.label}</a>`;
  }).join('');
  document.body.insertBefore(bar, document.body.firstChild);
}

// Auto-montage : uniquement sur une page employeur ET pour un utilisateur employeur
(async () => {
  if (!sb) return;
  const page = (location.pathname.split('/').pop() || '').toLowerCase();
  if (!FLX_EMPLOYER_PAGES.includes(page)) return;
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user?.user_metadata?.role !== 'employeur') return;
  } catch(e) { return; }
  if (document.body) mountEmployerQuickbar();
  else document.addEventListener('DOMContentLoaded', mountEmployerQuickbar);
})();
