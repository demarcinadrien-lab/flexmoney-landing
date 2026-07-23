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

// ── Fiche entreprise (consultable par les travailleurs, sur toutes les pages) ──
// Usage : flxShowCompanyProfile({ email, bce, entreprise })
async function flxShowCompanyProfile(opts = {}) {
  if (!sb) return;

  let ov = document.getElementById('flxCompanyModal');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'flxCompanyModal';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;z-index:3000;padding:20px;font-family:inherit;';
    ov.innerHTML =
      '<div style="background:#fff;border-radius:18px;max-width:520px;width:100%;max-height:88vh;overflow-y:auto;padding:26px 28px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px;">'
      + '<h2 id="flxCompanyTitle" style="font-size:20px;font-weight:800;color:#0f172a;margin:0;">Entreprise</h2>'
      + '<button id="flxCompanyClose" style="background:#f1f5f9;color:#64748b;border:none;border-radius:8px;width:32px;height:32px;font-size:20px;cursor:pointer;line-height:1;">&times;</button>'
      + '</div><div id="flxCompanyBody" style="font-size:13px;color:#334155;"></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
    ov.querySelector('#flxCompanyClose').addEventListener('click', () => ov.remove());
  } else {
    ov.style.display = 'flex';
  }

  const body = document.getElementById('flxCompanyBody');
  body.innerHTML = '<div style="padding:20px;text-align:center;color:#64748b;">Chargement...</div>';

  // Rechercher l'employeur : par BCE, puis e-mail de contact, puis dénomination
  let emp = null;
  try {
    if (opts.bce) {
      const { data } = await sb.from('employers_inscription').select('*').eq('numero_bce', opts.bce).limit(1);
      emp = data && data[0];
    }
    if (!emp && opts.email) {
      const { data } = await sb.from('employers_inscription').select('*').eq('email_contact', opts.email).order('created_at', { ascending: false }).limit(1);
      emp = data && data[0];
    }
    if (!emp && opts.entreprise) {
      const { data } = await sb.from('employers_inscription').select('*').eq('nom_entreprise', opts.entreprise).limit(1);
      emp = data && data[0];
    }
  } catch (e) { /* silencieux */ }

  const esc = s => (s == null ? '' : String(s)).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  const nom = (emp && emp.nom_entreprise) || opts.entreprise || 'Entreprise';
  document.getElementById('flxCompanyTitle').textContent = nom;

  if (!emp) {
    body.innerHTML = '<p style="color:#64748b;">Les détails de cette entreprise ne sont pas disponibles pour le moment.</p>';
    return;
  }

  const secteurLabel = (window.FLEXMONEY_SECTEURS && (window.FLEXMONEY_SECTEURS.find(s => s.id === emp.secteur) || {}).label) || emp.secteur || '';
  const adresse = [emp.adresse, [emp.code_postal, emp.ville].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const row = (label, val) => val ? '<div style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #f1f5f9;">'
    + '<span style="min-width:150px;font-size:13px;color:#64748b;font-weight:600;">' + label + '</span>'
    + '<span style="font-size:13px;color:#0f172a;">' + esc(val) + '</span></div>' : '';

  body.innerHTML =
    row('Secteur', secteurLabel) +
    row('Activité', emp.activite) +
    row('Commission paritaire', emp.commission_paritaire) +
    row('Adresse', adresse) +
    row('N° BCE', emp.numero_bce);
}
window.flxShowCompanyProfile = flxShowCompanyProfile;

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
